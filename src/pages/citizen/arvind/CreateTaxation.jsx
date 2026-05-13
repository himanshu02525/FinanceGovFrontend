import React, { useState } from 'react';
import { apiClient } from '@api/aravind';
import { getEntityId, getUserId, getMissingIdsMessage } from '@utils/storage';
import LoadingSpinner from '@components/common/LoadingSpinner';

const CreateTaxation = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [taxRecord, setTaxRecord] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const entityId = getEntityId();
  const userId = getUserId();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitted(false);

    if (!entityId || !userId) {
      setError(getMissingIdsMessage());
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/api/taxation/enter_taxrecord', {
        entityId,
        year: Number(year),
        amount: Number(amount)
      });
      setTaxRecord(response.data);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Unable to submit taxation record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSpinner message="Submitting taxation record..." />}
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Create Taxation</h2>
          <p className="text-muted">Submit a taxation record and confirm conceptual payment.</p>
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
              <label className="form-label">Fiscal Year</label>
              <input
                type="number"
                className="form-control"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="2000"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Amount</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Taxation'}
            </button>
          </form>

          {error && <div className="alert alert-danger mt-4">{error}</div>}
        </div>
      </div>

      {submitted && (
        <div className="alert alert-success mt-4">
          Taxation record submitted successfully. Your record is now in <strong>Pending</strong> status.
          When it reaches <strong>Verified Final</strong>, the payment screen will become available.
        </div>
      )}
      </div>
    </>
  );
};

export default CreateTaxation;
