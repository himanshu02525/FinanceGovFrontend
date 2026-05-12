import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div>
        <h1>404</h1>
        <p>Page not found. The citizen portal route may have changed.</p>
        <Link to="/" className="btn btn-primary">Return to Dashboard</Link>
      </div>
    </div>
  );
};

export default NotFound;
