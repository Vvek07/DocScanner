import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, Eye, FileText, Trash2 } from 'lucide-react';

const DocumentCard = ({ document, onClick, onDelete }) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(extension)) {
      return <img src={document.thumbnailUrl || document.originalUrl} alt="" className="w-full h-32 object-cover" />;
    }
    return (
      <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
    );
  };

  const downloadImage = (imageUrl, filename) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, shadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer overflow-hidden"
      onClick={() => onClick(document)}
    >
      <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
        {getFileIcon(document.filename)}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate mb-2">
          {document.filename}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(document.createdAt)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              document.status === 'completed' ? 'bg-green-400' :
              document.status === 'processing' ? 'bg-yellow-400' :
              'bg-red-400'
            }`} />
            <span className="capitalize">{document.status}</span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
              <Eye className="w-3 h-3" />
              <span>View</span>
            </button>
            
            {document.processedUrl && (
              <button 
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(document.processedUrl, `processed_${document.filename}`);
                }}
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            )}
          </div>
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(document.id);
              }}
              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DocumentCard;
