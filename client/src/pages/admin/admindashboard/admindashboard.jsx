import React, { useEffect, useState } from "react";
import axios from "axios";
import "./admindashboard.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:1234";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Stats load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="dash-container">Loading...</div>;
  if (!stats) return <div className="dash-container">No data.</div>;

  const cards = [
    { label: "Products", value: stats.totalProducts, accent: "blue" },
    { label: "Users", value: stats.totalUsers, accent: "purple" },
    { label: "Orders", value: stats.totalOrders, accent: "teal" },
    { label: "Revenue", value: `₹${stats.totalRevenue}`, accent: "orange" },
  ];

  return (
    <div className="dash-container">
      <header className="dash-header">
        <div>
          <p className="eyebrow">Control Center</p>
          <h1>Admin Dashboard</h1>
          <p className="muted">Quick overview of the store health.</p>
        </div>
        <button className="refresh" onClick={fetchStats}>
          ⟳ Refresh
        </button>
      </header>

      <div className="cards">
        {cards.map((c) => (
          <div className={`card ${c.accent}`} key={c.label}>
            <span className="card-label">{c.label}</span>
            <span className="card-value">{c.value}</span>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Recent</p>
            <h3>Latest Orders</h3>
          </div>
          <span className="muted">Last 5 orders</span>
        </div>
        <div className="order-list">
          {stats.latestOrders.map((o) => (
            <div className="order-row" key={o._id}>
              <div>
                <p className="order-user">{o.userId?.name || "Guest"}</p>
                <p className="muted">{o.userId?.email || ""}</p>
              </div>
              <div className="pill">{o.status}</div>
              <div className="order-total">₹{o.totalAmount || o.total}</div>
              <div className="muted">
                {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
              </div>
            </div>
          ))}
          {stats.latestOrders.length === 0 && (
            <div className="muted">No recent orders.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
