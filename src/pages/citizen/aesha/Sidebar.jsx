// src/components/layout/Sidebar.jsx
import React from 'react';
import { FileCheck, ClipboardList, FileText, Search, ChevronRight, ChevronLeft, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const isOfficer = location.pathname.startsWith('/officer');
  const isCitizen = location.pathname.startsWith('/citizen');

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button className="sidebar-toggle-btn" onClick={onToggle} title={isOpen ? 'Close sidebar' : 'Open sidebar'}>
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
      <div className="sidebar-nav">
        {isOfficer && (
          <>
            <NavLink to="/officer/applications" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <FileCheck size={20} /> <span>Approve Applications</span>
            </NavLink>

            <NavLink to="/officer/all-applications" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <ClipboardList size={20} /> <span>View Applications</span>
            </NavLink>

            {/* NEW OPTION ADDED HERE */}
            <NavLink to="/officer/citizen-search" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <User size={20} /> <span>Citizen Details</span>
            </NavLink>
          </>
        )}

        {isCitizen && (
          <>
            <NavLink to="/citizen/programs" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Search size={20} /> <span>Available Programs</span>
            </NavLink>
            <NavLink to="/citizen/my-applications" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <FileText size={20} /> <span>My Applications</span>
            </NavLink>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;