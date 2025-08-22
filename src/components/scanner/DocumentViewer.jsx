import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw, Download, Save, AlertTriangle } from 'lucide-react';

const DocumentViewer = ({ originalImage, processedImage, onSave, processing, error }) => {
  const [viewMode, setViewMode] = useState('split'); // 'split', 'original', 'processed'
  const originalRef = useRef(null);
  const processedRef = useRef(null);

  const downloadImage = (imageData, filename) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ViewControls = () => (
    <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-2 border">
      <button
        onClick={() => setViewMode('split')}
        className={`px-3 py-2 text-sm rounded-md transition-colors ${
          viewMode === 'split'
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        Split View
      </button>
      <button
        onClick={() => setViewMode('original')}
        className={`px-3 py-2 text-sm rounded-md transition-colors ${
          viewMode === 'original'
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        Original
      </button>
      <button
        onClick={() => setViewMode('processed')}
        className={`px-3 py-2 text-sm rounded-md transition-colors ${
          viewMode === 'processed'
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        disabled={!processedImage}
      >
        Processed
      </button>
    </div>
  );

  const ImagePanel = ({ image, title, ref }) => (
    <div className="flex flex-col h-full">
      <div className="bg-gray-50 px-4 py-2 border-b">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      </div>
      <div className="flex-1 relative bg-gray-100">
        <TransformWrapper
          initialScale={1}
          minScale={0.1}
          maxScale={5}
          centerOnInit={true}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute top-4 left-4 z-10 flex space-x-2">
                <button
                  onClick={() => zoomIn()}
                  className="p-2 bg-white rounded-lg shadow-sm border hover:bg-gray-50"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="p-2 bg-white rounded-lg shadow-sm border hover:bg-gray-50"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="p-2 bg-white rounded-lg shadow-sm border hover:bg-gray-50"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <TransformComponent
                wrapperClass="w-full h-full"
                contentClass="w-full h-full flex items-center justify-center"
              >
                <img
                  ref={ref}
                  src={image}
                  alt={title}
                  className="max-w-full max-h-full object-contain"
                />
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex flex-col"
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <ViewControls />
        
        <div className="flex items-center space-x-3">
          {processedImage && (
            <>
              <button
                onClick={() => downloadImage(processedImage, 'scanned-document.jpg')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={() => onSave(processedImage)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <h4 className="text-red-800 font-medium">Processing Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {processing && (
        <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Processing document...</span>
          </div>
        </div>
      )}

      {/* Image Viewer */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'split' ? (
          <div className="h-full flex">
            <div className="w-1/2 border-r">
              <ImagePanel
                image={originalImage}
                title="Original"
                ref={originalRef}
              />
            </div>
            <div className="w-1/2">
              {processedImage ? (
                <ImagePanel
                  image={processedImage}
                  title="Processed"
                  ref={processedRef}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <p>Processed image will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : viewMode === 'original' ? (
          <ImagePanel
            image={originalImage}
            title="Original Document"
            ref={originalRef}
          />
        ) : (
          processedImage && (
            <ImagePanel
              image={processedImage}
              title="Processed Document"
              ref={processedRef}
            />
          )
        )}
      </div>
    </motion.div>
  );
};

export default DocumentViewer;
