// src/roles/FinancialOfficer/aeshaModule3/OfficerApplications.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, CheckCircle, XCircle, DollarSign, Loader2 } from 'lucide-react';
import Footer from '../../../components/layout/Footer'; 
import './OfficerApplications.css';

const OfficerApplications = () => {
  const navigate = useNavigate();
  const [entitySearchId, setEntitySearchId] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Stores keys of already issued subsidies in format "entityId-programId"
  const [issuedSubsidies, setIssuedSubsidies] = useState(new Set());

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!entitySearchId) return;
    setLoading(true);
    try {
      // 1. Fetch applications
      const appResponse = await axios.get(`http://localhost:8083/applications/fetchByEntity/${entitySearchId}`);
      setApplications(appResponse.data);

      // 2. Fetch existing subsidies to check for previous grants
      // Note: Replace with your actual endpoint for checking issued subsidies
      const subsidyResponse = await axios.get(`http://localhost:8083/subsidies/fetchAll`);
      const grantedKeys = new Set(
        subsidyResponse.data
          .filter(s => s.status === 'GRANTED' || s.status === 'VERIFIED')
          .map(s => `${s.entityId}-${s.programId}`)
      );
      setIssuedSubsidies(grantedKeys);

    } catch (error) {
      console.error("Search error:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, action) => {
    try {
      await axios.put(`http://localhost:8083/applications/${action}/${id}`);
      handleSearch(); 
    } catch (error) {
      alert("Action failed.");
    }
  };

  const handleGrantNavigation = (app) => {
    navigate('/officer/grant-subsidy', { 
      state: { entityId: app.entityId, programId: app.programId } 
    });
  };

  return (
    <div className="officer-view">
      <div className="fixed-top-header">
        <div className="view-header">
          <h2>Application Approval Management</h2>
        </div>
      </div>

      <div className="vertical-scroll-area">
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <Search className="search-icon" size={18} />
              <input 
                type="number" 
                placeholder="Enter Entity ID..." 
                value={entitySearchId}
                onChange={(e) => setEntitySearchId(e.target.value)}
                className="search-field"
              />
            </div>
            <button type="submit" className="btn-search" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Fetch Applications"}
            </button>
          </form>
        </div>

        <div className="table-wrapper">
          <table className="officer-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>ENTITY ID</th>
                <th style={{ width: '30%' }}>PROGRAM ID</th>
                <th style={{ width: '20%' }}>STATUS</th>
                <th style={{ width: '20%' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? (
                applications.map((app) => {
                  const isAlreadyGranted = issuedSubsidies.has(`${app.entityId}-${app.programId}`);
                  
                  return (
                    <tr key={app.applicationId}>
                      <td>{app.entityId}</td>
                      <td>{app.programId}</td>
                      <td>
                        <span className={`status-pill ${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {app.status === 'PENDING' && (
                            <>
                              <button className="btn-approve" onClick={() => handleStatusUpdate(app.applicationId, 'approve')}>
                                <CheckCircle size={14} /> Approve
                              </button>
                              <button className="btn-reject" onClick={() => handleStatusUpdate(app.applicationId, 'reject')}>
                                <XCircle size={14} /> Reject
                              </button>
                            </>
                          )}
                          {app.status === 'APPROVED' && (
                            <button 
                              className={`btn-grant ${isAlreadyGranted ? 'disabled' : ''}`} 
                              onClick={() => handleGrantNavigation(app)}
                              disabled={isAlreadyGranted}
                            >
                              <DollarSign size={14} /> 
                              {isAlreadyGranted ? "Issued" : "Grant Subsidy"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="4" className="empty-row">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default OfficerApplications;