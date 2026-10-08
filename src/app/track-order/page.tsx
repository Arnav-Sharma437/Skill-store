"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import styles from "./TrackOrder.module.css";

interface IOrderItem {
  name: string;
  qty: number;
  price: number;
  imageUrl?: string;
}

interface IOrderDetails {
  orderNumber: string;
  date?: string;
  createdAt?: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  total: number;
  subtotal?: number;
  gst?: number;
  shipping?: number;
  couponCode?: string;
  couponDiscount?: number;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string;
  shippingAddress?: {
    name?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  items?: IOrderItem[];
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  shiprocketAwbCode?: string;
  shiprocketCourierName?: string;
  shiprocketStatus?: string;
  shiprocketTrackingUrl?: string;
}

interface ITrackActivity {
  date?: string;
  status?: string;
  activity?: string;
  location?: string;
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery =
    searchParams.get("order") ||
    searchParams.get("orderNumber") ||
    searchParams.get("phone") ||
    searchParams.get("id") ||
    "";

  const [activeTab, setActiveTab] = useState<"orderNumber" | "phone">(
    /^\d{10}$/.test(initialQuery.trim()) ? "phone" : "orderNumber"
  );
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<IOrderDetails | null>(null);
  const [activities, setActivities] = useState<ITrackActivity[]>([]);
  const [copied, setCopied] = useState(false);

  const fetchTracking = async (query: string) => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const hasLetters = /[a-zA-Z]/.test(q);
      const cleanDigits = q.replace(/\D/g, "");
      const isPhone = !hasLetters && cleanDigits.length >= 10 && cleanDigits.length <= 13;
      const param = isPhone
        ? `phone=${encodeURIComponent(cleanDigits.slice(-10))}`
        : `orderNumber=${encodeURIComponent(q)}`;

      const orderRes = await fetch(`/api/user/orders?${param}&_t=${Date.now()}`);
      const orderJson = await orderRes.json();

      if (orderJson.success && Array.isArray(orderJson.orders) && orderJson.orders.length > 0) {
        const primaryOrder = orderJson.orders[0];
        setOrderData(primaryOrder);

        // Fetch live courier scans & updates from Shiprocket API
        if (primaryOrder.orderNumber) {
          try {
            const shipRes = await fetch(
              `/api/shiprocket/track?orderNumber=${encodeURIComponent(primaryOrder.orderNumber)}`
            );
            const shipJson = await shipRes.json();
            if (shipJson.success && Array.isArray(shipJson.activities)) {
              setActivities(shipJson.activities);
            }
          } catch {
            // Live scan fallback
          }
        }
      } else {
        setError(
          orderJson.error ||
            "No order found matching your search. Please verify your Order Number (e.g., SKILL-2026-...) or registered 10-digit mobile number."
        );
        setOrderData(null);
      }
    } catch {
      setError("Network connection error while fetching tracking info. Please check your connection and try again.");
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchTracking(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(searchQuery);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine active step index (0: Placed, 1: Confirmed/Packed, 2: Shipped/In Transit, 3: Out for Delivery, 4: Delivered)
  const getActiveStep = () => {
    if (!orderData) return 0;
    const status = (orderData.shiprocketStatus || orderData.orderStatus || "").toLowerCase();
    if (status.includes("deliver")) return 4;
    if (status.includes("out for delivery") || status.includes("out_for_delivery")) return 3;
    if (status.includes("transit") || status.includes("shipped") || status.includes("picked") || status.includes("in_transit")) return 2;
    if (status.includes("confirmed") || status.includes("processing") || status.includes("new") || orderData.shiprocketOrderId) return 1;
    return 0;
  };

  const activeStep = getActiveStep();
  const stepPercent = `${(activeStep / 4) * 100}%`;

  return (
    <div className={styles.container}>
      <AnnouncementBar />
      <Header />

      <main className={styles.mainContent}>
        {/* Modern Brand Hero */}
        <section className={styles.heroSection}>
          <div className={styles.heroBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            OFFICIAL SKILL STORE LOGISTICS TRACKER
          </div>
          <h1 className={styles.heroTitle}>Track Your Order</h1>
          <p className={styles.heroSubtitle}>
            Real-time status, live courier tracking updates, and delivery timeline across India.
          </p>
        </section>

        {/* Search floating card */}
        <div className={styles.searchWrapper}>
          <div className={styles.searchCard}>
            <div className={styles.searchTabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === "orderNumber" ? styles.tabBtnActive : ""}`}
                onClick={() => {
                  setActiveTab("orderNumber");
                  setSearchQuery("");
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                Order Number
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === "phone" ? styles.tabBtnActive : ""}`}
                onClick={() => {
                  setActiveTab("phone");
                  setSearchQuery("");
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Mobile Number
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <div className={styles.inputGroup}>
                <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder={
                    activeTab === "orderNumber"
                      ? "Enter Order ID (e.g., SKILL-2026-12345)"
                      : "Enter 10-digit registered mobile number"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className={styles.searchSubmitBtn}>
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                    </svg>
                    Tracking...
                  </>
                ) : (
                  <>
                    <span>Track Order</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className={styles.quickChips}>
              <span>Quick hints:</span>
              <button
                type="button"
                className={styles.chipBtn}
                onClick={() => {
                  setActiveTab("orderNumber");
                  setSearchQuery("SKILL-2026-");
                }}
              >
                SKILL-2026-XXXXX
              </button>
              <button
                type="button"
                className={styles.chipBtn}
                onClick={() => setActiveTab("phone")}
              >
                10-Digit Mobile
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={styles.errorCard}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Order Details Dashboard */}
        {orderData ? (
          <div className={styles.trackDashboard}>
            {/* Header Meta Card */}
            <div className={styles.orderHeaderCard}>
              <div className={styles.orderHeaderTop}>
                <div className={styles.orderMetaBlock}>
                  <h2>
                    Order #{orderData.orderNumber}
                    <button
                      type="button"
                      onClick={() => copyToClipboard(orderData.orderNumber)}
                      className={styles.copyOrderBtn}
                      title="Copy Order ID"
                    >
                      {copied ? "✓ Copied" : "📋 Copy"}
                    </button>
                  </h2>
                  <p className={styles.orderDateText}>
                    Placed on{" "}
                    {orderData.createdAt
                      ? new Date(orderData.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recently"}
                  </p>
                </div>

                <div className={styles.badgeRow}>
                  <span
                    className={`${styles.statusPill} ${
                      activeStep === 4
                        ? styles.pillDelivered
                        : activeStep >= 2
                        ? styles.pillShipped
                        : activeStep >= 1
                        ? styles.pillConfirmed
                        : styles.pillProcessing
                    }`}
                  >
                    ● {orderData.shiprocketStatus || orderData.orderStatus || "Confirmed"}
                  </span>
                  <span className={styles.paymentPill}>
                    💳 {orderData.paymentMethod || "Online"} &bull; {orderData.paymentStatus === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>

              {/* Visual 5-Step Progress Stepper */}
              <div className={styles.stepperContainer}>
                <div className={styles.stepperTrack}>
                  <div className={styles.stepperProgressLine} style={{ width: stepPercent }}></div>

                  <div className={`${styles.stepNode} ${activeStep >= 0 ? styles.stepNodeActive : ""} ${activeStep === 0 ? styles.stepNodeCurrent : ""}`}>
                    <div className={styles.stepIconCircle}>✓</div>
                    <span className={styles.stepTitle}>Order Placed</span>
                    <span className={styles.stepSubtext}>Payment Confirmed</span>
                  </div>

                  <div className={`${styles.stepNode} ${activeStep >= 1 ? styles.stepNodeActive : ""} ${activeStep === 1 ? styles.stepNodeCurrent : ""}`}>
                    <div className={styles.stepIconCircle}>{activeStep >= 1 ? "✓" : "2"}</div>
                    <span className={styles.stepTitle}>Packed &amp; Ready</span>
                    <span className={styles.stepSubtext}>Skill Store Warehouse</span>
                  </div>

                  <div className={`${styles.stepNode} ${activeStep >= 2 ? styles.stepNodeActive : ""} ${activeStep === 2 ? styles.stepNodeCurrent : ""}`}>
                    <div className={styles.stepIconCircle}>{activeStep >= 2 ? "✓" : "3"}</div>
                    <span className={styles.stepTitle}>In Transit</span>
                    <span className={styles.stepSubtext}>Dispatched via Courier</span>
                  </div>

                  <div className={`${styles.stepNode} ${activeStep >= 3 ? styles.stepNodeActive : ""} ${activeStep === 3 ? styles.stepNodeCurrent : ""}`}>
                    <div className={styles.stepIconCircle}>{activeStep >= 3 ? "✓" : "4"}</div>
                    <span className={styles.stepTitle}>Out for Delivery</span>
                    <span className={styles.stepSubtext}>Nearest Delivery Hub</span>
                  </div>

                  <div className={`${styles.stepNode} ${activeStep >= 4 ? styles.stepNodeActive : ""} ${activeStep === 4 ? styles.stepNodeCurrent : ""}`}>
                    <div className={styles.stepIconCircle}>{activeStep >= 4 ? "✓" : "5"}</div>
                    <span className={styles.stepTitle}>Delivered</span>
                    <span className={styles.stepSubtext}>Package Handed Over</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shiprocket Logistics Card */}
            <div className={styles.logisticsCard}>
              <div className={styles.logisticsHeader}>
                <h3 className={styles.logisticsTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13"/>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  Shiprocket Logistics Information
                </h3>
                <span className={styles.statusPill} style={{ background: "#ffffff", color: "#166534" }}>
                  {orderData.shiprocketStatus || "LOGISTICS ASSIGNED"}
                </span>
              </div>

              <div className={styles.logisticsGrid}>
                <div className={styles.logisticsCol}>
                  <strong>Courier Partner</strong>
                  <span>{orderData.shiprocketCourierName || "Assigned on Dispatch"}</span>
                </div>
                <div className={styles.logisticsCol}>
                  <strong>AWB Tracking Number</strong>
                  <span style={{ fontFamily: "monospace", letterSpacing: "0.5px" }}>
                    {orderData.shiprocketAwbCode || "Pending Courier Assignment"}
                  </span>
                </div>
                <div className={styles.logisticsCol}>
                  <strong>Shipment ID</strong>
                  <span>{orderData.shiprocketShipmentId || "In Processing"}</span>
                </div>
                <div className={styles.logisticsCol}>
                  <strong>Estimated Delivery</strong>
                  <span>Within 3 - 5 Business Days</span>
                </div>
              </div>

              {orderData.shiprocketAwbCode && (
                <a
                  href={`https://shiprocket.co/tracking/${orderData.shiprocketAwbCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.liveTrackingBtn}
                >
                  <span>Open Official Courier Tracking Portal</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              )}
            </div>

            {/* Grid 2 Columns: Items & Address */}
            <div className={styles.gridTwoCol}>
              {/* Ordered Products Panel */}
              <div className={styles.panelBox}>
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  Ordered Items ({(orderData.items || []).length})
                </h3>

                <div className={styles.itemList}>
                  {(orderData.items || []).map((item, idx) => (
                    <div key={idx} className={styles.itemCard}>
                      <Image
                        src={item.imageUrl || "/images/products/hw2000.jpg"}
                        alt={item.name}
                        width={56}
                        height={56}
                        className={styles.itemImage}
                      />
                      <div className={styles.itemDetails}>
                        <h4 className={styles.itemName}>{item.name}</h4>
                        <span className={styles.itemQty}>Quantity: {item.qty}</span>
                      </div>
                      <span className={styles.itemPrice}>
                        ₹{(item.price * item.qty).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.orderTotals}>
                  <div className={styles.totalRow}>
                    <span>Subtotal</span>
                    <span>₹{(orderData.subtotal || orderData.total).toLocaleString("en-IN")}.00</span>
                  </div>
                  {orderData.couponDiscount && orderData.couponDiscount > 0 ? (
                    <div className={styles.totalRow} style={{ color: "#16a34a", fontWeight: 700 }}>
                      <span>Coupon Discount ({orderData.couponCode})</span>
                      <span>-₹{orderData.couponDiscount.toLocaleString("en-IN")}.00</span>
                    </div>
                  ) : null}
                  <div className={styles.totalRow}>
                    <span>Shipping</span>
                    <span style={{ color: "#16a34a", fontWeight: 700 }}>FREE</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Taxes (GST)</span>
                    <span>Included in Price</span>
                  </div>
                  <div className={`${styles.totalRow} ${styles.grandTotalRow}`}>
                    <span>Grand Total Paid</span>
                    <span>₹{orderData.total.toLocaleString("en-IN")}.00</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address & Contact */}
              <div className={styles.panelBox}>
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Delivery Destination
                </h3>

                <div className={styles.addressCard}>
                  <div className={styles.recipientName}>
                    {orderData.shippingAddress?.name || orderData.userName}
                  </div>
                  <p style={{ margin: "0 0 10px", color: "#475569" }}>
                    {orderData.shippingAddress?.street}
                    <br />
                    {orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} -{" "}
                    <strong>{orderData.shippingAddress?.pincode}</strong>
                    <br />
                    {orderData.shippingAddress?.country || "India"}
                  </p>

                  <div className={styles.contactBadge}>
                    <span>📞 {orderData.shippingAddress?.phone || orderData.userPhone || "Not provided"}</span>
                    <span>✉️ {orderData.userEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transit Activities Feed */}
            {activities.length > 0 && (
              <div className={styles.timelineBox}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                  📍 Live Transit Activity Log
                </h3>
                <div className={styles.timelineList}>
                  {activities.map((act, i) => (
                    <div key={i} className={styles.timelineItem}>
                      <div className={styles.timelineDot}></div>
                      <div className={styles.timelineContent}>
                        <h4 className={styles.timelineActivity}>{act.activity || act.status}</h4>
                        <p className={styles.timelineLocation}>
                          {act.location ? `${act.location} &bull; ` : ""}
                          {act.date || ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Support Bar */}
            <div className={styles.supportBar}>
              <div className={styles.supportText}>
                <h4>Need assistance with this order?</h4>
                <p>Our dedicated machinery and logistics support team is ready to help you.</p>
              </div>
              <div className={styles.supportButtons}>
                <a
                  href={`https://wa.me/918368146316?text=Hi%20Skill%20Store%2C%20I%20need%20help%20with%20Order%20%23${encodeURIComponent(
                    orderData.orderNumber
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappBtn}
                >
                  <span>💬 WhatsApp Support</span>
                </a>
                <Link href="/categories" className={styles.continueShoppingBtn}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        ) : !loading && !initialQuery ? (
          /* Empty Search Prompt with Features */
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📍</div>
              <h4>Real-Time Courier Tracking</h4>
              <p>Direct sync with Shiprocket, Delhivery, Blue Dart, and Xpressbees logistics networks.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h4>Fast Dispatch Guarantee</h4>
              <p>Orders are verified, packaged with protective industrial cushioning, and dispatched quickly.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📞</div>
              <h4>Direct Customer Support</h4>
              <p>Have questions regarding your order? Connect directly with our dispatch desk via WhatsApp.</p>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
          Loading Order Tracker...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
