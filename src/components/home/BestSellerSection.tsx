"use client";

import React, { useState, useEffect } from "react";
import styles from "./BestSellerSection.module.css";
import ProductCard from "./ProductCard";
import { BEST_SELLERS, Product } from "@/data/home";

export default function BestSellerSection() {
  const [products, setProducts] = useState<Product[]>(BEST_SELLERS);

  useEffect(() => {
    let isMounted = true;
    async function loadBestSellers() {
      try {
        const res = await fetch("/api/products?limit=12");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const dbProducts: Product[] = json.data.map((item: {
              id: string;
              title: string;
              price: number;
              originalPrice?: number;
              imageUrl: string;
              rating?: number;
              ratingCount?: number;
            }) => ({
              id: item.id,
              title: item.title,
              price: item.price,
              originalPrice: item.originalPrice || item.price,
              imageUrl: item.imageUrl,
              rating: item.rating || 5,
              ratingCount: item.ratingCount || 0
            }));

            if (isMounted) {
              setProducts(dbProducts);
            }
          }
        }
      } catch {
        // Fallback to initial BEST_SELLERS on network error
      }
    }
    loadBestSellers();
    return () => {
      isMounted = false;
    };
  }, []);

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

        {/* Product Cards Row with Continuous Scrolling Marquee */}
        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeTrack}>
            {/* First list copy */}
            <div className={styles.productRow}>
              {products.map((product) => (
                <ProductCard key={`${product.id}-1`} product={product} />
              ))}
            </div>
            {/* Duplicated list copy for seamless infinite loop */}
            <div className={styles.productRow} aria-hidden="true">
              {products.map((product) => (
                <ProductCard key={`${product.id}-2`} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
