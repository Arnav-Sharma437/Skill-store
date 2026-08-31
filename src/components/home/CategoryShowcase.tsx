"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./CategoryShowcase.module.css";

export default function CategoryShowcase() {
  const topCategories = [
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

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Header Title Row */}
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <span className={styles.subtitle}>EXPLORE THE CATALOG</span>
            <h2 className={styles.title}>SHOP BY CATEGORIES</h2>
          </div>
          <Link href="/categories" className={styles.viewAllLink}>
            <span>View All Categories</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        {/* Category Continuous Scrolling Marquee Track (Leftwards) */}
        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeTrack}>
            {/* First copy */}
            <div className={styles.categoryRow}>
              {topCategories.map((cat) => (
                <Link href={`/category/${cat.slug}`} key={`${cat.slug}-1`} className={styles.card}>
                  <div className={styles.imageBox}>
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      width={140}
                      height={120}
                      className={styles.image}
                      style={{ objectFit: "contain" }}
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
                      src={cat.imageUrl}
                      alt={cat.name}
                      width={140}
                      height={120}
                      className={styles.image}
                      style={{ objectFit: "contain" }}
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
      </div>
    </section>
  );
}
