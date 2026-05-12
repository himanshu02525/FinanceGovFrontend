import { toast } from 'react-toastify';

/**
 * Format currency values
 */
export const formatCurrency = (value) => {
  if (!value) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value);
};

/**
 * Format date to DD/MM/YYYY
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN');
};

/**
 * Show success toast
 */
export const showSuccess = (message) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show error toast
 */
export const showError = (message) => {
  toast.error(message, {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show info toast
 */
export const showInfo = (message) => {
  toast.info(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Handle API errors and show appropriate message
 */
export const handleApiError = (error) => {
  let message = 'An unexpected error occurred';

  if (error.code === 'VALIDATION_ERROR') {
    message = 'Please check your input and try again';
    if (error.details) {
      const details = error.details.map(d => `${d.field}: ${d.message}`).join(', ');
      message = `Validation Error: ${details}`;
    }
  } else if (error.code === 'Issue With The PROGRAM_ID') {
    message = 'Program not found. Please check the Program ID';
  } else if (error.code === 'BUSINESS_RULE_VIOLATION') {
    message = error.message || 'Business rule violation';
  } else if (error.code === 'MALFORMED_JSON') {
    message = 'Invalid data format';
  } else if (error.code === 'NO_RESPONSE') {
    message = 'Unable to connect to server. Please check your connection and backend service';
  } else if (error.code === 'REQUEST_ERROR') {
    message = error.message;
  } else {
    message = error.message || 'An error occurred';
  }

  showError(message);
  return message;
};

/**
 * Validate form data
 */
export const validateBudgetForm = (data) => {
  const errors = {};

  if (!data.programId) errors.programId = 'Program ID is required';
  if (!data.amount || data.amount <= 0) errors.amount = 'Valid amount is required';
  if (!data.date) errors.date = 'Date is required';
  if (!data.status) errors.status = 'Status is required';

  return errors;
};

/**
 * Validate resource form
 */
export const validateResourceForm = (data) => {
  const errors = {};

  if (!data.programId) errors.programId = 'Program ID is required';
  if (!data.type) errors.type = 'Resource type is required';
  if (!data.quantity || data.quantity <= 0) errors.quantity = 'Valid quantity is required';
  if (!data.status) errors.status = 'Status is required';

  return errors;
};

/**
 * Validate program form
 */
export const validateProgramForm = (data) => {
  const errors = {};

  if (!data.title || data.title.trim() === '') errors.title = 'Title is required';
  if (!data.description || data.description.trim() === '') errors.description = 'Description is required';
  if (!data.budget || data.budget <= 0) errors.budget = 'Valid budget amount is required';
  if (!data.startDate) errors.startDate = 'Start date is required';
  if (!data.endDate) errors.endDate = 'End date is required';
  
  // Validate date logic
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (endDate <= startDate) {
      errors.endDate = 'End date must be after start date';
    }
    if (endDate <= today) {
      errors.endDate = 'End date must be in the future';
    }
  }

  if (!data.status) errors.status = 'Status is required';

  return errors;
};
