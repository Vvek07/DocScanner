export class DocumentScanner {
  constructor() {
    this.cv = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    return new Promise((resolve, reject) => {
      const scriptId = 'opencv-script';
      
      const onScriptLoad = () => {
        // Use a poller to wait for the `cv` object to be ready on the window
        const checkCv = () => {
          if (window.cv && window.cv.Mat) {
            this.cv = window.cv;
            this.initialized = true;
            resolve();
          } else {
            setTimeout(checkCv, 50);
          }
        };
        checkCv();
      };

      // Check if the script tag already exists in the document
      let script = document.getElementById(scriptId);
      
      if (script) {
        // If the script exists, it might already be loaded or is currently loading.
        // If window.cv is ready, we can resolve. Otherwise, we listen for the 'load' event.
        if (window.cv) {
          onScriptLoad();
        } else {
          script.addEventListener('load', onScriptLoad);
          script.addEventListener('error', reject);
        }
      } else {
        // If the script tag doesn't exist, create it and append it to the document head.
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
        script.async = true;
        script.onload = onScriptLoad;
        script.onerror = reject;
        document.head.appendChild(script);
      }
    });
  }

  detectDocument(imageElement) {
    if (!this.cv || !this.initialized) {
      throw new Error('OpenCV not initialized');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;
    ctx.drawImage(imageElement, 0, 0);

    // Convert to OpenCV Mat
    const src = this.cv.imread(canvas);
    const gray = new this.cv.Mat();
    const blurred = new this.cv.Mat();
    const edged = new this.cv.Mat();
    
    try {
      // Convert to grayscale
      this.cv.cvtColor(src, gray, this.cv.COLOR_RGBA2GRAY);
      
      // Apply Gaussian blur
      this.cv.GaussianBlur(gray, blurred, new this.cv.Size(5, 5), 0);
      
      // Edge detection
      this.cv.Canny(blurred, edged, 75, 200);
      
      // Find contours
      const contours = new this.cv.MatVector();
      const hierarchy = new this.cv.Mat();
      this.cv.findContours(edged, contours, hierarchy, this.cv.RETR_LIST, this.cv.CHAIN_APPROX_SIMPLE);
      
      // Find the largest rectangular contour
      let largestContour = null;
      let maxArea = 0;
      
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = this.cv.contourArea(contour);
        
        if (area > maxArea) {
          // Approximate contour to polygon
          const approx = new this.cv.Mat();
          const peri = this.cv.arcLength(contour, true);
          this.cv.approxPolyDP(contour, approx, 0.02 * peri, true);
          
          // Check if it has 4 vertices (rectangle-like)
          if (approx.rows === 4 && area > canvas.width * canvas.height * 0.1) {
            maxArea = area;
            if (largestContour) largestContour.delete();
            largestContour = approx.clone();
          }
          approx.delete();
        }
        contour.delete();
      }
      
      let corners = null;
      if (largestContour) {
        corners = this.extractCorners(largestContour);
        largestContour.delete();
      } else {
        // Fallback: use image corners
        corners = [
          { x: 0, y: 0 },
          { x: canvas.width, y: 0 },
          { x: canvas.width, y: canvas.height },
          { x: 0, y: canvas.height }
        ];
      }
      
      // Clean up
      contours.delete();
      hierarchy.delete();
      
      return corners;
      
    } finally {
      src.delete();
      gray.delete();
      blurred.delete();
      edged.delete();
    }
  }

  extractCorners(contour) {
    const corners = [];
    for (let i = 0; i < contour.rows; i++) {
      const point = contour.intPtr(i, 0);
      corners.push({
        x: point[0],
        y: point[1]
      });
    }
    
    // Sort corners: top-left, top-right, bottom-right, bottom-left
    const center = corners.reduce((acc, corner) => ({
      x: acc.x + corner.x / corners.length,
      y: acc.y + corner.y / corners.length
    }), { x: 0, y: 0 });
    
    const sortedCorners = corners.sort((a, b) => {
      const angleA = Math.atan2(a.y - center.y, a.x - center.x);
      const angleB = Math.atan2(b.y - center.y, b.x - center.x);
      return angleA - angleB;
    });
    
    return sortedCorners;
  }

  perspectiveCorrect(imageElement, corners) {
    if (!this.cv || !this.initialized) {
      throw new Error('OpenCV not initialized');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;
    ctx.drawImage(imageElement, 0, 0);

    const src = this.cv.imread(canvas);
    
    // Calculate output dimensions
    const width = Math.max(
      Math.sqrt(Math.pow(corners[1].x - corners[0].x, 2) + Math.pow(corners[1].y - corners[0].y, 2)),
      Math.sqrt(Math.pow(corners[2].x - corners[3].x, 2) + Math.pow(corners[2].y - corners[3].y, 2))
    );
    const height = Math.max(
      Math.sqrt(Math.pow(corners[3].x - corners[0].x, 2) + Math.pow(corners[3].y - corners[0].y, 2)),
      Math.sqrt(Math.pow(corners[2].x - corners[1].x, 2) + Math.pow(corners[2].y - corners[1].y, 2))
    );
    
    // Define source and destination points
    const srcPoints = this.cv.matFromArray(4, 1, this.cv.CV_32FC2, [
      corners[0].x, corners[0].y,
      corners[1].x, corners[1].y,
      corners[2].x, corners[2].y,
      corners[3].x, corners[3].y
    ]);
    
    const dstPoints = this.cv.matFromArray(4, 1, this.cv.CV_32FC2, [
      0, 0,
      width, 0,
      width, height,
      0, height
    ]);
    
    // Get perspective transform matrix
    const M = this.cv.getPerspectiveTransform(srcPoints, dstPoints);
    
    // Apply transformation
    const dst = new this.cv.Mat();
    this.cv.warpPerspective(src, dst, M, new this.cv.Size(width, height));
    
    // Convert back to canvas
    const outputCanvas = document.createElement('canvas');
    this.cv.imshow(outputCanvas, dst);
    
    // Clean up
    src.delete();
    dst.delete();
    M.delete();
    srcPoints.delete();
    dstPoints.delete();
    
    return outputCanvas.toDataURL('image/jpeg', 0.9);
  }
}

export const documentScanner = new DocumentScanner();
