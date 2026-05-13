// src/roles/FinancialOfficer/aeshaModule3/GrantSubsidyPage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import './GrantSubsidyPage.css';

const GrantSubsidyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { entityId, programId } = location.state || {};

  const [formData, setFormData] = useState({
    entityId: entityId || '',
    programId: programId || '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'VERIFIED' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Retrieve dynamic userId to avoid 404 Feign errors
    const loggedInUserId = localStorage.getItem('userId') || 1; 

    const subsidyRequest = {
      entityId: Number(formData.entityId),
      programId: Number(formData.programId),
      amount: parseFloat(formData.amount),
      date: formData.date,
      status: formData.status, 
      userId: Number(loggedInUserId) 
    };

    try {
      // Hits POST /subsidies/save
      const response = await axios.post('http://localhost:8083/subsidies/save', subsidyRequest);

      if (response.status === 200 || response.status === 201) {
        alert(`Subsidy successfully generated with status: ${formData.status}`);
        navigate('/officer/applications');
      }
    } catch (error) {
      // Captures Identity Service 404 or connection issues
      const errMsg = error.response?.data?.message || "Check backend connection";
      alert("Error: " + errMsg);
    }
  };

  return (
    <div className="grant-page-container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back to Applications
        </button>
        <h2><ShieldCheck size={24} /> Issue New Subsidy</h2>
      </div>

      <div className="grant-card">
        <form onSubmit={handleSubmit} className="grant-form">
          <div className="form-grid">
            <div className="input-group disabled">
              <label>Entity ID</label>
              <input type="text" value={formData.entityId} readOnly />
            </div>

            <div className="input-group disabled">
              <label>Program ID</label>
              <input type="text" value={formData.programId} readOnly />
            </div>

            <div className="input-group disabled">
              <label>Disbursement Date</label>
              <input type="date" value={formData.date} readOnly />
            </div>

            <div className="input-group">
              <label>Subsidy Amount (₹) *</label>
              <input 
                type="number" 
                required 
                placeholder="Enter sanctioned amount"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>

            <div className="input-group">
              <label>Verification Status</label>
              {/* Updated dropdown with the specific Enums you requested */}
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="enum-select"
              >
                <option value="VERIFIED">VERIFIED</option>
                <option value="GRANTED">GRANTED</option>
                <option value="ONHOLD">ON HOLD</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="form-footer">
            <button type="submit" className="submit-grant-btn">
              <Send size={18} /> Confirm and Generate Subsidy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GrantSubsidyPage;