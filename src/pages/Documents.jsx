import React, { useEffect, useState } from 'react';
import { uploadDoc, updateDoc, fetchAllDocuments } from './Citizen';
import './CitizenModule.css';

const initialUploadForm = {
  docType: 'PAN',
  fileURI: '',
};

export const Documents = () => {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [uploadForm, setUploadForm] = useState(initialUploadForm);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const formatDate = (date) => date.toISOString().slice(0, 10);

  useEffect(() => {
    const storedProfile = localStorage.getItem('citizenProfile');
    const storedEntityId = localStorage.getItem('activeEntityId');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    } else if (storedEntityId) {
      setProfile({ entityId: Number(storedEntityId) });
    }
    setProfileLoading(false);
  }, []);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await fetchAllDocuments();
        console.log('📋 Citizen: Raw documents from backend:', response);
        if (response && response.length > 0) {
          console.log('🔍 Citizen: First document structure:', JSON.stringify(response[0], null, 2));
        }
        setDocuments(response || []);
      } catch (error) {
        console.error('Failed to load documents:', error);
      } finally {
        setDocumentsLoading(false);
      }
    };
    loadDocuments();
  }, []);

  const handleUploadChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadForm((prev) => ({
        ...prev,
        fileURI: file.name,
      }));
      setMessage('');
      setErrorMessage('');
    } else {
      setMessage('Please upload a PDF file only.');
      setUploadForm((prev) => ({ ...prev, fileURI: '' }));
    }
  };

  const handleDocTypeChange = (e) => {
    setUploadForm((prev) => ({ ...prev, docType: e.target.value }));
  };

  const entityId = profile?.entityId || null;
  const entityType = profile?.type || null;
  
  // Document types allowed based on entity type - matching backend validation
  const getAllowedDocTypes = () => {
    if (entityType === 'CITIZEN') {
      return ['PAN', 'AADHAR', 'PASSPORT', 'ID_PROOF'];
    }
    if (entityType === 'BUSINESS') {
      return ['FINANCIAL_STATEMENT'];
    }
    return [];
  };

  const allowedDocTypes = getAllowedDocTypes();

  const getDocumentEntityId = (doc) => doc.entityId ?? doc.entity?.entityId ?? doc.entity?.id;
  const filteredDocuments = documents.filter((doc) => {
    const docEntityId = getDocumentEntityId(doc);
    return String(docEntityId) === String(entityId);
  });

  // Get available document types for upload: not uploaded or rejected
  const getAvailableDocTypes = () => {
    return allowedDocTypes.filter(type => {
      const existing = filteredDocuments.find(doc => doc.docType === type);
      return !existing || existing.verificationStatus === 'REJECTED';
    });
  };

  const availableDocTypes = getAvailableDocTypes();

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!entityId) {
      setErrorMessage('Please complete registration before uploading documents.');
      return;
    }

    if (!uploadForm.fileURI) {
      setMessage('Upload a PDF document before submitting.');
      return;
    }

    setSaving(true);
    setMessage('');
    setErrorMessage('');

    try {
      const payload = {
        docType: uploadForm.docType,
        fileURI: uploadForm.fileURI,
        uploadedDate: formatDate(new Date()),
      };
      const existingRejected = filteredDocuments.find(
        (doc) => doc.docType === uploadForm.docType && doc.verificationStatus?.toUpperCase() === 'REJECTED'
      );
      const existingAny = filteredDocuments.find(
        (doc) => doc.docType === uploadForm.docType
      );

      if (existingRejected) {
        await updateDoc(entityId, uploadForm.docType, payload);
      } else if (!existingAny) {
        await uploadDoc(entityId, payload);
      } else {
        setErrorMessage(`Document of type ${uploadForm.docType} already exists and cannot be uploaded again.`);
        return;
      }
      setMessage('Document uploaded successfully.');
      const refreshed = await fetchAllDocuments();
      setDocuments(refreshed || []);
      setUploadForm(initialUploadForm);
    } catch (error) {
      console.error('Upload failed:', error);
      setErrorMessage('Upload failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReupload = (doc) => {
    // Only allow re-upload if docType is in available types
    if (!availableDocTypes.includes(doc.docType)) {
      setErrorMessage(`${doc.docType} cannot be re-uploaded at this time.`);
      return;
    }
    setUploadForm({
      docType: doc.docType,
      fileURI: '',
    });
    setMessage(`Re-upload document for ${doc.docType}.`);
  };

  const loading = profileLoading || documentsLoading;

  if (loading) {
    return (
      <div className="page-wrapper">
        <p>Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Document Management</h1>
        <p>Upload your documents for verification. PDF only, and date is stored in yyyy-MM-dd format.</p>
      </div>

      {!entityId ? (
        <div className="section-card">
          <p>Please complete registration first before uploading documents.</p>
        </div>
      ) : (
        <>
          <div className="section-card">
            <h2>Upload New Document</h2>
            <form className="registration-form" onSubmit={handleUploadSubmit}>
              <select name="docType" value={uploadForm.docType} onChange={handleDocTypeChange}>
                {availableDocTypes.map((docType) => (
                  <option key={docType} value={docType}>
                    {docType}
                  </option>
                ))}
              </select>

              <input type="file" accept=".pdf" onChange={handleUploadChange} />
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Uploading...' : 'Upload Document'}</button>
            </form>
            {message && <p className="success-message">{message}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>

          <div className="section-card">
            <h2>Your Documents</h2>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Document ID</th>
                  <th>Type</th>
                  <th>File</th>
                  <th>Uploaded</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center">No documents uploaded yet.</td>
                  </tr>
                )}
                {filteredDocuments
                  .map((doc) => (
                    <tr key={doc.documentId}>
                      <td>{doc.documentId}</td>
                      <td>{doc.docType}</td>
                      <td>{doc.fileURI}</td>
                      <td>{doc.uploadedDate}</td>
                      <td>
                        <span className={`badge-status ${
                          doc.verificationStatus === 'VERIFIED' ? 'badge-approved' :
                          doc.verificationStatus === 'REJECTED' ? 'badge-rejected' : 'badge-pending'
                        }`}>
                          {doc.verificationStatus}
                        </span>
                      </td>
                      <td>
                        {doc.verificationStatus === 'REJECTED' ? (
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleReupload(doc)}
                          >
                            Re-upload
                          </button>
                        ) : doc.verificationStatus === 'VERIFIED' ? (
                          <span>Verified</span>
                        ) : (
                          <span>Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Documents;
