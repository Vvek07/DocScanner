import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import FileUpload from '../components/scanner/FileUpload';
import DocumentViewer from '../components/scanner/DocumentViewer';
import { documentScanner } from '../utils/documentScanner';
import { processPDF } from '../utils/pdfProcessor';
import { localDB } from '../utils/localStorageDB';
import { useAuth } from '../contexts/AuthContext';
import { faker } from '@faker-js/faker';

const Scanner = () => {
  const [step, setStep] = useState('upload'); // 'upload', 'processing', 'preview'
  const [originalFile, setOriginalFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [scannerReady, setScannerReady] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize document scanner
    const initScanner = async () => {
      try {
        await documentScanner.initialize();
        setScannerReady(true);
      } catch (err) {
        console.error('Failed to initialize scanner:', err);
        setError('Failed to initialize document scanner. Some features may not work properly.');
      }
    };
    
    initScanner();
  }, []);

  const handleFileSelect = async (file) => {
    setOriginalFile(file);
    setError(null);
    setProcessing(true);
    setStep('processing');

    try {
      let imageDataUrl;
      
      if (file.type === 'application/pdf') {
        imageDataUrl = await processPDF(file);
      } else {
        imageDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      }
      
      setOriginalImage(imageDataUrl);
      setStep('preview');
      
      // Process document if scanner is ready
      if (scannerReady) {
        await processDocument(imageDataUrl);
      } else {
        setError('Document scanner not ready. Showing original image only.');
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Failed to process the file. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const processDocument = async (imageDataUrl) => {
    if (!scannerReady) return;
    
    try {
      setProcessing(true);
      
      // Create image element
      const img = new Image();
      img.src = imageDataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Detect document corners
      const corners = documentScanner.detectDocument(img);
      
      // Apply perspective correction
      const correctedImage = documentScanner.perspectiveCorrect(img, corners);
      setProcessedImage(correctedImage);
      
    } catch (err) {
      console.error('Error in document processing:', err);
      setError('Failed to detect document. Using original image.');
      // Fallback: use original image as processed
      setProcessedImage(imageDataUrl);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async (imageData) => {
    try {
      // Create document record
      const documentRecord = {
        id: faker.string.uuid(),
        userId: user.uid,
        filename: originalFile.name,
        originalUrl: originalImage,
        processedUrl: imageData,
        thumbnailUrl: imageData, // Use processed image as thumbnail
        status: 'completed',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // Save to local storage
      localDB.saveDocument(user.uid, documentRecord);
      
      // Show success message
      alert('Document saved successfully!');
      
      // Reset to upload state
      handleReset();
      
    } catch (err) {
      console.error('Error saving document:', err);
      setError('Failed to save document. Please try again.');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setOriginalFile(null);
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {step !== 'upload' && (
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Upload New</span>
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">Document Scanner</h1>
              {!scannerReady && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Demo Mode
                </span>
              )}
            </div>
            
            {step === 'preview' && originalImage && (
              <button
                onClick={() => processDocument(originalImage)}
                disabled={processing || !scannerReady}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
                <span>Reprocess</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'upload' && (
            <div className="flex items-center justify-center min-h-[500px]">
              <FileUpload onFileSelect={handleFileSelect} loading={processing} />
            </div>
          )}
          
          {step === 'processing' && (
            <div className="flex items-center justify-center min-h-[500px]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Document</h3>
                <p className="text-gray-600">
                  Detecting document boundaries and applying perspective correction...
                </p>
              </motion.div>
            </div>
          )}
          
          {step === 'preview' && originalImage && (
            <div className="h-[calc(100vh-200px)]">
              <DocumentViewer
                originalImage={originalImage}
                processedImage={processedImage}
                onSave={handleSave}
                processing={processing}
                error={error}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;
