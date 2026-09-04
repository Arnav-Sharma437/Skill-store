"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { useApp } from "@/context/AppContext";
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
}

export default function CartPage() {
  const { data: session } = useSession();
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useApp();

  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccessDetails | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst;

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
          id: item.id,
          quantity: item.quantity,
        })),
        customerDetails: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
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

            // 4. Server-side payment signature verification
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
                  name: session?.user?.name || orderData.customer?.name || "",
                  email: session?.user?.email || orderData.customer?.email || "",
                },
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
          name: session?.user?.name || orderData.customer?.name || "",
          email: session?.user?.email || orderData.customer?.email || "",
          contact: orderData.customer?.phone || "",
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
              <span className={styles.testBadge}>Razorpay Test Mode Payment Verified</span>
              <h2 className={styles.successHeading}>Order Placed Successfully!</h2>
              <p className={styles.successText}>
                Thank you for choosing Skill Store. Your payment has been securely confirmed and recorded in our database.
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
                  <span>Razorpay Standard Checkout (Test Mode)</span>
                </div>
                <div className={styles.receiptRow}>
                  <span>Status:</span>
                  <span className={styles.paidStatusBadge}>PAID &amp; PROCESSING</span>
                </div>
              </div>

              <div className={styles.successActions}>
                <Link href="/account" className={styles.viewOrdersBtn}>
                  VIEW IN MY ACCOUNT
                </Link>
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
              {/* Left Column: Cart Items List */}
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
                        src={item.imageUrl} 
                        alt={item.title} 
                        width={100} 
                        height={100} 
                        className={styles.itemImage}
                      />
                    </div>

                    <div className={styles.itemDetails}>
                      <Link href={`/product/${item.id}`} className={styles.itemTitleLink}>
                        <h3 className={styles.itemTitle}>{item.title}</h3>
                      </Link>
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
              </div>

              {/* Right Column: Checkout Summary */}
              <div className={styles.summaryColumn}>
                <div className={styles.summaryCard}>
                  <h2 className={styles.summaryHeading}>ORDER SUMMARY</h2>
                  
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toLocaleString("en-IN")}.00</span>
                  </div>

                  <div className={styles.summaryRow}>
                    <span>GST (18%)</span>
                    <span>Rs. {gst.toLocaleString("en-IN")}.00</span>
                  </div>

                  <div className={styles.summaryRow}>
                    <span>Shipping</span>
                    <span className={styles.freeShipping}>FREE</span>
                  </div>

                  <div className={styles.summaryDivider}></div>

                  <div className={`${styles.summaryRow} ${styles.grandTotalRow}`}>
                    <span>Grand Total</span>
                    <span>Rs. {grandTotal.toLocaleString("en-IN")}.00</span>
                  </div>

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
                    <span>100% Secure Razorpay Payment Gateway</span>
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
