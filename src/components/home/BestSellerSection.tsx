"use client";

import React, { useState, useEffect } from "react";
import styles from "./BestSellerSection.module.css";
import ProductCard from "./ProductCard";
import { Product } from "@/data/home";

export default function BestSellerSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadBestSellers() {
      try {
        const res = await fetch("/api/products?bestSeller=true&limit=12");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
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
      } catch (err) {
        console.error("Failed to load best seller products:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadBestSellers();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && products.length === 0) {
    return null;
  }

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
        {products.length > 0 && (
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
        )}
      </div>
    </section>
  );
}
