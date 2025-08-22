// Simple local storage database for demo mode
export class LocalStorageDB {
  constructor() {
    this.dbName = 'docScanner';
  }

  // Get all documents for a user
  getDocuments(userId) {
    const key = `${this.dbName}_documents_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // Save a document
  saveDocument(userId, document) {
    const documents = this.getDocuments(userId);
    const existingIndex = documents.findIndex(doc => doc.id === document.id);
    
    if (existingIndex >= 0) {
      documents[existingIndex] = document;
    } else {
      documents.push(document);
    }
    
    const key = `${this.dbName}_documents_${userId}`;
    localStorage.setItem(key, JSON.stringify(documents));
    return document;
  }

  // Delete a document
  deleteDocument(userId, documentId) {
    const documents = this.getDocuments(userId);
    const filtered = documents.filter(doc => doc.id !== documentId);
    
    const key = `${this.dbName}_documents_${userId}`;
    localStorage.setItem(key, JSON.stringify(filtered));
    return true;
  }

  // Update document status
  updateDocumentStatus(userId, documentId, status) {
    const documents = this.getDocuments(userId);
    const document = documents.find(doc => doc.id === documentId);
    
    if (document) {
      document.status = status;
      document.updatedAt = Date.now();
      this.saveDocument(userId, document);
    }
    
    return document;
  }
}

export const localDB = new LocalStorageDB();
