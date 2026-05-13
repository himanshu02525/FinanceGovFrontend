import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from '../../hooks/useAsync';
import { validateProgramForm, showError, showSuccess } from '../../utils/helpers';
import programService from '../../services/programService';
import { Loader } from '../common/Loader';
import './Forms.css';

export const CreateProgramForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldError, reset } = useForm(
    {
      title: '',
      description: '',
      budget: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'ACTIVE',
    },
    async (formValues) => {
      const validationErrors = validateProgramForm(formValues);
      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setFieldError(field, message);
        });
        return;
      }

      setLoading(true);
      try {
        const data = {
          title: formValues.title.trim(),
          description: formValues.description.trim(),
          budget: parseFloat(formValues.budget),
          startDate: formValues.startDate,
          endDate: formValues.endDate,
          status: formValues.status,
        };

        const response = await programService.createProgram(data);
        showSuccess('Program created successfully!');
        reset();
        onSuccess?.(response);
      } catch (error) {
        showError(error.message || 'Failed to create program');
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
        <label htmlFor="title" className="form-label">
          Program Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className={`form-control ${touched.title && errors.title ? 'is-invalid' : ''}`}
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter program title"
          maxLength="100"
          required
          disabled={loading}
        />
        {touched.title && errors.title && (
          <div className="invalid-feedback">{errors.title}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description <span className="required">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          className={`form-control ${touched.description && errors.description ? 'is-invalid' : ''}`}
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter program description"
          rows="4"
          maxLength="500"
          required
          disabled={loading}
          style={{ resize: 'vertical', minHeight: '100px' }}
        />
        {touched.description && errors.description && (
          <div className="invalid-feedback">{errors.description}</div>
        )}
        <small className="form-text">
          {values.description.length}/500 characters
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="budget" className="form-label">
          Budget (₹) <span className="required">*</span>
        </label>
        <input
          type="number"
          id="budget"
          name="budget"
          className={`form-control ${touched.budget && errors.budget ? 'is-invalid' : ''}`}
          value={values.budget}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter budget amount"
          step="0.01"
          min="0"
          required
          disabled={loading}
        />
        {touched.budget && errors.budget && (
          <div className="invalid-feedback">{errors.budget}</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate" className="form-label">
            Start Date <span className="required">*</span>
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            className={`form-control ${touched.startDate && errors.startDate ? 'is-invalid' : ''}`}
            value={values.startDate}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            disabled={loading}
          />
          {touched.startDate && errors.startDate && (
            <div className="invalid-feedback">{errors.startDate}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="endDate" className="form-label">
            End Date <span className="required">*</span>
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            className={`form-control ${touched.endDate && errors.endDate ? 'is-invalid' : ''}`}
            value={values.endDate}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            disabled={loading}
          />
          {touched.endDate && errors.endDate && (
            <div className="invalid-feedback">{errors.endDate}</div>
          )}
        </div>
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
          <option value="ACTIVE">Active</option>
          <option value="CLOSED">Closed</option>
        </select>
        {touched.status && errors.status && (
          <div className="invalid-feedback">{errors.status}</div>
        )}
      </div>

      {loading && <Loader message="Creating program..." />}

      <button
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Program'}
      </button>
    </motion.form>
  );
};

export default CreateProgramForm;
