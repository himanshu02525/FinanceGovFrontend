import React, { useState, useEffect } from 'react';
import './AdminModule.css';
import { fetchAllDocuments, verifyDocument, rejectDocument, getDocumentPreview } from './Admin';

export const DocumentVerification = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const resolveDocumentEntityId = (doc) => {
    return (
      doc.entityId ||
      doc.entity?.entityId ||
      doc.entity?.id ||
      doc.citizenBusiness?.entityId ||
      doc.citizenBusiness?.id ||
      doc.citizenBusiness?.citizenBusiness?.entityId ||
      doc.citizenBusiness?.citizenBusiness?.id ||
      null
    );
  };

  const loadDocuments = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const docs = await fetchAllDocuments();
      console.log('📋 Raw documents from backend:', docs);
      if (docs && docs.length > 0) {
        console.log('🔍 First document structure:', JSON.stringify(docs[0], null, 2));
        docs.forEach((doc, index) => {
            const resolvedEntityId = resolveDocumentEntityId(doc);
          console.log(`Document ${index}: entityId=${doc.entityId}, entity=${JSON.stringify(doc.entity)}, resolved=${resolvedEntityId}`);
        });
      }
      setDocuments(docs || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
      setErrorMessage('Unable to load documents.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleOpenDocument = (doc) => {
    setSelectedDocument(doc);
    setDocumentPreviewUrl(null);
    setPreviewLoading(true);
    
    // Fetch document preview
    const entityId = resolveDocumentEntityId(doc);
    console.log('Fetching document for entityId:', entityId, 'docType:', doc.docType);
    
    getDocumentPreview(entityId, encodeURIComponent(doc.docType))
      .then((response) => {
        console.log('Document preview loaded successfully:', response);
        const url = URL.createObjectURL(response.data);
        setDocumentPreviewUrl(url);
        setPreviewLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load document preview:', error);
        console.error('Error response:', error.response?.status, error.response?.data);
        setPreviewLoading(false);
      });
  };

  const handleCloseDocument = () => {
    setSelectedDocument(null);
    if (documentPreviewUrl) {
      URL.revokeObjectURL(documentPreviewUrl);
      setDocumentPreviewUrl(null);
    }
  };

  const handleVerify = async (entityId, docType) => {
    try {
      await verifyDocument(entityId, docType);
      await loadDocuments();
    } catch (error) {
      console.error('Failed to verify document:', error);
      setErrorMessage('Failed to verify document.');
    }
  };

  const handleReject = async (entityId, docType) => {
    try {
      await rejectDocument(entityId, docType);
      await loadDocuments();
    } catch (error) {
      console.error('Failed to reject document:', error);
      setErrorMessage('Failed to reject document.');
    }
  };

  const statusTabs = [
    { key: 'ALL', label: 'All Records' },
    { key: 'PENDING', label: 'Pending Review' },
    { key: 'VERIFIED', label: 'Verified' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  const filteredDocuments = documents.filter((doc) => {
    return activeTab === 'ALL' || doc.verificationStatus === activeTab;
  });

  const isDocumentUrl = (uri) => {
    return typeof uri === 'string' && /^https?:\/\//.test(uri);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Document Verification</h1>
        <button className="btn btn-sm btn-secondary" onClick={handleRefresh} disabled={loading || refreshing}>
          {refreshing ? 'Refreshing...' : 'Refresh Documents'}
        </button>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="tab-nav">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading documents...</p>
      ) : (
        <div className="section-card">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Entity ID</th>
                <th>Type</th>
                <th>File</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No documents available.</td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => {
                  const resolvedEntityId = resolveDocumentEntityId(doc);
                  return (
                    <tr key={doc.documentId}>
                      <td>{resolvedEntityId || 'N/A'}</td>
                      <td>{doc.docType}</td>
                      <td>
                        <button className="btn btn-sm btn-outline" onClick={() => handleOpenDocument(doc)}>
                          View Document
                        </button>
                      </td>
                      <td>
                        <span className={`badge-status ${
                          doc.verificationStatus === 'VERIFIED' ? 'badge-approved' :
                          doc.verificationStatus === 'REJECTED' ? 'badge-rejected' : 'badge-pending'
                        }`}>
                          {doc.verificationStatus}
                        </span>
                      </td>
                      <td>
                        {doc.verificationStatus === 'PENDING' ? (
                          <>
                            <button className="btn btn-sm btn-primary me-2" onClick={() => handleVerify(resolvedEntityId, encodeURIComponent(doc.docType))} disabled={!resolvedEntityId}>
                              Verify
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleReject(resolvedEntityId, encodeURIComponent(doc.docType))} disabled={!resolvedEntityId}>
                              Reject
                            </button>
                          </>
                        ) : doc.verificationStatus === 'VERIFIED' ? (
                          <span>Verified</span>
                        ) : doc.verificationStatus === 'REJECTED' ? (
                          <span>Rejected</span>
                        ) : (
                          <span>Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
      {selectedDocument && (
        <div className="modal-overlay" onClick={handleCloseDocument}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Document Verification</h2>
              <button className="modal-close" onClick={handleCloseDocument}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Entity ID:</strong> {resolveDocumentEntityId(selectedDocument) || 'N/A'}
              </div>
              <div className="detail-row">
                <strong>Document Type:</strong> {selectedDocument.docType}
              </div>
              <div className="detail-row">
                <strong>File Name:</strong> {selectedDocument.fileURI}
              </div>
              <div className="detail-row">
                <strong>Uploaded Date:</strong> {selectedDocument.uploadedDate || 'N/A'}
              </div>
              <div className="detail-row">
                <strong>Status:</strong> 
                <span className={`badge-status ${
                  selectedDocument.verificationStatus === 'VERIFIED' ? 'badge-approved' :
                  selectedDocument.verificationStatus === 'REJECTED' ? 'badge-rejected' : 'badge-pending'
                }`}>
                  {selectedDocument.verificationStatus}
                </span>
              </div>
              
              <div className="document-preview-section">
                <h3>Document Preview</h3>
                {previewLoading ? (
                  <div style={{ 
                    width: '100%', 
                    height: '400px', 
                    border: '1px solid #ddd', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5'
                  }}>
                    <p>Loading document...</p>
                  </div>
                ) : documentPreviewUrl ? (
                  <iframe
                    src={documentPreviewUrl}
                    style={{ width: '100%', height: '400px', border: '1px solid #ddd' }}
                    title="Document Preview"
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '400px', 
                    border: '1px solid #ddd', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5'
                  }}>
                    <p>Unable to load document preview.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {selectedDocument.verificationStatus === 'PENDING' ? (
                <>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      handleVerify(resolveDocumentEntityId(selectedDocument), encodeURIComponent(selectedDocument.docType));
                      handleCloseDocument();
                    }}
                    disabled={!resolveDocumentEntityId(selectedDocument)}
                  >
                    ✓ Verify Document
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => {
                      handleReject(resolveDocumentEntityId(selectedDocument), encodeURIComponent(selectedDocument.docType));
                      handleCloseDocument();
                    }}
                    disabled={!resolveDocumentEntityId(selectedDocument)}
                  >
                    ✕ Reject Document
                  </button>
                </>
              ) : (
                <button className="btn btn-secondary" onClick={handleCloseDocument}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVerification;
