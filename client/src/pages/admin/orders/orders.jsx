import { useEffect, useState } from "react";
import axios from "axios";
import "./orders.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:1234";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/orders/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/orders/admin/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders(); // Refresh orders
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status");
    }
  };

  if (loading) {
    return (
      <div className="admin-orders-container">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="admin-orders-container">
        <h2>Manage Orders</h2>
        <div className="empty-state">No orders found.</div>
      </div>
    );
  }

  return (
    <div className="admin-orders-container">
      <h2>Manage Orders</h2>
      <div className="orders-grid">
        {orders.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-header">
              <div>
                <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                <p className="order-date">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className={`status-badge status-${order.status?.toLowerCase() || "pending"}`}>
                {order.status || "Pending"}
              </div>
            </div>

            <div className="user-info">
              <p><strong>Customer:</strong> {order.user?.name || "Unknown"}</p>
              <p><strong>Email:</strong> {order.user?.email || "N/A"}</p>
            </div>

            <div className="order-products">
              {order.products?.map((item, idx) => (
                <div className="product-row" key={idx}>
                  <span>{item.product?.name || "Unknown Product"}</span>
                  <span>Qty: {item.quantity}</span>
                  <span>₹{item.product?.price || 0}</span>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="total">
                <strong>Total: ₹{order.totalPrice?.toFixed(2) || 0}</strong>
              </div>
              <div className="status-controls">
                <label>Update Status:</label>
                <select
                  value={order.status || "Pending"}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminOrders;
