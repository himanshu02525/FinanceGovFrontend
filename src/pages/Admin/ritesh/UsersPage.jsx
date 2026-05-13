import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./UsersPage.css";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ VIEW MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const USERS_PER_PAGE = 5;
  const API = "http://localhost:9091/api/users";

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  // ✅ FETCH USERS
  const fetchUsers = async () => {
    try {
      const res = await axios.get(API, { headers });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch {
      toast.error("Failed to load users ❌");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ SEARCH + FILTER
  useEffect(() => {
    let data = users;

    if (filter !== "ALL") {
      data = data.filter((u) => u.status === filter);
    }

    if (search) {
      data = data.filter(
        (u) =>
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredUsers(data);
    setCurrentPage(1);
  }, [search, filter, users]);

  // ✅ VIEW (SHOW MODAL)
  const handleView = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // ✅ EDIT (placeholder)
  const handleEdit = (user) => {
    toast.info(`Editing ${user.username}`);
  };

  // ✅ DEACTIVATE (REAL DB)
  const handleDeactivate = async (id) => {
    try {
      await axios.patch(`${API}/${id}/status`, "INACTIVE", {
        headers: {
          ...headers,
          "Content-Type": "text/plain",
        },
      });

      toast.success("User deactivated ✅");
      fetchUsers();
    } catch {
      toast.error("Failed to deactivate ❌");
    }
  };

  // ✅ RESTORE
  const handleRestore = async (id) => {
    try {
      await axios.put(`${API}/${id}/restore`, {}, { headers });

      toast.success("User restored ✅");
      fetchUsers();
    } catch {
      toast.error("Failed to restore ❌");
    }
  };

  // ✅ PAGINATION
  const indexOfLast = currentPage * USERS_PER_PAGE;
  const indexOfFirst = indexOfLast - USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  return (
    <div className="users-page">
      <h2>User Management</h2>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">All</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* TABLE */}
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
            {currentUsers.map((user) => {
              const isAdmin = user.role === "ROLE_ADMIN";

              return (
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
                    <span
                      className={`status-badge ${
                        user.status === "ACTIVE" ? "active" : "inactive"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="action-cell">
                    {/* ✅ VIEW */}
                    <button
                      className="btn view-btn"
                      onClick={() => handleView(user)}
                    >
                      View
                    </button>


                    {user.status === "ACTIVE" ? (
                      <button
                        className={`btn delete-btn ${
                          isAdmin ? "disabled" : ""
                        }`}
                        disabled={isAdmin}
                        onClick={() => handleDeactivate(user.userId)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className={`btn restore-btn ${
                          isAdmin ? "disabled" : ""
                        }`}
                        disabled={isAdmin}
                        onClick={() => handleRestore(user.userId)}
                      >
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
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

      {/* ✅ ✅ VIEW MODAL */}
      {showModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>User Details</h3>

            <p><strong>ID:</strong> {selectedUser.userId}</p>
            <p><strong>Name:</strong> {selectedUser.username}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p>
              <strong>Role:</strong>{" "}
              {selectedUser.role.replace("ROLE_", "")}
            </p>
            <p><strong>Status:</strong> {selectedUser.status}</p>

            <button
              className="modal-btn cancel"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;