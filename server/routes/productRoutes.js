const express = require("express");
const router = express.Router();
const Product = require("../models/productmodel");

// ✅ Cloudinary Multer middleware
// IMPORTANT: this file must upload to Cloudinary and return file.path as URL
const upload = require("../middleware/uploads");

/* ------------------ helpers ------------------ */

const parseJSON = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (err) {
    return fallback;
  }
};

const extractPaths = (files, fieldName) => {
  if (!files) return [];

  // If multer gives array (.any())
  if (Array.isArray(files)) {
    return files
      .filter((f) => f.fieldname === fieldName)
      .map((f) => f.path);
  }

  // If multer gives object (.fields())
  if (files[fieldName]) {
    return files[fieldName].map((f) => f.path);
  }

  return [];
};


const buildPrimaryImage = (images, primaryExisting, primaryNewIndex) => {
  if (primaryExisting && images.includes(primaryExisting)) {
    return primaryExisting;
  }
  if (
    primaryNewIndex !== undefined &&
    primaryNewIndex !== "" &&
    !Number.isNaN(Number(primaryNewIndex))
  ) {
    const idx = Number(primaryNewIndex);
    if (images[idx]) return images[idx];
  }
  return images[0] || "";
};

/* ------------------ ADD PRODUCT ------------------ */

router.post("/add", upload, async (req, res) => {
  try {
    const files = req.files || [];

    // DEBUG (remove later)
    console.log("Uploaded files:", files.map(f => f.path));

    const keepImages = parseJSON(req.body.keepImages, []);
    const newImages = extractPaths(files, "images");
    const videos = extractPaths(files, "videos");
    const allImages = [...keepImages, ...newImages];

    const sizes = (req.body.sizes || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const colorVariantsInput = parseJSON(req.body.colorVariants, []);
    const colorVariants = colorVariantsInput.map((variant, idx) => ({
      color: variant.color,
      images: [
        ...(variant.existingImages || []),
        ...extractPaths(files, `colorImages_${idx}`),
      ],
    }));

    const product = new Product({
      name: req.body.name,
      description: req.body.description || "",
      price: Number(req.body.price) || 0,
      originalPrice:
        Number(req.body.originalPrice) || Number(req.body.price) || 0,
      discountPercent: Number(req.body.discountPercent) || 0,
      stock: Number(req.body.stock) || 0,
      category: req.body.category || "",
      subcategory: req.body.subcategory || "",
      brand: req.body.brand || "",
      color: req.body.color || "",
      altColors: colorVariants.map((v) => v.color).filter(Boolean),
      sizes,
      images: allImages,
      videos,
      image: buildPrimaryImage(
        allImages,
        req.body.primaryExisting,
        req.body.primaryNewIndex
      ),
      colorVariants,
      highlightPoints: req.body.highlightPoints || "",
      featurePoints: req.body.featurePoints || "",
      material: req.body.material || "",
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/* ------------------ UPDATE PRODUCT ------------------ */

router.put("/:id", upload, async (req, res) => {
  try {
    const files = req.files || [];

    const keepImages = parseJSON(req.body.keepImages, []);
    const newImages = extractPaths(files, "images");
    const videos = extractPaths(files, "videos");
    const allImages = [...keepImages, ...newImages];

    const sizes = (req.body.sizes || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const colorVariantsInput = parseJSON(req.body.colorVariants, []);
    const colorVariants = colorVariantsInput.map((variant, idx) => ({
      color: variant.color,
      images: [
        ...(variant.existingImages || []),
        ...extractPaths(files, `colorImages_${idx}`),
      ],
    }));

    const update = {
      name: req.body.name,
      description: req.body.description || "",
      price: Number(req.body.price) || 0,
      originalPrice:
        Number(req.body.originalPrice) || Number(req.body.price) || 0,
      discountPercent: Number(req.body.discountPercent) || 0,
      stock: Number(req.body.stock) || 0,
      category: req.body.category || "",
      subcategory: req.body.subcategory || "",
      brand: req.body.brand || "",
      color: req.body.color || "",
      altColors: colorVariants.map((v) => v.color).filter(Boolean),
      sizes,
      images: allImages,
      videos,
      image: buildPrimaryImage(
        allImages,
        req.body.primaryExisting,
        req.body.primaryNewIndex
      ),
      colorVariants,
      highlightPoints: req.body.highlightPoints || "",
      featurePoints: req.body.featurePoints || "",
      material: req.body.material || "",
    };

    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/* ------------------ DELETE PRODUCT ------------------ */

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------ GET PRODUCTS ------------------ */

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
