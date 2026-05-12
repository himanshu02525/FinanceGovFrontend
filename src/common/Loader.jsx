import React from 'react';
import { motion } from 'framer-motion';
import './Loader.css';

export const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="loader-container">
      <motion.div
        className="loader-spinner"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className="spinner-circle"></div>
      </motion.div>
      <motion.p
        className="loader-text"
        animate={{ opacity: [0.6, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  );
};

export const PageLoader = ({ fullScreen = true }) => {
  const containerClass = fullScreen ? 'page-loader-fullscreen' : 'page-loader';

  return (
    <div className={containerClass}>
      <Loader message="Loading..." />
    </div>
  );
};

export const SkeletonLoader = ({ count = 3, height = 100 }) => {
  return (
    <div className="skeleton-loader">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="skeleton-item"
          style={{ height: `${height}px` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      ))}
    </div>
  );
};

export default Loader;
