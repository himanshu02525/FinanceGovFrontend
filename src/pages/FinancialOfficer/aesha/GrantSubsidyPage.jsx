// src/roles/FinancialOfficer/aeshamodule3/GrantSubsidyPage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, ShieldCheck, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setFormData({ ...formData, status: newStatus });

    switch (newStatus) {
      case 'VERIFIED':
        triggerToast("Status set to Verified. Ready for disbursement.", "info");
        break;
      case 'GRANTED':
        triggerToast("Warning: Setting to Granted will finalize the transaction.", "warning");
        break;
      case 'ONHOLD':
        triggerToast("Status set to On Hold. Process suspended.", "warning");
        break;
      case 'CANCELLED':
        triggerToast("Alert: This application will be marked as Cancelled.", "error");
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loggedInUserId = localStorage.getItem('userId');
      const subsidyRequest = {
        ...formData,
        amount: parseFloat(formData.amount),
        userId: parseInt(loggedInUserId, 10)
      };

      await axios.post('http://localhost:8083/subsidies/save', subsidyRequest);
      
      const finalMessages = {
        'VERIFIED': "Subsidy record verified successfully!",
        'GRANTED': "Subsidy successfully granted and disbursed!",
        'ONHOLD': "Subsidy has been placed on hold.",
        'CANCELLED': "Subsidy application has been cancelled."
      };

      const successType = formData.status === 'CANCELLED' ? 'error' : 'success';
      triggerToast(finalMessages[formData.status] || "Transaction completed!", successType);
      
      setTimeout(() => {
        navigate('/officer/applications');
      }, 2000);

    } catch (error) {
      triggerToast(error.response?.data?.message || "Server connection failed", "error");
    }
  };

  return (
    <div className="grant-page-container">
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            className={`toast-notification ${toast.type}`}
            initial={{ opacity: 0, y: -100, x: '-50%' }}
            animate={{ opacity: 1, y: 30, x: '-50%' }}
            exit={{ opacity: 0, y: -100, x: '-50%' }}
          >
            <div className="toast-content">
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
              {toast.type === 'warning' && <AlertCircle size={20} />}
              {toast.type === 'error' && <XCircle size={20} />}
              <span>{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <label>Subsidy Amount (₹) <span className="required">*</span></label>
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
              <select 
                value={formData.status}
                onChange={handleStatusChange}
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