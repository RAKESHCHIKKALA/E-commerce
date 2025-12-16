import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./home.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1234";
function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [price, setPrice] = useState([0, 0]);
  const [color, setColor] = useState("all");
  const [brand, setBrand] = useState("all");
  const [cartIds, setCartIds] = useState(new Set());
  const [theme, setTheme] = useState("dark");
  const showFilters = search.trim().length > 0;

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_BASE}/products`)
      .then((res) => {
        setProducts(res.data);
        const maxP = Math.max(...res.data.map((p) => Number(p.price) || 0), 0);
        setPrice([0, maxP]);
      })
      .catch((err) => {
        console.log("Product fetch error:", err);
      });
  }, []);

  // Fetch cart once to mark already-added products
  useEffect(() => {
    const loadCart = async () => {
      if (!token || isAdmin) return;
      try {
        const res = await axios.get(`${API_BASE}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ids = new Set(
          (res.data || []).map((item) => item.product?._id || item.product)
        );
        setCartIds(ids);
      } catch (err) {
        console.log("Cart fetch error:", err);
      }
    };
    loadCart();
  }, [token, isAdmin]);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [products]);

  const colors = useMemo(() => {
    const c = new Set(products.map((p) => p.color).filter(Boolean));
    return ["all", ...Array.from(c)];
  }, [products]);

  const brands = useMemo(() => {
    const b = new Set(products.map((p) => p.brand).filter(Boolean));
    return ["all", ...Array.from(b)];
  }, [products]);

  const filtered = useMemo(() => {
    let data = [...products];
    if (search.trim()) {
      const term = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.brand?.toLowerCase().includes(term)
      );
    }
    if (category !== "all") {
      data = data.filter((p) => p.category === category);
    }
    if (color !== "all") {
      data = data.filter((p) => p.color === color);
    }
    if (brand !== "all") {
      data = data.filter((p) => p.brand === brand);
    }
    data = data.filter((p) => {
      const priceVal = Number(p.price) || 0;
      return priceVal >= price[0] && priceVal <= price[1];
    });

    if (sort === "priceLow") data.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "priceHigh") data.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sort === "newest") data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "older") data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return data;
  }, [products, search, category, color, brand, price, sort]);

  const addToCart = async (productId) => {
    if (!token) {
      alert("Please sign in to add items to your cart.");
      return;
    }
    if (isAdmin) {
      alert("Admins cannot add items to cart.");
      return;
    }
    try {
      await axios.post(
        `${API_BASE}/cart`,
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartIds((prev) => new Set(prev).add(productId));
      alert("Added to cart");
    } catch (err) {
      alert("Could not add to cart");
      console.log(err);
    }
  };

  const goToBuy = (productId) => {
    if (!token) return navigate("/signin");
    if (isAdmin) return alert("Admins cannot purchase.");
    navigate(`/buy/${productId}`);
  };

  const isInCart = (id) => cartIds.has(id);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className={`home-page theme-${theme}`}>
      <div className="home-topbar">
        <div className="theme-toggle">
          <span>{theme === "dark" ? "Dark" : "Light"} mode</span>
          <button onClick={toggleTheme}>
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </button>
        </div>
      </div>
      <div className="hero">
        <p className="eyebrow">Discover</p>
        <h1>Find your next favorite</h1>
        <p className="sub">Search, filter, and shop the latest drops.</p>
      </div>

      <div className="top-controls">
        <input
          className="search"
          placeholder="Search products, brands..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="category-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={cat === category ? "active" : ""}
              onClick={() => setCategory(cat)}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {!showFilters && (
        <div className="filter-hint">
          Start typing to reveal filters (price, brand, color, sort).
        </div>
      )}

      {showFilters && (
        <div className="filters">
          <div className="filter-group">
            <label>Sort</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="older">Older</option>
              <option value="priceLow">Price: Low → High</option>
              <option value="priceHigh">Price: High → Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price ₹{price[0]} - ₹{price[1]}</label>
            <div className="range">
              <input
                type="range"
                min="0"
                max={price[1] || 0}
                value={price[0]}
                onChange={(e) => setPrice([Number(e.target.value), price[1]])}
              />
              <input
                type="range"
                min={price[0]}
                max={Math.max(price[1], price[0] + 1)}
                value={price[1]}
                onChange={(e) => setPrice([price[0], Number(e.target.value)])}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Color</label>
            <select value={color} onChange={(e) => setColor(e.target.value)}>
              {colors.map((c) => (
                <option key={c} value={c}>{c === "all" ? "All" : c}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Brand</label>
            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              {brands.map((b) => (
                <option key={b} value={b}>{b === "all" ? "All" : b}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="products">
        {filtered.map((p) => (
          <div className="product-card" key={p._id}>
            <Link to={`/product/${p._id}`} className="card-link">
              <img
                src={
                  p.image?.startsWith("http")
                    ? p.image
                    : p.image
                    ? `${API_BASE}${p.image}`
                    : p.images?.[0]
                    ? `${API_BASE}${p.images[0]}`
                    : ""
                }
                alt={p.name}
              />
              <div className="meta">
                <p className="category">{p.category || "General"}</p>
                <h3>{p.name}</h3>
                <p className="price">₹{p.price}</p>
                <div className="tags">
                  {p.brand && <span>{p.brand}</span>}
                  {p.color && <span>{p.color}</span>}
                </div>
              </div>
            </Link>
            
              <div className="card-actions">
                <button
                  onClick={() => addToCart(p._id)}
                  disabled={isInCart(p._id)}
                >
                  {isInCart(p._id) ? "In Cart" : "Add to Cart"}
                </button>
                <button className="ghost" onClick={() => goToBuy(p._id)}>Buy Now</button>
              </div>
            
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty">No products match your filters.</div>
        )}
      </div>
    </div>
  );
}

export default Home;
