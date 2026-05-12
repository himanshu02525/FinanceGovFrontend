import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import './EmptyState.css';

export const EmptyState = ({ 
  title = 'No Data Found',
  message = 'There is no data to display',
  icon: Icon = AlertCircle,
  action = null,
}) => {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="empty-state-icon">
        <Icon size={64} />
      </div>
      <h4>{title}</h4>
      <p>{message}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </motion.div>
  );
};

export default EmptyState;
