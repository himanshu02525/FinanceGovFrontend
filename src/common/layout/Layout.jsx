import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import './Layout.css';

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`layout ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
      <Header />
      <div className={`layout-body ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <Sidebar onToggle={setSidebarOpen} initialState={sidebarOpen} />
        <main className="main-content">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
