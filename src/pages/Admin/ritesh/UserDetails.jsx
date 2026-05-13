import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./UserDetails.css";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:9091/api/users/getuserbyid/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUser(res.data);
      } catch (error) {
        toast.error("Failed to load user ❌");
      }
    };

    fetchUser();
  }, [id]);

  if (!user) {
    return <p style={{ padding: "20px" }}>Loading user...</p>;
  }

 return (
  <div className="user-details-container">
    <div className="user-details-wrapper">
      <div className="user-card">
        <h2>User Details</h2>

        <div className="user-details-grid">
          <div className="label">ID</div>
          <div className="value">{user.userId}</div>

          <div className="label">Name</div>
          <div className="value">{user.username}</div>

          <div className="label">Email</div>
          <div className="value">{user.email}</div>

          <div className="label">Phone</div>
          <div className="value">{user.phone}</div>

          <div className="label">Role</div>
          <div className="value">{user.role}</div>

          <div className="label">Status</div>
          <div className="value">
            <span className="status-active">{user.status}</span>
          </div>
        </div>

        <div className="user-card-actions">
          <button
            className="btn-back"
            onClick={() => navigate("/admin/users")}
          >
            ← Back to Users
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

export default UserDetails;