"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { useApp } from "@/context/AppContext";
import styles from "./CartPage.module.css";

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity } = useApp();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst;

  const handleCheckout = () => {
    alert("Checkout functionality is ready! Proceeding to payment gateway...");
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

          {cart.length === 0 ? (
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
                      >
                        -
                      </button>
                      <input 
                        type="text" 
                        value={item.quantity} 
                        readOnly 
                        className={styles.qtyInput}
                      />
                      <button 
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className={styles.qtyBtn}
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
                    className={styles.checkoutBtn}
                  >
                    PROCEED TO CHECKOUT
                  </button>
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
