import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import DocumentCard from '../components/gallery/DocumentCard';
import DocumentViewer from '../components/scanner/DocumentViewer';
import { localDB } from '../utils/localStorageDB';
import { useAuth } from '../contexts/AuthContext';

const Gallery = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Load documents from local storage
    const loadDocuments = async () => {
      setLoading(true);
      
      try {
        const userDocuments = localDB.getDocuments(user.uid);
        
        // If no documents exist, create some demo documents
        if (userDocuments.length === 0) {
          const demoDocuments = [
            {
              id: 'demo-1',
              userId: user.uid,
              filename: 'business_card.jpg',
              originalUrl: 'https://picsum.photos/400/300?random=1',
              processedUrl: 'https://picsum.photos/400/300?random=2',
              thumbnailUrl: 'https://picsum.photos/200/150?random=1',
              status: 'completed',
              createdAt: Date.now() - 86400000, // Yesterday
              updatedAt: Date.now() - 86400000
            },
            {
              id: 'demo-2',
              userId: user.uid,
              filename: 'receipt.pdf',
              originalUrl: 'https://picsum.photos/400/300?random=3',
              processedUrl: 'https://picsum.photos/400/300?random=4',
              thumbnailUrl: 'https://picsum.photos/200/150?random=3',
              status: 'completed',
              createdAt: Date.now() - 172800000, // 2 days ago
              updatedAt: Date.now() - 172800000
            }
          ];
          
          // Save demo documents
          demoDocuments.forEach(doc => {
            localDB.saveDocument(user.uid, doc);
          });
          
          setDocuments(demoDocuments);
        } else {
          setDocuments(userDocuments);
        }
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDocuments();
  }, [user]);

  useEffect(() => {
    // Filter documents based on search and status
    let filtered = documents;
    
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);
    
    setFilteredDocuments(filtered);
  }, [documents, searchTerm, statusFilter]);

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
  };

  const handleCloseViewer = () => {
    setSelectedDocument(null);
  };

  const handleDeleteDocument = (documentId) => {
    if (confirm('Are you sure you want to delete this document?')) {
      localDB.deleteDocument(user.uid, documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    }
  };

  if (selectedDocument) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCloseViewer}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Back to Gallery
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{selectedDocument.filename}</h1>
            </div>
          </div>
        </div>
        
        <div className="h-[calc(100vh-100px)]">
          <DocumentViewer
            originalImage={selectedDocument.originalUrl}
            processedImage={selectedDocument.processedUrl}
            onSave={() => {}}
            processing={false}
            error={null}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Gallery</h1>
            <p className="text-gray-600">View and manage your scanned documents</p>
          </div>
          
          <Link
            to="/scanner"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Scan New</span>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDocuments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first document to get started'}
            </p>
            <Link
              to="/scanner"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Scan Document</span>
            </Link>
          </motion.div>
        )}

        {/* Documents Grid */}
        {!loading && filteredDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {filteredDocuments.map((document, index) => (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <DocumentCard
                  document={document}
                  onClick={handleDocumentClick}
                  onDelete={() => handleDeleteDocument(document.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
