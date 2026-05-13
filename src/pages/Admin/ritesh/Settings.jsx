import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./Settings.css";

const Settings = () => {

  // STATE
  const [formData, setFormData] = useState({
    username: "",
    email: ""
  });

  const [darkMode, setDarkMode] = useState(false);

  // LOAD DATA
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const theme = localStorage.getItem("theme");

    if (storedUser) {
      setFormData({
        username: storedUser.username || "Admin",
        email: storedUser.email || "admin@financegov.com"
      });
    }

    setDarkMode(theme === "dark");
  }, []);

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // SAVE
  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify(formData));
    toast.success("Settings updated ✅");
  };

  // TOGGLE DARK MODE
  const toggleDarkMode = () => {
    const newTheme = darkMode ? "light" : "dark";

    localStorage.setItem("theme", newTheme);
    setDarkMode(!darkMode);

    window.dispatchEvent(new Event("themeChange"));
  };

  return (
    <div className="settings-container">

      <div className="settings-card">

        <h2>Settings</h2>

        {/* AVATAR */}
        <div className="avatar-section">
          <img
            src="https://api.dicebear.com/9.x/micah/svg?mouth=laughing,smile,smirk"
            alt="admin-avatar"
          />
          <p>Admin Avatar</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="settings-form">

          <label>Admin Name</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <div className="settings-actions">
            <button type="submit" className="btn save-btn">
              Save Changes
            </button>
          </div>

        </form>

        {/* DARK MODE */}
        {/* <div className="dark-mode-toggle">

          <span>Dark Mode</span>

          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
            />
            <span className="slider"></span>
          </label>

        </div> */}

      </div>

    </div>
  );
};

export default Settings;