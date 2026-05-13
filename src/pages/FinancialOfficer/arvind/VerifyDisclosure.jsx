import React, { useEffect, useState } from 'react';
import { apiClient } from '@api/aravind';
import { statusBadgeClass, disclosureStatusLabels } from '@utils/status';
import LoadingSpinner from '@components/common/LoadingSpinner';

const VerifyDisclosure = () => {
  const [disclosures, setDisclosures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadDisclosures = async () => {
    setError(null);
    setSuccess(null);
    try {
      setLoading(true);
      const response = await apiClient.get('/api/disclosure/all_disclosures');
      setDisclosures(response.data || []);
    } catch (err) {
      setError(err.message || 'Unable to fetch disclosure records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisclosures();
  }, []);

  const updateStatus = async (disclosureId, status) => {
    setError(null);
    setSuccess(null);
    setActionLoading(disclosureId);
    try {
      await apiClient.patch(`/api/disclosure/${disclosureId}/validate`, null, {
        params: { status }
      });
      setSuccess(`Disclosure ${disclosureId} updated to ${status}.`);
      await loadDisclosures();
    } catch (err) {
      setError(err.message || 'Failed to update disclosure status.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      {actionLoading && <LoadingSpinner message="Processing disclosure..." />}
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Verify Disclosure</h2>
          <p className="text-muted">Review disclosures and validate or reject them.</p>
        </div>
        <button className="btn btn-outline-primary" onClick={loadDisclosures} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="table-responsive shadow-sm rounded bg-white">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Entity ID</th>
              <th>Type</th>
              <th>Status</th>
              <th>Submission Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading disclosures…
                </td>
              </tr>
            ) : disclosures.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No disclosure records available.
                </td>
              </tr>
            ) : (
              disclosures.map((record) => (
                <tr key={record.disclosureId}>
                  <td>{record.entityId}</td>
                  <td>{record.type}</td>
                  <td>
                    <span className={`badge bg-${statusBadgeClass(record.status)}`}>
                      {disclosureStatusLabels[record.status] || record.status}
                    </span>
                  </td>
                  <td>{new Date(record.submissionDate).toLocaleString()}</td>
                  <td>
                    {record.status !== 'SUBMITTED' && (
                      <span className="text-muted me-2">Action complete</span>
                    )}
                    <button
                      className="btn btn-sm btn-success me-2"
                      disabled={actionLoading === record.disclosureId || record.status !== 'SUBMITTED'}
                      onClick={() => updateStatus(record.disclosureId, 'VALIDATED')}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={actionLoading === record.disclosureId || record.status !== 'SUBMITTED'}
                      onClick={() => updateStatus(record.disclosureId, 'REJECTED')}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </>
  );
};

export default VerifyDisclosure;
