"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./BestSellerSection.module.css";
import ProductCard from "./ProductCard";
import { Product } from "@/data/home";

const DEFAULT_BEST_SELLERS: Product[] = [
  {
    id: "hpw-1",
    title: "TUQO Cordless High Pressure Washer CDW400 / 24V Lithium",
    price: 6299,
    originalPrice: 8299,
    imageUrl: "/images/products/cdw400.jpg",
    rating: 5,
    ratingCount: 320,
  },
  {
    id: "hpw-2",
    title: "TUQO High Pressure Washer HW2000 / 140 Bar Induction Motor",
    price: 4999,
    originalPrice: 6999,
    imageUrl: "/images/products/hw2000.jpg",
    rating: 5,
    ratingCount: 450,
  },
  {
    id: "pmp-1",
    title: "PUMPKIN Heavy Duty Angle Grinder 850W",
    price: 2499,
    originalPrice: 3499,
    imageUrl: "/images/products/hw2000.jpg",
    rating: 5,
    ratingCount: 180,
  },
  {
    id: "msk-1",
    title: "MITSUKI Rotary Hammer Drill 26mm",
    price: 3999,
    originalPrice: 5499,
    imageUrl: "/images/products/cdw400.jpg",
    rating: 5,
    ratingCount: 210,
  },
];

export default function BestSellerSection() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_BEST_SELLERS);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadBestSellers() {
      try {
        const res = await fetch("/api/products?bestSeller=true&limit=12");
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
      } catch (err) {
        console.error("Failed to load best seller products:", err);
      }
    }
    loadBestSellers();
    return () => {
      isMounted = false;
    };
  }, []);

  if (products.length === 0) {
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

          {/* Navigation Arrows for Slider */}
          {products.length > 0 && (
            <div className={styles.navButtons}>
              <button
                className={styles.arrowBtn}
                onClick={() => scrollSlider("left")}
                aria-label="Scroll left"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button
                className={styles.arrowBtn}
                onClick={() => scrollSlider("right")}
                aria-label="Scroll right"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Display static grid on desktop / slider with arrows on mobile if < 5 products, else continuous marquee */}
        {products.length > 0 && (
          products.length < 5 ? (
            <div className={styles.productSliderContainer}>
              <div className={styles.productGrid} ref={sliderRef}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.marqueeContainer} ref={sliderRef}>
              <div className={styles.marqueeTrack}>
                {/* 4 Duplicated list copies for 100% gapless infinite loop */}
                {[1, 2, 3, 4].map((copyIndex) => (
                  <div key={copyIndex} className={styles.productRow} aria-hidden={copyIndex > 1 ? "true" : undefined}>
                    {products.map((product) => (
                      <ProductCard key={`${product.id}-copy-${copyIndex}`} product={product} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
