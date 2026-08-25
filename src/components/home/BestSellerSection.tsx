"use client";

import React from "react";
import styles from "./BestSellerSection.module.css";
import ProductCard from "./ProductCard";
import { BEST_SELLERS } from "@/data/home";

export default function BestSellerSection() {
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
        </div>
      </div>

      {/* Product Cards Row with Continuous Scrolling Marquee */}
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack}>
          {/* First list copy */}
          <div className={styles.productRow}>
            {BEST_SELLERS.map((product) => (
              <ProductCard key={`${product.id}-1`} product={product} />
            ))}
          </div>
          {/* Duplicated list copy for seamless infinite loop */}
          <div className={styles.productRow}>
            {BEST_SELLERS.map((product) => (
              <ProductCard key={`${product.id}-2`} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
