import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./orders.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1234";

function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/orders/myorders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <h2>My Orders</h2>
        <div className="empty-state">
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="shop-link">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h2>My Orders</h2>
      <div className="orders-list">
        {orders.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-header">
              <div>
                <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                <p className="order-date">
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className={`status-badge status-${order.status.toLowerCase()}`}>
                {order.status}
              </div>
            </div>

            <div className="order-products">
              {order.products.map((item, idx) => (
                <div className="order-product-item" key={idx}>
                  <Link to={`/product/${item.product?._id}`} className="product-link">
                    <img
                      src={
                        item.product?.image?.startsWith("http")
                          ? item.product.image
                          : item.product?.image
                          ? `${API_BASE}${item.product.image}`
                          : item.product?.images?.[0]
                          ? `${API_BASE}${item.product.images[0]}`
                          : ""
                      }
                      alt={item.product?.name || "Product"}
                      className="product-img"
                    />
                    <div className="product-info">
                      <h4>{item.product?.name || "Unknown Product"}</h4>
                      <p className="product-price">₹{item.product?.price || 0}</p>
                      <p className="quantity">Quantity: {item.quantity}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="total">
                <strong>Total: ₹{order.totalPrice?.toFixed(2) || 0}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserOrders;







