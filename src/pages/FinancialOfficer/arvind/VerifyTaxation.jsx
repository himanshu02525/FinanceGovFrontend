import React, { useEffect, useState } from 'react';
import { apiClient } from '@api/aravind';
import { statusBadgeClass, taxStatusLabels } from '@utils/status';
import LoadingSpinner from '@components/common/LoadingSpinner';

const VerifyTaxation = () => {
  const [taxRecords, setTaxRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadRecords = async () => {
    setError(null);
    setSuccess(null);
    try {
      setLoading(true);
      const response = await apiClient.get('/api/taxation/all_taxrecords');
      setTaxRecords(response.data || []);
    } catch (err) {
      setError(err.message || 'Unable to fetch taxation records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const updateStatus = async (taxId, status) => {
    setError(null);
    setSuccess(null);
    setActionLoading(taxId);
    try {
      await apiClient.put(`/api/taxation/taxrecords/verify/${taxId}`, { status });
      setSuccess(`Taxation record ${taxId} has been updated to ${status}.`);
      await loadRecords();
    } catch (err) {
      setError(err.message || 'Failed to update taxation status.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      {actionLoading && <LoadingSpinner message="Processing taxation record..." />}
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Verify Taxation</h2>
          <p className="text-muted">Review all tax records and approve or reject them.</p>
        </div>
        <button className="btn btn-outline-primary" onClick={loadRecords} disabled={loading}>
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
              <th>Year</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading taxation records…
                </td>
              </tr>
            ) : taxRecords.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No taxation records available.
                </td>
              </tr>
            ) : (
              taxRecords.map((record) => (
                <tr key={record.taxId}>
                  <td>{record.entityId}</td>
                  <td>{record.year}</td>
                  <td>₹{record.amount}</td>
                  <td>
                    <span className={`badge bg-${statusBadgeClass(record.status)}`}>
                      {taxStatusLabels[record.status] || record.status}
                    </span>
                  </td>
                  <td>
                    {record.status === 'PENDING' ? (
                      <>
                        <button
                          className="btn btn-sm btn-success me-2"
                          disabled={actionLoading === record.taxId}
                          onClick={() => updateStatus(record.taxId, 'VERIFIED_INITIAL')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          disabled={actionLoading === record.taxId}
                          onClick={() => updateStatus(record.taxId, 'REJECTED')}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-muted">Already processed</span>
                    )}
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

export default VerifyTaxation;
