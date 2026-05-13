// src/roles/FinancialOfficer/aeshaModule3/CitizenSearchPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Search, User, Mail, Phone, MapPin, Loader2, FileText, Briefcase, Info } from 'lucide-react';
import Footer from '../../../components/layout/Footer';
import './OfficerApplications.css'; 

const CitizenSearchPage = () => {
  const [searchId, setSearchId] = useState('');
  const [citizenData, setCitizenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchId) return;

    setLoading(true);
    setError('');
    setCitizenData(null);

    try {
      // Endpoint using port 8082 as per your requirement
      const response = await axios.get(`http://localhost:8082/entities/getCitizenById/${searchId}`);
      
      const data = Array.isArray(response.data) ? response.data[0] : response.data;

      if (data && data.name) {
        setCitizenData(data);
      } else {
        setError("No citizen found with this Entity ID.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to retrieve citizen details. Please check the ID or server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="officer-view">
      <div className="fixed-top-header">
        <div className="view-header">
          <h2>Citizen Information Lookup</h2>
        </div>
      </div>

      <div className="vertical-scroll-area">
        {/* Search Bar Section */}
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <Search className="search-icon" size={18} />
              <input 
                type="number" 
                placeholder="Enter Entity ID to fetch profile & documents..." 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="search-field"
              />
            </div>
            <button type="submit" className="btn-search" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Fetch Details"}
            </button>
          </form>
        </div>

        {/* Error State */}
        {!loading && error && (
          <div className="table-wrapper" style={{textAlign: 'center', padding: '2rem', color: '#ef4444'}}>
            <Info size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} />
            {error}
          </div>
        )}

        {/* Data Display Section */}
        {citizenData && (
          <div className="table-wrapper" style={{padding: '2.5rem'}}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem'}}>
              
              {/* Profile Details - Mapped to your JSON */}
              <div className="details-section">
                <h3 style={{color: '#143859', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem'}}>
                  Personal Information
                </h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.2rem'}}>
                  <p><strong><User size={16} /> Name:</strong> {citizenData.name}</p>
                  <p><strong><Mail size={16} /> Email:</strong> {citizenData.email || 'Not Provided'}</p>
                  <p><strong><Phone size={16} /> Contact:</strong> {citizenData.contactInfo || 'N/A'}</p>
                  <p><strong><MapPin size={16} /> Address:</strong> {citizenData.address}</p>
                </div>
              </div>

              {/* Status & Documents Section */}
              <div className="details-section">
                <h3 style={{color: '#143859', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem'}}>
                  Verification & Records
                </h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.2rem'}}>
                  <p><strong><Briefcase size={16} /> Entity Type:</strong> {citizenData.type}</p>
                  <p><strong>Verification Status:</strong> 
                    <span className={`status-pill ${citizenData.status.toLowerCase()}`} style={{marginLeft: '10px'}}>
                      {citizenData.status}
                    </span>
                  </p>
                  <div style={{marginTop: '10px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1'}}>
                    <p style={{fontSize: '0.9rem', color: '#64748b', margin: 0}}>
                      <strong><FileText size={14} /> Documents:</strong> 
                      {citizenData.documents && citizenData.documents.length > 0 
                        ? ` ${citizenData.documents.length} files attached` 
                        : ' No digital documents found in database'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Initial State */}
        {!citizenData && !loading && !error && (
          <div className="table-wrapper" style={{textAlign: 'center', padding: '4rem', color: '#94a3b8'}}>
            Enter a valid Entity ID to view the complete citizen profile and verification history.
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default CitizenSearchPage;