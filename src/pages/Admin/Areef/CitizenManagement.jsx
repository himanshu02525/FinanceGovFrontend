import React, { useState, useEffect } from 'react';
import './AdminModule.css';
import { fetchAllCitizens, approveCitizen, fetchAllDocuments } from './api';

export const CitizenManagement = () => {
  const [citizens, setCitizens] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [citizensData, docsData] = await Promise.all([
          fetchAllCitizens(),
          fetchAllDocuments()
        ]);
        setCitizens(citizensData);
        setDocuments(docsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getVerificationStatus = (entityId) => {
    const citizenDocs = documents.filter(doc => {
      const docEntityId = doc.entityId || doc.entity?.entityId || doc.entity?.id;
      return String(docEntityId) === String(entityId);
    });
    if (citizenDocs.length === 0) return "No Documents";
    const allVerified = citizenDocs.every(doc => doc.verificationStatus === 'VERIFIED');
    return allVerified ? "✅ All Documents Verified" : "⏳ Pending Verification";
  };

  const handleApprove = async (entityId) => {
    try {
      await approveCitizen(entityId);
      // Refresh citizens
      const refreshed = await fetchAllCitizens();
      setCitizens(refreshed);
    } catch (error) {
      console.error('Failed to approve citizen:', error);
    }
  };

  if (loading) return <div className="page-wrapper"><p>Loading citizens...</p></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header"><h1>Citizen Management</h1></div>
      <div className="section-card">
        <table className="table-custom">
          <thead>
            <tr><th>Name</th><th>Verification Progress</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {citizens.map(citizen => (
              <tr key={citizen.entityId}>
                <td>{citizen.name}</td>
                <td>{getVerificationStatus(citizen.entityId)}</td>
                <td><span className={`badge-status ${citizen.status === 'ACTIVE' ? 'badge-approved' : 'badge-pending'}`}>{citizen.status}</span></td>
                <td>
                  {citizen.status === 'PENDING' && getVerificationStatus(citizen.entityId) === "✅ All Documents Verified" ? (
                    <button className="btn btn-sm btn-success" onClick={() => handleApprove(citizen.entityId)}>Set to Active</button>
                  ) : citizen.status === 'ACTIVE' ? "Verified" : "Waiting for Docs"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CitizenManagement;