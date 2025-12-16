import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./product.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:1234";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeMedia, setActiveMedia] = useState(0); // index into gallery
  const [added, setAdded] = useState(false);
  const [checkingCart, setCheckingCart] = useState(false);
  const highlightList = useMemo(() => {
    if (!product?.highlightPoints) return [];
    return product.highlightPoints
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [product]);

  const featureList = useMemo(() => {
    if (!product?.featurePoints) return [];
    return product.featurePoints
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [product]);

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const colorOptions = useMemo(() => {
    if (!product) return [];
    const list = [];
    if (product.color) list.push(product.color);
    (product.altColors || []).forEach((c) => list.push(c));
    (product.colorVariants || []).forEach((variant) =>
      list.push(variant.color)
    );
    return Array.from(new Set(list.filter(Boolean)));
  }, [product]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const variant =
      product.colorVariants?.find((v) => v.color === selectedColor) || null;
    const imgs =
      (variant && variant.images?.length
        ? variant.images
        : product.images?.length
        ? product.images
        : product.image
        ? [product.image]
        : []) || [];
    const vids = product.videos || [];
    return [
      ...imgs.map((src) =>
        src.startsWith("http") ? src : `${API_BASE}${src}`
      ),
      ...vids.map((src) =>
        src.startsWith("http") ? src : `${API_BASE}${src}`
      ),
    ];
  }, [product, selectedColor]);

  useEffect(() => {
    setActiveMedia(0);
  }, [gallery.length]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/products/${id}`);
        setProduct(res.data);
        if (res.data.color) {
          setSelectedColor(res.data.color);
        } else if (res.data.colorVariants?.[0]?.color) {
          setSelectedColor(res.data.colorVariants[0].color);
        }
        if (Array.isArray(res.data.sizes) && res.data.sizes.length > 0) {
          setSelectedSize(res.data.sizes[0]);
        }
      } catch (err) {
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // On load, check if item already in cart to reflect UI
  useEffect(() => {
    const checkCart = async () => {
      if (!token || isAdmin) return;
      setCheckingCart(true);
      try {
        const res = await axios.get(`${API_BASE}/api/cart/check/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.inCart) setAdded(true);
      } catch {
        // silent fail, button will allow adding again
      } finally {
        setCheckingCart(false);
      }
    };
    checkCart();
  }, [id, token, isAdmin]);

  const addToCart = async () => {
    if (!token) return navigate("/signin");
    if (isAdmin) return alert("Admins cannot add items to cart.");
    try {
      await axios.post(
        `${API_BASE}/api/cart`,
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdded(true);
    } catch {
      alert("Could not add to cart");
    }
  };

  const buyNow = () => {
    if (!token) return navigate("/signin");
    if (isAdmin) return alert("Admins cannot purchase.");
    navigate(`/buy/${product._id}`, {
      state: { selectedColor, selectedSize },
    });
  };

  if (loading) return <div className="product-page">Loading...</div>;
  if (error || !product) return <div className="product-page">{error}</div>;

  return (
    <div className="product-page">
      <div className="product-hero">
        <div className="product-media">
          {gallery.length > 0 ? (
            <>
              {gallery[activeMedia] && gallery[activeMedia].match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={gallery[activeMedia]} controls />
              ) : (
                <img src={gallery[activeMedia]} alt={product.name} />
              )}
              <div className="thumb-row">
                {gallery.map((src, idx) => (
                  <button
                    key={idx}
                    className={`thumb ${idx === activeMedia ? "active" : ""}`}
                    onClick={() => setActiveMedia(idx)}
                  >
                    {src.match(/\.(mp4|webm|ogg)$/i) ? (
                      <span>Video</span>
                    ) : (
                      <img src={src} alt="" />
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="no-media">No images or videos available.</div>
          )}
        </div>

        <div className="product-info">
          <p className="crumb" onClick={() => navigate(-1)}>← Back</p>
          <h1>{product.name}</h1>
          <p className="brand">{product.brand || "Brand"}</p>
          <p className="price">₹{product.price}</p>
          {true && (
            <div className="buy-inline">
              
              <span className="buy-hint">Choose your color/size below</span>
            </div>
          )}
          <p className="desc">{product.description || "No description available."}</p>

          {colorOptions.length > 0 && (
            <div className="option">
              <span>Color:</span>
              <div className="chip-row">
                {colorOptions.map((c, idx) => (
                  <button
                    key={`${c}-${idx}`}
                    className={`chip color-chip ${
                      selectedColor === c ? "active" : ""
                    }`}
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
              <span>Size:</span>
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

          {true && (
            <div className="actions">
              <>
                <button
                  className="primary"
                  onClick={addToCart}
                  disabled={added || checkingCart}
                >
                  {added ? "Already in Cart" : checkingCart ? "Checking..." : "Add to Cart"}
                </button>
                <button className="ghost" onClick={buyNow}>Buy Now</button>
              </>
            </div>
          )}

        </div>
      </div>

      {highlightList.length > 0 && (
        <div className="details-panel">
          <h3>Highlights</h3>
          <ul>
            {highlightList.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {featureList.length > 0 && (
        <div className="details-panel">
          <h3>More info</h3>
          <ul>
            {featureList.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="details-panel">
        <h3>Product details</h3>
        <ul>
          <li><strong>Category:</strong> {product.category || "N/A"}</li>
          <li><strong>Brand:</strong> {product.brand || "N/A"}</li>
          <li>
            <strong>Color:</strong> {selectedColor || product.color || "N/A"}
          </li>
          <li><strong>Stock:</strong> {product.stock}</li>
        </ul>
      </div>
      <div className="details-panel">
  <h3>Additional Details</h3>
  <ul>
    {product.subcategories && product.subcategories.length > 0 && (
      <li>
        <strong>Subcategories:</strong> {product.subcategories.join(", ")}
      </li>
    )}

    {product.colorVariants && product.colorVariants.length > 0 && (
      <li>
        <strong>Color Variants:</strong>{" "}
        {product.colorVariants.map((v) => v.color).join(", ")}
      </li>
    )}

    {product.sizes && product.sizes.length > 0 && (
      <li>
        <strong>Sizes Available:</strong> {product.sizes.join(", ")}
      </li>
    )}

    {product.stock != null && (
      <li>
        <strong>Stock:</strong> {product.stock}
      </li>
    )}

    {product.brand && (
      <li>
        <strong>Brand:</strong> {product.brand}
      </li>
    )}

    {product.highlightPoints && (
      <li>
        <strong>Highlights:</strong>
        <ul>
          {product.highlightPoints
            .split("\n")
            .map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
        </ul>
      </li>
    )}

    {product.featurePoints && (
      <li>
        <strong>Features:</strong>
        <ul>
          {product.featurePoints
            .split("\n")
            .map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
        </ul>
      </li>
    )}

    {product.description && (
      <li>
        <strong>Description:</strong> {product.description}
      </li>
    )}
  </ul>
</div>


      <div className="reviews-panel">
        <h3>Reviews</h3>
        <p className="muted">Reviews feature placeholder (integrate ratings & comments backend).</p>
      </div>
    </div>
  );
}

export default ProductDetail;


