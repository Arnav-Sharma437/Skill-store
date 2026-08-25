"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./AdminPage.module.css";

// Interface Definitions
interface IBanner {
  id: string;
  imageUrl: string;
  link: string;
}

interface ICategory {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  link: string;
}

interface IProduct {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  brand: string;
  category: string;
  subCategory: string;
  inStock: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"banners" | "categories" | "products">("products");
  const [authorized, setAuthorized] = useState(false);

  // Data States
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  
  // loading state
  const [loading, setLoading] = useState(true);

  // Form States
  const [bannerForm, setBannerForm] = useState({ id: "", imageUrl: "", link: "" });
  const [categoryForm, setCategoryForm] = useState({ id: "", name: "", brand: "tuqo", imageUrl: "", link: "" });
  const [productForm, setProductForm] = useState({
    id: "",
    title: "",
    price: "",
    originalPrice: "",
    imageUrl: "",
    brand: "tuqo",
    category: "high-pressure-washer",
    subCategory: "domestic",
    inStock: true,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBanners = useCallback(async () => {
    const res = await fetch("/api/admin/banners");
    const json = await res.json();
    if (json.success) setBanners(json.data);
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/admin/categories");
    const json = await res.json();
    if (json.success) setCategories(json.data);
  }, []);

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    const json = await res.json();
    if (json.success) setProducts(json.data);
  }, []);

  const initializeData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Trigger database seeding if empty
      await fetch("/api/admin/seed");

      // 2. Fetch all collections
      await Promise.all([fetchBanners(), fetchCategories(), fetchProducts()]);
    } catch (e) {
      console.error("Initialization failed", e);
    } finally {
      setLoading(false);
    }
  }, [fetchBanners, fetchCategories, fetchProducts]);

  // Auth check
  useEffect(() => {
    const token = sessionStorage.getItem("skill_store_admin_token");
    if (token !== "logged_in") {
      router.push("/admin/login");
    } else {
      Promise.resolve().then(() => {
        setAuthorized(true);
        initializeData();
      });
    }
  }, [router, initializeData]);

  // Sign out
  const handleSignOut = () => {
    sessionStorage.removeItem("skill_store_admin_token");
    router.push("/admin/login");
  };

  // Banner Actions
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const res = await fetch("/api/admin/banners", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bannerForm),
    });
    const json = await res.json();
    if (json.success) {
      alert(editingId ? "Banner updated!" : "Banner created!");
      setBannerForm({ id: "", imageUrl: "", link: "" });
      setEditingId(null);
      fetchBanners();
    } else {
      alert(`Error: ${json.error}`);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      fetchBanners();
    } else {
      alert(`Error: ${json.error}`);
    }
  };

  // Category Actions
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const res = await fetch("/api/admin/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryForm),
    });
    const json = await res.json();
    if (json.success) {
      alert(editingId ? "Category updated!" : "Category created!");
      setCategoryForm({ id: "", name: "", brand: "tuqo", imageUrl: "", link: "" });
      setEditingId(null);
      fetchCategories();
    } else {
      alert(`Error: ${json.error}`);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      fetchCategories();
    } else {
      alert(`Error: ${json.error}`);
    }
  };

  // Product Actions
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const res = await fetch("/api/admin/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productForm),
    });
    const json = await res.json();
    if (json.success) {
      alert(editingId ? "Product updated!" : "Product created!");
      setProductForm({
        id: "",
        title: "",
        price: "",
        originalPrice: "",
        imageUrl: "",
        brand: "tuqo",
        category: "high-pressure-washer",
        subCategory: "domestic",
        inStock: true,
      });
      setEditingId(null);
      fetchProducts();
    } else {
      alert(`Error: ${json.error}`);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      fetchProducts();
    } else {
      alert(`Error: ${json.error}`);
    }
  };

  if (!authorized) return null;

  return (
    <div className={styles.adminWrapper}>
      {/* Top Navigation Panel */}
      <header className={styles.adminHeader}>
        <div className={styles.brandGroup}>
          <span className={styles.headerTitle}>SKILL STORE</span>
          <span className={styles.headerBadge}>CMS Panel</span>
        </div>
        <button onClick={handleSignOut} className={styles.signOutBtn}>
          Sign Out
        </button>
      </header>

      {/* Main CMS Layout */}
      <div className={styles.adminLayout}>
        {/* Sidebar navigation */}
        <aside className={styles.sidebar}>
          <button
            onClick={() => { setActiveTab("products"); setEditingId(null); }}
            className={`${styles.sidebarTab} ${activeTab === "products" ? styles.activeTab : ""}`}
          >
            Manage Products
          </button>
          <button
            onClick={() => { setActiveTab("categories"); setEditingId(null); }}
            className={`${styles.sidebarTab} ${activeTab === "categories" ? styles.activeTab : ""}`}
          >
            Manage Categories
          </button>
          <button
            onClick={() => { setActiveTab("banners"); setEditingId(null); }}
            className={`${styles.sidebarTab} ${activeTab === "banners" ? styles.activeTab : ""}`}
          >
            Manage Banners
          </button>
        </aside>

        {/* Dashboard Area */}
        <main className={styles.dashboardContent}>
          {loading ? (
            <div className={styles.loadingSpinner}>
              <span>LOADING COLLECTIONS DATA...</span>
            </div>
          ) : (
            <>
              {/* tab 1: BANNERS */}
              {activeTab === "banners" && (
                <div className={styles.tabContent}>
                  <div className={styles.flexHeader}>
                    <h2>HOMEPAGE HERO BANNERS</h2>
                  </div>

                  <div className={styles.gridFormLayout}>
                    {/* Banner Form */}
                    <div className={styles.formCard}>
                      <h3>{editingId ? "EDIT BANNER" : "ADD NEW BANNER"}</h3>
                      <form onSubmit={handleBannerSubmit} className={styles.form}>
                        <div className={styles.inputField}>
                          <label htmlFor="banner-id">Banner ID</label>
                          <input
                            id="banner-id"
                            type="text"
                            placeholder="e.g. hero-6"
                            value={bannerForm.id}
                            onChange={(e) => setBannerForm({ ...bannerForm, id: e.target.value })}
                            required
                            disabled={!!editingId}
                          />
                        </div>
                        <div className={styles.inputField}>
                          <label htmlFor="banner-image">Banner Image URL</label>
                          <input
                            id="banner-image"
                            type="text"
                            placeholder="e.g. /images/banners/Hbanner-6.png"
                            value={bannerForm.imageUrl}
                            onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                            required
                          />
                        </div>
                        <div className={styles.inputField}>
                          <label htmlFor="banner-link">Redirect Link</label>
                          <input
                            id="banner-link"
                            type="text"
                            placeholder="e.g. /shop/tuqo"
                            value={bannerForm.link}
                            onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                          />
                        </div>
                        <button type="submit" className={styles.submitBtn}>
                          {editingId ? "UPDATE BANNER" : "CREATE BANNER"}
                        </button>
                        {editingId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setBannerForm({ id: "", imageUrl: "", link: "" });
                            }}
                            className={styles.cancelBtn}
                          >
                            Cancel
                          </button>
                        )}
                      </form>
                    </div>

                    {/* Banner List */}
                    <div className={styles.listCard}>
                      <h3>ACTIVE BANNERS ({banners.length})</h3>
                      <div className={styles.bannersList}>
                        {banners.map((b) => (
                          <div key={b.id} className={styles.bannerRow}>
                            <div className={styles.bannerPreview}>
                              <Image src={b.imageUrl} alt={b.id} width={120} height={50} style={{ objectFit: "cover" }} />
                            </div>
                            <div className={styles.bannerInfo}>
                              <strong>{b.id}</strong>
                              <span>Link: {b.link}</span>
                            </div>
                            <div className={styles.rowActions}>
                              <button
                                onClick={() => {
                                  setEditingId(b.id);
                                  setBannerForm({ id: b.id, imageUrl: b.imageUrl, link: b.link });
                                }}
                                className={styles.editBtn}
                              >
                                Edit
                              </button>
                              <button onClick={() => deleteBanner(b.id)} className={styles.deleteBtn}>
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* tab 2: CATEGORIES */}
              {activeTab === "categories" && (
                <div className={styles.tabContent}>
                  <div className={styles.flexHeader}>
                    <h2>BRAND CATEGORIES</h2>
                  </div>

                  <div className={styles.gridFormLayout}>
                    {/* Category Form */}
                    <div className={styles.formCard}>
                      <h3>{editingId ? "EDIT CATEGORY" : "ADD NEW CATEGORY"}</h3>
                      <form onSubmit={handleCategorySubmit} className={styles.form}>
                        <div className={styles.inputField}>
                          <label htmlFor="category-id">Category ID</label>
                          <input
                            id="category-id"
                            type="text"
                            placeholder="e.g. tuqo-11"
                            value={categoryForm.id}
                            onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value })}
                            required
                            disabled={!!editingId}
                          />
                        </div>
                        <div className={styles.inputField}>
                          <label htmlFor="category-name">Category Name</label>
                          <input
                            id="category-name"
                            type="text"
                            placeholder="e.g. Water Filters"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className={styles.inputField}>
                          <label htmlFor="category-brand">Brand</label>
                          <select
                            id="category-brand"
                            value={categoryForm.brand}
                            onChange={(e) => setCategoryForm({ ...categoryForm, brand: e.target.value })}
                          >
                            <option value="tuqo">TUQO</option>
                            <option value="pumpkin">PUMPKIN</option>
                            <option value="mitsuki">MITSUKI</option>
                            <option value="metso">METSO</option>
                            <option value="costec">COSTEC</option>
                          </select>
                        </div>
                        <div className={styles.inputField}>
                          <label htmlFor="category-image">Category Image URL</label>
                          <input
                            id="category-image"
                            type="text"
                            placeholder="e.g. /images/products/hw2000.jpg"
                            value={categoryForm.imageUrl}
                            onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                            required
                          />
                        </div>
                        <div className={styles.inputField}>
                          <label htmlFor="category-link">Redirect Link</label>
                          <input
                            id="category-link"
                            type="text"
                            placeholder="e.g. /shop/tuqo/water-filters"
                            value={categoryForm.link}
                            onChange={(e) => setCategoryForm({ ...categoryForm, link: e.target.value })}
                          />
                        </div>
                        <button type="submit" className={styles.submitBtn}>
                          {editingId ? "UPDATE CATEGORY" : "CREATE CATEGORY"}
                        </button>
                        {editingId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setCategoryForm({ id: "", name: "", brand: "tuqo", imageUrl: "", link: "" });
                            }}
                            className={styles.cancelBtn}
                          >
                            Cancel
                          </button>
                        )}
                      </form>
                    </div>

                    {/* Category List */}
                    <div className={styles.listCard}>
                      <h3>ACTIVE CATEGORIES ({categories.length})</h3>
                      <div className={styles.tableWrapper}>
                        <table className={styles.adminTable}>
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Brand</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categories.map((c) => (
                              <tr key={c.id}>
                                <td><strong>{c.id}</strong></td>
                                <td>{c.name}</td>
                                <td><span className={styles.badge}>{c.brand.toUpperCase()}</span></td>
                                <td>
                                  <div className={styles.rowActions}>
                                    <button
                                      onClick={() => {
                                        setEditingId(c.id);
                                        setCategoryForm({ id: c.id, name: c.name, brand: c.brand, imageUrl: c.imageUrl, link: c.link });
                                      }}
                                      className={styles.editBtn}
                                    >
                                      Edit
                                    </button>
                                    <button onClick={() => deleteCategory(c.id)} className={styles.deleteBtn}>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* tab 3: PRODUCTS */}
              {activeTab === "products" && (
                <div className={styles.tabContent}>
                  <div className={styles.flexHeader}>
                    <h2>E-COMMERCE PRODUCTS</h2>
                  </div>

                  <div className={styles.gridFormLayout}>
                    {/* Product Form */}
                    <div className={styles.formCard}>
                      <h3>{editingId ? "EDIT PRODUCT" : "ADD NEW PRODUCT"}</h3>
                      <form onSubmit={handleProductSubmit} className={styles.form}>
                        <div className={styles.inputField}>
                          <label htmlFor="product-id">Product ID / SKU</label>
                          <input
                            id="product-id"
                            type="text"
                            placeholder="e.g. prod-6"
                            value={productForm.id}
                            onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                            required
                            disabled={!!editingId}
                          />
                        </div>
                        <div className={styles.inputField}>
                          <label htmlFor="product-title">Product Title</label>
                          <input
                            id="product-title"
                            type="text"
                            placeholder="e.g. High Pressure Washer CDW400"
                            value={productForm.title}
                            onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                            required
                          />
                        </div>
                        <div className={styles.inputRow}>
                          <div className={styles.inputField}>
                            <label htmlFor="product-price">Price (Rs.)</label>
                            <input
                              id="product-price"
                              type="number"
                              placeholder="4999"
                              value={productForm.price}
                              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                              required
                            />
                          </div>
                          <div className={styles.inputField}>
                            <label htmlFor="product-original-price">Original Price</label>
                            <input
                              id="product-original-price"
                              type="number"
                              placeholder="6999"
                              value={productForm.originalPrice}
                              onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className={styles.inputRow}>
                          <div className={styles.inputField}>
                            <label htmlFor="product-brand">Brand</label>
                            <select
                              id="product-brand"
                              value={productForm.brand}
                              onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                            >
                              <option value="tuqo">TUQO</option>
                              <option value="pumpkin">PUMPKIN</option>
                              <option value="mitsuki">MITSUKI</option>
                              <option value="metso">METSO</option>
                              <option value="costec">COSTEC</option>
                            </select>
                          </div>
                          <div className={styles.inputField}>
                            <label htmlFor="product-category">Category</label>
                            <select
                              id="product-category"
                              value={productForm.category}
                              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                            >
                              <option value="high-pressure-washer">High Pressure Washer</option>
                              <option value="vaccum-cleaner">Vaccum Cleaner</option>
                              <option value="accessories">Accessories</option>
                              <option value="cordless-tools">Cordless Tools</option>
                              <option value="spares">Spares & Accessories</option>
                            </select>
                          </div>
                        </div>

                        <div className={styles.inputRow}>
                          <div className={styles.inputField}>
                            <label htmlFor="product-subcat">Sub Category</label>
                            <select
                              id="product-subcat"
                              value={productForm.subCategory}
                              onChange={(e) => setProductForm({ ...productForm, subCategory: e.target.value })}
                            >
                              <option value="domestic">Domestic</option>
                              <option value="commercial">Commercial</option>
                              <option value="accessory">Accessory</option>
                            </select>
                          </div>
                          <div className={styles.inputField}>
                            <label htmlFor="product-stock">Stock Availability</label>
                            <select
                              id="product-stock"
                              value={productForm.inStock ? "true" : "false"}
                              onChange={(e) => setProductForm({ ...productForm, inStock: e.target.value === "true" })}
                            >
                              <option value="true">In Stock</option>
                              <option value="false">Out of Stock</option>
                            </select>
                          </div>
                        </div>

                        <div className={styles.inputField}>
                          <label htmlFor="product-image">Main Image URL</label>
                          <input
                            id="product-image"
                            type="text"
                            placeholder="e.g. /images/products/cdw400.jpg"
                            value={productForm.imageUrl}
                            onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                            required
                          />
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                          {editingId ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
                        </button>
                        {editingId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setProductForm({
                                id: "",
                                title: "",
                                price: "",
                                originalPrice: "",
                                imageUrl: "",
                                brand: "tuqo",
                                category: "high-pressure-washer",
                                subCategory: "domestic",
                                inStock: true,
                              });
                            }}
                            className={styles.cancelBtn}
                          >
                            Cancel
                          </button>
                        )}
                      </form>
                    </div>

                    {/* Product List */}
                    <div className={styles.listCard}>
                      <h3>ACTIVE PRODUCTS ({products.length})</h3>
                      <div className={styles.tableWrapper}>
                        <table className={styles.adminTable}>
                          <thead>
                            <tr>
                              <th>SKU</th>
                              <th>Title</th>
                              <th>Price</th>
                              <th>Brand</th>
                              <th>Type</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((p) => (
                              <tr key={p.id}>
                                <td><strong>{p.id}</strong></td>
                                <td className={styles.tableTitleCell} title={p.title}>{p.title}</td>
                                <td>Rs. {p.price.toLocaleString("en-IN")}</td>
                                <td><span className={styles.badge}>{p.brand.toUpperCase()}</span></td>
                                <td>
                                  <span className={`${styles.badge} ${styles.typeBadge}`}>
                                    {p.subCategory.toUpperCase()}
                                  </span>
                                </td>
                                <td>
                                  <div className={styles.rowActions}>
                                    <button
                                      onClick={() => {
                                        setEditingId(p.id);
                                        setProductForm({
                                          id: p.id,
                                          title: p.title,
                                          price: p.price.toString(),
                                          originalPrice: p.originalPrice.toString(),
                                          imageUrl: p.imageUrl,
                                          brand: p.brand,
                                          category: p.category,
                                          subCategory: p.subCategory,
                                          inStock: p.inStock,
                                        });
                                      }}
                                      className={styles.editBtn}
                                    >
                                      Edit
                                    </button>
                                    <button onClick={() => deleteProduct(p.id)} className={styles.deleteBtn}>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
