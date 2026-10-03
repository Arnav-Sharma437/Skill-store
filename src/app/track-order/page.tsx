"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import styles from "./TrackOrder.module.css";

interface IOrderDetails {
  orderNumber: string;
  createdAt: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    name?: string;
    phone?: string;
  };
  items?: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
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
  const initialQuery = searchParams.get("order") || searchParams.get("orderNumber") || searchParams.get("phone") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<IOrderDetails | null>(null);
  const [activities, setActivities] = useState<ITrackActivity[]>([]);

  const fetchTracking = async (query: string) => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch order details from user/orders
      const isPhone = /^\d{10,12}$/.test(q.replace(/\D/g, ""));
      const param = isPhone ? `phone=${encodeURIComponent(q)}` : `orderNumber=${encodeURIComponent(q)}`;
      const orderRes = await fetch(`/api/user/orders?${param}&_t=${Date.now()}`);
      const orderJson = await orderRes.json();

      if (orderJson.success && Array.isArray(orderJson.orders) && orderJson.orders.length > 0) {
        const primaryOrder = orderJson.orders[0];
        setOrderData(primaryOrder);

        // 2. Query live Shiprocket status
        if (primaryOrder.orderNumber) {
          try {
            const shipRes = await fetch(`/api/shiprocket/track?orderNumber=${encodeURIComponent(primaryOrder.orderNumber)}`);
            const shipJson = await shipRes.json();
            if (shipJson.success && Array.isArray(shipJson.activities)) {
              setActivities(shipJson.activities);
            }
          } catch {
            // Live tracking activities fallback
          }
        }
      } else {
        setError(orderJson.error || "No order found matching your query. Please check your Order ID or registered Mobile Number.");
        setOrderData(null);
      }
    } catch {
      setError("Network error while searching for order. Please try again.");
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

  // Determine active step (0: Placed, 1: Confirmed/Logistics Booked, 2: Shipped/In Transit, 3: Out for Delivery, 4: Delivered)
  const getActiveStep = () => {
    if (!orderData) return 0;
    const status = (orderData.shiprocketStatus || orderData.orderStatus || "").toLowerCase();
    if (status.includes("deliver")) return 4;
    if (status.includes("out for delivery")) return 3;
    if (status.includes("transit") || status.includes("shipped") || status.includes("picked")) return 2;
    if (status.includes("confirmed") || status.includes("new") || status.includes("processing") || orderData.shiprocketOrderId) return 1;
    return 0;
  };

  const activeStep = getActiveStep();
  const stepPercent = `${(activeStep / 4) * 100}%`;

  return (
    <div className={styles.container}>
      <AnnouncementBar />
      <Header />

      <div className={styles.bannerHeader}>
        <div className="container">
          <h1 className={styles.bannerTitle}>Track Your Order</h1>
          <p className={styles.bannerSubtitle}>
            Enter your Order Number (e.g. SKILL-2026-XXXX) or registered Mobile Number for real-time shipment updates.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Search Bar */}
        <div className={styles.searchSection}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Enter Order ID (SKILL-2026-...) or 10-digit Phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" disabled={loading} className={styles.searchBtn}>
              {loading ? "Searching..." : "Track Live"}
            </button>
          </form>
        </div>

        {error && (
          <div style={{ maxWidth: "680px", margin: "0 auto 24px", padding: "12px 18px", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "13.5px" }}>
            ⚠️ {error}
          </div>
        )}

        {orderData ? (
          <div className={styles.card}>
            {/* Card Header */}
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.orderHeading}>Order #{orderData.orderNumber}</h3>
                <p className={styles.orderDate}>
                  Placed on {orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently"}
                </p>
              </div>
              <span
                className={`${styles.statusBadge} ${
                  activeStep === 4
                    ? styles.statusDelivered
                    : activeStep >= 2
                    ? styles.statusShipped
                    : styles.statusConfirmed
                }`}
              >
                {orderData.shiprocketStatus || orderData.orderStatus || "Confirmed"}
              </span>
            </div>

            {/* Card Body */}
            <div className={styles.cardBody}>
              {/* Visual Stepper */}
              <div className={styles.stepper}>
                <div className={styles.stepProgress} style={{ width: stepPercent }}></div>

                <div className={`${styles.stepItem} ${activeStep >= 0 ? styles.stepItemActive : ""}`}>
                  <div className={styles.stepCircle}>✓</div>
                  <span className={styles.stepLabel}>Order Placed</span>
                </div>

                <div className={`${styles.stepItem} ${activeStep >= 1 ? styles.stepItemActive : ""}`}>
                  <div className={styles.stepCircle}>{activeStep >= 1 ? "✓" : "2"}</div>
                  <span className={styles.stepLabel}>Confirmed</span>
                </div>

                <div className={`${styles.stepItem} ${activeStep >= 2 ? styles.stepItemActive : ""}`}>
                  <div className={styles.stepCircle}>{activeStep >= 2 ? "✓" : "3"}</div>
                  <span className={styles.stepLabel}>In Transit</span>
                </div>

                <div className={`${styles.stepItem} ${activeStep >= 3 ? styles.stepItemActive : ""}`}>
                  <div className={styles.stepCircle}>{activeStep >= 3 ? "✓" : "4"}</div>
                  <span className={styles.stepLabel}>Out for Delivery</span>
                </div>

                <div className={`${styles.stepItem} ${activeStep >= 4 ? styles.stepItemActive : ""}`}>
                  <div className={styles.stepCircle}>{activeStep >= 4 ? "✓" : "5"}</div>
                  <span className={styles.stepLabel}>Delivered</span>
                </div>
              </div>

              {/* Shiprocket Logistics Information */}
              <div className={styles.logisticsBox}>
                <div className={styles.logisticsHeader}>
                  <h4 className={styles.logisticsTitle}>📦 Shiprocket Logistics Information</h4>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#166534", background: "#dcfce7", padding: "3px 8px", borderRadius: "4px" }}>
                    {orderData.shiprocketStatus || "LOGISTICS QUEUE"}
                  </span>
                </div>
                <div className={styles.logisticsGrid}>
                  <div>
                    <strong>Shiprocket Order ID</strong>
                    <span>{orderData.shiprocketOrderId || "Assigned on Dispatch"}</span>
                  </div>
                  <div>
                    <strong>Shipment ID</strong>
                    <span>{orderData.shiprocketShipmentId || "In Processing"}</span>
                  </div>
                  <div>
                    <strong>Courier Partner</strong>
                    <span>{orderData.shiprocketCourierName || "Assigned on Dispatch"}</span>
                  </div>
                  <div>
                    <strong>AWB Tracking Code</strong>
                    <span>{orderData.shiprocketAwbCode || "Pending Courier Assignment"}</span>
                  </div>
                </div>

                {orderData.shiprocketAwbCode && (
                  <a
                    href={`https://shiprocket.co/tracking/${orderData.shiprocketAwbCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.courierLinkBtn}
                  >
                    Open Live Courier Tracking ↗
                  </a>
                )}
              </div>

              {/* Items & Shipping Address Details */}
              <div className={styles.detailsGrid}>
                {/* Items */}
                <div className={styles.sectionBox}>
                  <h4>Ordered Products ({(orderData.items || []).length})</h4>
                  {(orderData.items || []).map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <span>
                        {item.name} <strong>x {item.qty}</strong>
                      </span>
                      <strong>₹{(item.price * item.qty).toLocaleString("en-IN")}</strong>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", paddingTop: "8px", borderTop: "1.5px solid #cbd5e1", fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                    <span>Total Amount Paid</span>
                    <span>₹{orderData.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Address */}
                <div className={styles.sectionBox}>
                  <h4>Delivery Address</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                    <strong>{orderData.shippingAddress?.name || orderData.userName}</strong><br />
                    {orderData.shippingAddress?.street}<br />
                    {orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} - {orderData.shippingAddress?.pincode}<br />
                    📞 {orderData.shippingAddress?.phone || orderData.userPhone}
                  </p>
                </div>
              </div>

              {/* Scan Activities */}
              {activities.length > 0 && (
                <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
                  <h4 style={{ fontSize: "14px", color: "#0f172a", marginBottom: "12px" }}>Live Transit Activities</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {activities.map((act, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", padding: "6px 10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                        <span>📍 {act.activity || act.status} - {act.location || ""}</span>
                        <span style={{ color: "#64748b" }}>{act.date || ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : !loading && !initialQuery ? (
          <div className={styles.emptyState}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
            <h3 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>Enter Your Order Details</h3>
            <p style={{ margin: 0, color: "#64748b", fontSize: "13.5px" }}>
              Type your Skill Store Order Number or 10-digit mobile number above to view real-time delivery status and courier updates.
            </p>
          </div>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading Order Tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
