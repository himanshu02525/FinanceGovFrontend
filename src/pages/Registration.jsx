import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCitizen, getCitizenByUserId, updateCitizen } from './api';

const initialForm = {
  name: '',
  type: 'CITIZEN',
  contactInfo: '',
  address: ''
};

export const Registration = () => {
  const [formData, setFormData] = useState(initialForm);
  const [entityId, setEntityId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingUser = async () => {
      if (!userId) {
        setIsCheckingUser(false);
        return;
      }

      try {
        const response = await getCitizenByUserId(userId);
        const citizen = response?.data || response;
        localStorage.setItem('citizenProfile', JSON.stringify(citizen));
        localStorage.setItem('activeEntityId', citizen.entityId);
        setFormData({
          name: citizen.name || '',
          type: citizen.type || 'CITIZEN',
          contactInfo: citizen.contactInfo || '',
          address: citizen.address || ''
        });
        setEntityId(citizen.entityId || null);
        setIsRegistered(!!citizen.entityId);
        setIsEditMode(true);
        setStatusMessage('Existing registration found. You can update your details below.');
        setIsCheckingUser(false);
        return;
      } catch (error) {
        if (error.response?.status === 404) {
          setIsCheckingUser(false);
        } else {
          console.error('Failed to check existing user:', error);
          setIsCheckingUser(false);
        }
      }
    };

    checkExistingUser();
  }, [userId, navigate]);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newUserId = localStorage.getItem('userId');
      if (newUserId !== userId) {
        setUserId(newUserId);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage('');

    const storedId = localStorage.getItem('userId');
    const userId = storedId ? parseInt(storedId, 10) : 1;
    // User doesn't exist, create new
    const payload = {
      userId: userId,
      name: formData.name,
      type: formData.type,
      contactInfo: formData.contactInfo,
      address: formData.address
    };

    try {
      let response;
      if (entityId) {
        console.log('Updating citizen with payload:', payload);
        response = await updateCitizen(entityId, payload);
      } else {
        console.log('Creating citizen with payload:', payload);
        response = await createCitizen(payload);
      }
      console.log('API response:', response?.data || response);
      const apiResponse = response?.data || response;
      const existingProfile = JSON.parse(localStorage.getItem('citizenProfile') || '{}');
      let savedProfile = {};

      if (apiResponse && typeof apiResponse === 'object') {
        savedProfile = apiResponse;
      } else {
        savedProfile = {
          ...existingProfile,
          ...payload,
          entityId: entityId || existingProfile.entityId,
        };
      }

      console.log('Saved profile:', savedProfile);

      if (savedProfile.entityId) {
        localStorage.setItem('citizenProfile', JSON.stringify(savedProfile));
        localStorage.setItem('activeEntityId', savedProfile.entityId);
        setEntityId(savedProfile.entityId);
        setIsRegistered(true);
      } else {
        localStorage.setItem('citizenProfile', JSON.stringify(savedProfile));
      }

      setStatusMessage(entityId ? 'Details updated successfully.' : 'Registration completed successfully.');
      if (savedProfile.entityId) {
        navigate('/profile');
      }
      alert('Data saved in MySQL successfully!');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data || error.message;
      if (errorMessage.includes('already exists') || error.response?.status === 409 || error.response?.status === 500) {
        // User already exists, fetch and redirect to profile
        try {
          const response = await getCitizenByUserId(userId);
          const citizen = response?.data || response;
          localStorage.setItem('citizenProfile', JSON.stringify(citizen));
          localStorage.setItem('activeEntityId', citizen.entityId);
          navigate('/profile');
        } catch (fetchError) {
          alert('User exists but failed to load profile. Please try again.');
        }
      } else {
        alert(`Registration failed: ${errorMessage}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      {isCheckingUser ? (
        <div className="alert alert-info">Checking your account. Please wait...</div>
      ) : (
        <>
          <h2>Entity Registration</h2>
          <button
            className="btn btn-secondary mb-3"
            onClick={() => {
              const newUserId = localStorage.getItem('userId');
              setUserId(newUserId);
            }}
          >
            Re-check User
          </button>
          {isRegistered && (
            <div className="alert alert-info">
              Registration is already done. You can update your details here or proceed to upload documents.
            </div>
          )}
          {isEditMode && (
            <div className="alert alert-warning">
              Existing registration found. Update the details below and save.
            </div>
          )}
          {statusMessage && <div className="alert alert-success">{statusMessage}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                maxLength="15"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label>Type</label>
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="CITIZEN">Citizen</option>
                <option value="BUSINESS">Business</option>
              </select>
            </div>

            <div className="mb-3">
              <label>Contact Info (10 digits)</label>
              <input
                type="text"
                className="form-control"
                pattern="^[0-9]{10}$"
                title="Please enter exactly 10 digits"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label>Address</label>
              <input
                type="text"
                className="form-control"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-success" disabled={submitting}>
              {entityId ? 'Update details' : 'Save to Database'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};
