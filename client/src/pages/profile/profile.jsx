import { useEffect, useState } from "react";
import axios from "axios";
import "./profile.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1234";

function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState(0);

  const token = localStorage.getItem("token");

  const loadProfile = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setPhone(res.data.phone || "");
      setAddresses(res.data.addresses?.length ? res.data.addresses : []);
      // fetch order count in parallel
      try {
        const ordersRes = await axios.get(`${API_BASE}/orders/myorders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrderCount(Array.isArray(ordersRes.data) ? ordersRes.data.length : 0);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addAddress = () => {
    setAddresses([
      ...addresses,
      { label: "Home", line1: "", line2: "", city: "", state: "", zip: "" },
    ]);
  };

  const updateAddress = (idx, field, value) => {
    setAddresses((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a))
    );
  };

  const removeAddress = (idx) => {
    setAddresses((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveProfile = async () => {
    try {
      const res = await axios.put(
        `${API_BASE}/users/me`,
        { phone, addresses },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
      setEditing(false);
    } catch (err) {
      alert("Could not save profile");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please sign in.</p>;

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="profile-avatar">{user.name?.[0] || "U"}</div>
        <div className="profile-meta">
          <p className="welcome">Welcome back,</p>
          <h1>{user.name}</h1>
          <p className="email">{user.email}</p>
          <div className="pill-row">
            <span className="pill">Member</span>
            {user.phone && <span className="pill subtle">{user.phone}</span>}
          <span className="pill subtle">{orderCount} orders</span>
          </div>
        </div>
        <div className="profile-actions">
          <button className="edit-btn" onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {!editing && (
        <div className="profile-grid">
          <div className="card">
            <h3>Contact</h3>
            <p className="label">Phone</p>
            <p className="value">{user.phone || "Not set"}</p>
            <p className="label">Email</p>
            <p className="value">{user.email}</p>
          </div>

          <div className="card">
            <h3>Addresses</h3>
            <div className="addr-list">
              {(user.addresses || []).length === 0 && (
                <p className="muted">No addresses saved.</p>
              )}
              {(user.addresses || []).map((a, idx) => (
                <div className="addr-card" key={idx}>
                  <div className="addr-head">
                    <strong>{a.label || "Address"}</strong>
                  </div>
                  <p>{a.line1}</p>
                  {a.line2 && <p>{a.line2}</p>}
                  <p>
                    {a.city}, {a.state} {a.zip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="card edit-form">
          <h3>Edit details</h3>
          <label>Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
          />

          <div className="addr-list edit-mode">
            {addresses.map((a, idx) => (
              <div className="addr-card editable" key={idx}>
                <div className="addr-row">
                  <input
                    value={a.label}
                    onChange={(e) => updateAddress(idx, "label", e.target.value)}
                    placeholder="Label (Home/Work)"
                  />
                  <button
                    className="remove-addr"
                    type="button"
                    onClick={() => removeAddress(idx)}
                  >
                    Remove
                  </button>
                </div>
                <input
                  value={a.line1}
                  onChange={(e) => updateAddress(idx, "line1", e.target.value)}
                  placeholder="Address line 1"
                />
                <input
                  value={a.line2}
                  onChange={(e) => updateAddress(idx, "line2", e.target.value)}
                  placeholder="Address line 2"
                />
                <div className="addr-row">
                  <input
                    value={a.city}
                    onChange={(e) => updateAddress(idx, "city", e.target.value)}
                    placeholder="City"
                  />
                  <input
                    value={a.state}
                    onChange={(e) => updateAddress(idx, "state", e.target.value)}
                    placeholder="State"
                  />
                  <input
                    value={a.zip}
                    onChange={(e) => updateAddress(idx, "zip", e.target.value)}
                    placeholder="ZIP"
                  />
                </div>
              </div>
            ))}
          </div>

          <button className="add-addr" type="button" onClick={addAddress}>
            + Add address
          </button>

          <div className="form-actions">
            <button className="save-btn" type="button" onClick={saveProfile}>
              Save changes
            </button>
            <button className="ghost-btn" type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
