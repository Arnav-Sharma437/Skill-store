"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { useApp } from "@/context/AppContext";
import { optimizeGalleryThumbnail } from "@/lib/imageOptimization";
import styles from "./CartPage.module.css";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayError {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  };
}

interface OrderSuccessDetails {
  orderNumber: string;
  grandTotal: number;
  itemsCount: number;
  shiprocketStatus?: string;
  shiprocketTrackingUrl?: string;
}

export default function CartPage() {
  const { data: session } = useSession();
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useApp();

  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccessDetails | null>(null);

  // Delivery & Shipping Address State
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Prefill address from session if available
  useEffect(() => {
    let isMounted = true;
    if (session?.user) {
      // Fetch saved address from user profile asynchronously
      fetch("/api/user/addresses")
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          const defaultAddr =
            data.success && Array.isArray(data.addresses) && data.addresses.length > 0
              ? data.addresses[0]
              : null;

          setShippingAddress((prev) => ({
            name: prev.name || defaultAddr?.name || session.user?.name || "",
            phone: prev.phone || defaultAddr?.phone || "",
            street: prev.street || defaultAddr?.street || "",
            city: prev.city || defaultAddr?.city || "",
            state: prev.state || defaultAddr?.state || "",
            pincode: prev.pincode || defaultAddr?.pincode || "",
          }));
        })
        .catch(() => {
          if (isMounted && session.user?.name) {
            setShippingAddress((prev) => ({
              ...prev,
              name: prev.name || session.user?.name || "",
            }));
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [session]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gst = 0; // Tax is already included in all product prices
  const grandTotal = subtotal;

  // Load Razorpay Standard Checkout SDK
  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (typeof window === "undefined") return resolve(false);

      const win = window as unknown as { Razorpay?: unknown };
      if (win.Razorpay) return resolve(true);

      const existingScript = document.getElementById("razorpay-checkout-sdk");
      if (existingScript) {
        return resolve(true);
      }

      const script = document.createElement("script");
      script.id = "razorpay-checkout-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutError(null);

    // Mandatory Delivery Details Validation
    if (!shippingAddress.name.trim()) {
      setCheckoutError("Please enter recipient's Full Name.");
      return;
    }
    const cleanPhone = shippingAddress.phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setCheckoutError("Please enter a valid 10-digit mobile Phone Number.");
      return;
    }
    if (!shippingAddress.street.trim()) {
      setCheckoutError("Please enter Delivery Street Address (House / Flat / Area).");
      return;
    }
    if (!shippingAddress.city.trim()) {
      setCheckoutError("Please enter City / Town.");
      return;
    }
    if (!shippingAddress.state.trim()) {
      setCheckoutError("Please enter State.");
      return;
    }
    const cleanPincode = shippingAddress.pincode.replace(/\D/g, "");
    if (!cleanPincode || cleanPincode.length < 6) {
      setCheckoutError("Please enter a valid 6-digit Pincode.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Ensure Razorpay SDK is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error(
          "Failed to load Razorpay payment gateway. Please check your internet connection and try again."
        );
      }

      // 2. Request Server-side Order Creation with price recalculation
      const orderPayload = {
        items: cart.map((item) => ({
          id: item.productId || item.id,
          quantity: item.quantity,
          title: item.title,
          price: item.price,
          selectedVariant: item.selectedVariant,
        })),
        customerDetails: {
          name: shippingAddress.name.trim() || session?.user?.name || "",
          email: session?.user?.email || "",
          phone: shippingAddress.phone.trim() || "",
        },
        shippingAddress: {
          name: shippingAddress.name.trim(),
          phone: shippingAddress.phone.trim(),
          street: shippingAddress.street.trim(),
          city: shippingAddress.city.trim(),
          state: shippingAddress.state.trim(),
          pincode: shippingAddress.pincode.trim(),
        },
      };

      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initialize payment order.");
      }

      const win = window as unknown as {
        Razorpay: new (options: Record<string, unknown>) => {
          open: () => void;
          on: (event: string, callback: (response: RazorpayError) => void) => void;
        };
      };

      // 3. Configure Razorpay Standard Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Skill Store",
        description: `Machinery & Power Tools (${cart.length} items)`,
        image: "/images/logos/Skill Store Logo.png",
        order_id: orderData.orderId,
        handler: async function (response: RazorpayResponse) {
          try {
            setIsProcessing(true);
            setCheckoutError(null);

            // 4. Server-side payment signature verification & Shiprocket order creation
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items: cart.map((item) => ({
                  id: item.id,
                  quantity: item.quantity,
                })),
                receipt: orderData.receipt,
                customerDetails: {
                  name: shippingAddress.name || session?.user?.name || orderData.customer?.name || "",
                  email: session?.user?.email || orderData.customer?.email || "",
                  phone: shippingAddress.phone || orderData.customer?.phone || "",
                },
                shippingAddress,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              const completedCount = cart.length;
              clearCart();
              setOrderSuccess({
                orderNumber: verifyData.orderNumber,
                grandTotal: verifyData.grandTotal,
                itemsCount: completedCount,
                shiprocketStatus: verifyData.shiprocketStatus,
                shiprocketTrackingUrl: verifyData.shiprocketTrackingUrl,
              });
            } else {
              setCheckoutError(
                verifyData.error ||
                  "Payment signature verification failed. Please contact support."
              );
            }
          } catch (err: unknown) {
            console.error("Verification error:", err);
            setCheckoutError(
              err instanceof Error ? err.message : "Error verifying payment signature."
            );
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: shippingAddress.name || session?.user?.name || orderData.customer?.name || "",
          email: session?.user?.email || orderData.customer?.email || "",
          contact: shippingAddress.phone || orderData.customer?.phone || "",
        },
        theme: {
          color: "#132c66",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new win.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response: RazorpayError) {
        console.error("Razorpay payment failed:", response);
        setCheckoutError(
          response.error?.description ||
            "Payment failed or declined by bank. Please try again."
        );
        setIsProcessing(false);
      });

      razorpayInstance.open();
    } catch (err: unknown) {
      console.error("Checkout initiation error:", err);
      setCheckoutError(
        err instanceof Error ? err.message : "Could not start checkout process."
      );
      setIsProcessing(false);
    }
  };

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className={styles.main}>
        {/* Sky Blue Breadcrumb Strip */}
        <div className={styles.breadcrumbBar}>
          <div className="container">
            <div className={styles.breadcrumbContent}>
              <Link href="/">HOME</Link>
              <span className={styles.separator}>/</span>
              <span>SHOPPING CART</span>
            </div>
          </div>
        </div>

        <div className="container">
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>SHOPPING CART</h1>
            <div className={styles.titleUnderline}></div>
          </div>

          {/* Payment Success View */}
          {orderSuccess ? (
            <div className={styles.successState}>
              <div className={styles.successIconContainer}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <span className={styles.testBadge}>Payment &amp; Logistics Verified</span>
              <h2 className={styles.successHeading}>Order Placed Successfully!</h2>
              <p className={styles.successText}>
                Thank you for choosing Skill Store. Your payment has been securely confirmed, and your order is recorded in Shiprocket logistics for fulfillment.
              </p>

              <div className={styles.successReceiptCard}>
                <div className={styles.receiptRow}>
                  <span>Order Reference:</span>
                  <strong>{orderSuccess.orderNumber}</strong>
                </div>
                <div className={styles.receiptRow}>
                  <span>Total Amount Paid:</span>
                  <strong className={styles.receiptAmount}>
                    Rs. {orderSuccess.grandTotal.toLocaleString("en-IN")}.00
                  </strong>
                </div>
                <div className={styles.receiptRow}>
                  <span>Payment Gateway:</span>
                  <span>Razorpay Standard Checkout</span>
                </div>
                <div className={styles.receiptRow}>
                  <span>Logistics Partner:</span>
                  <span className={styles.logisticsBadge}>Shiprocket Logistics</span>
                </div>
                <div className={styles.receiptRow}>
                  <span>Status:</span>
                  <span className={styles.paidStatusBadge}>PAID &amp; CONFIRMED</span>
                </div>
              </div>

              <div className={styles.successActions}>
                <Link href="/account" className={styles.viewOrdersBtn}>
                  VIEW IN MY ACCOUNT
                </Link>
                {orderSuccess.shiprocketTrackingUrl && (
                  <a
                    href={orderSuccess.shiprocketTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.trackShipmentBtn}
                  >
                    TRACK SHIPMENT
                  </a>
                )}
                <Link href="/categories" className={styles.continueShoppingBtn}>
                  CONTINUE SHOPPING
                </Link>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconContainer}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <h2 className={styles.emptyHeading}>Your Cart is Empty</h2>
              <p className={styles.emptyText}>Add some premium tools and power accessories to get started!</p>
              <Link href="/" className={styles.continueShoppingBtn}>
                CONTINUE SHOPPING
              </Link>
            </div>
          ) : (
            <div className={styles.cartGrid}>
              {/* Left Column: Cart Items List & Delivery Details */}
              <div className={styles.itemsColumn}>
                {checkoutError && (
                  <div className={styles.errorAlertBox}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{checkoutError}</span>
                  </div>
                )}

                {cart.map((item) => (
                  <div key={item.id} className={styles.cartItemCard}>
                    <div className={styles.itemImageContainer}>
                      <Image 
                        src={optimizeGalleryThumbnail(item.imageUrl)} 
                        alt={item.title} 
                        width={100} 
                        height={100} 
                        loading="lazy"
                        className={styles.itemImage}
                      />
                    </div>

                    <div className={styles.itemDetails}>
                      <Link href={`/product/${item.productId || item.id}`} className={styles.itemTitleLink}>
                        <h3 className={styles.itemTitle}>{item.title}</h3>
                      </Link>

                      {item.selectedVariant && (item.selectedVariant.name || item.selectedVariant.degree || item.selectedVariant.size || item.selectedVariant.style) && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "4px 0 6px 0" }}>
                          {item.selectedVariant.name && (
                            <span style={{ fontSize: "11px", fontWeight: "750", background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "4px", border: "1px solid #bae6fd" }}>
                              Variant: {item.selectedVariant.name}
                            </span>
                          )}
                          {item.selectedVariant.degree && (!item.selectedVariant.name || !item.selectedVariant.name.toLowerCase().includes(item.selectedVariant.degree.toLowerCase())) && (
                            <span style={{ fontSize: "11px", fontWeight: "700", background: "#f1f5f9", color: "#334155", padding: "2px 8px", borderRadius: "4px" }}>
                              Degree: {item.selectedVariant.degree}
                            </span>
                          )}
                          {item.selectedVariant.size && (!item.selectedVariant.name || !item.selectedVariant.name.toLowerCase().includes(item.selectedVariant.size.toLowerCase())) && (
                            <span style={{ fontSize: "11px", fontWeight: "700", background: "#f1f5f9", color: "#334155", padding: "2px 8px", borderRadius: "4px" }}>
                              Size: {item.selectedVariant.size}
                            </span>
                          )}
                          {item.selectedVariant.style && (!item.selectedVariant.name || !item.selectedVariant.name.toLowerCase().includes(item.selectedVariant.style.toLowerCase())) && (
                            <span style={{ fontSize: "11px", fontWeight: "700", background: "#f1f5f9", color: "#334155", padding: "2px 8px", borderRadius: "4px" }}>
                              Style: {item.selectedVariant.style}
                            </span>
                          )}
                        </div>
                      )}

                      <span className={styles.itemPrice}>Rs. {item.price.toLocaleString("en-IN")}.00</span>
                    </div>

                    {/* Quantity selectors */}
                    <div className={styles.quantityContainer}>
                      <button 
                        onClick={() => updateCartQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className={styles.qtyBtn}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <input 
                        type="text" 
                        value={item.quantity} 
                        readOnly 
                        className={styles.qtyInput}
                        aria-label="Product quantity"
                      />
                      <button 
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className={styles.qtyBtn}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal & Actions */}
                    <div className={styles.itemSubtotalContainer}>
                      <span className={styles.itemSubtotal}>
                        Rs. {(item.price * item.quantity).toLocaleString("en-IN")}.00
                      </span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className={styles.removeBtn}
                        aria-label="Remove item"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Delivery & Shipping Address Form Card */}
                <div className={styles.addressCard}>
                  <div className={styles.addressHeader}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#132c66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <div>
                      <h3 style={{ margin: 0 }}>Delivery &amp; Shipping Details</h3>
                      <span style={{ fontSize: "11.5px", color: "#e11d48", fontWeight: "600" }}>
                        * All fields below are mandatory for order delivery
                      </span>
                    </div>
                  </div>

                  <div className={styles.addressGrid}>
                    <div className={styles.formGroup}>
                      <label>Recipient Name <span style={{ color: "#e11d48" }}>*</span></label>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={shippingAddress.name}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Phone Number <span style={{ color: "#e11d48" }}>*</span></label>
                      <input
                        type="tel"
                        placeholder="10-digit Mobile Number"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className={`${styles.formGroup} ${styles.fullWidthGroup}`}>
                      <label>Delivery Street Address <span style={{ color: "#e11d48" }}>*</span></label>
                      <input
                        type="text"
                        placeholder="House / Flat / Shop / Street / Area"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>City / Town <span style={{ color: "#e11d48" }}>*</span></label>
                      <input
                        type="text"
                        placeholder="e.g. New Delhi"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>State <span style={{ color: "#e11d48" }}>*</span></label>
                      <input
                        type="text"
                        placeholder="e.g. Delhi"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Pincode <span style={{ color: "#e11d48" }}>*</span></label>
                      <input
                        type="text"
                        placeholder="6-digit Pincode"
                        maxLength={6}
                        value={shippingAddress.pincode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Checkout Summary */}
              <div className={styles.summaryColumn}>
                <div className={styles.summaryCard}>
                  <h2 className={styles.summaryHeading}>ORDER SUMMARY</h2>
                  
                  <div className={styles.summaryRow}>
                    <span>Items Subtotal</span>
                    <span>Rs. {subtotal.toLocaleString("en-IN")}.00</span>
                  </div>

                  <div className={styles.summaryRow}>
                    <span>Taxes &amp; GST</span>
                    <span style={{ color: "#16a34a", fontWeight: "700" }}>Included (₹0.00 extra)</span>
                  </div>

                  <div className={styles.summaryRow}>
                    <span>Express Shipping</span>
                    <span className={styles.freeShipping}>FREE</span>
                  </div>

                  <div className={styles.summaryDivider}></div>

                  <div className={`${styles.summaryRow} ${styles.grandTotalRow}`}>
                    <span>Grand Total</span>
                    <span>Rs. {grandTotal.toLocaleString("en-IN")}.00</span>
                  </div>

                  <div style={{ fontSize: "11px", color: "#166534", background: "#f0fdf4", padding: "6px 10px", borderRadius: "6px", border: "1px solid #bbf7d0", margin: "10px 0", textAlign: "center", fontWeight: "600", lineHeight: 1.4 }}>
                    ✓ All taxes (GST) and shipping charges are included in product price
                  </div>

                  {checkoutError && (
                    <div style={{ padding: "10px", background: "#fee2e2", color: "#b91c1c", borderRadius: "6px", fontSize: "12px", margin: "10px 0", fontWeight: "600" }}>
                      ⚠️ {checkoutError}
                    </div>
                  )}

                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessing || cart.length === 0}
                    className={`${styles.checkoutBtn} ${isProcessing ? styles.checkoutBtnDisabled : ""}`}
                  >
                    {isProcessing ? (
                      <span className={styles.btnLoadingContent}>
                        <span className={styles.btnSpinner}></span>
                        PROCESSING PAYMENT...
                      </span>
                    ) : (
                      "PROCEED TO CHECKOUT"
                    )}
                  </button>

                  <div className={styles.secureBadgeRow}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>100% Secure Payment &amp; Shiprocket Dispatch</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
