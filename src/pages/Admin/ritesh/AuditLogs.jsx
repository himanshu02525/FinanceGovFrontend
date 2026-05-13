import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./AuditLogs.css";

const AuditLogs = () => {

  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);

  const [searchEmail, setSearchEmail] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const LOGS_PER_PAGE = 5;

  // ✅ LOCATION STATE (Frontend Only)
  const [location, setLocation] = useState("Loading...");

  // ✅ FETCH LOCATION
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Step 1: Get Public IP
        const ipRes = await axios.get("https://api.ipify.org?format=json");
        const ip = ipRes.data.ip;

        // Step 2: Get Location
        const locRes = await axios.get(`http://ip-api.com/json/${ip}`);
        const city = locRes.data.city;
        const country = locRes.data.country;

        setLocation(`${city}, ${country}`);
      } catch (error) {
        console.error("Location fetch failed:", error);
        setLocation("Unknown");
      }
    };

    fetchLocation();
  }, []);

  // ✅ FETCH LOGS FROM BACKEND
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(
          "http://localhost:9091/api/v1/audit/logs",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setLogs(res.data);
        setFilteredLogs(res.data);
      } catch {
        toast.error("Failed to load audit logs ❌");
      }
    };

    fetchLogs();
  }, []);

  // ✅ SEARCH + FILTER
  useEffect(() => {
    let data = logs;

    if (actionFilter !== "ALL") {
      data = data.filter(log => log.action === actionFilter);
    }

    if (searchEmail) {
      data = data.filter(log =>
        log.actorEmail.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    setFilteredLogs(data);
    setCurrentPage(1);
  }, [searchEmail, actionFilter, logs]);

  // ✅ PAGINATION
  const indexOfLast = currentPage * LOGS_PER_PAGE;
  const indexOfFirst = indexOfLast - LOGS_PER_PAGE;
  const currentLogs = filteredLogs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);

  return (
    <div className="audit-page">

      <h2>Audit Logs</h2>

      {/* ✅ CONTROLS */}
      <div className="controls">

        <input
          type="text"
          placeholder="Search by actor email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="ALL">All Actions</option>
          <option value="CREATE_INTERNAL_USER">Create User</option>
          <option value="DELETE_USER">Delete User</option>
          <option value="DELETE_OFFICER">Delete Officer</option>
          <option value="USER_LOGIN">Login</option>
          <option value="PASSWORD_RESET">Password Reset</option>
        </select>

      </div>

      {/* ✅ TABLE */}
      <div className="table-container">
        <table className="audit-table">

          <thead>
            <tr>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
              <th>Location</th>
              <th>Time</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>
            {currentLogs.map(log => {

              const formattedAction = log.action
                ?.replaceAll("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, c => c.toUpperCase());

              return (
                <tr key={log.id}>
                  <td>{log.actorEmail || "N/A"}</td>

                  <td>
                    <span className={`action-badge ${log.action || ""}`}>
                      {formattedAction || "N/A"}
                    </span>
                  </td>

                  <td>{log.targetEmail || "-"}</td>

                  {/* ✅ LOCATION (Frontend-based) */}
                  <td>{location}</td>

                  <td>
                    {log.timestamp
                      ? new Date(log.timestamp).toLocaleString()
                      : "N/A"}
                  </td>

                  {/* ✅ DETAILS (TOOLTIP SUPPORT) */}
                  <td title={log.details || ""}>
                    {log.details || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* ✅ PAGINATION */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

    </div>
  );
};

export default AuditLogs;
