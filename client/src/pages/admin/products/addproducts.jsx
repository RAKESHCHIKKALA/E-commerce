import React, { useEffect, useState } from "react";
import axios from "axios";
import "./addproducts.css";

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    price: "",
    originalPrice: "",
    discountPercent: "",
    stock: "",
    category: "",
    subcategory: "",
    brand: "",
    color: "",
    sizes: "",
    description: "",
    highlightPoints: "",
    featurePoints: "",
    material: "",
    images: [],
    videos: [],
  });

  const [colorVariants, setColorVariants] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // {path, url}
  const [primaryChoice, setPrimaryChoice] = useState(null); // {type: "existing"|"new", value: path|index}

  const token = localStorage.getItem("token");

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:1234";

  // Fetch products
  const fetchProducts = async () => {
    const res = await axios.get(`${API_BASE}/api/products`);
    setProducts(res.data);
    setFiltered(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search / Filter / Sort
  useEffect(() => {
    let data = [...products];

    if (search.trim()) {
      const term = search.toLowerCase();
      data = data.filter((item) =>
        item.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.brand?.toLowerCase().includes(term) ||
        item.subcategory?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term)
      );
    }

    if (category !== "all") {
      data = data.filter((item) => item.category === category);
    }

    if (sort === "priceLow") data.sort((a, b) => a.price - b.price);
    if (sort === "priceHigh") data.sort((a, b) => b.price - a.price);
    if (sort === "newest") data.reverse();

    setFiltered(data);
  }, [search, sort, category, products]);

  // Add Product Modal
  const openAddModal = () => {
    setEditingId(null);
    setForm({
      name: "",
      price: "",
      originalPrice: "",
      discountPercent: "",
      stock: "",
      category: "",
      subcategory: "",
      brand: "",
      color: "",
      sizes: "",
      description: "",
      material: "",
      images: [],
      videos: [],
    });
    setColorVariants([]);
    setImagePreviews([]);
    setExistingImages([]);
    setPrimaryChoice(null);
    setShowModal(true);
  };

  // Edit Modal
  const openEditModal = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      discountPercent: p.discountPercent || "",
      stock: p.stock,
      category: p.category,
      subcategory: p.subcategory || "",
      brand: p.brand || "",
      color: p.color || "",
      sizes: (p.sizes || []).join(", "),
      description: p.description,
      highlightPoints: p.highlightPoints || "",
      featurePoints: p.featurePoints || "",
      material: p.material || "",
      images: [],
      videos: [],
    });
    setColorVariants(
      (p.colorVariants || []).map((v) => ({
        color: v.color || "",
        files: [],
        previews: [],
        existingImages: (v.images || []).map((path) => ({
          path,
          url: path?.startsWith("http") ? path : `${API_BASE}${path}`,
        })),
      }))
    );
    const imgs = (p.images && p.images.length ? p.images : p.image ? [p.image] : []);
    setExistingImages(
      imgs.map((path) => ({
        path,
        url: path?.startsWith("http") ? path : `${API_BASE}${path}`,
      }))
    );
    setImagePreviews([]);
    setPrimaryChoice(
      imgs[0]
        ? { type: "existing", value: imgs[0] }
        : null
    );
    setShowModal(true);
  };

  // Images Preview + store files
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const merged = [...(form.images || []), ...files];
    const seen = new Set();
    const deduped = [];
    merged.forEach((file) => {
      const key = `${file.name}-${file.lastModified}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(file);
      }
    });
    const limited = deduped.slice(0, 5); // align with backend maxCount

    setForm({ ...form, images: limited });
    setImagePreviews(limited.map((file) => URL.createObjectURL(file)));

    if (
      !primaryChoice ||
      (primaryChoice.type === "new" &&
        (primaryChoice.value === undefined ||
          primaryChoice.value >= limited.length))
    ) {
      if (limited.length > 0) {
        setPrimaryChoice({ type: "new", value: 0 });
      }
    }

    // allow reselecting the same files
    if (e.target?.value) e.target.value = null;
  };

  const handleVideosChange = (e) => {
    const files = Array.from(e.target.files || []);
    setForm({ ...form, videos: files });
  };

  const addColorVariant = () => {
    setColorVariants((prev) => [
      ...prev,
      { color: "", files: [], previews: [], existingImages: [] },
    ]);
  };

  const updateColorVariant = (idx, patch) => {
    setColorVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, ...patch } : v))
    );
  };

  const handleColorImagesChange = (idx, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setColorVariants((prev) => {
      const copy = [...prev];
      const current = copy[idx] || { files: [], previews: [], existingImages: [] };
      const merged = [...(current.files || []), ...files];
      const seen = new Set();
      const deduped = [];
      merged.forEach((file) => {
        const key = `${file.name}-${file.lastModified}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(file);
        }
      });
      const limited = deduped.slice(0, 5);
      copy[idx] = {
        ...current,
        files: limited,
        previews: limited.map((file) => URL.createObjectURL(file)),
      };
      return copy;
    });

    if (e.target?.value) e.target.value = null;
  };

  const removeColorVariant = (idx) => {
    setColorVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeVariantExistingImage = (idx, path) => {
    setColorVariants((prev) =>
      prev.map((v, i) =>
        i === idx
          ? {
              ...v,
              existingImages: (v.existingImages || []).filter((img) => img.path !== path),
            }
          : v
      )
    );
  };

  const removeVariantNewImage = (idx, imgIndex) => {
    setColorVariants((prev) =>
      prev.map((v, i) =>
        i === idx
          ? {
              ...v,
              files: (v.files || []).filter((_, fi) => fi !== imgIndex),
              previews: (v.previews || []).filter((_, fi) => fi !== imgIndex),
            }
          : v
      )
    );
  };

  // Save Product (Add or Edit)
  const saveProduct = async () => {
    const fd = new FormData();

    fd.append("name", form.name);
    fd.append("price", form.price);
    fd.append("originalPrice", form.originalPrice);
    fd.append("discountPercent", form.discountPercent);
    fd.append(
      "keepImages",
      JSON.stringify(existingImages.map((img) => img.path))
    );
    fd.append(
      "primaryExisting",
      primaryChoice?.type === "existing" ? primaryChoice.value : ""
    );
    fd.append(
      "primaryNewIndex",
      primaryChoice?.type === "new" ? primaryChoice.value : ""
    );
    fd.append("stock", form.stock);
    fd.append("category", form.category);
    fd.append("subcategory", form.subcategory);
    fd.append("brand", form.brand);
    fd.append("color", form.color);
    fd.append("sizes", form.sizes);
    fd.append("description", form.description);
    fd.append("highlightPoints", form.highlightPoints);
    fd.append("featurePoints", form.featurePoints);
    fd.append("material",form.material);
    fd.append(
      "colorVariants",
      JSON.stringify(
        colorVariants.map((v) => ({
          color: v.color,
          existingImages: (v.existingImages || []).map((img) => img.path),
        }))
      )
    );

    (form.images || []).forEach((file) => fd.append("images", file));
    (form.videos || []).forEach((file) => fd.append("videos", file));
    colorVariants.forEach((variant, idx) => {
      (variant.files || []).forEach((file) => fd.append(`colorImages_${idx}`, file));
    });

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/api/products/${editingId}`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axios.post(`${API_BASE}/api/products/add`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.log(err);
    }
  };

  // Delete Product
  const deleteProduct = async (id) => {
    if (!confirm("Are you sure to delete?")) return;
    await axios.delete(`http://localhost:1234/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
  };

  return (
    <div className="container">
      
      <header className="topbar">
        <h2>Manage Products</h2>
        <button className="add-btn" onClick={openAddModal}>
          + Add Product
        </button>
      </header>

      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All</option>
          <option value="electronics">Electronics</option>
          <option value="fashion">Fashion</option>
          <option value="home">Home & Kitchen</option>
          <option value="beauty">Beauty</option>
        </select>

        <select onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="priceLow">Price: Low → High</option>
          <option value="priceHigh">Price: High → Low</option>
        </select>
      </div>

      <table className="product-table">
        <thead>
          <tr>
            <th>Img</th>
            <th>Name</th>
            <th>Price ₹</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Subcategory</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((p) => (
            <tr key={p._id}>
              <td>
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
                  className="thumb"
                />
              </td>
              <td>{p.name}</td>
              <td>₹{p.price}</td>
              <td>{p.stock}</td>
              <td>{p.category}</td>
            <td>{p.subcategory || "-"}</td>
              <td>
                <button className="edit" onClick={() => openEditModal(p)}>
                  ✏ Edit
                </button>
                <button className="delete" onClick={() => deleteProduct(p._id)}>
                  🗑 Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-body">
            <h3>{editingId ? "Edit Product" : "Add Product"}</h3>

            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <input
              type="number"
              placeholder="Original price"
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
            />

            <input
              type="number"
              placeholder="Discount %"
              value={form.discountPercent}
              onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
            />

            <input
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />

            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select Category</option>
              <option value="electronics">Electronics</option>
              <option value="clothes">clothes</option>
              <option value="footweare">footware</option>
              <option value="acceries">acceries</option>
              <option value="MENS">MENS</option>
              <option value="WOMEN">WOMENS</option>
              <option value="STATINORY"></option>
            </select>

            <input
              list="subcategoryOptions"
              type="text"
              placeholder="Subcategory (Men, Women, Kids or custom)"
              value={form.subcategory}
              onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
            />
            <datalist id="subcategoryOptions">
              <option value="men" />
              <option value="women" />
              <option value="kids" />
              <option value="unisex" />
            </datalist>

            <input
              type="text"
              placeholder="Brand"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />

             <input
              type="text"
              placeholder="colour (comma separated)"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />

            <div className="color-variants">
              <div className="color-variants-head">
                <h4>Color Variants (buttons + separate images)</h4>
                <button type="button" className="add-variant" onClick={addColorVariant}>
                  + Add Color
                </button>
              </div>
              {colorVariants.length === 0 && (
                <p className="muted">Add a color to upload its specific images.</p>
              )}
              {colorVariants.map((variant, idx) => (
                <div className="variant-card" key={idx}>
                  <div className="variant-row">
                    <input
                      type="text"
                      placeholder="Color name (e.g. Red)"
                      value={variant.color}
                      onChange={(e) =>
                        updateColorVariant(idx, { color: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="remove-variant"
                      onClick={() => removeColorVariant(idx)}
                    >
                      Remove
                    </button>
                  </div>
                  <label>Images for this color (up to 5)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleColorImagesChange(idx, e)}
                  />
                  {(variant.existingImages?.length > 0 ||
                    variant.previews?.length > 0) && (
                    <div className="preview-grid">
                      {(variant.existingImages || []).map((img) => (
                        <div className="preview-tile" key={img.path}>
                          <img src={img.url} alt="" className="preview" />
                          <button
                            type="button"
                            className="remove-img"
                            onClick={() => removeVariantExistingImage(idx, img.path)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {(variant.previews || []).map((src, imgIdx) => (
                        <div className="preview-tile" key={`new-${imgIdx}`}>
                          <img src={src} alt="" className="preview" />
                          <button
                            type="button"
                            className="remove-img"
                            onClick={() => removeVariantNewImage(idx, imgIdx)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <input
              type="text"
              placeholder="Sizes (comma separated)"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            />

            < textarea
              className="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            < textarea
              className="text"
            
              placeholder="Highlights (one point per line)"
              value={form.highlightPoints}
              onChange={(e) =>
                setForm({ ...form, highlightPoints: e.target.value })
              }
            />

            < textarea
              className="text"
              placeholder="More info / About this item (one point per line)"
              value={form.featurePoints}
              onChange={(e) =>
                setForm({ ...form, featurePoints: e.target.value })
              }
            />
            < textarea
              className="text"
              style={{ height: "120px"  }}
              placeholder="material"
              value={form.material}
              onChange={(e) =>
                setForm({ ...form, material: e.target.value })
              }
            />
            

            <label>Images (up to 5)</label>
            <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
            {existingImages.length > 0 && (
              <div className="preview-grid">
                {existingImages.map((img) => (
                  <div className="preview-tile" key={img.path}>
                    <img src={img.url} alt="" className="preview" />
                    <div className="preview-actions">
                      <label className="primary-radio">
                        <input
                          type="radio"
                          name="primary-img"
                          checked={
                            primaryChoice?.type === "existing" &&
                            primaryChoice?.value === img.path
                          }
                          onChange={() =>
                            setPrimaryChoice({ type: "existing", value: img.path })
                          }
                        />
                        Primary
                      </label>
                      <button
                        type="button"
                        className="remove-img"
                        onClick={() => {
                          setExistingImages((prev) =>
                            prev.filter((e) => e.path !== img.path)
                          );
                          if (
                            primaryChoice?.type === "existing" &&
                            primaryChoice?.value === img.path
                          ) {
                            const remaining = existingImages
                              .filter((e) => e.path !== img.path)
                              .map((e) => e.path);
                            if (remaining[0]) {
                              setPrimaryChoice({ type: "existing", value: remaining[0] });
                            } else if (form.images.length > 0) {
                              setPrimaryChoice({ type: "new", value: 0 });
                            } else {
                              setPrimaryChoice(null);
                            }
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {imagePreviews.length > 0 && (
              <div className="preview-grid">
                {imagePreviews.map((src, idx) => (
                  <div className="preview-tile" key={idx}>
                    <img src={src} alt={`preview-${idx}`} className="preview" />
                    <div className="preview-actions">
                      <label className="primary-radio">
                        <input
                          type="radio"
                          name="primary-img"
                          checked={
                            primaryChoice?.type === "new" &&
                            primaryChoice?.value === idx
                          }
                          onChange={() =>
                            setPrimaryChoice({ type: "new", value: idx })
                          }
                        />
                        Primary
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label>Videos (up to 2)</label>
            <input type="file" accept="video/*" multiple onChange={handleVideosChange} />

            <div className="actions">
              <button className="save" onClick={saveProduct}>
                Save
              </button>
              <button className="close" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageProducts;
