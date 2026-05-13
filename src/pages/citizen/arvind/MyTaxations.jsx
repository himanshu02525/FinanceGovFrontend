import React, { useEffect, useState } from 'react';
import { apiClient } from '@api/aravind';
import { getEntityId, getMissingIdsMessage } from '@utils/storage';
import { statusBadgeClass, taxStatusLabels } from '@utils/status';

const MyTaxations = () => {
  const [taxations, setTaxations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const entityId = getEntityId();

  const loadTaxations = async () => {
    setError(null);
    if (!entityId) {
      setError(getMissingIdsMessage());
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/api/taxation/taxrecords/entity/${entityId}`);
      setTaxations(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load taxation history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxations();
  }, []);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>My Taxation History</h2>
          <p className="text-muted">Fetch taxation records for your entity ID.</p>
        </div>
        <button className="btn btn-outline-primary" onClick={loadTaxations} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive shadow-sm rounded bg-white">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Year</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  Loading records…
                </td>
              </tr>
            ) : taxations.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No taxation records found.
                </td>
              </tr>
            ) : (
              taxations.map((record) => (
                <tr key={record.taxId}>
                  <td>{record.year}</td>
                  <td>₹{record.amount}</td>
                  <td>
                    <span className={`badge bg-${statusBadgeClass(record.status)}`}>
                      {taxStatusLabels[record.status] || record.status}
                    </span>
                  </td>
                  <td>{new Date(record.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyTaxations;
