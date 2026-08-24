"use client";

import React from "react";
import styles from "./BestSellerSection.module.css";
import ProductCard from "./ProductCard";
import { BEST_SELLERS } from "@/data/home";

export default function BestSellerSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        {/* Section Heading */}
        <div className={styles.headingContainer}>
          <span className={styles.tag}>CURATED SKILLS</span>
          <h2 className={styles.title}>Best Seller Courses</h2>
          <div className={styles.line}></div>
          <p className={styles.subtitle}>
            Explore our most popular and highest-rated technical masterclasses, chosen by thousands of learners.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className={styles.grid}>
          {BEST_SELLERS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
