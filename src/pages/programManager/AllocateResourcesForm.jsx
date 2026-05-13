import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from '../../hooks/useAsync';
import { validateResourceForm, showError, showSuccess } from '../../utils/helpers';
import resourceService from '../../api/resourceService';
import { Loader } from '../common/Loader';
import './Forms.css';

export const AllocateResourcesForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldError, reset } = useForm(
    {
      programId: '',
      type: '',
      quantity: '',
      status: 'AVAILABLE',
    },
    async (formValues) => {
      const validationErrors = validateResourceForm(formValues);
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
          type: formValues.type,
          quantity: parseInt(formValues.quantity),
          status: formValues.status,
        };

        const response = await resourceService.createResource(data);
        showSuccess('Resource allocated successfully!');
        reset();
        onSuccess?.(response);
      } catch (error) {
        showError(error.message || 'Failed to allocate resource');
      } finally {
        setLoading(false);
      }
    }
  );

  const resourceTypes = ['Personnel', 'Equipment', 'Materials', 'Technology', 'Infrastructure', 'Other'];

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
        <label htmlFor="type" className="form-label">
          Resource Type <span className="required">*</span>
        </label>
        <select
          id="type"
          name="type"
          className={`form-control ${touched.type && errors.type ? 'is-invalid' : ''}`}
          value={values.type}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          disabled={loading}
        >
          <option value="">Select resource type</option>
          {resourceTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {touched.type && errors.type && (
          <div className="invalid-feedback">{errors.type}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="quantity" className="form-label">
          Quantity <span className="required">*</span>
        </label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          className={`form-control ${touched.quantity && errors.quantity ? 'is-invalid' : ''}`}
          value={values.quantity}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter quantity"
          min="1"
          required
          disabled={loading}
        />
        {touched.quantity && errors.quantity && (
          <div className="invalid-feedback">{errors.quantity}</div>
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
          <option value="AVAILABLE">Available</option>
          <option value="UTILIZED">Utilized</option>
        </select>
        {touched.status && errors.status && (
          <div className="invalid-feedback">{errors.status}</div>
        )}
      </div>

      {loading && <Loader message="Allocating resource..." />}

      <button
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={loading}
      >
        {loading ? 'Allocating...' : 'Allocate Resource'}
      </button>
    </motion.form>
  );
};

export default AllocateResourcesForm;
