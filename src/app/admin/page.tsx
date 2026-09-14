"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BRAND_CATEGORIES } from "@/data/home";
import { optimizeAdminPreview } from "@/lib/imageOptimization";
import styles from "./AdminPage.module.css";

// --- Interfaces ---
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
  videoUrl?: string;
  gallery: string[];
  brand: string;
  category: string;
  subCategory: string;
  inStock: boolean;
  rating?: number;
  ratingCount?: number;
  description?: string[];
  specifications?: string[];
  whatsInBox?: string[];
}

interface IEnquiry {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

interface IAdminOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  itemsCount: number;
  items: Array<{
    productId?: string;
    title: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  subtotal: number;
  gst: number;
  shipping?: number;
  grandTotal: number;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  receipt?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
    name?: string;
    country?: string;
  };
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  shiprocketAwbCode?: string;
  shiprocketCourierName?: string;
  shiprocketStatus?: string;
  shiprocketTrackingUrl?: string;
  shipmentError?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    breadth?: number;
    height?: number;
  };
}

// Fallback all system categories
const DEFAULT_SYSTEM_CATEGORIES: ICategory[] = Object.entries(BRAND_CATEGORIES).flatMap(([brandKey, brandObj]) =>
  brandObj.categories.map((cat) => ({
    id: cat.id,
    name: `${cat.name} (${brandObj.name})`,
    brand: brandKey,
    imageUrl: cat.imageUrl,
    link: cat.link,
  }))
);

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "orders" | "banners">("analytics");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data States
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [categories, setCategories] = useState<ICategory[]>(DEFAULT_SYSTEM_CATEGORIES);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [enquiries, setEnquiries] = useState<IEnquiry[]>([]);
  const [orders, setOrders] = useState<IAdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderActionLoading, setOrderActionLoading] = useState<string | null>(null);

  // Search & Filter States
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productBrandFilter, setProductBrandFilter] = useState("all");
  const [productStockFilter, setProductStockFilter] = useState("all");

  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState("all");

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [viewingProduct, setViewingProduct] = useState<IProduct | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<IAdminOrder | null>(null);

  // Upload States
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Product Form State
  const [productForm, setProductForm] = useState({
    id: "",
    title: "",
    price: "",
    originalPrice: "",
    imageUrl: "",
    videoUrl: "",
    gallery: [] as string[],
    brand: "tuqo",
    category: "high-pressure-washer",
    subCategory: "domestic",
    inStock: true,
    descriptionText: "",
    specificationsText: "",
    whatsInBoxText: "",
  });

  // Banner Form State
  const [bannerForm, setBannerForm] = useState({ id: "", imageUrl: "", link: "" });
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // --- Data Fetching Callbacks ---
  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/banners");
      const json = await res.json();
      if (json.success) setBanners(json.data);
    } catch (e) {
      console.error("Error fetching banners:", e);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setCategories(json.data);
      } else {
        setCategories(DEFAULT_SYSTEM_CATEGORIES);
      }
    } catch (e) {
      console.error("Error fetching categories:", e);
      setCategories(DEFAULT_SYSTEM_CATEGORIES);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (e) {
      console.error("Error fetching products:", e);
    }
  }, []);

  const fetchEnquiries = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/enquiries");
      const json = await res.json();
      if (json.success) setEnquiries(json.data);
    } catch (e) {
      console.error("Error fetching enquiries:", e);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const initializeData = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/seed");
      await Promise.all([
        fetchBanners(),
        fetchCategories(),
        fetchProducts(),
        fetchEnquiries(),
        fetchOrders(),
      ]);
    } catch (e) {
      console.error("Initialization failed", e);
    } finally {
      setLoading(false);
    }
  }, [fetchBanners, fetchCategories, fetchProducts, fetchEnquiries, fetchOrders]);

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

  // --- Upload Handlers ---
  const handleFileUpload = async (
    file: File,
    targetType: "main_image" | "video" | "gallery" | "banner"
  ) => {
    setUploadError(null);
    if (targetType === "main_image") setIsUploadingImage(true);
    if (targetType === "video") setIsUploadingVideo(true);
    if (targetType === "gallery") setIsUploadingGallery(true);
    if (targetType === "banner") setIsUploadingBanner(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", targetType === "banner" ? "skill-store/banners" : "skill-store/products");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "File upload failed");
      }

      if (targetType === "main_image") {
        setProductForm((prev) => ({ ...prev, imageUrl: data.url }));
      } else if (targetType === "video") {
        setProductForm((prev) => ({ ...prev, videoUrl: data.url }));
      } else if (targetType === "gallery") {
        setProductForm((prev) => ({
          ...prev,
          gallery: [...prev.gallery, data.url],
        }));
      } else if (targetType === "banner") {
        setBannerForm((prev) => ({ ...prev, imageUrl: data.url }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading file";
      setUploadError(msg);
      alert(`Upload error: ${msg}`);
    } finally {
      if (targetType === "main_image") setIsUploadingImage(false);
      if (targetType === "video") setIsUploadingVideo(false);
      if (targetType === "gallery") setIsUploadingGallery(false);
      if (targetType === "banner") setIsUploadingBanner(false);
    }
  };

  // --- Stock Toggle Handler ---
  const handleStockToggle = async (product: IProduct) => {
    const updatedStock = !product.inStock;
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
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, inStock: product.inStock } : p))
        );
        alert(`Error toggling stock: ${json.error}`);
      }
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: product.inStock } : p))
      );
      alert("Network error toggling stock");
    }
  };

  // --- Product CRUD Modals & Actions ---
  const openAddProductModal = () => {
    setEditingProduct(null);
    setUploadError(null);
    setProductForm({
      id: "",
      title: "",
      price: "",
      originalPrice: "",
      imageUrl: "",
      videoUrl: "",
      gallery: [],
      brand: "tuqo",
      category: "high-pressure-washer",
      subCategory: "domestic",
      inStock: true,
      descriptionText: "",
      specificationsText: "",
      whatsInBoxText: "",
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: IProduct) => {
    setEditingProduct(prod);
    setUploadError(null);
    setProductForm({
      id: prod.id,
      title: prod.title,
      price: prod.price ? prod.price.toString() : "",
      originalPrice: prod.originalPrice ? prod.originalPrice.toString() : "",
      imageUrl: prod.imageUrl || "",
      videoUrl: prod.videoUrl || "",
      gallery: Array.isArray(prod.gallery) ? prod.gallery : [],
      brand: prod.brand || "tuqo",
      category: prod.category || "high-pressure-washer",
      subCategory: prod.subCategory || "domestic",
      inStock: prod.inStock !== false,
      descriptionText: Array.isArray(prod.description) ? prod.description.join("\n") : "",
      specificationsText: Array.isArray(prod.specifications) ? prod.specifications.join("\n") : "",
      whatsInBoxText: Array.isArray(prod.whatsInBox) ? prod.whatsInBox.join("\n") : "",
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct ? "PUT" : "POST";

    const payload = {
      id: productForm.id.trim(),
      title: productForm.title.trim(),
      price: Number(productForm.price),
      originalPrice: Number(productForm.originalPrice || productForm.price),
      imageUrl: productForm.imageUrl.trim(),
      videoUrl: productForm.videoUrl.trim(),
      gallery: productForm.gallery,
      brand: productForm.brand.toLowerCase(),
      category: productForm.category.toLowerCase(),
      subCategory: productForm.subCategory.toLowerCase(),
      inStock: productForm.inStock,
      description: productForm.descriptionText.split("\n").filter((l) => l.trim().length > 0),
      specifications: productForm.specificationsText.split("\n").filter((l) => l.trim().length > 0),
      whatsInBox: productForm.whatsInBoxText.split("\n").filter((l) => l.trim().length > 0),
    };

    try {
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setIsProductModalOpen(false);
        fetchProducts();
      } else {
        alert(`Error saving product: ${json.error}`);
      }
    } catch {
      alert("Network error saving product.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setDeletingProductId(null);
        fetchProducts();
      } else {
        alert(`Error deleting product: ${json.error}`);
      }
    } catch {
      alert("Network error deleting product");
    }
  };

  // --- Banner Actions ---
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingBannerId ? "PUT" : "POST";
    try {
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
    } catch {
      alert("Network error saving banner");
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchBanners();
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch {
      alert("Network error deleting banner");
    }
  };

  // --- Shiprocket & Order Actions ---
  const handleRetryShiprocket = async (orderNumber: string) => {
    setOrderActionLoading(orderNumber);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderNumber, action: "retry_shiprocket" }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Shiprocket shipment generated successfully!");
        fetchOrders();
        if (selectedOrder?.orderNumber === orderNumber) {
          setSelectedOrder((prev) => (prev ? { ...prev, ...json.data } : null));
        }
      } else {
        alert(`Shiprocket Error: ${json.error}`);
      }
    } catch {
      alert("Network error retrying Shiprocket dispatch");
    } finally {
      setOrderActionLoading(null);
    }
  };

  const handleSyncTracking = async (orderNumber: string) => {
    setOrderActionLoading(orderNumber);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderNumber, action: "sync_tracking" }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Tracking updated: ${json.trackResult?.currentStatus || "Success"}`);
        fetchOrders();
        if (selectedOrder?.orderNumber === orderNumber) {
          setSelectedOrder((prev) => (prev ? { ...prev, ...json.data } : null));
        }
      } else {
        alert(`Sync Error: ${json.error}`);
      }
    } catch {
      alert("Network error syncing tracking status");
    } finally {
      setOrderActionLoading(null);
    }
  };

  const handleOrderStatusChange = async (orderNumber: string, newStatus: string) => {
    setOrderActionLoading(orderNumber);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderNumber, action: "update_status", newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        fetchOrders();
        if (selectedOrder?.orderNumber === orderNumber) {
          setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
        }
      } else {
        alert(`Error updating order status: ${json.error}`);
      }
    } catch {
      alert("Network error updating status");
    } finally {
      setOrderActionLoading(null);
    }
  };

  // --- Filtered Product & Order Datasets ---
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        (p.title || "").toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.id || "").toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(productSearch.toLowerCase());

      const matchesCat =
        productCategoryFilter === "all" || p.category === productCategoryFilter;

      const matchesBrand =
        productBrandFilter === "all" || p.brand?.toLowerCase() === productBrandFilter.toLowerCase();

      const matchesStock =
        productStockFilter === "all" ||
        (productStockFilter === "in" && p.inStock) ||
        (productStockFilter === "out" && !p.inStock);

      return matchesSearch && matchesCat && matchesBrand && matchesStock;
    });
  }, [products, productSearch, productCategoryFilter, productBrandFilter, productStockFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        (o.orderNumber || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.userName || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.userEmail || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.shiprocketAwbCode || "").toLowerCase().includes(orderSearch.toLowerCase());

      const matchesStatus =
        orderStatusFilter === "all" || o.orderStatus === orderStatusFilter;

      const matchesPayment =
        orderPaymentFilter === "all" || o.paymentStatus === orderPaymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, orderSearch, orderStatusFilter, orderPaymentFilter]);

  // --- Analytics Calculations ---
  const analyticsData = useMemo(() => {
    const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;
    const inStock = products.filter((p) => p.inStock).length;
    const outOfStock = products.length - inStock;
    const dispatched = orders.filter((o) => !!o.shiprocketAwbCode || !!o.shiprocketOrderId).length;

    return {
      totalRevenue,
      paidOrdersCount: paidOrders.length,
      totalOrdersCount: orders.length,
      avgOrderValue,
      inStock,
      outOfStock,
      dispatched,
      totalProducts: products.length,
    };
  }, [orders, products]);

  if (!authorized) return null;

  return (
    <div className={styles.adminWrapper}>
      {/* Top Header Bar */}
      <header className={styles.adminHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className={styles.mobileMenuToggle}
            aria-label="Toggle Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {isMobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div className={styles.brandGroup}>
            <span className={styles.headerTitle}>Skill Store Central Control</span>
            <span className={styles.headerSubtitle}>Official E-Commerce Backend</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.adminMeta}>
            <strong>Super Admin</strong>
            <span>Verified Session</span>
          </div>

          <button onClick={handleSignOut} className={styles.signOutBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div className={styles.sidebarBackdrop} onClick={() => setIsMobileMenuOpen(false)} />
        )}

        <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarBrand}>
            <strong>SKILL STORE</strong>
            <span>Management Portal</span>
          </div>

          <nav className={styles.sidebarNav}>
            <button
              onClick={() => {
                setActiveTab("analytics");
                setIsMobileMenuOpen(false);
              }}
              className={`${styles.sidebarTab} ${activeTab === "analytics" ? styles.activeTab : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.tabIcon}>
                <rect x="3" y="3" width="7" height="9"></rect>
                <rect x="14" y="3" width="7" height="5"></rect>
                <rect x="14" y="12" width="7" height="9"></rect>
                <rect x="3" y="16" width="7" height="5"></rect>
              </svg>
              <span>Analytics &amp; KPI</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("orders");
                setIsMobileMenuOpen(false);
              }}
              className={`${styles.sidebarTab} ${activeTab === "orders" ? styles.activeTab : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.tabIcon}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Orders &amp; Logistics</span>
              {orders.length > 0 && <span className={styles.tabBadge}>{orders.length}</span>}
            </button>

            <button
              onClick={() => {
                setActiveTab("products");
                setIsMobileMenuOpen(false);
              }}
              className={`${styles.sidebarTab} ${activeTab === "products" ? styles.activeTab : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.tabIcon}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>Products Catalogue</span>
              {products.length > 0 && <span className={styles.tabBadge}>{products.length}</span>}
            </button>

            <button
              onClick={() => {
                setActiveTab("banners");
                setIsMobileMenuOpen(false);
              }}
              className={`${styles.sidebarTab} ${activeTab === "banners" ? styles.activeTab : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.tabIcon}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>Hero Banners</span>
            </button>
          </nav>

          <Link href="/" className={styles.viewWebsiteLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>Live Store Preview</span>
          </Link>
        </aside>

        {/* Dashboard Main Content Area */}
        <main className={styles.dashboardContent}>
          {loading ? (
            <div className={styles.loadingSpinner}>
              <span>SYNCING E-COMMERCE DATA...</span>
            </div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* TAB 1: ANALYTICS & DASHBOARD METRICS                    */}
              {/* ======================================================== */}
              {activeTab === "analytics" && (
                <div className={styles.tabContent}>
                  <div className={styles.analyticsIntro}>
                    <span>Executive Summary</span>
                    <h2>Store Performance &amp; Analytics</h2>
                    <p>Real-time revenue, orders pipeline, inventory metrics, and customer enquiries.</p>
                  </div>

                  {/* Top Stats Grid */}
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard} style={{ borderLeft: "4px solid #10b981" }}>
                      <div className={styles.statInfo}>
                        <span>Total Revenue (Paid)</span>
                        <strong style={{ color: "#10b981" }}>₹{analyticsData.totalRevenue.toLocaleString("en-IN")}</strong>
                      </div>
                      <div className={styles.statIconBox} style={{ background: "#d1fae5" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                      </div>
                    </div>

                    <div className={styles.statCard} style={{ borderLeft: "4px solid #38b6ff" }}>
                      <div className={styles.statInfo}>
                        <span>Total Orders</span>
                        <strong style={{ color: "#0284c7" }}>{analyticsData.totalOrdersCount}</strong>
                      </div>
                      <div className={styles.statIconBox} style={{ background: "#e0f2fe" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                        </svg>
                      </div>
                    </div>

                    <div className={styles.statCard} style={{ borderLeft: "4px solid #ffd300" }}>
                      <div className={styles.statInfo}>
                        <span>Average Order Value</span>
                        <strong style={{ color: "#b45309" }}>₹{analyticsData.avgOrderValue.toLocaleString("en-IN")}</strong>
                      </div>
                      <div className={styles.statIconBox} style={{ background: "#fef3c7" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.5">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                          <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                      </div>
                    </div>

                    <div className={styles.statCard} style={{ borderLeft: "4px solid #8b5cf6" }}>
                      <div className={styles.statInfo}>
                        <span>Shiprocket Dispatches</span>
                        <strong style={{ color: "#7c3aed" }}>{analyticsData.dispatched}</strong>
                      </div>
                      <div className={styles.statIconBox} style={{ background: "#ede9fe" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5">
                          <rect x="1" y="3" width="15" height="13"></rect>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                          <circle cx="5.5" cy="18.5" r="2.5"></circle>
                          <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Stock & Orders Dual Panel */}
                  <div className={styles.dualPanelGrid}>
                    {/* Left: Inventory Breakdown */}
                    <div className={styles.panelCard}>
                      <h3>Inventory Health</h3>
                      <div className={styles.inventoryBreakdown}>
                        <div className={styles.invRow}>
                          <span className={styles.invDot} style={{ background: "#10b981" }}></span>
                          <span>In Stock Ready to Ship</span>
                          <strong>{analyticsData.inStock} items</strong>
                        </div>
                        <div className={styles.invRow}>
                          <span className={styles.invDot} style={{ background: "#ef4444" }}></span>
                          <span>Out of Stock</span>
                          <strong style={{ color: "#ef4444" }}>{analyticsData.outOfStock} items</strong>
                        </div>
                        <div className={styles.invRow}>
                          <span className={styles.invDot} style={{ background: "#64748b" }}></span>
                          <span>Total Catalogued SKUs</span>
                          <strong>{analyticsData.totalProducts} items</strong>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab("products")} className={styles.panelActionBtn}>
                        Manage Products Catalogue →
                      </button>
                    </div>

                    {/* Right: Recent Customer Enquiries */}
                    <div className={styles.panelCard}>
                      <h3>Recent Customer Inquiries ({enquiries.length})</h3>
                      {enquiries.length === 0 ? (
                        <p style={{ color: "#64748b", fontSize: "13.5px" }}>No customer messages received yet.</p>
                      ) : (
                        <div className={styles.enquiriesList}>
                          {enquiries.slice(0, 4).map((enq) => (
                            <div key={enq._id} className={styles.enquiryItem}>
                              <div className={styles.enquiryTop}>
                                <strong>{enq.name}</strong>
                                <span>{enq.email}</span>
                              </div>
                              <p>{enq.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: ORDERS & SHIPROCKET LOGISTICS                    */}
              {/* ======================================================== */}
              {activeTab === "orders" && (
                <div className={styles.tabContent}>
                  <div className={styles.flexHeader}>
                    <div>
                      <h2>Orders &amp; Shiprocket Dispatch</h2>
                      <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "13.5px" }}>
                        Manage customer purchases, Razorpay payment verification, and Shiprocket live tracking.
                      </p>
                    </div>
                    <button
                      onClick={fetchOrders}
                      className={styles.primaryBtn}
                      style={{ height: "40px", padding: "0 18px", fontSize: "13px" }}
                      disabled={ordersLoading}
                    >
                      {ordersLoading ? "Refreshing..." : "↻ Refresh Orders"}
                    </button>
                  </div>

                  {/* Filters Bar */}
                  <div className={styles.searchFilterGrid}>
                    <input
                      type="text"
                      placeholder="Search order #, customer, email, AWB..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className={styles.searchInput}
                    />

                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="all">All Order Statuses</option>
                      <option value="processing">Processing</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                      value={orderPaymentFilter}
                      onChange={(e) => setOrderPaymentFilter(e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="all">All Payment Statuses</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  {/* Orders Table */}
                  <div className={styles.listCard} style={{ marginTop: "20px" }}>
                    <div className={styles.tableWrapper}>
                      <table className={styles.adminTable}>
                        <thead>
                          <tr>
                            <th>Order Ref &amp; Date</th>
                            <th>Customer Info</th>
                            <th>Items &amp; Value</th>
                            <th>Payment</th>
                            <th>Shiprocket Logistics</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                                {ordersLoading ? "Loading customer orders..." : "No orders found matching criteria."}
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map((o) => (
                              <tr key={o.id}>
                                <td>
                                  <strong style={{ color: "#0f172a", fontSize: "14px" }}>{o.orderNumber}</strong>
                                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: "750", color: "#1e293b" }}>{o.userName}</div>
                                  <div style={{ fontSize: "12px", color: "#64748b" }}>{o.userEmail}</div>
                                  {o.userPhone && <div style={{ fontSize: "12px", color: "#64748b" }}>📞 {o.userPhone}</div>}
                                </td>
                                <td>
                                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#132c66" }}>
                                    ₹{o.grandTotal.toLocaleString("en-IN")}
                                  </div>
                                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                                    {o.items?.map((it, idx) => (
                                      <div key={idx}>
                                        {it.title} <strong>x{it.quantity}</strong>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      fontSize: "11px",
                                      fontWeight: "800",
                                      textTransform: "uppercase",
                                      padding: "3px 8px",
                                      borderRadius: "4px",
                                      background: o.paymentStatus === "paid" ? "#dcfce7" : "#fef9c3",
                                      color: o.paymentStatus === "paid" ? "#15803d" : "#854d0e",
                                    }}
                                  >
                                    {o.paymentStatus}
                                  </span>
                                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                                    {o.paymentMethod || "Razorpay"}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                                    <span
                                      style={{
                                        display: "inline-block",
                                        width: "fit-content",
                                        fontSize: "11px",
                                        fontWeight: "800",
                                        textTransform: "uppercase",
                                        padding: "2px 7px",
                                        borderRadius: "4px",
                                        background: o.shiprocketAwbCode ? "#e0f2fe" : "#f1f5f9",
                                        color: o.shiprocketAwbCode ? "#0369a1" : "#475569",
                                      }}
                                    >
                                      {o.shiprocketStatus || "pending_shipment"}
                                    </span>
                                    {o.shiprocketAwbCode && (
                                      <span style={{ fontSize: "11.5px", color: "#1e293b", fontWeight: "600" }}>
                                        AWB: {o.shiprocketAwbCode} ({o.shiprocketCourierName || "Shiprocket"})
                                      </span>
                                    )}
                                    {o.shiprocketTrackingUrl && (
                                      <a
                                        href={o.shiprocketTrackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: "11.5px", color: "#0284c7", fontWeight: "700" }}
                                      >
                                        Live Track ↗
                                      </a>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <button
                                      onClick={() => setSelectedOrder(o)}
                                      className={styles.primaryBtn}
                                      style={{ padding: "6px 12px", fontSize: "12px" }}
                                      title="View Order Details"
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: PRODUCTS CATALOGUE MANAGEMENT                    */}
              {/* ======================================================== */}
              {activeTab === "products" && (
                <div className={styles.tabContent}>
                  <div className={styles.flexHeader}>
                    <div>
                      <h2>Products Catalogue Management</h2>
                      <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "13.5px" }}>
                        Add, view, edit, delete, upload media, and toggle stock availability.
                      </p>
                    </div>

                    <button onClick={openAddProductModal} className={styles.primaryBtn}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span>+ ADD NEW PRODUCT</span>
                    </button>
                  </div>

                  {/* Product Search & Filter Strip */}
                  <div className={styles.searchFilterGrid}>
                    <input
                      type="text"
                      placeholder="Search title, SKU, or brand..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className={styles.searchInput}
                    />

                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={productBrandFilter}
                      onChange={(e) => setProductBrandFilter(e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="all">All Brands</option>
                      <option value="tuqo">TUQO</option>
                      <option value="pumpkin">PUMPKIN</option>
                      <option value="mitsuki">MITSUKI</option>
                      <option value="metso">METSO</option>
                      <option value="costec">COSTEC</option>
                    </select>

                    <select
                      value={productStockFilter}
                      onChange={(e) => setProductStockFilter(e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="all">All Stock Statuses</option>
                      <option value="in">In Stock Only</option>
                      <option value="out">Out of Stock Only</option>
                    </select>
                  </div>

                  {/* Products Data Table */}
                  <div className={styles.listCard} style={{ marginTop: "20px" }}>
                    <div className={styles.tableWrapper}>
                      <table className={styles.adminTable}>
                        <thead>
                          <tr>
                            <th>Product Details</th>
                            <th>SKU ID</th>
                            <th>Brand &amp; Category</th>
                            <th>Selling Price</th>
                            <th>Stock Toggle</th>
                            <th>Media</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                                No products found matching criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((p) => (
                              <tr key={p.id}>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div className={styles.tableThumbnail}>
                                      <Image
                                        src={optimizeAdminPreview(p.imageUrl || "/images/products/hw2000.jpg")}
                                        alt={p.title}
                                        width={44}
                                        height={44}
                                        loading="lazy"
                                        style={{ objectFit: "contain" }}
                                      />
                                    </div>
                                    <div>
                                      <strong className={styles.tableNameCell}>{p.title}</strong>
                                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                                        {p.subCategory ? `Sub: ${p.subCategory}` : ""}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                                    {p.id}
                                  </code>
                                </td>
                                <td>
                                  <div style={{ fontWeight: "750", textTransform: "uppercase" }}>{p.brand}</div>
                                  <div style={{ fontSize: "11.5px", color: "#64748b" }}>{p.category}</div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: "800", color: "#132c66" }}>
                                    ₹{p.price.toLocaleString("en-IN")}
                                  </div>
                                  {p.originalPrice > p.price && (
                                    <del style={{ fontSize: "11px", color: "#94a3b8" }}>
                                      ₹{p.originalPrice.toLocaleString("en-IN")}
                                    </del>
                                  )}
                                </td>
                                <td>
                                  <div className={styles.switchWrapper}>
                                    <label className={styles.switch}>
                                      <input
                                        type="checkbox"
                                        checked={p.inStock}
                                        onChange={() => handleStockToggle(p)}
                                      />
                                      <span className={styles.slider}></span>
                                    </label>
                                    <span style={{ fontSize: "12px", color: p.inStock ? "#10b981" : "#ef4444", fontWeight: "700" }}>
                                      {p.inStock ? "In Stock" : "Out of Stock"}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                    {p.videoUrl ? (
                                      <span className={styles.mediaBadge} style={{ background: "#ede9fe", color: "#7c3aed" }} title="Has Video">
                                        🎬 Video
                                      </span>
                                    ) : null}
                                    {p.gallery && p.gallery.length > 0 ? (
                                      <span className={styles.mediaBadge} style={{ background: "#e0f2fe", color: "#0369a1" }} title={`${p.gallery.length} Gallery Photos`}>
                                        🖼️ {p.gallery.length}
                                      </span>
                                    ) : null}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    {/* View Quick Preview */}
                                    <button
                                      onClick={() => setViewingProduct(p)}
                                      className={styles.iconActionBtn}
                                      title="Quick View Product"
                                    >
                                      👁️
                                    </button>

                                    {/* Edit Product */}
                                    <button
                                      onClick={() => openEditProductModal(p)}
                                      className={styles.iconActionBtn}
                                      title="Edit Product"
                                    >
                                      ✏️
                                    </button>

                                    {/* Delete Product */}
                                    <button
                                      onClick={() => setDeletingProductId(p.id)}
                                      className={styles.iconActionBtn}
                                      style={{ color: "#ef4444" }}
                                      title="Delete Product"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: HERO BANNERS MANAGEMENT                          */}
              {/* ======================================================== */}
              {activeTab === "banners" && (
                <div className={styles.tabContent}>
                  <div className={styles.flexHeader}>
                    <h2>Homepage Hero Banners</h2>
                  </div>

                  <div className={styles.gridFormLayout}>
                    <div className={styles.formCard}>
                      <h3>{editingBannerId ? "Edit Hero Banner" : "Add New Banner"}</h3>
                      <form onSubmit={handleBannerSubmit} className={styles.form}>
                        <div className={styles.inputField}>
                          <label htmlFor="form-banner-id">Banner ID *</label>
                          <input
                            id="form-banner-id"
                            type="text"
                            placeholder="e.g. hero-1"
                            value={bannerForm.id}
                            onChange={(e) => setBannerForm({ ...bannerForm, id: e.target.value })}
                            required
                            disabled={!!editingBannerId}
                          />
                        </div>

                        {/* Banner Image Upload & URL input */}
                        <div className={styles.mediaUploadBox}>
                          <label><strong>Banner Image * (Upload from device or paste URL)</strong></label>
                          <div className={styles.uploadRow}>
                            <input
                              id="form-banner-image"
                              type="text"
                              placeholder="e.g. /images/banners/banner1.jpg or upload below"
                              value={bannerForm.imageUrl}
                              onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                              required
                              style={{ flex: 1 }}
                            />
                            <label className={styles.uploadBtn}>
                              {isUploadingBanner ? "Uploading..." : "📁 Upload Banner"}
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file, "banner");
                                }}
                              />
                            </label>
                          </div>
                          {bannerForm.imageUrl && (
                            <div className={styles.mediaPreview} style={{ width: "100%", height: "90px", marginTop: "4px" }}>
                              <Image
                                src={optimizeAdminPreview(bannerForm.imageUrl)}
                                alt="Banner Preview"
                                width={240}
                                height={80}
                                loading="lazy"
                                style={{ objectFit: "contain", maxHeight: "80px" }}
                              />
                            </div>
                          )}
                        </div>

                        <div className={styles.inputField}>
                          <label htmlFor="form-banner-link">Target Link</label>
                          <input
                            id="form-banner-link"
                            type="text"
                            placeholder="e.g. /category/high-pressure-washer"
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

                    <div className={styles.listCard}>
                      <h3>Active Banner Slides ({banners.length})</h3>
                      <div className={styles.bannersList}>
                        {banners.map((b) => (
                          <div key={b.id} className={styles.bannerRow}>
                            <div className={styles.bannerPreview}>
                              <Image
                                src={optimizeAdminPreview(b.imageUrl)}
                                alt={b.id}
                                width={120}
                                height={50}
                                loading="lazy"
                                style={{ objectFit: "cover" }}
                              />
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

      {/* ============================================================ */}
      {/* MODAL 1: ADD / EDIT PRODUCT WITH UPLOADS & GALLERY           */}
      {/* ============================================================ */}
      {isProductModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: "780px" }}>
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#132c66" }}>
                  {editingProduct ? `Edit Product: ${editingProduct.title}` : "Add New Product to Catalogue"}
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {editingProduct ? `SKU: ${editingProduct.id}` : "Fill in details, pricing, media and specifications"}
                </span>
              </div>
              <button onClick={() => setIsProductModalOpen(false)} className={styles.closeModalBtn}>
                &times;
              </button>
            </div>

            {uploadError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "8px 12px", borderRadius: "8px", fontSize: "12.5px", margin: "4px 0" }}>
                ⚠️ {uploadError}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className={styles.form} style={{ gap: "14px" }}>
              {/* 1. Essential Product Info */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>1. Basic Details &amp; Categorization</div>
                <div className={styles.inputGrid3}>
                  <div className={styles.inputField}>
                    <label htmlFor="form-prod-id">Product SKU *</label>
                    <input
                      id="form-prod-id"
                      type="text"
                      placeholder="e.g. hpw-1 or prod-10"
                      value={productForm.id}
                      onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                      required
                      disabled={!!editingProduct}
                    />
                  </div>

                  <div className={styles.inputField} style={{ gridColumn: "span 2" }}>
                    <label htmlFor="form-prod-title">Product Title *</label>
                    <input
                      id="form-prod-title"
                      type="text"
                      placeholder="e.g. TUQO High Pressure Washer HW2000"
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGrid3}>
                  <div className={styles.inputField}>
                    <label htmlFor="form-prod-brand">Brand *</label>
                    <select
                      id="form-prod-brand"
                      value={productForm.brand}
                      onChange={(e) => {
                        const newBrand = e.target.value;
                        setProductForm((prev) => {
                          const brandCats = BRAND_CATEGORIES[newBrand]?.categories || [];
                          const nextCat = brandCats.length > 0 ? brandCats[0].id : prev.category;
                          return { ...prev, brand: newBrand, category: nextCat };
                        });
                      }}
                    >
                      <option value="tuqo">TUQO</option>
                      <option value="pumpkin">PUMPKIN</option>
                      <option value="mitsuki">MITSUKI</option>
                      <option value="metso">METSO</option>
                      <option value="costec">COSTEC</option>
                      <option value="ultratouch">Ultra TOUCH</option>
                    </select>
                  </div>

                  <div className={styles.inputField}>
                    <label htmlFor="form-prod-category">Category *</label>
                    <select
                      id="form-prod-category"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.inputField}>
                    <label htmlFor="form-prod-subcat">Sub-Category</label>
                    <input
                      id="form-prod-subcat"
                      type="text"
                      placeholder="e.g. domestic, commercial, accessory"
                      value={productForm.subCategory}
                      onChange={(e) => setProductForm({ ...productForm, subCategory: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Pricing & Stock */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>2. Pricing &amp; Stock Availability</div>
                <div className={styles.inputGrid3}>
                  <div className={styles.inputField}>
                    <label htmlFor="form-prod-price">Selling Price (₹) *</label>
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
                    <label htmlFor="form-prod-orig-price">MRP Price (₹)</label>
                    <input
                      id="form-prod-orig-price"
                      type="number"
                      placeholder="6999"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    />
                  </div>

                  <div className={styles.inputField} style={{ justifyContent: "center" }}>
                    <label>Stock Status</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={productForm.inStock}
                          onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                        />
                        <span className={styles.slider}></span>
                      </label>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: productForm.inStock ? "#10b981" : "#ef4444" }}>
                        {productForm.inStock ? "IN STOCK" : "OUT OF STOCK"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Media Assets */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>3. Media Assets (Image, Video &amp; Gallery)</div>
                <div className={styles.inputRow}>
                  {/* Main Product Image */}
                  <div className={styles.mediaUploadBox} style={{ flex: 1 }}>
                    <label><strong>Main Image *</strong></label>
                    <div className={styles.uploadRow}>
                      <input
                        type="text"
                        placeholder="Image URL or upload"
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                        required
                        style={{ flex: 1, minWidth: "140px" }}
                      />
                      <label className={styles.uploadBtn}>
                        {isUploadingImage ? "..." : "📁 Upload"}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "main_image");
                          }}
                        />
                      </label>
                    </div>
                    {productForm.imageUrl && (
                      <div className={styles.mediaPreview} style={{ marginTop: "6px" }}>
                        <Image
                          src={optimizeAdminPreview(productForm.imageUrl)}
                          alt="Preview"
                          width={70}
                          height={70}
                          loading="lazy"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Video */}
                  <div className={styles.mediaUploadBox} style={{ flex: 1 }}>
                    <label><strong>Product Video</strong></label>
                    <div className={styles.uploadRow}>
                      <input
                        type="text"
                        placeholder="Video URL or upload MP4"
                        value={productForm.videoUrl}
                        onChange={(e) => setProductForm({ ...productForm, videoUrl: e.target.value })}
                        style={{ flex: 1, minWidth: "140px" }}
                      />
                      <label className={styles.uploadBtn}>
                        {isUploadingVideo ? "..." : "🎬 Upload"}
                        <input
                          type="file"
                          accept="video/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "video");
                          }}
                        />
                      </label>
                    </div>
                    {productForm.videoUrl && (
                      <div style={{ fontSize: "11px", color: "#166534", marginTop: "4px" }}>
                        ✓ Video attached
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery Images */}
                <div className={styles.mediaUploadBox} style={{ marginTop: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label><strong>Additional Gallery Images ({productForm.gallery.length})</strong></label>
                    <label className={styles.uploadBtn} style={{ fontSize: "11px", padding: "4px 10px" }}>
                      {isUploadingGallery ? "Uploading..." : "+ Add Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "gallery");
                        }}
                      />
                    </label>
                  </div>
                  {productForm.gallery.length > 0 && (
                    <div className={styles.galleryThumbGrid} style={{ marginTop: "8px" }}>
                      {productForm.gallery.map((imgUrl, idx) => (
                        <div key={idx} className={styles.galleryThumbCard}>
                          <Image
                            src={optimizeAdminPreview(imgUrl)}
                            alt={`Gallery ${idx}`}
                            width={55}
                            height={55}
                            loading="lazy"
                            style={{ objectFit: "contain" }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setProductForm((prev) => ({
                                ...prev,
                                gallery: prev.gallery.filter((_, i) => i !== idx),
                              }));
                            }}
                            className={styles.removeGalleryBtn}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Specifications & Highlights */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>4. Descriptions &amp; Specs (One line per point)</div>
                <div className={styles.inputGrid3}>
                  <div className={styles.inputField}>
                    <label>Features &amp; Highlights</label>
                    <textarea
                      rows={2}
                      placeholder="Induction Motor 140 Bar&#10;Self-priming function&#10;Auto-stop system"
                      value={productForm.descriptionText}
                      onChange={(e) => setProductForm({ ...productForm, descriptionText: e.target.value })}
                    />
                  </div>

                  <div className={styles.inputField}>
                    <label>Technical Specifications</label>
                    <textarea
                      rows={2}
                      placeholder="Power: 2000W&#10;Pressure: 140 Bar&#10;Flow: 420 L/hr"
                      value={productForm.specificationsText}
                      onChange={(e) => setProductForm({ ...productForm, specificationsText: e.target.value })}
                    />
                  </div>

                  <div className={styles.inputField}>
                    <label>What&apos;s in the Box</label>
                    <textarea
                      rows={2}
                      placeholder="1x Washer Machine&#10;1x Trigger Gun&#10;1x Hose Pipe"
                      value={productForm.whatsInBoxText}
                      onChange={(e) => setProductForm({ ...productForm, whatsInBoxText: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} style={{ marginTop: 0 }}>
                  {editingProduct ? "SAVE PRODUCT CHANGES" : "CREATE PRODUCT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: PRODUCT QUICK VIEW PREVIEW MODAL                    */}
      {/* ============================================================ */}
      {viewingProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: "650px" }}>
            <div className={styles.modalHeader}>
              <h3>Product Preview: {viewingProduct.title}</h3>
              <button onClick={() => setViewingProduct(null)} className={styles.closeModalBtn}>
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <div className={styles.tableThumbnail} style={{ width: "120px", height: "120px" }}>
                  <Image
                    src={optimizeAdminPreview(viewingProduct.imageUrl || "/images/products/hw2000.jpg")}
                    alt={viewingProduct.title}
                    width={110}
                    height={110}
                    loading="lazy"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#132c66" }}>{viewingProduct.title}</h4>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>SKU ID: <strong>{viewingProduct.id}</strong></div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>Brand: <strong>{viewingProduct.brand.toUpperCase()}</strong> | Category: <strong>{viewingProduct.category}</strong></div>
                  <div style={{ fontSize: "18px", fontWeight: "900", color: "#132c66", marginTop: "8px" }}>
                    ₹{viewingProduct.price.toLocaleString("en-IN")}{" "}
                    {viewingProduct.originalPrice > viewingProduct.price && (
                      <del style={{ fontSize: "13px", color: "#94a3b8" }}>₹{viewingProduct.originalPrice.toLocaleString("en-IN")}</del>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Player */}
              {viewingProduct.videoUrl && (
                <div>
                  <strong>Product Demonstration Video:</strong>
                  <video src={viewingProduct.videoUrl} controls style={{ width: "100%", maxHeight: "220px", borderRadius: "8px", marginTop: "6px" }}>
                    Your browser does not support video.
                  </video>
                </div>
              )}

              {/* Gallery */}
              {viewingProduct.gallery && viewingProduct.gallery.length > 0 && (
                <div>
                  <strong>Gallery Photos ({viewingProduct.gallery.length}):</strong>
                  <div className={styles.galleryThumbGrid} style={{ marginTop: "6px" }}>
                    {viewingProduct.gallery.map((img, idx) => (
                      <div key={idx} className={styles.galleryThumbCard}>
                        <Image
                          src={optimizeAdminPreview(img)}
                          alt={`Gallery ${idx}`}
                          width={60}
                          height={60}
                          loading="lazy"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specs & Description */}
              {viewingProduct.description && viewingProduct.description.length > 0 && (
                <div>
                  <strong>Key Features:</strong>
                  <ul style={{ margin: "4px 0 0 18px", fontSize: "13px", color: "#475569" }}>
                    {viewingProduct.description.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.modalActions}>
                <button onClick={() => setViewingProduct(null)} className={styles.cancelBtn}>
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    const p = viewingProduct;
                    setViewingProduct(null);
                    openEditProductModal(p);
                  }}
                  className={styles.submitBtn}
                  style={{ marginTop: 0 }}
                >
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: DELETE PRODUCT CONFIRMATION MODAL                   */}
      {/* ============================================================ */}
      {deletingProductId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: "440px", textAlign: "center" }}>
            <h3 style={{ color: "#ef4444", margin: "0 0 10px 0" }}>Delete Product?</h3>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px 0" }}>
              Are you sure you want to delete product SKU <strong>{deletingProductId}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => setDeletingProductId(null)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={() => handleDeleteProduct(deletingProductId)} className={styles.deleteBtn} style={{ padding: "8px 20px" }}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: DETAILED ORDER & SHIPROCKET LOGISTICS MODAL         */}
      {/* ============================================================ */}
      {selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: "720px" }}>
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0 }}>Order Details: {selectedOrder.orderNumber}</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className={styles.closeModalBtn}>
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
              {/* Customer & Address Card */}
              <div className={styles.orderDetailSection}>
                <h4>Customer &amp; Shipping Address</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13.5px" }}>
                  <div>
                    <strong>Customer Name:</strong> {selectedOrder.userName}<br />
                    <strong>Email:</strong> {selectedOrder.userEmail}<br />
                    <strong>Phone:</strong> {selectedOrder.userPhone || "N/A"}
                  </div>
                  <div>
                    <strong>Street:</strong> {selectedOrder.shippingAddress?.street || "Not specified"}<br />
                    <strong>City:</strong> {selectedOrder.shippingAddress?.city || "N/A"}<br />
                    <strong>State &amp; PIN:</strong> {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className={styles.orderDetailSection}>
                <h4>Items in this Order ({selectedOrder.items?.length || 0})</h4>
                <div className={styles.tableWrapper}>
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((it, idx) => (
                        <tr key={idx}>
                          <td>{it.title}</td>
                          <td>{it.quantity}</td>
                          <td>₹{it.price.toLocaleString("en-IN")}</td>
                          <td><strong>₹{(it.price * it.quantity).toLocaleString("en-IN")}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ textAlign: "right", marginTop: "12px", fontSize: "15px", fontWeight: "800", color: "#132c66" }}>
                  Grand Total (incl. GST): ₹{selectedOrder.grandTotal.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Shiprocket Logistics Dispatch Section */}
              <div className={styles.orderDetailSection} style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, color: "#166534" }}>Shiprocket Logistics Status</h4>
                  <span
                    style={{
                      background: selectedOrder.shiprocketAwbCode ? "#dcfce7" : "#fef9c3",
                      color: selectedOrder.shiprocketAwbCode ? "#15803d" : "#854d0e",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "800",
                    }}
                  >
                    {selectedOrder.shiprocketStatus || "pending_shipment"}
                  </span>
                </div>

                <div style={{ marginTop: "10px", fontSize: "13px", color: "#1e293b", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div>
                    <strong>Shiprocket Order ID:</strong> {selectedOrder.shiprocketOrderId || "Not dispatched yet"}<br />
                    <strong>Shipment ID:</strong> {selectedOrder.shiprocketShipmentId || "N/A"}<br />
                    <strong>Assigned Courier:</strong> {selectedOrder.shiprocketCourierName || "N/A"}
                  </div>
                  <div>
                    <strong>AWB Code:</strong> {selectedOrder.shiprocketAwbCode || "N/A"}<br />
                    {selectedOrder.shiprocketTrackingUrl && (
                      <a
                        href={selectedOrder.shiprocketTrackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#0284c7", fontWeight: "750", textDecoration: "underline" }}
                      >
                        Open Live Tracking ↗
                      </a>
                    )}
                  </div>
                </div>

                {selectedOrder.shipmentError && (
                  <div style={{ color: "#b91c1c", fontSize: "12px", marginTop: "8px", background: "#fef2f2", padding: "6px 10px", borderRadius: "6px" }}>
                    ⚠️ {selectedOrder.shipmentError}
                  </div>
                )}

                {/* Shiprocket Actions */}
                <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                  <button
                    onClick={() => handleRetryShiprocket(selectedOrder.orderNumber)}
                    disabled={orderActionLoading === selectedOrder.orderNumber}
                    className={styles.editBtn}
                    style={{ fontSize: "12.5px" }}
                  >
                    {orderActionLoading === selectedOrder.orderNumber ? "Processing..." : "🚀 Dispatch / Retry Shiprocket"}
                  </button>
                  {(selectedOrder.shiprocketAwbCode || selectedOrder.shiprocketShipmentId) && (
                    <button
                      onClick={() => handleSyncTracking(selectedOrder.orderNumber)}
                      disabled={orderActionLoading === selectedOrder.orderNumber}
                      className={styles.cancelBtn}
                      style={{ fontSize: "12.5px" }}
                    >
                      ↻ Sync Live Tracking
                    </button>
                  )}
                </div>
              </div>

              {/* Status Update Control */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "750" }}>Change Order Status:</label>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleOrderStatusChange(selectedOrder.orderNumber, e.target.value)}
                    className={styles.filterSelect}
                    style={{ width: "160px", height: "36px", fontSize: "12.5px" }}
                  >
                    <option value="processing">Processing</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <button onClick={() => setSelectedOrder(null)} className={styles.cancelBtn}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
