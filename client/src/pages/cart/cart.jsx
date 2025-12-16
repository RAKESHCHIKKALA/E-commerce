import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./cart.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:1234";

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const navigate = useNavigate();

  const authHeader = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchCart = async () => {
    if (!token || isAdmin) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/api/cart`, {
        headers: authHeader,
      });
      setItems(res.data);
    } catch (err) {
      setError("Unable to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await axios.put(
        `${API_BASE}/api/cart/${productId}`,
        { quantity },
        { headers: authHeader }
      );
      setItems(res.data);
    } catch {
      setError("Could not update quantity");
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await axios.delete(`${API_BASE}/api/cart/${productId}`, {
        headers: authHeader,
      });
      setItems(res.data);
    } catch {
      setError("Could not remove item");
    }
  };

  const goToProduct = (productId) => {
    if (!productId) return;
    navigate(`/product/${productId}`);
  };

  const total = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  if (!token) {
    return <div className="cart-page">Please sign in to view your cart.</div>;
  }

  if (isAdmin) {
    return <div className="cart-page">Admins do not have a cart.</div>;
  }

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="cart-error">{error}</p>}

      {!loading && items.length === 0 && (
        <p className="empty">Your cart is empty.</p>
      )}

      <div className="cart-items">
        {items.map((item) => (
          <div className="cart-item" key={item.product?._id || item._id}>
            <img
              className="clickable"
              onClick={() => goToProduct(item.product?._id)}
              src={
                item.product?.image?.startsWith("http")
                  ? item.product.image
                  : `${API_BASE}${item.product?.image || ""}`
              }
              alt={item.product?.name}
            />
            <div className="info">
              <h4 className="clickable" onClick={() => goToProduct(item.product?._id)}>
                {item.product?.name}
              </h4>
              <p className="clickable" onClick={() => goToProduct(item.product?._id)}>
                ₹{item.product?.price}
              </p>
              <div className="quantity">
                <button
                  onClick={() =>
                    updateQuantity(
                      item.product?._id,
                      Math.max(1, item.quantity - 1)
                    )
                  }
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.product?._id, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>
            <button
              className="remove"
              onClick={() => removeItem(item.product?._id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {!loading && items.length > 0 && (
        <div className="cart-summary">
          <div>Total: ₹{total.toFixed(2)}</div>
          <button className="checkout-btn" disabled>
            Checkout (placeholder)
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;


