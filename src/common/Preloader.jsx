import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import './Preloader.css';

const Preloader = ({ onFinish }) => {
  useEffect(() => {
    // Matches the 3s duration for your branding animation
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="preloader-overlay">
      <motion.div 
        initial={{ scale: 0.5, filter: 'blur(15px)', opacity: 0 }} 
        animate={{ scale: [0.5, 1.1, 1], filter: 'blur(0px)', opacity: 1 }} 
        transition={{ duration: 2.5, ease: "easeInOut" }} 
        className="preloader-brand"
      > 
        <h1 className="display-1 fw-bold text-white"> 
          Finance<span className="text-warning">Gov</span> 
        </h1> 
        <p className="letter-spacing">NATIONAL FINANCIAL REGULATION</p> 
      </motion.div> 
    </div>
  );
};

export default Preloader;