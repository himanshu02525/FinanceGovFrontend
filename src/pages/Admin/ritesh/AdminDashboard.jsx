import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const navigate = useNavigate();

  // ✅ FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:9091/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsers(res.data);
      } catch {
        toast.error("Failed to load users ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ✅ DELETE HANDLER
  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:9091/api/users/${selectedUserId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setUsers(prev =>
        prev.map(u =>
          u.userId === selectedUserId
            ? { ...u, status: "INACTIVE" }
            : u
        )
      );

      toast.success("User deactivated ✅");
    } catch {
      toast.error("Operation failed ❌");
    } finally {
      setShowModal(false);
      setSelectedUserId(null);
    }
  };

  return (
    <div className="admin-dashboard">

      {/* HEADER */}
      <div className="dashboard-header">
        <span className="badge">ADMIN PANEL</span>
        <h2>Welcome, Admin</h2>
        <p>System overview dashboard</p>
      </div>

      {/* USERS TABLE */}
      <div className="dashboard-section">
        <h3>Active Users Overview</h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users
                  .filter(u => u.status === "ACTIVE")
                  .slice(0, 5)
                  .map(user => (
                    <tr key={user.userId}>
                      <td>{user.userId}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>

                      <td>
                        <span className="role-badge">
                          {user.role.replace("ROLE_", "")}
                        </span>
                      </td>

                      <td>
                        <span className="status-badge active">
                          {user.status}
                        </span>
                      </td>

                      <td>
                        <div className="action-cell">

                          {/* ✅ VIEW ALWAYS AVAILABLE */}
                          <button
                            className="btn view-btn"
                            onClick={() =>
                              navigate(`/admin/users/${user.userId}`)
                            }
                          >
                            View
                          </button>

                          {/* ✅ ADMIN → DELETE DISABLED */}
                          {user.role === "ROLE_ADMIN" ? (
                            <button
                              className="btn delete-btn disabled-btn"
                              disabled
                              title="Admin cannot be deleted"
                            >
                              Delete
                            </button>
                          ) : (
                            <button
                              className="btn delete-btn"
                              onClick={() => {
                                setSelectedUserId(user.userId);
                                setShowModal(true);
                              }}
                            >
                              Delete
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRM MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4>Confirm Action</h4>
            <p>Deactivate this user?</p>

            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="modal-btn confirm"
                onClick={handleDelete}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;