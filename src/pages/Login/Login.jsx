import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Auth.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:9091/api/auth/login', credentials);

      if (response.data.token) {
  localStorage.setItem("token", response.data.token);

  // ✅ ADD THIS
  localStorage.setItem("role", response.data.role || "ROLE_USER");
}
  const role=response.data.role;
      toast.success("Login Successful!");
      
if (role === "ROLE_ADMIN") {
  navigate("/admin/dashboard");
} else {
  navigate("/");
}

     // navigate('/');

    } catch (err) {
      toast.error("Invalid credentials");
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

        {/* ✅ LEFT SIDE (Professional Govt Info Panel) */}
        <div className="auth-left">
          
<h1 className="brand-title">
  <span className="finance">Finance</span>
  <span className="gov">Gov</span>
</h1>


          <p className="tagline">
            National Financial Regulation & Economic Governance System
          </p>

          <ul>
            <li>✔ Secure Government Portal</li>
            <li>✔ Manage Financial Programs</li>
            <li>✔ Apply for Subsidies</li>
            <li>✔ Track Compliance & Reports</li>
          </ul>
        </div>

        {/* ✅ RIGHT SIDE (LOGIN CARD) */}
        <div className="auth-right">

          <div className="login-card">

            <h2>Sign In</h2>
            <p className="subtitle">Access your secure dashboard</p>

            <form onSubmit={handleLogin}>
              
              <div className="mb-3">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="forgot-password">
  <Link to="/forgot-password">Forgot Password?</Link>
</div>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "LOGIN"}
              </button>

            </form>

            {/* ✅ REGISTER LINK */}
            <div className="register-link">
              New user? <Link to="/register">Register here</Link>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;