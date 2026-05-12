import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, ChevronLeft, Plus, Zap, BarChart2, UserCheck, FileText, X, User } from 'lucide-react';
import './Sidebar.css';

export const Sidebar = ({ onToggle, initialState = true }) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [citizenProfile, setCitizenProfile] = useState(null);
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    const loadProfile = () => {
      const storedProfile = localStorage.getItem('citizenProfile');
      if (storedProfile) {
        try {
          setCitizenProfile(JSON.parse(storedProfile));
        } catch (error) {
          console.error('Failed to parse citizen profile:', error);
        }
      } else {
        setCitizenProfile(null);
      }
    };

    loadProfile();
    window.addEventListener('storage', loadProfile);
    return () => window.removeEventListener('storage', loadProfile);
  }, [pathname]);

  const navigationItems = isAdmin
    ? [
        {
          id: 2,
          label: 'Citizen Management',
          to: '/admin/citizen-management',
          icon: UserCheck,
        },
        {
          id: 3,
          label: 'Document Verification',
          to: '/admin/document-verification',
          icon: FileText,
        },
      ]
    : [
        {
          id: 1,
          label: 'Citizen Registration',
          to: '/registration',
          icon: UserCheck,
        },
        {
          id: 2,
          label: 'Upload Documents',
          to: '/documents',
          icon: FileText,
        },
      ];
  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <motion.button
        className="sidebar-toggle-mobile"
        onClick={toggleMobileSidebar}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="sidebar-overlay"
            onClick={toggleMobileSidebar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`sidebar ${isOpen ? 'expanded' : 'collapsed'} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
        initial={false}
        animate={{
          width: isOpen ? '280px' : '80px',
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Desktop Toggle Button */}
        <motion.button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </motion.button>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon size={20} />
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        {/* Footer Info - Profile Section */}
        {isOpen && !isAdmin && (
          <motion.div
            className="sidebar-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `profile-footer-item ${isActive ? 'active' : ''}`
              }
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="profile-footer-icon">
                <User size={20} />
              </div>
              <div className="profile-footer-info">
                <p className="profile-footer-label">Profile</p>
                <p className="profile-footer-name">
                  {citizenProfile?.name || 'User'}
                </p>
              </div>
            </NavLink>
          </motion.div>
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;