"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { optimizeProductCard } from "@/lib/imageOptimization";
import styles from "./CategoryShowcase.module.css";

interface CategoryItem {
  slug: string;
  name: string;
  count?: string;
  imageUrl?: string;
  badge?: string;
}

const defaultCategories: CategoryItem[] = [
  {
    slug: "high-pressure-washer",
    name: "High Pressure Washers",
    count: "12+ Models",
    imageUrl: "/images/products/hw2000.jpg",
    badge: "Best Seller"
  },
  {
    slug: "cordless-tools",
    name: "Cordless Tools & Drills",
    count: "8+ Models",
    imageUrl: "/images/products/cdw400.jpg",
    badge: "Wireless Power"
  },
  {
    slug: "air-compressor",
    name: "Air Compressors",
    count: "6+ Models",
    imageUrl: "/images/products/compressor.jpg",
    badge: "Silent & Direct"
  },
  {
    slug: "accessories-spares",
    name: "Accessories & Spares",
    count: "25+ Items",
    imageUrl: "/images/products/nozzle_tips.jpg",
    badge: "Genuine Brass"
  },
  {
    slug: "vaccum-cleaner",
    name: "Vacuum Cleaners",
    count: "5+ Models",
    imageUrl: "/images/products/cdw400.jpg",
    badge: "Wet & Dry"
  },
  {
    slug: "autocare-detailing",
    name: "Autocare & Detailing",
    count: "10+ Items",
    imageUrl: "/images/products/trigger_gun.jpg",
    badge: "Pro Finish"
  },
  {
    slug: "power-tools",
    name: "Heavy Power Tools",
    count: "14+ Tools",
    imageUrl: "/images/products/hw2000.jpg",
    badge: "High Torque"
  },
  {
    slug: "hand-tools",
    name: "Precision Hand Tools",
    count: "18+ Sets",
    imageUrl: "/images/products/nozzle_tips.jpg",
    badge: "CR-V Steel"
  }
];

interface ApiCategory {
  slug?: string;
  id?: string;
  name?: string;
  productCount?: number;
  image?: string;
  imageUrl?: string;
}

export default function CategoryShowcase() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -220 : 220;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    fetch("/api/categories?_t=" + Date.now(), { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { success?: boolean; categories?: ApiCategory[] }) => {
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          const mapped: CategoryItem[] = data.categories.map((c) => ({
            slug: c.slug || c.id || "",
            name: c.name || "",
            count: c.productCount !== undefined ? `${c.productCount} Products` : "Featured",
            imageUrl: c.imageUrl || c.image || "/images/products/hw2000.jpg",
            badge: "Genuine"
          }));
          setCategories(mapped);
        }
      })
      .catch((err) => console.error("Error loading categories:", err))
      .finally(() => setIsLoaded(true));
  }, []);

  if (!isLoaded || categories.length === 0) {
    return null;
  }

  const topCategories = categories;

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Header Title Row */}
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <span className={styles.subtitle}>EXPLORE THE CATALOG</span>
            <h2 className={styles.title}>SHOP BY CATEGORIES</h2>
          </div>
          <div className={styles.headerActions}>
            <Link href="/categories" className={styles.viewAllLink}>
              <span>View All Categories</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            {/* Navigation Arrows for Mobile Slider (< 5 categories) */}
            {topCategories.length < 5 && (
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
        </div>

        {/* Display static grid on desktop / slider on mobile if < 5 categories, else continuous marquee */}
        {topCategories.length < 5 ? (
          <div className={styles.categoryGrid} ref={sliderRef}>
            {topCategories.map((cat) => (
              <Link href={`/category/${cat.slug}`} key={cat.slug} className={styles.card}>
                <div className={styles.imageBox}>
                  <Image
                    src={optimizeProductCard(cat.imageUrl)}
                    alt={cat.name}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 190px, 220px"
                    className={styles.image}
                  />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.categoryTitle}>{cat.name}</h3>
                  <span className={styles.productCount}>{cat.count}</span>
                  <div className={styles.exploreArrow}>
                    <span>Explore</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.marqueeContainer}>
            <div className={styles.marqueeTrack}>
              {/* First copy */}
              <div className={styles.categoryRow}>
                {topCategories.map((cat) => (
                  <Link href={`/category/${cat.slug}`} key={`${cat.slug}-1`} className={styles.card}>
                    <div className={styles.imageBox}>
                      <Image
                        src={optimizeProductCard(cat.imageUrl)}
                        alt={cat.name}
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 190px, 220px"
                        className={styles.image}
                      />
                    </div>
                    <div className={styles.cardContent}>
                      <h3 className={styles.categoryTitle}>{cat.name}</h3>
                      <span className={styles.productCount}>{cat.count}</span>
                      <div className={styles.exploreArrow}>
                        <span>Explore</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Duplicate copy for infinite seamless loop */}
              <div className={styles.categoryRow} aria-hidden="true">
                {topCategories.map((cat) => (
                  <Link href={`/category/${cat.slug}`} key={`${cat.slug}-2`} className={styles.card}>
                    <div className={styles.imageBox}>
                      <Image
                        src={optimizeProductCard(cat.imageUrl)}
                        alt={cat.name}
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 190px, 220px"
                        className={styles.image}
                      />
                    </div>
                    <div className={styles.cardContent}>
                      <h3 className={styles.categoryTitle}>{cat.name}</h3>
                      <span className={styles.productCount}>{cat.count}</span>
                      <div className={styles.exploreArrow}>
                        <span>Explore</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
