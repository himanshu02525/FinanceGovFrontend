import React, { useEffect, useState } from 'react';
import { apiClient } from '@api/aravind';
import { getEntityId, getMissingIdsMessage } from '@utils/storage';
import { statusBadgeClass, disclosureStatusLabels } from '@utils/status';

const MyDisclosures = () => {
  const [disclosures, setDisclosures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const entityId = getEntityId();

  const loadDisclosures = async () => {
    setError(null);
    if (!entityId) {
      setError(getMissingIdsMessage());
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/api/disclosure/entity/${entityId}`);
      setDisclosures(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load disclosure history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisclosures();
  }, []);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>My Disclosure History</h2>
          <p className="text-muted">Fetch disclosure records for your entity ID.</p>
        </div>
        <button className="btn btn-outline-primary" onClick={loadDisclosures} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive shadow-sm rounded bg-white">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Type</th>
              <th>Status</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  Loading records…
                </td>
              </tr>
            ) : disclosures.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  No disclosure records found.
                </td>
              </tr>
            ) : (
              disclosures.map((record) => (
                <tr key={record.disclosureId}>
                  <td>{record.type}</td>
                  <td>
                    <span className={`badge bg-${statusBadgeClass(record.status)}`}>
                      {disclosureStatusLabels[record.status] || record.status}
                    </span>
                  </td>
                  <td>{new Date(record.submissionDate).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyDisclosures;
