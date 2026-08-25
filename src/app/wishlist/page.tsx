"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { useApp } from "@/context/AppContext";
import styles from "./WishlistPage.module.css";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useApp();

  const handleMoveToCart = (item: { id: string; title: string; price: number; imageUrl: string }) => {
    addToCart(item, 1);
    toggleWishlist(item); // Remove from wishlist once moved to cart
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
              <span>WISHLIST</span>
            </div>
          </div>
        </div>

        <div className="container">
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>YOUR WISHLIST</h1>
            <div className={styles.titleUnderline}></div>
          </div>

          {wishlist.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconContainer}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h2 className={styles.emptyHeading}>Your Wishlist is Empty</h2>
              <p className={styles.emptyText}>Add some premium products to wishlist to track them here!</p>
              <Link href="/" className={styles.continueShoppingBtn}>
                CONTINUE SHOPPING
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {wishlist.map((item) => (
                <div key={item.id} className={styles.productCard}>
                  <Link href={`/product/${item.id}`} className={styles.imageLink}>
                    <div className={styles.imageContainer}>
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width={220}
                        height={165}
                        className={styles.image}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  </Link>

                  <div className={styles.cardDetails}>
                    <Link href={`/product/${item.id}`} className={styles.titleLink}>
                      <h3 className={styles.productTitle} title={item.title}>
                        {item.title}
                      </h3>
                    </Link>
                    
                    <span className={styles.price}>Rs. {item.price.toLocaleString("en-IN")}.00</span>
                    
                    <div className={styles.actionRow}>
                      <button 
                        onClick={() => handleMoveToCart(item)}
                        className={styles.cartButton}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span>Move To Cart</span>
                      </button>
                      
                      <button 
                        onClick={() => toggleWishlist(item)}
                        className={styles.removeBtn}
                        aria-label="Remove from wishlist"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
