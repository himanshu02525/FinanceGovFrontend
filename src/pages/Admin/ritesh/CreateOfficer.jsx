import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./CreateOfficer.css";

/* ✅ PASSWORD STRENGTH CHECK */
const checkStrength = (password) => {
  const rules = {
    length: password.length >= 10,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@#$%^&+=!]/.test(password),
  };

  const score = Object.values(rules).filter(Boolean).length;
  let level = "Weak";
  let percent = (score / 5) * 100;

  if (score >= 4) level = "Medium";
  if (score === 5) level = "Strong";

  return { rules, level, percent };
};

const CreateOfficer = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const strength = checkStrength(formData.password);

  const passwordsMatch =
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  const isValid =
    strength.level === "Strong" &&
    passwordsMatch &&
    formData.username &&
    formData.email &&
    formData.phone &&
    formData.role;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:9091/api/admin/create-internal-user",
        {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          role: formData.role,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setShowSuccess(true);

      setFormData({
        username: "",
        email: "",
        phone: "",
        role: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error) {
      toast.error(error.response?.data || "Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  /* ✅ SUCCESS SCREEN */
  if (showSuccess) {
    return (
      <div className="success-card">
        <h2>✅ User Created Successfully</h2>
        <p>The internal user has been added to the system.</p>

        <button onClick={() => navigate("/admin/users")}>
          Go to Users List
        </button>
      </div>
    );
  }

  return (
    <div className="create-officer-page">

      <h2>Create Internal User</h2>

      <form className="officer-form" onSubmit={handleSubmit}>

        <label>Username</label>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label>Email</label>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Phone</label>
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <label>Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="">Select role</option>
          <option value="ROLE_COMPLIANCE_OFFICER">Compliance Officer</option>
          <option value="ROLE_FINANCIAL_OFFICER">Financial Officer</option>
          <option value="ROLE_PROGRAM_MANAGER">Program Manager</option>
          <option value="ROLE_GOVERNMENT_AUDITOR">Government Auditor</option>
        </select>

        {/* ✅ PASSWORD */}
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {/* ✅ STRENGTH BAR */}
        <div className="strength-box">

          <div className="progress-bar">
            <div
              className={`progress-fill ${strength.level.toLowerCase()}`}
              style={{ width: `${strength.percent}%` }}
            />
          </div>

          <div className="strength-text">
            Strength: {strength.level}
          </div>

          <ul className="strength-list">
            <li className={strength.rules.length ? "ok" : "bad"}>≥ 10 characters</li>
            <li className={strength.rules.upper ? "ok" : "bad"}>Uppercase letter</li>
            <li className={strength.rules.lower ? "ok" : "bad"}>Lowercase letter</li>
            <li className={strength.rules.number ? "ok" : "bad"}>Number</li>
            <li className={strength.rules.special ? "ok" : "bad"}>Special character</li>
          </ul>

        </div>

        {/* ✅ CONFIRM PASSWORD */}
        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        {formData.confirmPassword && (
          <div className={`confirm-msg ${passwordsMatch ? "match" : "mismatch"}`}>
            {passwordsMatch
              ? "✅ Passwords match"
              : "❌ Passwords do not match"}
          </div>
        )}

        {/* ✅ BUTTON */}
        <button type="submit" disabled={!isValid || loading}>
          {loading ? "Creating..." : "Create User"}
        </button>

      </form>
    </div>
  );
};

export default CreateOfficer;