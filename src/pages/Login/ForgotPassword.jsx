import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { ArrowLeft } from "lucide-react";

const ForgotPassword = () => {

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const navigate = useNavigate();

  // ✅ STEP 1: SEND OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `http://localhost:9091/api/auth/request-otp?email=${email}`
      );

      toast.success("OTP sent ✅");
      setStep(2);
    } catch {
      toast.error("Failed to send OTP ❌");
    }
  };

  // ✅ STEP 2: RESET PASSWORD
  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        "http://localhost:9091/api/auth/verify-and-update-password",
        {
          email,
          otp,
          newPassword,
        }
      );

      toast.success("Password updated ✅");
      navigate("/login");
    } catch {
      toast.error("Invalid OTP ❌");
    }
  };

  return (
    

    <div className="auth-page">

       

      <div className="auth-wrapper">

        {/* ✅ KEEP LEFT PANEL (IMPORTANT FOR GOOD UI) */}
        <div className="auth-left">

          <h1 className="brand-title">
            <span className="finance">Finance</span>
            <span className="gov">Gov</span>
          </h1>

          <p className="tagline">
            Secure password recovery system
          </p>

          <ul>
            <li>✔ Email OTP verification</li>
            <li>✔ Secure password update</li>
            <li>✔ Encrypted authentication</li>
          </ul>

        </div>

        {/* ✅ RIGHT PANEL */}
        <div className="auth-right">

          <div className="login-card">

            <h2>Reset Password</h2>

            <p className="subtitle">
              {step === 1
                ? "Enter your email to receive OTP"
                : "Enter OTP and new password"}
            </p>

            {/* ✅ STEP 1 */}
            {step === 1 && (
              <form onSubmit={handleSendOtp}>

                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button type="submit">
                  Send OTP
                </button>

              </form>
            )}

            {/* ✅ STEP 2 */}
            {step === 2 && (
              <form onSubmit={handleResetPassword}>

                <input
                  type="text"
                  placeholder="Enter OTP"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Enter new password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <button type="submit">
                  Reset Password
                </button>

              </form>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;