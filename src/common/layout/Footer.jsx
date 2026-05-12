import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, MapPin, Phone, Mail } from 'lucide-react';
import './Footer.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-IN'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.footer
      className="footer"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="footer-content">
        <div className="footer-section">
          <h6>Department Information</h6>
          <div className="footer-item">
            <MapPin size={16} />
            <span>New Delhi, India</span>
          </div>
          <div className="footer-item">
            <Phone size={16} />
            <span>+91 78697 12345</span>
          </div>
          <div className="footer-item">
            <Mail size={16} />
            <span>FinanceGov@government.in</span>
          </div>
        </div>

        <div className="footer-section">
          <h6>Quick Links</h6>
          <ul>
            <li><a href="#/">Home</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h6>Resources</h6>
          <ul>
            <li><a href="#help">Help Center</a></li>
            <li><a href="#docs">Documentation</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#support">Support</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h6>Current Time</h6>
          <div className="footer-item">
            <span className="time-display">{currentTime}</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-divider"></div>
        <div className="footer-copyright">
          <p>&copy; {currentYear} Ministry of Finance. All rights reserved.</p>
          <p className="footer-version">Government System v1.0.0</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
