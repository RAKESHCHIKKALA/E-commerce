import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import "./buy.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1234";

function Buy() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    location.state?.selectedColor || ""
  );
  const [selectedSize, setSelectedSize] = useState(
    location.state?.selectedSize || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
  });
  const [payment, setPayment] = useState({
    method: "upi",
    upiId: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    emiPlan: "no-emi",
  });
  const [added, setAdded] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedIdx, setSelectedSavedIdx] = useState(null);

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const gallery = useMemo(() => {
    if (!product) return [];
    const imgs = product.images?.length
      ? product.images
      : product.image
      ? [product.image]
      : [];
    return imgs.map((src) => (src.startsWith("http") ? src : `${API_BASE}${src}`));
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE}/products/${id}`);
        setProduct(res.data);
        if (res.data.color) setSelectedColor(res.data.color);
        if (Array.isArray(res.data.sizes) && res.data.sizes.length > 0) {
          setSelectedSize(location.state?.selectedSize || res.data.sizes[0]);
        }
      } catch (err) {
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();

    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const addrs = res.data.addresses || [];
        setSavedAddresses(addrs);
        if (addrs[0]) {
          setSelectedSavedIdx(0);
          setAddress({
            fullName: res.data.name || "",
            phone: res.data.phone || "",
            line1: addrs[0].line1 || "",
            line2: addrs[0].line2 || "",
            city: addrs[0].city || "",
            state: addrs[0].state || "",
            zip: addrs[0].zip || "",
          });
        }
      } catch (_) {
        // ignore profile load errors
      }
    };
    fetchProfile();
  }, [id, location.state]);

  const addToCart = async () => {
    if (!token) return navigate("/signin");
    if (isAdmin) return alert("Admins cannot add items to cart.");
    try {
      await axios.post(
        `${API_BASE}/cart`,
        { productId: product._id, quantity: quantity || 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdded(true);
    } catch {
      alert("Could not add to cart");
    }
  };

  const placeOrder = async () => {
    if (!token) return navigate("/signin");
    if (isAdmin) return alert("Admins cannot purchase.");
    const addressFilled = address.fullName && address.phone && address.line1 && address.city && address.state && address.zip;
    if (!addressFilled) return alert("Please fill shipping address.");
    if (payment.method === "upi" && !payment.upiId) return alert("Enter UPI ID.");
    if (payment.method === "card" && (!payment.cardNumber || !payment.cardExpiry || !payment.cardCvv)) {
      return alert("Enter card details.");
    }
    try {
      const total = (product.price || product.offerPrice || 0) * quantity;
      await axios.post(
        `${API_BASE}/orders`,
        {
          products: [{ product: product._id, quantity }],
          totalPrice: total,
          address,
          payment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Order placed! Stock updated.");
      navigate("/orders");
    } catch (err) {
      alert("Could not place order");
    }
  };

  if (loading) return <div className="buy-page">Loading...</div>;
  if (error || !product) return <div className="buy-page">{error}</div>;

  return (
    <div className="buy-page">
      <div className="buy-card">
        <div className="buy-media">
          <img src={gallery[0]} alt={product.name} />
          {/* <div className="thumbs">
            {gallery.map((src, idx) => (
              <img key={idx} src={src} alt="" />
            ))}
          </div> */}
        </div>

        <div className="buy-info">
          <p className="crumb" onClick={() => navigate(-1)}>← Back</p>
          <h1>{product.name}</h1>
          <p className="brand">{product.brand || "Brand"}</p>
          <p className="price">₹{product.price}</p>
          <p className="desc">{product.description || "No description available."}</p>

          {product.color && (
            <div className="option">
              <span>Color</span>
              <div className="chip-row">
                {[product.color, ...(product.altColors || [])].map((c, idx) => (
                  <button
                    key={`${c}-${idx}`}
                    className={`chip ${selectedColor === c ? "active" : ""}`}
                    onClick={() => setSelectedColor(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="option">
              <span>Size</span>
              <div className="chip-row">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={`chip ${selectedSize === s ? "active" : ""}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="option">
            <span>Quantity</span>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            />
          </div>

          <div className="option">
            <span>Shipping address</span>
            {savedAddresses.length > 0 && (
              <div className="saved-addr">
                {savedAddresses.map((a, idx) => (
                  <label key={idx} className="radio-row saved">
                    <input
                      type="radio"
                      name="saved"
                      checked={selectedSavedIdx === idx}
                      onChange={() => {
                        setSelectedSavedIdx(idx);
                        setAddress({
                          fullName: address.fullName || "",
                          phone: address.phone || "",
                          line1: a.line1 || "",
                          line2: a.line2 || "",
                          city: a.city || "",
                          state: a.state || "",
                          zip: a.zip || "",
                        });
                      }}
                    />
                    <div>
                      <strong>{a.label || "Saved address"}</strong>
                      <div>{a.line1}</div>
                      {a.line2 ? <div>{a.line2}</div> : null}
                      <div>
                        {a.city}, {a.state} {a.zip}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <div className="address-grid">
              <input placeholder="Full name" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
              <input placeholder="Phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
              <input placeholder="Address line 1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
              <input placeholder="Address line 2" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
              <input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
              <input placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
              <input placeholder="ZIP / PIN" value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} />
            </div>
          </div>

          <div className="option">
            <span>Payment</span>
            <div className="payment-grid">
              <label className="radio-row">
                <input
                  type="radio"
                  name="pay"
                  checked={payment.method === "upi"}
                  onChange={() => setPayment({ ...payment, method: "upi" })}
                />
                <div>
                  <strong>UPI</strong>
                  <input
                    placeholder="UPI ID (name@bank)"
                    value={payment.upiId}
                    onChange={(e) => setPayment({ ...payment, upiId: e.target.value })}
                  />
                </div>
              </label>

              <label className="radio-row">
                <input
                  type="radio"
                  name="pay"
                  checked={payment.method === "card"}
                  onChange={() => setPayment({ ...payment, method: "card" })}
                />
                <div>
                  <strong>Credit/Debit Card</strong>
                  <div className="card-grid">
                    <input
                      placeholder="Card number"
                      value={payment.cardNumber}
                      onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
                    />
                    <input
                      placeholder="MM/YY"
                      value={payment.cardExpiry}
                      onChange={(e) => setPayment({ ...payment, cardExpiry: e.target.value })}
                    />
                    <input
                      placeholder="CVV"
                      value={payment.cardCvv}
                      onChange={(e) => setPayment({ ...payment, cardCvv: e.target.value })}
                    />
                  </div>
                </div>
              </label>

              <label className="radio-row">
                <input
                  type="radio"
                  name="pay"
                  checked={payment.method === "emi"}
                  onChange={() => setPayment({ ...payment, method: "emi" })}
                />
                <div>
                  <strong>EMI</strong>
                  <select
                    value={payment.emiPlan}
                    onChange={(e) => setPayment({ ...payment, emiPlan: e.target.value })}
                  >
                    <option value="no-emi">Select plan</option>
                    <option value="3m">3 months</option>
                    <option value="6m">6 months</option>
                    <option value="9m">9 months</option>
                    <option value="12m">12 months</option>
                  </select>
                </div>
              </label>
            </div>
          </div>

          <div className="actions">
            <button className="primary" onClick={addToCart}>Add to Cart</button>
            <button className="ghost" onClick={placeOrder}>Place Order</button>
            {added && <span className="added-pill">Added</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Buy;

