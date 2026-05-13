import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import CreateBudgetForm from '../components/forms/CreateBudgetForm';
import { PageLoader } from '../components/common/Loader';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import budgetService from '../services/budgetService';
import { formatCurrency, formatDate } from '../utils/helpers';
import './Pages.css';

export const CreateBudget = () => {
  const location = useLocation();
  const [allocations, setAllocations] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    // Check if we came from Dashboard with viewMode state
    return location.state?.viewMode || 'form';
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    itemId: 0,
    isLoading: false,
  });

  // Load allocations when component mounts or when switching to list view
  useEffect(() => {
    if (viewMode === 'list') {
      loadAllocations();
    }
  }, [viewMode]);

  const handleSuccess = async (newAllocation) => {
    // Add new allocation to list
    setAllocations(prev => [newAllocation, ...prev]);
    
    // Refresh the list
    loadAllocations();
  };

  const loadAllocations = async () => {
    setLoadingList(true);
    try {
      const data = await budgetService.getAllAllocations();
      setAllocations(data || []);
    } catch (error) {
      console.error('Error loading allocations:', error);
    } finally {
      setLoadingList(false);
    }
  };

  const handleDelete = async (allocationId) => {
    console.log('=== DELETE BUTTON CLICKED ===');
    console.log('Allocation ID to delete:', allocationId);
    console.log('Opening confirmation dialog...');
    setDeleteConfirm({ isOpen: true, itemId: allocationId, isLoading: false });
  };

  const confirmDelete = async () => {
    console.log('=== CONFIRM DELETE FUNCTION CALLED ===');
    if (!deleteConfirm.itemId) {
      console.error('No item ID to delete');
      return;
    }

    console.log('Starting delete process for ID:', deleteConfirm.itemId);
    setDeleteConfirm(prev => ({ ...prev, isLoading: true }));
    try {
      console.log('Calling budgetService.deleteAllocation...');
      const response = await budgetService.deleteAllocation(deleteConfirm.itemId);
      console.log('Delete response:', response);
      
      // Close dialog first
      setDeleteConfirm({ isOpen: false, itemId: null, isLoading: false });
      
      // Then reload the list to get fresh data
      console.log('Reloading allocations...');
      await loadAllocations();
      console.log('Delete completed successfully!');
    } catch (error) {
      console.error('Error deleting allocation:', error);
      alert('Failed to delete allocation. Please try again.');
      setDeleteConfirm(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="header-content">
          <Plus size={32} />
          <div>
            <h2>Create Budget Allocation</h2>
            <p className="text-muted">Allocate monthly wise budget to your programs</p>
          </div>
        </div>
        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => setViewMode(viewMode === 'form' ? 'list' : 'form')}
        >
          {viewMode === 'form' ? 'View Allocations' : 'New Allocation'}
        </button>
      </div>

      <div className="page-content single-column">
        {/* Form Section - Show only when viewMode is 'form' */}
        {viewMode === 'form' && (
          <motion.div
            className="form-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card">
              <div className="card-header">
                <h4>Budget Allocation Form</h4>
              </div>
              <div className="card-body">
                <CreateBudgetForm onSuccess={handleSuccess} />
              </div>
            </div>
          </motion.div>
        )}

        {/* List Section - Show only when viewMode is 'list' */}
        {viewMode === 'list' && (
          <motion.div
            className="list-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card">
              <div className="card-header">
                <h4>All Budget Allocations</h4>
              </div>
              <div className="card-body">
                {loadingList && <PageLoader fullScreen={false} />}
                {!loadingList && allocations && allocations.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Allocation ID</th>
                          <th>Program ID</th>
                          <th>Amount</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allocations.map((alloc) => (
                          <motion.tr
                            key={alloc.allocationId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <td>#{alloc.allocationId}</td>
                            <td>{alloc.programId}</td>
                            <td className="fw-bold">
                              {formatCurrency(alloc.amount)}
                            </td>
                            <td>{formatDate(alloc.date)}</td>
                            <td>
                              <span className={`badge badge-${alloc.status === 'ALLOCATED' ? 'success' : 'danger'}`}>
                                {alloc.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => {
                                  console.log('DELETE BUTTON CLICKED - FIRING ONCLICK');
                                  handleDelete(alloc.allocationId);
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  !loadingList && (
                    <div className="empty-state-simple">
                      <p>No allocations found. Create your first allocation!</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Allocation"
        message="Are you sure you want to delete this allocation? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, itemId: null, isLoading: false })}
        isLoading={deleteConfirm.isLoading}
        isDangerous={true}
      />
    </motion.div>
  );
};

export default CreateBudget;
