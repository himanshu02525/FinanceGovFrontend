import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post('http://localhost:9091/api/auth/register', formData);

      toast.success("Registration Successful!");
      navigate('/login');

    } catch (err) {
      toast.error("Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Back Button */}
      <button className="auth-back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={18} /> Back to Home
      </button>

      <div className="auth-wrapper">

        {/* ✅ LEFT SIDE */}
        <div className="auth-left">
          <h1 className="brand-title">
            <span className="finance">Finance</span>
            <span className="gov">Gov</span>
          </h1>

          <p className="tagline">
            National Financial Regulation & Economic Governance System
          </p>

          <ul>
            <li>✔ Secure Citizen Registration</li>
            <li>✔ Easy Access to Subsidy Programs</li>
            <li>✔ Transparent Governance System</li>
            <li>✔ Track Applications & Benefits</li>
          </ul>
        </div>

        {/* ✅ RIGHT SIDE */}
        <div className="auth-right">
          
          <div className="login-card">

            <h2>Create Account</h2>
            <p className="subtitle">Register for citizen services</p>

            <form onSubmit={handleRegister}>

              <div className="mb-3">
                <label>Full Name</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your full name"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="ritesh@example.com"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="10-digit mobile number"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  required
                  onChange={handleChange}
                />
              </div>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "REGISTER"}
              </button>

            </form>

            {/* ✅ LOGIN LINK */}
            <div className="register-link">
              Already have an account? <Link to="/login">Login here</Link>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;