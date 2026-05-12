import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, LogOut } from 'lucide-react';
import './Header.css';

export const Header = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <motion.header
      className="header"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="header-container">
        <div className="header-brand">
          <motion.div
            className="header-logo"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <BarChart3 size={32} />
          </motion.div>
          <div className="brand-text">
            <h1>FinanceGov</h1>
            <p>Program Manager</p>
          </div>
        </div>

        <div className="header-info">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
