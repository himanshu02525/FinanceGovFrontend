import { useState, useCallback } from 'react';
import { handleApiError } from '../utils/helpers';

/**
 * Custom hook for async operations with loading state
 */
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setStatus('pending');
      setData(null);
      setError(null);
      try {
        const response = await asyncFunction(...args);
        setData(response);
        setStatus('success');
        return response;
      } catch (error) {
        setError(error);
        setStatus('error');
        handleApiError(error);
        throw error;
      }
    },
    [asyncFunction]
  );

  return { execute, status, data, error };
};

/**
 * Custom hook for form handling
 */
export const useForm = (initialState, onSubmit) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setFieldError = (field, error) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const reset = () => {
    setValues(initialState);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError,
    reset,
    setValues,
  };
};
