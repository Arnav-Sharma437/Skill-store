"use client";

import React, { useState } from "react";
import styles from "./BestSellerSection.module.css";
import ProductCard from "./ProductCard";
import { BEST_SELLERS } from "@/data/home";

export default function BestSellerSection() {
  const [products, setProducts] = useState(BEST_SELLERS);
  const [offset, setOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setOffset(-265); // Slide left by one card width (245px) + gap (20px)
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setOffset(265); // Slide right by one card width + gap
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (offset < 0) {
      // Next: shift first product to the end
      setProducts((prev) => [...prev.slice(1), prev[0]]);
    } else if (offset > 0) {
      // Prev: shift last product to the front
      setProducts((prev) => [prev[prev.length - 1], ...prev.slice(0, prev.length - 1)]);
    }
    setOffset(0); // Reset translation offset instantly
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

        {/* Product Cards Row with Seamless Transition */}
        <div className={styles.scrollContainer}>
          <div 
            className={styles.productRow}
            style={{ 
              transform: `translateX(${offset}px)`,
              transition: isTransitioning ? "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)" : "none"
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
