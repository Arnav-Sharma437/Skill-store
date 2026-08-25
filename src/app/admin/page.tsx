"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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

interface IEnquiry {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "banners">("analytics");
  const [authorized, setAuthorized] = useState(false);

  // Data States
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [enquiries, setEnquiries] = useState<IEnquiry[]>([]);
  
  // loading state
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

  // Form States
  const [bannerForm, setBannerForm] = useState({ id: "", imageUrl: "", link: "" });
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

  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

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

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    const json = await res.json();
    if (json.success) setProducts(json.data);
  };

  const fetchEnquiries = useCallback(async () => {
    const res = await fetch("/api/admin/enquiries");
    const json = await res.json();
    if (json.success) setEnquiries(json.data);
  }, []);

  const initializeData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Trigger database seeding if empty
      await fetch("/api/admin/seed");

      // 2. Fetch all collections
      await Promise.all([fetchBanners(), fetchCategories(), fetchProducts(), fetchEnquiries()]);
    } catch (e) {
      console.error("Initialization failed", e);
    } finally {
      setLoading(false);
    }
  }, [fetchBanners, fetchCategories, fetchEnquiries]);

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

  // Toggle stock switch handler (instant save to MongoDB!)
  const handleStockToggle = async (product: IProduct) => {
    const updatedStock = !product.inStock;
    
    // Optimistic Update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, inStock: updatedStock } : p))
    );

    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, inStock: updatedStock }),
      });
      const json = await res.json();
      if (!json.success) {
        // Rollback on failure
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, inStock: product.inStock } : p))
        );
        alert(`Error toggling stock: ${json.error}`);
      }
    } catch {
      // Rollback
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: product.inStock } : p))
      );
      alert("Network error toggling stock");
    }
  };

  // Banner Actions
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingBannerId ? "PUT" : "POST";
    const res = await fetch("/api/admin/banners", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bannerForm),
    });
    const json = await res.json();
    if (json.success) {
      alert(editingBannerId ? "Banner updated!" : "Banner created!");
      setBannerForm({ id: "", imageUrl: "", link: "" });
      setEditingBannerId(null);
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

  // Product CRUD modal triggers
  const openAddProductModal = () => {
    setEditingProduct(null);
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
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: IProduct) => {
    setEditingProduct(prod);
    setProductForm({
      id: prod.id,
      title: prod.title,
      price: prod.price.toString(),
      originalPrice: prod.originalPrice.toString(),
      imageUrl: prod.imageUrl,
      brand: prod.brand,
      category: prod.category,
      subCategory: prod.subCategory,
      inStock: prod.inStock,
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct ? "PUT" : "POST";
    const res = await fetch("/api/admin/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productForm),
    });
    const json = await res.json();
    if (json.success) {
      setIsProductModalOpen(false);
      fetchProducts();
    } else {
      alert(`Error saving product: ${json.error}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product from the database?")) return;
    const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      fetchProducts();
    } else {
      alert(`Error deleting product: ${json.error}`);
    }
  };

  // Filtered Products List
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchSearch =
        prod.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        prod.id.toLowerCase().includes(productSearch.toLowerCase());
      
      const matchCategory =
        productCategoryFilter === "all" || prod.category === productCategoryFilter;

      return matchSearch && matchCategory;
    });
  }, [products, productSearch, productCategoryFilter]);

  // Unique categories list for dropdown selection
  const uniqueCategories = useMemo(() => {
    const seen = new Set();
    return categories.filter((cat) => {
      const duplicate = seen.has(cat.id);
      seen.add(cat.id);
      return !duplicate;
    });
  }, [categories]);

  // Analytics helper calculations
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = totalProducts - inStockCount;
  const totalEnquiries = enquiries.length;

  const inStockPercentage = totalProducts > 0 ? (inStockCount / totalProducts) * 360 : 360;

  // Products per category breakdown (AEC style visual bar chart)
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const catLabel = p.category.replace(/-/g, " ").toUpperCase();
      counts[catLabel] = (counts[catLabel] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [products]);

  const maxCategoryCount = useMemo(() => {
    if (categoryChartData.length === 0) return 1;
    return Math.max(...categoryChartData.map((d) => d.count));
  }, [categoryChartData]);

  if (!authorized) return null;

  return (
    <div className={styles.adminWrapper}>
      {/* Top Header Panel (Matches AEC Admin Panel Header) */}
      <header className={styles.adminHeader}>
        <div className={styles.brandGroup}>
          <span className={styles.headerTitle}>Dashboard</span>
          <span className={styles.headerSubtitle}>Skill Store Management Panel</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.adminMeta}>
            <strong>Skill Store Admin</strong>
            <span>Administrator</span>
          </div>
          <button onClick={handleSignOut} className={styles.signOutBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Sidebar Layout */}
      <div className={styles.adminLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarBrand}>
            <strong>Skill Store Admin</strong>
            <span>Management Panel</span>
          </div>

          <nav className={styles.sidebarNav}>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`${styles.sidebarTab} ${activeTab === "analytics" ? styles.activeTab : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.tabIcon}>
                <rect x="3" y="3" width="7" height="9"></rect>
                <rect x="14" y="3" width="7" height="5"></rect>
                <rect x="14" y="12" width="7" height="9"></rect>
                <rect x="3" y="16" width="7" height="5"></rect>
              </svg>
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`${styles.sidebarTab} ${activeTab === "products" ? styles.activeTab : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.tabIcon}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>Products</span>
            </button>

            <button
              onClick={() => setActiveTab("banners")}
              className={`${styles.sidebarTab} ${activeTab === "banners" ? styles.activeTab : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.tabIcon}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>Hero Banner</span>
            </button>
          </nav>

          <Link href="/" className={styles.viewWebsiteLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>View Website</span>
          </Link>
        </aside>

        {/* Dashboard Panels */}
        <main className={styles.dashboardContent}>
          {loading ? (
            <div className={styles.loadingSpinner}>
              <span>LOADING CATALOGUE DATA...</span>
            </div>
          ) : (
            <>
              {/* Tab 1: Analytics (AEC Style charts and cards) */}
              {activeTab === "analytics" && (
                <div className={styles.tabContent}>
                  <div className={styles.analyticsIntro}>
                    <span>Welcome back</span>
                    <h2>Analytics overview</h2>
                    <p>Inventory health and recent customer enquiries</p>
                  </div>

                  {/* Summary Cards Grid */}
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <div className={styles.statInfo}>
                        <span>Total Products</span>
                        <strong>{totalProducts}</strong>
                      </div>
                      <div className={styles.statIconBox}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                          <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                      </div>
                    </div>

                    <div className={styles.statCard} style={{ borderLeft: "4px solid #10b981" }}>
                      <div className={styles.statInfo}>
                        <span>In Stock</span>
                        <strong style={{ color: "#10b981" }}>{inStockCount}</strong>
                      </div>
                      <div className={styles.statIconBox} style={{ background: "#d1fae5" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </div>

                    <div className={styles.statCard} style={{ borderLeft: "4px solid #ef4444" }}>
                      <div className={styles.statInfo}>
                        <span>Out of Stock</span>
                        <strong style={{ color: "#ef4444" }}>{outOfStockCount}</strong>
                      </div>
                      <div className={styles.statIconBox} style={{ background: "#fee2e2" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </div>
                    </div>

                    <div className={styles.statCard} style={{ borderLeft: "4px solid #f59e0b" }}>
                      <div className={styles.statInfo}>
                        <span>Total Enquiries</span>
                        <strong style={{ color: "#f59e0b" }}>{totalEnquiries}</strong>
                      </div>
                      <div className={styles.statIconBox} style={{ background: "#fef3c7" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Graphical breakdowns */}
                  <div className={styles.graphsRow}>
                    {/* Products per category bar chart */}
                    <div className={styles.graphCard}>
                      <div className={styles.graphHeader}>
                        <h3>Products per category</h3>
                        <span>Catalogue breakdown by category</span>
                      </div>
                      <div className={styles.barChartContainer}>
                        {categoryChartData.map((data, idx) => {
                          const heightPercent = (data.count / maxCategoryCount) * 100;
                          return (
                            <div key={idx} className={styles.barCol}>
                              <div className={styles.barWrapper}>
                                <div 
                                  className={styles.barFill} 
                                  style={{ height: `${heightPercent}%` }}
                                  title={`${data.count} Products`}
                                ></div>
                              </div>
                              <span className={styles.barLabel} title={data.name}>
                                {data.name.length > 12 ? `${data.name.substring(0, 10)}...` : data.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stock Distribution Donut */}
                    <div className={styles.graphCard}>
                      <div className={styles.graphHeader}>
                        <h3>Stock distribution</h3>
                        <span>In stock vs out of stock</span>
                      </div>
                      <div className={styles.donutContainer}>
                        <div 
                          className={styles.donutChart}
                          style={{
                            background: `conic-gradient(#10b981 0deg, #10b981 ${inStockPercentage}deg, #ef4444 ${inStockPercentage}deg, #ef4444 360deg)`
                          }}
                        >
                          <div className={styles.donutCenter}>
                            <strong>{Math.round((inStockCount / (totalProducts || 1)) * 100)}%</strong>
                            <span>Available</span>
                          </div>
                        </div>
                        <div className={styles.legend}>
                          <div className={styles.legendItem}>
                            <span className={styles.legendDot} style={{ background: "#10b981" }}></span>
                            <span>In Stock ({inStockCount})</span>
                          </div>
                          <div className={styles.legendItem}>
                            <span className={styles.legendDot} style={{ background: "#ef4444" }}></span>
                            <span>Out of Stock ({outOfStockCount})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Enquiries list */}
                  <div className={styles.enquiriesCard}>
                    <div className={styles.graphHeader}>
                      <h3>Recent enquiries</h3>
                      <span>Last 10 messages from customers</span>
                    </div>

                    <div className={styles.tableWrapper}>
                      <table className={styles.adminTable}>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Message</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enquiries.slice(0, 10).map((e) => (
                            <tr key={e._id}>
                              <td style={{ color: "#64748b", fontWeight: 600 }}>
                                {new Date(e.createdAt).toLocaleString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td><strong>{e.name}</strong></td>
                              <td style={{ color: "#334155" }}>{e.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Products List (AEC Products Layout) */}
              {activeTab === "products" && (
                <div className={styles.tabContent}>
                  <div className={styles.productsCatalogHeader}>
                    <div className={styles.catalogInfo}>
                      <h2>Products</h2>
                      <span>{products.length} products in catalogue</span>
                    </div>
                    <div className={styles.catalogActions}>
                      <button onClick={initializeData} className={styles.syncBtn}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="23 4 23 10 17 10"></polyline>
                          <polyline points="1 20 1 14 7 14"></polyline>
                          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                        <span>Sync Catalogue</span>
                      </button>
                      <button onClick={openAddProductModal} className={styles.addProductBtn}>
                        + Add Product
                      </button>
                    </div>
                  </div>

                  {/* Filter panel bar */}
                  <div className={styles.filterBar}>
                    <div className={styles.searchBox}>
                      <label htmlFor="search-input" className="sr-only">Search products</label>
                      <input 
                        id="search-input"
                        type="text" 
                        placeholder="Search products by name or category..." 
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className={styles.searchInput}
                      />
                    </div>
                    
                    <div className={styles.filterDropdown}>
                      <label htmlFor="cat-filter" className="sr-only">Filter by category</label>
                      <select
                        id="cat-filter"
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className={styles.filterSelect}
                      >
                        <option value="all">All Categories</option>
                        {uniqueCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Products list table */}
                  <div className={styles.listCard} style={{ padding: 0 }}>
                    <div className={styles.tableWrapper}>
                      <table className={styles.adminTable}>
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Sub-Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((p) => (
                            <tr key={p.id}>
                              <td>
                                <div className={styles.tableThumbnail}>
                                  <Image src={p.imageUrl} alt={p.id} width={40} height={40} style={{ objectFit: "contain" }} />
                                </div>
                              </td>
                              <td className={styles.tableNameCell}><strong>{p.title}</strong></td>
                              <td>{p.category.replace(/-/g, " ").toUpperCase()}</td>
                              <td>{p.subCategory.toUpperCase()}</td>
                              <td>₹ {p.price.toLocaleString("en-IN")}</td>
                              <td>
                                {/* Premium stock switch toggle control */}
                                <div className={styles.switchWrapper}>
                                  <label className={styles.switch}>
                                    <input 
                                      type="checkbox" 
                                      checked={p.inStock} 
                                      onChange={() => handleStockToggle(p)}
                                    />
                                    <span className={styles.slider}></span>
                                  </label>
                                  <span className={`${styles.switchLabel} ${p.inStock ? styles.labelIn : styles.labelOut}`}>
                                    {p.inStock ? "In Stock" : "Out of Stock"}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className={styles.rowActions}>
                                  {/* Edit pencil icon */}
                                  <button onClick={() => openEditProductModal(p)} className={styles.iconActionBtn} title="Edit Product">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
                                    </svg>
                                  </button>

                                  {/* View product in front-end icon */}
                                  <Link href={`/product/${p.id}`} className={styles.iconActionBtn} title="View Details">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                      <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                  </Link>

                                  {/* Delete trash icon */}
                                  <button onClick={() => handleDeleteProduct(p.id)} className={styles.iconActionBtn} style={{ color: "#ef4444" }} title="Delete Product">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
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
              )}

              {/* Tab 3: Banners */}
              {activeTab === "banners" && (
                <div className={styles.tabContent}>
                  <div className={styles.flexHeader}>
                    <h2>Homepage Hero Banners</h2>
                  </div>

                  <div className={styles.gridFormLayout}>
                    {/* Banner Form */}
                    <div className={styles.formCard}>
                      <h3>{editingBannerId ? "Edit Hero Banner" : "Add New Banner"}</h3>
                      <form onSubmit={handleBannerSubmit} className={styles.form}>
                        <div className={styles.inputField}>
                          <label htmlFor="form-banner-id">Banner ID</label>
                          <input
                            id="form-banner-id"
                            type="text"
                            placeholder="e.g. hero-6"
                            value={bannerForm.id}
                            onChange={(e) => setBannerForm({ ...bannerForm, id: e.target.value })}
                            required
                            disabled={!!editingBannerId}
                          />
                        </div>
                        <div className={styles.inputField}>
                          <label htmlFor="form-banner-image">Banner Image URL</label>
                          <input
                            id="form-banner-image"
                            type="text"
                            placeholder="e.g. /images/banners/Hbanner-6.png"
                            value={bannerForm.imageUrl}
                            onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                            required
                          />
                        </div>
                        <div className={styles.inputField}>
                          <label htmlFor="form-banner-link">Redirect Link</label>
                          <input
                            id="form-banner-link"
                            type="text"
                            placeholder="e.g. /shop/tuqo"
                            value={bannerForm.link}
                            onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                          />
                        </div>
                        <button type="submit" className={styles.submitBtn}>
                          {editingBannerId ? "UPDATE BANNER" : "CREATE BANNER"}
                        </button>
                        {editingBannerId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBannerId(null);
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
                      <h3>Active Banner Slides ({banners.length})</h3>
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
                                  setEditingBannerId(b.id);
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
            </>
          )}
        </main>
      </div>

      {/* Popup Modal Form for Add/Edit Product */}
      {isProductModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3>{editingProduct ? "Edit Product Details" : "Add New Catalogue Product"}</h3>
              <button onClick={() => setIsProductModalOpen(false)} className={styles.closeModalBtn}>
                &times;
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className={styles.form}>
              <div className={styles.inputField}>
                <label htmlFor="form-prod-id">Product SKU ID</label>
                <input
                  id="form-prod-id"
                  type="text"
                  placeholder="e.g. prod-6"
                  value={productForm.id}
                  onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                  required
                  disabled={!!editingProduct}
                />
              </div>

              <div className={styles.inputField}>
                <label htmlFor="form-prod-title">Product Title</label>
                <input
                  id="form-prod-title"
                  type="text"
                  placeholder="e.g. High Pressure Washer CDW400"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  required
                />
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputField}>
                  <label htmlFor="form-prod-price">Selling Price (Rs.)</label>
                  <input
                    id="form-prod-price"
                    type="number"
                    placeholder="4999"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.inputField}>
                  <label htmlFor="form-prod-orig-price">Original Price</label>
                  <input
                    id="form-prod-orig-price"
                    type="number"
                    placeholder="6999"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputField}>
                  <label htmlFor="form-prod-brand">Brand</label>
                  <select
                    id="form-prod-brand"
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
                  <label htmlFor="form-prod-category">Category</label>
                  <select
                    id="form-prod-category"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    {uniqueCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputField}>
                  <label htmlFor="form-prod-subcat">Sub Category</label>
                  <select
                    id="form-prod-subcat"
                    value={productForm.subCategory}
                    onChange={(e) => setProductForm({ ...productForm, subCategory: e.target.value })}
                  >
                    <option value="domestic">Domestic</option>
                    <option value="commercial">Commercial</option>
                    <option value="accessory">Accessory</option>
                  </select>
                </div>
                <div className={styles.inputField}>
                  <label htmlFor="form-prod-stock">Stock Availability</label>
                  <select
                    id="form-prod-stock"
                    value={productForm.inStock ? "true" : "false"}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.value === "true" })}
                  >
                    <option value="true">In Stock</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputField}>
                <label htmlFor="form-prod-image">Product Image URL</label>
                <input
                  id="form-prod-image"
                  type="text"
                  placeholder="e.g. /images/products/cdw400.jpg"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} className={styles.cancelBtn}>
                  Close
                </button>
                <button type="submit" className={styles.submitBtn} style={{ marginTop: 0 }}>
                  {editingProduct ? "SAVE CHANGES" : "ADD PRODUCT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
