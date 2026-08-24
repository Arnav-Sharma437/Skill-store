"use client";

import React, { useState } from "react";
import styles from "./BestSellerSection.module.css";
import ProductCard from "./ProductCard";
import { BEST_SELLERS } from "@/data/home";

export default function BestSellerSection() {
  const [products, setProducts] = useState(BEST_SELLERS);

  const scrollLeft = () => {
    // Shift elements to the right (move last to first)
    setProducts((prev) => [prev[prev.length - 1], ...prev.slice(0, prev.length - 1)]);
  };

  const scrollRight = () => {
    // Shift elements to the left (move first to last)
    setProducts((prev) => [...prev.slice(1), prev[0]]);
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
            <button onClick={scrollLeft} className={styles.arrowBtn} aria-label="Scroll left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button onClick={scrollRight} className={styles.arrowBtn} aria-label="Scroll right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Product Cards Row */}
        <div className={styles.scrollContainer}>
          <div className={styles.productRow}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
