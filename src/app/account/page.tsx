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
import styles from "./AccountPage.module.css";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber?: string;
  date: string;
  total: number;
  status: string;
  paymentStatus?: string;
  items: OrderItem[];
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

  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (session?.user?.email) {
      Promise.resolve().then(() => {
        if (isMounted) setIsLoadingOrders(true);
      });
      fetch("/api/user/orders")
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.success && Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
        })
        .catch((err) => console.error("Error fetching orders:", err))
        .finally(() => {
          if (isMounted) setIsLoadingOrders(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [session]);

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/account" });
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/account" });
  };

  if (status === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Verifying secure session...</p>
      </div>
    );
  }

  return (
    <>
      {/* Banner Header */}
      <div className={styles.bannerHeader}>
        <div className="container">
          <h1 className={styles.bannerTitle}>My Account</h1>
          <p className={styles.bannerSubtitle}>
            {session?.user ? `Welcome back, ${session.user.name}!` : "Sign in to track orders and manage your profile."}
          </p>
        </div>
      </div>

      <div className="container">
        {!session?.user ? (
          /* Logged Out view: Login Gate */
          <div className={styles.loginGate}>
            <div className={styles.loginCard}>
              <div className={styles.logoRow}>
                <span className={styles.logoSkill}>SKILL</span>
                <span className={styles.logoStore}>STORE</span>
              </div>
              <h2>Access Your Dashboard</h2>
              <p>Track order shipments, view order history, and sync your favorite items instantly.</p>
              
              {authError && (
                <div className={styles.authErrorBox}>
                  <strong>Authentication Notice:</strong>{" "}
                  {authError === "Configuration"
                    ? "Google OAuth environment variables (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) or callback URL may be misconfigured in Google Cloud Console."
                    : authError === "AccessDenied"
                    ? "Access was denied or canceled during Google Sign-In. Please try again."
                    : `Authentication issue encountered: ${authError}. Please try again.`}
                </div>
              )}

              <button onClick={handleGoogleLogin} className={styles.googleBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Sign In with Google</span>
              </button>
            </div>
          </div>
        ) : (
          /* Logged In view: Account Dashboard */
          <div className={styles.dashboardLayout}>
            {/* Left Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.profileHeader}>
                <Image
                  src={session.user.image || "https://api.dicebear.com/7.x/adventurer/svg?seed=Store"}
                  alt={session.user.name || "User"}
                  width={60}
                  height={60}
                  className={styles.avatar}
                  unoptimized
                />
                <div className={styles.profileMeta}>
                  <h3>{session.user.name}</h3>
                  <p>{session.user.email}</p>
                </div>
              </div>

              <nav className={styles.sidebarNav}>
                <button 
                  onClick={() => setActiveTab("overview")} 
                  className={`${styles.navBtn} ${activeTab === "overview" ? styles.activeNavBtn : ""}`}
                >
                  Dashboard Overview
                </button>
                <button 
                  onClick={() => setActiveTab("orders")} 
                  className={`${styles.navBtn} ${activeTab === "orders" ? styles.activeNavBtn : ""}`}
                >
                  My Orders
                </button>
                <button 
                  onClick={() => setActiveTab("wishlist")} 
                  className={`${styles.navBtn} ${activeTab === "wishlist" ? styles.activeNavBtn : ""}`}
                >
                  My Wishlist ({wishlist.length})
                </button>
                <button onClick={handleLogout} className={`${styles.navBtn} ${styles.logoutBtn}`}>
                  Sign Out
                </button>
              </nav>
            </aside>

            {/* Right Content Area */}
            <div className={styles.contentArea}>
              {/* 1. Overview Tab */}
              {activeTab === "overview" && (
                <div className={styles.tabContent}>
                  <h2>Account Overview</h2>
                  <p>Manage your account settings, order history, and active deliveries easily.</p>

                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <h3>{orders.length}</h3>
                      <p>Total Orders</p>
                    </div>
                    <div className={styles.statCard}>
                      <h3>{wishlist.length}</h3>
                      <p>Wishlist Items</p>
                    </div>
                  </div>

                  <div className={styles.profileSummary}>
                    <h3>Personal Information</h3>
                    <div className={styles.profileDetailsRow}>
                      <div className={styles.profileDetail}>
                        <strong>Name:</strong>
                        <span>{session.user.name}</span>
                      </div>
                      <div className={styles.profileDetail}>
                        <strong>Email:</strong>
                        <span>{session.user.email}</span>
                      </div>
                      <div className={styles.profileDetail}>
                        <strong>Registered Platform:</strong>
                        <span>Google Sign-In</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. My Orders Tab */}
              {activeTab === "orders" && (
                <div className={styles.tabContent}>
                  <h2>Order History</h2>
                  <p>Check the delivery status of your recent transactions.</p>

                  {isLoadingOrders ? (
                    <div className={styles.loadingContainer}>
                      <div className={styles.spinner}></div>
                      <p>Loading your orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className={styles.emptyOrdersCard}>
                      <div className={styles.emptyOrdersIcon}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#38b6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                      </div>
                      <h3>No Orders Placed Yet</h3>
                      <p>Looks like you haven&apos;t placed any orders yet. Browse our high pressure washers, compressors, and tools to get started!</p>
                      <Link href="/categories" className={styles.startShoppingBtn}>
                        Explore Catalog
                      </Link>
                    </div>
                  ) : (
                    <div className={styles.ordersTableWrapper}>
                      <table className={styles.ordersTable}>
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Product Description</th>
                            <th>Total Amount</th>
                            <th>Shipment / Logistics</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id}>
                              <td className={styles.orderId}>{order.orderNumber || order.id}</td>
                              <td>{order.date}</td>
                              <td>
                                {order.items.map((it, idx) => (
                                  <div key={idx}>
                                    {it.name} <strong>x {it.qty}</strong>
                                  </div>
                                ))}
                              </td>
                              <td className={styles.orderTotal}>₹{order.total.toLocaleString("en-IN")}</td>
                              <td>
                                {order.shiprocketAwbCode || order.shiprocketTrackingUrl ? (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <span style={{ fontSize: "12px", color: "#0f172a", fontWeight: "700" }}>
                                      {order.shiprocketCourierName || "Shiprocket Express"}
                                    </span>
                                    {order.shiprocketAwbCode && (
                                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                                        AWB: {order.shiprocketAwbCode}
                                      </span>
                                    )}
                                    {order.shiprocketTrackingUrl && (
                                      <a
                                        href={order.shiprocketTrackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          fontSize: "11.5px",
                                          color: "#0284c7",
                                          fontWeight: "750",
                                          textDecoration: "underline",
                                        }}
                                      >
                                        Track Package ↗
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                                    {order.shiprocketStatus === "pending_shipment"
                                      ? "In Logistics Queue"
                                      : order.shiprocketStatus || "Processing"}
                                  </span>
                                )}
                              </td>
                              <td>
                                <span className={`${styles.statusBadge} ${order.status === "Delivered" ? styles.statusDelivered : styles.statusShipped}`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Wishlist Tab */}
              {activeTab === "wishlist" && (
                <div className={styles.tabContent}>
                  <h2>My Wishlist</h2>
                  <p>Your saved favorites are listed here. You can add them straight to your shopping cart.</p>

                  {wishlist.length === 0 ? (
                    <p className={styles.emptyText}>Your wishlist is empty.</p>
                  ) : (
                    <div className={styles.wishlistGrid}>
                      {wishlist.map((item) => (
                        <div key={item.id} className={styles.wishlistCard}>
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            width={100}
                            height={100}
                            className={styles.wishlistImg}
                            style={{ objectFit: "contain" }}
                          />
                          <div className={styles.wishlistMeta}>
                            <h4>{item.title}</h4>
                            <p className={styles.wishlistPrice}>₹{item.price.toLocaleString("en-IN")}</p>
                            <div className={styles.wishlistActions}>
                              <Link href={`/product/prod-3`} className={styles.viewProductBtn}>
                                View Item
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
            </div>
          </div>
        )}
      </div>
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
              <p>Loading Account...</p>
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
