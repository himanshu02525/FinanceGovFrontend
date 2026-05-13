import React, { useEffect, useState } from 'react';
import { apiClient } from '@api/aravind';
import { getEntityId, getMissingIdsMessage } from '@utils/storage';
import { statusBadgeClass, taxStatusLabels } from '@utils/status';
import LoadingSpinner from '@components/common/LoadingSpinner';

const PaymentScreen = () => {
  const [taxRecords, setTaxRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [paymentStage, setPaymentStage] = useState('select_method');
  const [selectedPaymentChoice, setSelectedPaymentChoice] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [paymentTimestamp, setPaymentTimestamp] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [paying, setPaying] = useState(false);

  const entityId = getEntityId();

  const getDueDate = (year) => {
    return new Date(year, 2, 30);
  };

  const isOverdue = (record) => {
    return new Date() > getDueDate(record.year);
  };

  const calculatePenalty = (amount) => {
    return Math.round((amount * 2) / 100);
  };

  const generateTransactionId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN${timestamp}${random}`;
  };

  const loadRecordsAsync = async () => {
    setError(null);
    setSuccess(null);
    if (!entityId) {
      setError(getMissingIdsMessage());
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/api/taxation/taxrecords/entity/${entityId}`);
      const verifiedFinal = (response.data || []).filter((record) => record.status === 'VERIFIED_FINAL');
      setTaxRecords(verifiedFinal);
    } catch (err) {
      setError(err.message || 'Unable to load payment-ready tax records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecordsAsync();
  }, []);

  const confirmPayment = (record) => {
    setError(null);
    setSuccess(null);
    setSelectedRecord(record);
    setPaymentMethod('credit_card');
    setPaymentDetails({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
    setPaymentStage('select_method');
    setSelectedPaymentChoice(null);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedRecord(null);
  };

  const handlePaymentDetailChange = (field, value) => {
    setPaymentDetails((current) => ({ ...current, [field]: value }));
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    if (!selectedRecord) {
      setError('No record selected for payment.');
      return;
    }

    if (paymentMethod === 'credit_card') {
      if (!paymentDetails.cardName || !paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.cvv) {
        setError('Please complete all card payment fields.');
        return;
      }
    }

    if ((paymentMethod === 'upi' || paymentMethod === 'netbanking') && !selectedPaymentChoice) {
      setError('Please select a payment option before proceeding.');
      return;
    }

    setError(null);
    setSuccess(null);
    setPaying(true);

    try {
      await apiClient.put(`/api/taxation/taxrecords/pay/${selectedRecord.taxId}`);
      setTaxRecords((records) => records.filter((record) => record.taxId !== selectedRecord.taxId));
      const newTxnId = generateTransactionId();
      setTransactionId(newTxnId);
      setPaymentTimestamp(new Date());
      setPaymentStage('done');
      setSuccess(`Payment completed successfully for tax record ${selectedRecord.taxId}.`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment update failed.');
    } finally {
      setPaying(false);
    }
  };


  return (
    <>
      {paying && <LoadingSpinner message="Processing payment..." />}
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Payment Screen</h2>
          <p className="text-muted">These tax records are finalised and ready for payment.</p>
        </div>
        <button className="btn btn-outline-primary" onClick={loadRecordsAsync} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="table-responsive shadow-sm rounded bg-white">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Tax ID</th>
              <th>Year</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Loading records…
                </td>
              </tr>
            ) : taxRecords.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No tax records are in Verified Final status yet.
                </td>
              </tr>
            ) : (
              taxRecords.map((record) => (
                <tr key={record.taxId}>
                  <td>{record.taxId}</td>
                  <td>{record.year}</td>
                  <td>₹{record.amount}</td>
                  <td>
                    <span className={`badge bg-${statusBadgeClass(record.status)}`}>
                      {taxStatusLabels[record.status] || record.status}
                    </span>
                  </td>
                  <td>{new Date(record.createdAt).toLocaleString()}</td>
                  <td>
                    {record.status === 'VERIFIED_FINAL' ? (
                      <button
                        className="btn btn-sm btn-success"
                        disabled={paying}
                        onClick={() => confirmPayment(record)}
                      >
                        Confirm Payment
                      </button>
                    ) : (
                      <span className="text-muted">{taxStatusLabels[record.status] || record.status}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        {showPaymentModal && selectedRecord && (
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Payment</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={closePaymentModal} />
                </div>
                <form onSubmit={handlePaymentSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Tax ID</label>
                      <input type="text" className="form-control" value={selectedRecord.taxId} disabled />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Amount</label>
                      <input type="text" className="form-control" value={`₹${selectedRecord.amount}`} disabled />
                    </div>

                    {paymentStage === 'select_method' && (
                      <>
                        <div className="mb-3">
                          <label className="form-label">Payment Method</label>
                          <select className="form-select" value={paymentMethod} onChange={(e) => {
                            setPaymentMethod(e.target.value);
                            setPaymentStage('select_method');
                            setSelectedPaymentChoice(null);
                            setPaymentDetails({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
                            setError(null);
                          }}>
                            <option value="credit_card">Credit / Debit Card</option>
                            <option value="upi">UPI</option>
                            <option value="netbanking">Net Banking</option>
                          </select>
                        </div>

                        {paymentMethod === 'upi' && (
                          <div className="mb-3">
                            <label className="form-label">Choose UPI App</label>
                            <div className="d-flex gap-2 flex-wrap">
                              {['PhonePe', 'Paytm', 'Google Pay'].map((app) => (
                                <button
                                  key={app}
                                  type="button"
                                  className="btn btn-outline-primary"
                                  onClick={() => {
                                    setSelectedPaymentChoice(app);
                                    setPaymentStage('summary');
                                    setError(null);
                                  }}
                                >
                                  {app}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'netbanking' && (
                          <div className="mb-3">
                            <label className="form-label">Choose Bank</label>
                            <div className="d-flex gap-2 flex-wrap">
                              {['SBI', 'HDFC', 'ICICI', 'Axis Bank', 'Kotak'].map((bank) => (
                                <button
                                  key={bank}
                                  type="button"
                                  className="btn btn-outline-primary"
                                  onClick={() => {
                                    setSelectedPaymentChoice(bank);
                                    setPaymentStage('summary');
                                    setError(null);
                                  }}
                                >
                                  {bank}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'credit_card' && (
                          <>
                            <div className="mb-3">
                              <label className="form-label">Cardholder Name</label>
                              <input
                                type="text"
                                className="form-control"
                                value={paymentDetails.cardName}
                                onChange={(e) => handlePaymentDetailChange('cardName', e.target.value)}
                                placeholder="John Doe"
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Card Number</label>
                              <input
                                type="text"
                                className="form-control"
                                value={paymentDetails.cardNumber}
                                onChange={(e) => handlePaymentDetailChange('cardNumber', e.target.value)}
                                placeholder="1234 5678 9012 3456"
                              />
                            </div>
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Expiry</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={paymentDetails.expiry}
                                  onChange={(e) => handlePaymentDetailChange('expiry', e.target.value)}
                                  placeholder="MM/YY"
                                />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label">CVV</label>
                                <input
                                  type="password"
                                  className="form-control"
                                  value={paymentDetails.cvv}
                                  onChange={(e) => handlePaymentDetailChange('cvv', e.target.value)}
                                  placeholder="123"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {paymentMethod !== 'credit_card' && (
                          <div className="alert alert-info">
                            Select an option above to continue. If payment is made after March 30, a 2% charge will apply.
                          </div>
                        )}
                      </>
                    )}

                    {(paymentMethod === 'upi' || paymentMethod === 'netbanking') && paymentStage === 'summary' && (
                      <div>
                        <div className="mb-3">
                          <h6>Payment Details</h6>
                          <p className="mb-1"><strong>Method:</strong> {paymentMethod === 'upi' ? 'UPI' : 'Net Banking'}</p>
                          <p className="mb-1"><strong>Option:</strong> {selectedPaymentChoice}</p>
                          <p className="mb-1"><strong>Base Amount:</strong> ₹{selectedRecord.amount.toFixed(2)}</p>
                          {isOverdue(selectedRecord) && (
                            <>
                              <div className="alert alert-info mt-2 mb-2">
                                <strong>Note:</strong> A 2% late payment charge has been applied because your payment is being made after March 30, {selectedRecord.year} (the due date).
                              </div>
                              <p className="mb-1 text-danger"><strong>Late Payment Charge (2%):</strong> ₹{(selectedRecord.amount * 0.02).toFixed(2)}</p>
                              <p className="mb-1"><strong>Total Amount:</strong> ₹{(selectedRecord.amount + (selectedRecord.amount * 0.02)).toFixed(2)}</p>
                            </>
                          )}
                          {!isOverdue(selectedRecord) && (
                            <p className="mb-1"><strong>Total Amount:</strong> ₹{selectedRecord.amount.toFixed(2)}</p>
                          )}
                        </div>
                        <div className="mb-3 text-center">
                          <div className="border rounded p-3 d-inline-block bg-light">
                            <p className="mb-2"><strong>Scan QR Code with {selectedPaymentChoice}</strong></p>
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${selectedPaymentChoice} payment ₹${(selectedRecord.amount + (isOverdue(selectedRecord) ? selectedRecord.amount * 0.02 : 0)).toFixed(2)}`)}`}
                              alt="Payment QR Code"
                              className="img-fluid"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentStage === 'done' && (
                      <div>
                        <div className="alert alert-success mb-3">
                          <h6 className="mb-2">✓ Payment Successfully Completed</h6>
                          <p className="mb-0 fs-6"><strong>Transaction ID:</strong> {transactionId}</p>
                        </div>
                        <div className="card border-light shadow-sm">
                          <div className="card-body">
                            <h6 className="card-title mb-3">Payment Details</h6>
                            <div className="row">
                              <div className="col-md-6 mb-2">
                                <p className="text-muted mb-1">Tax ID</p>
                                <p className="mb-2"><strong>{selectedRecord.taxId}</strong></p>
                              </div>
                              <div className="col-md-6 mb-2">
                                <p className="text-muted mb-1">Amount Paid</p>
                                <p className="mb-2"><strong>₹{(selectedRecord.amount + (isOverdue(selectedRecord) ? selectedRecord.amount * 0.02 : 0)).toFixed(2)}</strong></p>
                              </div>
                              <div className="col-md-6 mb-2">
                                <p className="text-muted mb-1">Payment Method</p>
                                <p className="mb-2"><strong>{paymentMethod === 'upi' ? 'UPI' : 'Net Banking'}</strong></p>
                              </div>
                              <div className="col-md-6 mb-2">
                                <p className="text-muted mb-1">Payment Choice</p>
                                <p className="mb-2"><strong>{selectedPaymentChoice}</strong></p>
                              </div>
                              <div className="col-md-6 mb-0">
                                <p className="text-muted mb-1">Date & Time</p>
                                <p className="mb-0"><strong>{paymentTimestamp ? paymentTimestamp.toLocaleString() : 'N/A'}</strong></p>
                              </div>
                              <div className="col-md-6 mb-0">
                                <p className="text-muted mb-1">Status</p>
                                <p className="mb-0"><span className="badge bg-success">PAID</span></p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closePaymentModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={paying || (paymentMethod !== 'credit_card' && paymentStage !== 'summary')}>
                      {paying ? 'Processing...' : 'Pay Now'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentScreen;
