import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmDialog.css';

export const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      console.log('📋 CONFIRM DIALOG OPENED');
      console.log('Dialog props:', { title, isOpen, onConfirm: !!onConfirm, isLoading });
      document.body.classList.add('dialog-open');
    } else {
      document.body.classList.remove('dialog-open');
    }
    return () => {
      document.body.classList.remove('dialog-open');
    };
  }, [isOpen, isLoading]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="confirm-dialog-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Dialog Container */}
          <div className="confirm-dialog-wrapper">
            <motion.div
              className="confirm-dialog"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="confirm-dialog-header">
                <div className="confirm-dialog-icon-wrapper">
                  <AlertTriangle size={28} className="confirm-dialog-icon" />
                </div>
                <h2 className="confirm-dialog-title">{title}</h2>
                <button
                  className="confirm-dialog-close"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="confirm-dialog-content">
                <p className="confirm-dialog-message">{message}</p>
              </div>

              <div className="confirm-dialog-footer">
                <button
                  className="confirm-dialog-btn cancel-btn"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  {cancelText}
                </button>
                <button
                  className={`confirm-dialog-btn confirm-btn ${isDangerous ? 'dangerous' : ''}`}
                  onClick={async (e) => {
                    console.log('=== CONFIRM BUTTON CLICKED ===');
                    console.log('Event:', e);
                    console.log('isLoading state:', isLoading);
                    console.log('onConfirm exists:', !!onConfirm);
                    console.log('onConfirm is function:', typeof onConfirm === 'function');
                    if (onConfirm && typeof onConfirm === 'function') {
                      console.log('Calling onConfirm...');
                      try {
                        await onConfirm();
                        console.log('onConfirm completed successfully');
                      } catch (error) {
                        console.error('Error in onConfirm:', error);
                      }
                    } else {
                      console.warn('onConfirm is not a function or does not exist');
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
