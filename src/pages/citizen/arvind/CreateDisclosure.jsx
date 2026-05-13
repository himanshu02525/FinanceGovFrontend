import React, { useState } from 'react';
import { apiClient } from '@api/aravind';
import { getEntityId, getUserId, getMissingIdsMessage } from '@utils/storage';
import LoadingSpinner from '@components/common/LoadingSpinner';

const CreateDisclosure = () => {
  const [type, setType] = useState('INCOME');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const entityId = getEntityId();
  const userId = getUserId();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!entityId || !userId) {
      setError(getMissingIdsMessage());
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/api/disclosure/enter_disclosure', {
        entityId,
        type,
        userId
      });
      setMessage('Disclosure submitted successfully. Status will update when verified.');
    } catch (err) {
      setError(err.message || 'Unable to submit disclosure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSpinner message="Submitting disclosure..." />}
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Create Disclosure</h2>
          <p className="text-muted">Submit a new disclosure using the backend disclosure API.</p>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Entity ID</label>
              <input type="text" className="form-control" value={entityId || ''} disabled />
            </div>

            <div className="mb-3">
              <label className="form-label">Disclosure Type</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Disclosure'}
            </button>
          </form>

          {message && <div className="alert alert-success mt-4">{message}</div>}
          {error && <div className="alert alert-danger mt-4">{error}</div>}
        </div>
      </div>
      </div>
    </>
  );
};

export default CreateDisclosure;
