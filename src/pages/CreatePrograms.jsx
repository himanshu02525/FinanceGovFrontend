import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import CreateProgramForm from '../components/forms/CreateProgramForm';
import { PageLoader } from '../components/common/Loader';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import programService from '../services/programService';
import { formatCurrency, formatDate } from '../utils/helpers';
import './Pages.css';

export const CreatePrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [viewMode, setViewMode] = useState('form'); // 'form' or 'list'
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    itemId: null,
    isLoading: false,
  });

  // Load programs when component mounts or when switching to list view
  useEffect(() => {
    if (viewMode === 'list') {
      loadPrograms();
    }
  }, [viewMode]);

  const handleSuccess = async (newProgram) => {
    // Add new program to list
    setPrograms(prev => [newProgram, ...prev]);
    
    // Refresh the list
    loadPrograms();
  };

  const loadPrograms = async () => {
    setLoadingList(true);
    try {
      const data = await programService.getAllPrograms();
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoadingList(false);
    }
  };

  const handleDelete = async (programId) => {
    console.log('🗑️ DELETE BUTTON CLICKED');
    console.log('Program ID passed:', programId);
    console.log('Type of ID:', typeof programId);
    setDeleteConfirm({ isOpen: true, itemId: programId, isLoading: false });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.itemId) {
      console.error('No item ID to delete');
      return;
    }

    setDeleteConfirm(prev => ({ ...prev, isLoading: true }));
    try {
      console.log('Deleting program:', deleteConfirm.itemId);
      const response = await programService.deleteProgram(deleteConfirm.itemId);
      console.log('Delete response:', response);
      
      // Close dialog first
      setDeleteConfirm({ isOpen: false, itemId: null, isLoading: false });
      
      // Then reload the list to get fresh data
      await loadPrograms();
    } catch (error) {
      console.error('Error deleting program:', error);
      let errorMessage = 'Failed to delete program. Please try again.';
      
      // Check if it's a foreign key constraint error
      if (error.response?.status === 409 || 
          error.message?.includes('foreign key') || 
          error.message?.includes('constraint') ||
          error.response?.data?.includes('foreign key')) {
        errorMessage = 'Cannot delete this program. It has associated subsidy applications or allocations. Please delete those first.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
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
            <h2>Create Financial Programs</h2>
            <p className="text-muted">Create and manage financial assistance programs</p>
          </div>
        </div>
        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => setViewMode(viewMode === 'form' ? 'list' : 'form')}
        >
          {viewMode === 'form' ? 'All Programs' : 'New Program'}
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
                <h4>Program Details Form</h4>
              </div>
              <div className="card-body">
                <CreateProgramForm onSuccess={handleSuccess} />
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
                <h4>All Programs</h4>
              </div>
              <div className="card-body">
                {loadingList && <PageLoader fullScreen={false} />}
                {!loadingList && programs && programs.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Program ID</th>
                          <th>Title</th>
                          <th>Description</th>
                          <th>Budget</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programs.map((program) => (
                          <motion.tr
                            key={program.programId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <td>#{program.programId}</td>
                            <td className="fw-bold">{program.title}</td>
                            <td className="text-truncate" title={program.description}>
                              {program.description.length > 50
                                ? program.description.substring(0, 50) + '...'
                                : program.description}
                            </td>
                            <td className="fw-bold">
                              {formatCurrency(program.budget)}
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  program.status === 'ACTIVE'
                                    ? 'status-active'
                                    : 'status-closed'
                                }`}
                              >
                                {program.status}
                              </span>
                            </td>
                            <td>
                              <motion.button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(program.programId)}
                                disabled={deleteConfirm.isLoading}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Delete
                              </motion.button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  !loadingList && (
                    <div className="empty-state-simple">
                      <p>No programs found. Create your first program using the form.</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Program"
        message="Are you sure you want to delete this program? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteConfirm.isLoading}
        isDangerous={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, itemId: null, isLoading: false })}
      />
    </motion.div>
  );
};

export default CreatePrograms;
