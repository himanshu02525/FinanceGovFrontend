// src/roles/FinancialOfficer/aeshamodule3/OfficerAllApplications.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Search, History } from 'lucide-react';
import Footer from '../../../components/layout/Footer'; // Adjust path if necessary
import './OfficerAllApplications.css';

const OfficerAllApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8083/applications/fetchAll');
      setApplications(response.data);
    } catch (err) {
      console.error("Error fetching application history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const filteredData = applications.filter(app => {
    const search = searchTerm.trim();
    if (!search) return true; 
    return app.entityId.toString() === search;
  });

  return (
    <div className="history-view">
      {/* SECTION 1: FIXED HEADING */}
      <div className="fixed-top-header">
        <div className="view-header">
          <div className="header-left">
            <h2><History size={24} /> Application History</h2>
            <p>Full record of subsidy applications processed by the system.</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: VERTICAL SCROLL AREA (Search + Table + Footer) */}
      <div className="vertical-scroll-area">
        
        {/* Search container now moves with the scroll */}
        <div className="search-container">
          <div className="search-form">
            <div className="search-input-group">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-field"
                placeholder="Enter Entity ID to filter history..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-search" onClick={fetchHistory}>
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Sync Records
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="officer-table">
            <thead>
              <tr>
                <th>ENTITY ID</th>
                <th>PROGRAM ID</th>
                <th>SUBMISSION DATE</th>
                <th>CURRENT STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="loading-state">Loading history...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-row">
                    {searchTerm ? `No records found for Entity ID: ${searchTerm}` : "No records found."}
                  </td>
                </tr>
              ) : (
                filteredData.map(app => (
                  <tr key={app.applicationId}>
                    <td className="entity-id-cell">{app.entityId}</td>
                    <td>{app.programId}</td>
                    <td>{app.submittedDate}</td>
                    <td>
                      <span className={`status-pill ${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer at the very bottom of the scroll area */}
        <Footer />
      </div>
    </div>
  );
};

export default OfficerAllApplications;