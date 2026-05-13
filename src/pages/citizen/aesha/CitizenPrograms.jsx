// src/roles/Citizen/aeshaModule3/CitizenPrograms.jsx
import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Footer from '../../../components/layout/Footer'; 
import './CitizenPrograms.css';

const DescriptionCell = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 100;
  if (text.length <= maxLength) return <p className="prog-description">{text}</p>;

  return (
    <div className="description-container">
      <p className="prog-description">
        {isExpanded ? text : `${text.substring(0, maxLength)}...`}
        <button className="read-more-btn" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? ' Show Less' : ' Read More'}
        </button>
      </p>
    </div>
  );
};

const CitizenPrograms = ({ defaultView = 'available' }) => {
  const [programs, setPrograms] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [view, setView] = useState(defaultView);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const citizenEntityId = Number(localStorage.getItem('entityId') );

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const appRes = await axios.get(`http://localhost:8083/applications/fetchByEntity/${citizenEntityId}`);
      setMyApplications(Array.isArray(appRes.data) ? appRes.data : []);

      if (view === 'available') {
        const res = await axios.get('http://localhost:8083/programs/fetchAll');
        setPrograms(Array.isArray(res.data) ? res.data : [res.data]);
      }
    } catch (err) {
      if (err.response?.status !== 404) triggerToast("Failed to sync data.", "error");
      else setMyApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setView(defaultView); }, [defaultView]);
  useEffect(() => { fetchData(); }, [view]);

  const isAlreadyApplied = (programId) => {
    return myApplications.some(app => Number(app.programId) === Number(programId));
  };

  const handleApplyClick = async (program) => {
    setApplyingId(program.programId);
    try {
      const loggedInUserId = Number(localStorage.getItem('userId'));
      const request = {
        userId: loggedInUserId,
        entityId: citizenEntityId,
        programId: program.programId,
        submittedDate: new Date().toISOString().split('T')[0]
      };
      await axios.post('http://localhost:8083/applications/save', request);
      triggerToast(`Application for ${program.title} submitted successfully!`);
      fetchData();
    } catch (err) {
      triggerToast("Application failed.", "error");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="programs-view">
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            className={`toast-notification ${toast.type}`}
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
          >
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="view-fixed-header">
        <div className="view-header">
          <div className="header-text">
            <h2>{view === 'available' ? 'Available Programs' : 'My Applications'}</h2>
            <p>{view === 'available' ? 'Browse and apply for financial assistance.' : 'Track your submitted requests.'}</p>
          </div>
          <button className="refresh-btn" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 
            {loading ? ' Syncing...' : ' Refresh List'}
          </button>
        </div>
      </div>

      <div className="scrollable-content-area">
        <div className="programs-table-container">
          <div className={`table-header ${view === 'available' ? 'available-grid' : 'applications-grid'}`}>
            <span>{view === 'available' ? 'PROGRAM DETAILS' : 'PROGRAM ID'}</span>
            <span>{view === 'available' ? 'BUDGET' : 'SUBMITTED DATE'}</span>
            <span>{view === 'available' ? 'STATUS' : 'STATUS'}</span>
            {view === 'available' && <span>ACTION</span>}
          </div>

          <div className="table-body">
            {loading ? (
              <div className="loading-state">Updating records...</div>
            ) : view === 'available' ? (
              programs.map(prog => {
                const applied = isAlreadyApplied(prog.programId);
                const isClosed = prog.status === 'CLOSED';
                return (
                  <div key={prog.programId} className="table-row available-grid">
                    <div className="prog-info">
                      <span className="prog-name">{prog.title}</span>
                      <DescriptionCell text={prog.description} />
                    </div>
                    <div className="prog-budget">₹{Number(prog.budget).toLocaleString('en-IN')}</div>
                    <div className="prog-status">
                      <span className={`status-badge ${prog.status?.toLowerCase()}`}>{prog.status}</span>
                    </div>
                    <div className="prog-actions">
                      <button 
                        className={`apply-now-btn ${applied ? 'applied' : ''} ${isClosed ? 'closed' : ''}`}
                        disabled={isClosed || applied || applyingId === prog.programId}
                        onClick={() => handleApplyClick(prog)}
                      >
                        {applyingId === prog.programId ? <Loader2 size={14} className="animate-spin" /> : 
                         applied ? "Applied" : isClosed ? "Closed" : "Apply"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              myApplications.map(app => (
                <div key={app.applicationId} className="table-row applications-grid">
                  <div className="prog-id">{app.programId}</div>
                  <div className="app-date">{app.submittedDate}</div>
                  <div className="app-status">
                    <span className={`status-pill ${app.status.toLowerCase()}`}>{app.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default CitizenPrograms;