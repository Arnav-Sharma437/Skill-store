"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import { useApp } from "@/context/AppContext";
import { optimizeGalleryThumbnail } from "@/lib/imageOptimization";
import styles from "./AccountPage.module.css";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  orderNumber?: string;
  date: string;
  createdAt?: string;
  total: number;
  subtotal?: number;
  gst?: number;
  status: string;
  paymentStatus?: string;
  orderStatus?: string;
  paymentMethod?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    name?: string;
    phone?: string;
  };
  items: OrderItem[];
  razorpayPaymentId?: string;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  shiprocketAwbCode?: string;
  shiprocketCourierName?: string;
  shiprocketStatus?: string;
  shiprocketTrackingUrl?: string;
}

function AccountContent() {
  const { data: session, status } = useSession();
  const { wishlist, toggleWishlist } = useApp();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");

  // Auth Form State (Logged Out)
  const [authMode, setAuthMode] = useState<"phone" | "email">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Dashboard State (Logged In)
  const [activeTab, setActiveTab] = useState<"orders" | "overview" | "wishlist">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [syncPhone, setSyncPhone] = useState("");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOrders = async (phoneOverride?: string) => {
    setIsLoadingOrders(true);
    try {
      const query = phoneOverride ? `phone=${encodeURIComponent(phoneOverride)}&` : "";
      const res = await fetch(`/api/user/orders?${query}_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        if (phoneOverride) {
          setSyncMessage(
            data.orders.length > 0
              ? `✅ Found ${data.orders.length} order(s) for mobile ${phoneOverride}`
              : `No orders found for mobile number ${phoneOverride}`
          );
        }
      } else if (data.error) {
        if (phoneOverride) setSyncMessage(data.error);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchOrders();
    }
  }, [session]);

  const handlePhoneAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phoneInput.replace(/\D/g, "");
    if (!cleanDigits || cleanDigits.length < 10) {
      setAuthMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    setIsSubmittingAuth(true);
    setAuthMessage(null);
    try {
      const res = await signIn("phone-or-email", {
        identifier: cleanDigits.slice(-10),
        name: nameInput.trim() || "Customer",
        redirect: false,
      });
      if (res?.error) {
        setAuthMessage(`Login error: ${res.error}`);
      } else {
        window.location.reload();
      }
    } catch {
      setAuthMessage("Network error during mobile login. Please try again.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setAuthMessage("Please enter a valid email address.");
      return;
    }
    setIsSubmittingAuth(true);
    setAuthMessage(null);
    try {
      const res = await signIn("phone-or-email", {
        identifier: email,
        name: nameInput.trim() || "Customer",
        redirect: false,
      });
      if (res?.error) {
        setAuthMessage(`Login error: ${res.error}`);
      } else {
        window.location.reload();
      }
    } catch {
      setAuthMessage("Network error during email login. Please try again.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/account" });
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/account" });
  };

  const handleLinkPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = syncPhone.replace(/\D/g, "");
    if (!clean || clean.length < 10) {
      setSyncMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/user/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: clean }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(`✅ ${data.message || "Mobile number linked! Orders synchronized."}`);
        fetchOrders(clean);
      } else {
        setSyncMessage(`⚠️ ${data.error || "Failed to link mobile number"}`);
      }
    } catch {
      setSyncMessage("⚠️ Network error while syncing orders.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOrders = orders.filter((ord) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const orderNum = (ord.orderNumber || ord.id).toLowerCase();
    const itemMatch = ord.items.some((it) => it.name.toLowerCase().includes(term));
    const statusMatch = ord.status.toLowerCase().includes(term);
    return orderNum.includes(term) || itemMatch || statusMatch;
  });

  if (status === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your Skill Store account...</p>
      </div>
    );
  }

  return (
    <>
      {/* Banner Header */}
      <div className={styles.bannerHeader}>
        <div className="container">
          <h1 className={styles.bannerTitle}>Customer Dashboard</h1>
          <p className={styles.bannerSubtitle}>
            {session?.user
              ? `Hello ${session.user.name || "Customer"}, track your orders and logistics in real-time.`
              : "Sign in with Mobile, Email, or Google to manage your orders and shipments."}
          </p>
        </div>
      </div>

      <div className="container">
        {!session?.user ? (
          /* Logged Out View - Amazon / Flipkart Tier Login Gate */
          <div className={styles.loginGate}>
            <div className={styles.loginCard}>
              <div className={styles.logoRow}>
                <span className={styles.logoSkill}>SKILL</span>
                <span className={styles.logoStore}>STORE</span>
              </div>
              <h2>Sign in to your account</h2>
              <p>Track orders, manage addresses, and check live Shiprocket logistics.</p>

              {authError && (
                <div className={styles.authErrorBox}>
                  <strong>Authentication Notice:</strong> {authError}
                </div>
              )}

              {/* Login Mode Tabs */}
              <div className={styles.authTabs}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("phone");
                    setAuthMessage(null);
                  }}
                  className={`${styles.authTabBtn} ${authMode === "phone" ? styles.authTabBtnActive : ""}`}
                >
                  📱 Mobile Number
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("email");
                    setAuthMessage(null);
                  }}
                  className={`${styles.authTabBtn} ${authMode === "email" ? styles.authTabBtnActive : ""}`}
                >
                  ✉️ Email Address
                </button>
              </div>

              {/* Phone Login Form */}
              {authMode === "phone" && (
                <form onSubmit={handlePhoneAuthSubmit} className={styles.authForm}>
                  <div className={styles.inputGroup}>
                    <label>Enter 10-digit Mobile Number</label>
                    <div className={styles.inputWithPrefix}>
                      <span className={styles.phonePrefix}>+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Enter 10-digit mobile number"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className={styles.authInput}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Your Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className={styles.authInput}
                    />
                  </div>

                  <button type="submit" disabled={isSubmittingAuth} className={styles.submitBtn}>
                    {isSubmittingAuth ? "Signing In..." : "Continue with Mobile Number →"}
                  </button>
                </form>
              )}

              {/* Email Login Form */}
              {authMode === "email" && (
                <form onSubmit={handleEmailAuthSubmit} className={styles.authForm}>
                  <div className={styles.inputGroup}>
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className={styles.authInput}
                      required
                      autoFocus
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Your Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className={styles.authInput}
                    />
                  </div>

                  <button type="submit" disabled={isSubmittingAuth} className={styles.submitBtn}>
                    {isSubmittingAuth ? "Signing In..." : "Continue with Email →"}
                  </button>
                </form>
              )}

              {authMessage && (
                <div style={{ marginTop: "14px", padding: "10px", borderRadius: "8px", background: "#fef2f2", color: "#b91c1c", fontSize: "13px" }}>
                  {authMessage}
                </div>
              )}

              <div className={styles.dividerRow}>
                <span>or</span>
              </div>

              {/* Google 1-Click Sign-In */}
              <button onClick={handleGoogleLogin} className={styles.googleBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
                <Link href="/track-order" style={{ fontSize: "13px", color: "#0284c7", fontWeight: "750", textDecoration: "none" }}>
                  🔍 Track an order without logging in →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard View - Flipkart / Amazon Tier UI */
          <div className={styles.dashboardLayout}>
            {/* Left Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.profileHeader}>
                <Image
                  src={session.user.image || "https://api.dicebear.com/7.x/adventurer/svg?seed=" + encodeURIComponent(session.user.name || "Customer")}
                  alt={session.user.name || "User"}
                  width={64}
                  height={64}
                  className={styles.avatar}
                  unoptimized
                />
                <div className={styles.profileMeta}>
                  <h3>{session.user.name || "Skill Store Member"}</h3>
                  <p>{session.user.email?.includes("@customer.skillstore.in") ? `Mobile: ${session.user.email.split("@")[0]}` : session.user.email}</p>
                  <span className={styles.verifiedBadge}>✓ Verified Member</span>
                </div>
              </div>

              <nav className={styles.sidebarNav}>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`${styles.navBtn} ${activeTab === "orders" ? styles.activeNavBtn : ""}`}
                >
                  <span>📦 My Orders</span>
                  <span className={styles.navBadge}>{orders.length}</span>
                </button>
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`${styles.navBtn} ${activeTab === "overview" ? styles.activeNavBtn : ""}`}
                >
                  <span>👤 Profile & Account</span>
                </button>
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`${styles.navBtn} ${activeTab === "wishlist" ? styles.activeNavBtn : ""}`}
                >
                  <span>❤️ Wishlist</span>
                  <span className={styles.navBadge}>{wishlist.length}</span>
                </button>
                <button onClick={handleLogout} className={`${styles.navBtn} ${styles.logoutBtn}`}>
                  <span>🚪 Sign Out</span>
                </button>
              </nav>
            </aside>

            {/* Right Main Content */}
            <main className={styles.contentArea}>
              {/* TAB 1: MY ORDERS (Flipkart / Amazon Style Cards) */}
              {activeTab === "orders" && (
                <div className={styles.tabContent}>
                  {/* Top Bar with Search */}
                  <div className={styles.ordersHeaderBar}>
                    <div>
                      <h2>Your Orders ({orders.length})</h2>
                    </div>
                    <div className={styles.ordersFilter}>
                      <input
                        type="text"
                        placeholder="Search all orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.filterInput}
                      />
                    </div>
                  </div>

                  {/* Missing Orders Sync Banner */}
                  <div className={styles.syncOrdersBox}>
                    <div className={styles.syncOrdersTitle}>
                      <span>📱 Placed an order with a phone number?</span>
                    </div>
                    <p className={styles.syncOrdersDesc}>
                      If you ordered during checkout using your mobile number, enter it below to automatically link and sync all your orders to this account.
                    </p>
                    <form onSubmit={handleLinkPhone} className={styles.syncForm}>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Enter 10-digit Mobile No."
                        value={syncPhone}
                        onChange={(e) => setSyncPhone(e.target.value)}
                        className={styles.syncInput}
                      />
                      <button type="submit" disabled={isSyncing} className={styles.syncBtn}>
                        {isSyncing ? "Syncing..." : "Sync Orders"}
                      </button>
                    </form>
                    {syncMessage && (
                      <div
                        className={styles.syncMessage}
                        style={{ color: syncMessage.startsWith("✅") ? "#15803d" : "#b91c1c" }}
                      >
                        {syncMessage}
                      </div>
                    )}
                  </div>

                  {isLoadingOrders ? (
                    <div className={styles.loadingContainer}>
                      <div className={styles.spinner}></div>
                      <p>Fetching your orders from logistics network...</p>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className={styles.emptyOrdersCard}>
                      <div className={styles.emptyOrdersIcon}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#38b6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                      </div>
                      <h3>No Orders Found</h3>
                      <p>We couldn&apos;t find any orders matching your account or search. If you used a phone number, use the sync box above to link them!</p>
                      <Link href="/categories" className={styles.startShoppingBtn}>
                        Explore Catalog
                      </Link>
                    </div>
                  ) : (
                    /* Amazon / Flipkart Order Cards List */
                    filteredOrders.map((ord) => {
                      const orderNum = ord.orderNumber || ord.id;
                      const isDelivered = ord.status.toLowerCase().includes("delivered");
                      const isShipped =
                        ord.status.toLowerCase().includes("shipped") ||
                        ord.status.toLowerCase().includes("transit") ||
                        Boolean(ord.shiprocketAwbCode);

                      return (
                        <div key={ord.id} className={styles.amazonOrderCard}>
                          {/* Card Header (Amazon Gray Header) */}
                          <div className={styles.amazonCardHeader}>
                            <div className={styles.amazonHeaderCols}>
                              <div className={styles.amazonHeaderCol}>
                                <span className={styles.amazonColLabel}>Order Placed</span>
                                <span className={styles.amazonColValue}>{ord.date}</span>
                              </div>
                              <div className={styles.amazonHeaderCol}>
                                <span className={styles.amazonColLabel}>Total</span>
                                <span className={styles.amazonColValue}>₹{ord.total.toLocaleString("en-IN")}</span>
                              </div>
                              <div className={styles.amazonHeaderCol}>
                                <span className={styles.amazonColLabel}>Ship To</span>
                                <span className={styles.amazonColValue}>{ord.shippingAddress?.name || ord.userName || "Customer"}</span>
                              </div>
                            </div>
                            <div className={styles.amazonOrderIdCol}>
                              <span className={styles.amazonColLabel}>Order # {orderNum}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyOrderId(orderNum)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  fontSize: "11px",
                                  color: "#0284c7",
                                  cursor: "pointer",
                                  fontWeight: "700",
                                  padding: 0,
                                }}
                              >
                                {copiedId === orderNum ? "✓ Copied" : "Copy ID"}
                              </button>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className={styles.amazonCardBody}>
                            {/* Left: Status & Products */}
                            <div>
                              <div className={styles.amazonStatusRow}>
                                <span className={styles.statusHeadline}>
                                  {isDelivered ? "🟢 Delivered" : isShipped ? "🚚 In Logistics Transit" : "📦 Order Confirmed & In Logistics Queue"}
                                </span>
                                <span
                                  className={`${styles.statusBadgePill} ${
                                    isDelivered
                                      ? styles.statusDelivered
                                      : isShipped
                                      ? styles.statusShipped
                                      : styles.statusConfirmed
                                  }`}
                                >
                                  {ord.shiprocketStatus || ord.status}
                                </span>
                              </div>

                              <div className={styles.amazonItemsList}>
                                {ord.items.map((item, idx) => (
                                  <div key={idx} className={styles.amazonItemRow}>
                                    <Image
                                      src={item.imageUrl ? optimizeGalleryThumbnail(item.imageUrl) : "https://api.dicebear.com/7.x/shapes/svg?seed=Tool"}
                                      alt={item.name}
                                      width={64}
                                      height={64}
                                      className={styles.amazonItemImg}
                                      unoptimized
                                    />
                                    <div className={styles.amazonItemDetails}>
                                      <span className={styles.amazonItemTitle}>{item.name}</span>
                                      <span className={styles.amazonItemMeta}>
                                        Qty: <strong>{item.qty}</strong> • Price: <strong>₹{item.price.toLocaleString("en-IN")}</strong>
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Right: Actions Column (Amazon Style Buttons) */}
                            <div className={styles.amazonActionsCol}>
                              <Link
                                href={ord.shiprocketAwbCode ? `https://shiprocket.co/tracking/${ord.shiprocketAwbCode}` : `/track-order?order=${encodeURIComponent(orderNum)}`}
                                target={ord.shiprocketAwbCode ? "_blank" : "_self"}
                                className={styles.amazonTrackBtn}
                              >
                                🚀 Track Package
                              </Link>

                              <button
                                type="button"
                                onClick={() => setSelectedOrder(ord)}
                                className={styles.amazonDetailsBtn}
                              >
                                📄 View Details
                              </button>

                              <a
                                href={`https://wa.me/919500694111?text=${encodeURIComponent(`Hi Skill Store Support, I need help with my Order ${orderNum}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.amazonSupportBtn}
                              >
                                💬 WhatsApp Support
                              </a>
                            </div>
                          </div>

                          {/* Courier Logistics Strip */}
                          <div className={styles.courierInfoBar}>
                            <div>
                              <strong>Courier:</strong> {ord.shiprocketCourierName || (ord.shiprocketOrderId ? "Shiprocket Logistics" : "Assigned on Dispatch")}
                              {ord.shiprocketAwbCode && (
                                <span style={{ marginLeft: "12px" }}>
                                  <strong>AWB:</strong> {ord.shiprocketAwbCode}
                                </span>
                              )}
                            </div>
                            <Link
                              href={`/track-order?order=${encodeURIComponent(orderNum)}`}
                              style={{ color: "#0284c7", fontWeight: "750", textDecoration: "none" }}
                            >
                              Live Status Page →
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: PROFILE & ACCOUNT OVERVIEW */}
              {activeTab === "overview" && (
                <div className={styles.tabContent}>
                  <div className={styles.ordersHeaderBar}>
                    <h2>Account Overview</h2>
                  </div>

                  <div className={styles.modalSection}>
                    <h4>Personal Information</h4>
                    <p style={{ margin: "0 0 6px 0", fontSize: "14px", color: "#334155" }}>
                      <strong>Name:</strong> {session.user.name || "Customer"}
                    </p>
                    <p style={{ margin: "0 0 6px 0", fontSize: "14px", color: "#334155" }}>
                      <strong>Email:</strong> {session.user.email}
                    </p>
                    <p style={{ margin: 0, fontSize: "14px", color: "#334155" }}>
                      <strong>Total Synced Orders:</strong> {orders.length}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: WISHLIST */}
              {activeTab === "wishlist" && (
                <div className={styles.tabContent}>
                  <div className={styles.ordersHeaderBar}>
                    <h2>My Wishlist ({wishlist.length})</h2>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className={styles.emptyOrdersCard}>
                      <h3>Your Wishlist is Empty</h3>
                      <p>Explore our heavy duty pressure washers, compressors, and garage equipment!</p>
                      <Link href="/categories" className={styles.startShoppingBtn}>
                        Browse Catalog
                      </Link>
                    </div>
                  ) : (
                    <div className={styles.wishlistGrid}>
                      {wishlist.map((item) => (
                        <div key={item.id} className={styles.wishlistCard}>
                          <Image
                            src={optimizeGalleryThumbnail(item.imageUrl)}
                            alt={item.title}
                            width={70}
                            height={70}
                            className={styles.wishlistImg}
                            unoptimized
                          />
                          <div className={styles.wishlistMeta}>
                            <h4>{item.title}</h4>
                            <p className={styles.wishlistPrice}>₹{item.price.toLocaleString("en-IN")}</p>
                            <div className={styles.wishlistActions}>
                              <Link href={`/product/${item.id}`} className={styles.viewProductBtn}>
                                View
                              </Link>
                              <button onClick={() => toggleWishlist(item)} className={styles.removeWishlistBtn}>
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* Order Details Modal (Amazon / Flipkart Style) */}
      {selectedOrder && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Order Details: {selectedOrder.orderNumber || selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className={styles.closeBtn}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h4>Logistics & Courier Information</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
                  <div><strong>Shiprocket Order ID:</strong> {selectedOrder.shiprocketOrderId || "Pending"}</div>
                  <div><strong>Shipment ID:</strong> {selectedOrder.shiprocketShipmentId || "Pending"}</div>
                  <div><strong>Courier Partner:</strong> {selectedOrder.shiprocketCourierName || "Assigned on Dispatch"}</div>
                  <div><strong>AWB Code:</strong> {selectedOrder.shiprocketAwbCode || "Pending"}</div>
                </div>
              </div>

              <div className={styles.modalSection}>
                <h4>Shipping Address</h4>
                <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                  <strong>{selectedOrder.shippingAddress?.name || selectedOrder.userName}</strong><br />
                  {selectedOrder.shippingAddress?.street}<br />
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}<br />
                  📞 {selectedOrder.shippingAddress?.phone || selectedOrder.userPhone}
                </p>
              </div>

              <div className={styles.modalSection}>
                <h4>Payment & Invoice Breakdown</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Payment Method:</span>
                    <strong>{selectedOrder.paymentMethod || "Razorpay"} (Paid)</strong>
                  </div>
                  {selectedOrder.razorpayPaymentId && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Razorpay Payment ID:</span>
                      <span style={{ fontFamily: "monospace" }}>{selectedOrder.razorpayPaymentId}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", paddingTop: "6px", borderTop: "1px solid #cbd5e1", fontSize: "14.5px", fontWeight: "800", color: "#132c66" }}>
                    <span>Grand Total Paid:</span>
                    <span>₹{selectedOrder.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <Link
                  href={selectedOrder.shiprocketAwbCode ? `https://shiprocket.co/tracking/${selectedOrder.shiprocketAwbCode}` : `/track-order?order=${encodeURIComponent(selectedOrder.orderNumber || selectedOrder.id)}`}
                  target={selectedOrder.shiprocketAwbCode ? "_blank" : "_self"}
                  className={styles.amazonTrackBtn}
                  style={{ flex: 1 }}
                >
                  Open Live Tracking ↗
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className={styles.amazonDetailsBtn}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AccountPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className={styles.main}>
        <Suspense
          fallback={
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading Account Dashboard...</p>
            </div>
          }
        >
          <AccountContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
