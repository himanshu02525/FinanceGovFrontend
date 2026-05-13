import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from '../../hooks/useAsync';
import { validateBudgetForm, showError, showSuccess } from '../../utils/helpers';
import budgetService from '../../services/budgetService';
import { Loader } from '../common/Loader';
import './Forms.css';

export const CreateBudgetForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldError, reset } = useForm(
    {
      programId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      status: 'ALLOCATED',
    },
    async (formValues) => {
      const validationErrors = validateBudgetForm(formValues);
      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setFieldError(field, message);
        });
        return;
      }

      setLoading(true);
      try {
        const data = {
          programId: parseInt(formValues.programId),
          amount: parseFloat(formValues.amount),
          date: formValues.date,
          status: formValues.status,
        };

        const response = await budgetService.createAllocation(data);
        showSuccess('Budget allocation created successfully!');
        reset();
        onSuccess?.(response);
      } catch (error) {
        showError(error.message || 'Failed to create budget allocation');
      } finally {
        setLoading(false);
      }
    }
  );

  return (
    <motion.form
      className="form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="form-group">
        <label htmlFor="programId" className="form-label">
          Program ID <span className="required">*</span>
        </label>
        <input
          type="number"
          id="programId"
          name="programId"
          className={`form-control ${touched.programId && errors.programId ? 'is-invalid' : ''}`}
          value={values.programId}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter program ID"
          min="1"
          required
          disabled={loading}
        />
        {touched.programId && errors.programId && (
          <div className="invalid-feedback">{errors.programId}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="amount" className="form-label">
          Amount (₹) <span className="required">*</span>
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          className={`form-control ${touched.amount && errors.amount ? 'is-invalid' : ''}`}
          value={values.amount}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter amount"
          step="0.01"
          min="0"
          required
          disabled={loading}
        />
        {touched.amount && errors.amount && (
          <div className="invalid-feedback">{errors.amount}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="date" className="form-label">
          Allocation Date <span className="required">*</span>
        </label>
        <input
          type="date"
          id="date"
          name="date"
          className={`form-control ${touched.date && errors.date ? 'is-invalid' : ''}`}
          value={values.date}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          disabled={loading}
        />
        {touched.date && errors.date && (
          <div className="invalid-feedback">{errors.date}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="status" className="form-label">
          Status <span className="required">*</span>
        </label>
        <select
          id="status"
          name="status"
          className={`form-control ${touched.status && errors.status ? 'is-invalid' : ''}`}
          value={values.status}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          disabled={loading}
        >
          <option value="ALLOCATED">Allocated</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        {touched.status && errors.status && (
          <div className="invalid-feedback">{errors.status}</div>
        )}
      </div>

      {loading && <Loader message="Creating allocation..." />}

      <button
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Budget Allocation'}
      </button>
    </motion.form>
  );
};

export default CreateBudgetForm;
