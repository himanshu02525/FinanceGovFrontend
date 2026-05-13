import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Analytics.css";

const Analytics = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get("http://localhost:9091/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "ACTIVE").length;
  const inactiveUsers = users.filter(u => u.status === "INACTIVE").length;
  const officers = users.filter(
    u => u.role === "ROLE_COMPLIANCE_OFFICER"
  ).length;

  const activePercent =
    totalUsers === 0 ? 0 : Math.round((activeUsers / totalUsers) * 100);
  const inactivePercent = 100 - activePercent;
  const officerPercent =
    totalUsers === 0 ? 0 : Math.round((officers / totalUsers) * 100);

  return (
    <div className="analytics-page">

      <div className="analytics-header">
        <h2>System Analytics</h2>
        <p>Usage, risk and governance overview</p>
      </div>

      {/* KPI CARDS */}
      <div className="analytics-cards">
        <div className="analytics-card blue">
          <h3>{totalUsers}</h3>
          <p>Total Users</p>
        </div>
        <div className="analytics-card green">
          <h3>{activeUsers}</h3>
          <p>Active Users</p>
        </div>
        <div className="analytics-card red">
          <h3>{inactiveUsers}</h3>
          <p>Inactive Users</p>
        </div>
        <div className="analytics-card orange">
          <h3>{officers}</h3>
          <p>Compliance Officers</p>
        </div>
      </div>

      {/* PIE */}
      <div className="analytics-section">
        <h3>Active vs Inactive Users</h3>

        <div className="donut-wrapper">
          <div
            className="donut"
            style={{
              background: `conic-gradient(
                #22c55e ${activePercent}%,
                #ef4444 ${activePercent}% 100%
              )`,
            }}
          >
            <div className="donut-center">
              {activePercent}%<br />Active
            </div>
          </div>

          <div className="donut-legend">
            <div><span className="dot green"></span> Active ({activeUsers})</div>
            <div><span className="dot red"></span> Inactive ({inactiveUsers})</div>
          </div>
        </div>

        {/* ✅ SLIM GOVERNANCE BARS (DIFFERENT MEANING) */}
        <div className="governance-bars">

          <div className="gov-row">
            <span>Active Utilization</span>
            <div className="gov-track">
              <div
                className="gov-fill active"
                style={{ width: `${activePercent}%` }}
              />
            </div>
            <span>{activePercent}%</span>
          </div>

          <div className="gov-row">
            <span>Dormant Accounts</span>
            <div className="gov-track">
              <div
                className="gov-fill inactive"
                style={{ width: `${inactivePercent}%` }}
              />
            </div>
            <span>{inactivePercent}%</span>
          </div>

          <div className="gov-row">
            <span>Monitoring Capacity</span>
            <div className="gov-track">
              <div
                className="gov-fill officer"
                style={{ width: `${officerPercent}%` }}
              />
            </div>
            <span>{officerPercent}%</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;
