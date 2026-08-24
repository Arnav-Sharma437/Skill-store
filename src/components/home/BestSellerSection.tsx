"use client";

import React, { useState } from "react";
import styles from "./BestSellerSection.module.css";
import ProductCard from "./ProductCard";
import { BEST_SELLERS } from "@/data/home";

export default function BestSellerSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalItems = BEST_SELLERS.length;
  
  // We allow sliding up to the point where the last items are visible.
  // On desktop (1400px container), all 5 fit, but on smaller screens we slide.
  // Let's slide 1 card at a time up to index = totalItems - 1.
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
  };

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Section Header Row */}
        <div className={styles.headerRow}>
          {/* Angled Section Tab */}
          <div className={styles.titleTab}>
            <h2 className={styles.title}>BEST SELLER PRODUCTS</h2>
          </div>
          {/* Bottom underline of the tab row */}
          <div className={styles.headerLine}></div>
          {/* Carousel Arrows */}
          <div className={styles.arrows}>
            <button onClick={handlePrev} className={styles.arrowBtn} aria-label="Scroll left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button onClick={handleNext} className={styles.arrowBtn} aria-label="Scroll right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Product Cards Row with CSS Transition */}
        <div className={styles.scrollContainer}>
          <div 
            className={styles.productRow}
            style={{ 
              transform: `translateX(-${currentIndex * 265}px)`,
              transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
            }}
          >
            {BEST_SELLERS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
