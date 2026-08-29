import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./BrandShowcase.module.css";

export default function BrandShowcase() {
  const brands = [
    {
      slug: "tuqo",
      name: "TUQO",
      logo: "/images/brands/tuqo.png",
      tagline: "High Pressure Washers, Compressors & Cordless Systems",
      width: 110,
      height: 34
    },
    {
      slug: "pumpkin",
      name: "PUMPKIN",
      logo: "/images/brands/pumpkin.png",
      tagline: "Heavy-Duty Power Tools, Spares & Garden Equipment",
      width: 120,
      height: 34
    },
    {
      slug: "mitsuki",
      name: "MITSUKI",
      logo: "/images/brands/mitsuki.png",
      tagline: "Precision Washers, Cutting Tools & Workshop Machines",
      width: 110,
      height: 32
    },
    {
      slug: "metso",
      name: "METSO",
      logo: "/images/brands/metso.png",
      tagline: "Unleash Your Power with Hand Tools & Garage Systems",
      width: 110,
      height: 34
    },
    {
      slug: "costec",
      name: "COSTEC",
      logo: "/images/brands/costec.png",
      tagline: "Smart MagSafe Accessories, Chargers & Workshop Fans",
      width: 110,
      height: 32
    }
  ];

  const marqueeText = [
    "AUTHORIZED BRAND DISTRIBUTOR",
    "100% ORIGINAL SPARE PARTS",
    "DIRECT MANUFACTURER WARRANTY",
    "PAN-INDIA EXPRESS DELIVERY",
    "COIMBATORE WAREHOUSE HUB",
    "CERTIFIED MACHINERY QUALITY"
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Header */}
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <span className={styles.subtitle}>OFFICIAL PARTNERS</span>
            <h2 className={styles.title}>SHOP BY BRANDS</h2>
          </div>
        </div>

        {/* Brand Showcase Cards Grid */}
        <div className={styles.brandsGrid}>
          {brands.map((brand) => (
            <Link href={`/shop/${brand.slug}`} key={brand.slug} className={styles.brandCard}>
              <div className={styles.logoContainer}>
                <Image
                  src={brand.logo}
                  alt={`${brand.name} Logo`}
                  width={brand.width}
                  height={brand.height}
                  className={styles.brandLogo}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <p className={styles.tagline}>{brand.tagline}</p>
              <div className={styles.shopBrandBtn}>
                <span>Shop {brand.name}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Animated Brand Trust Marquee Bar */}
        <div className={styles.marqueeWrapper}>
          <div className={styles.marqueeTrack}>
            <div className={styles.marqueeList}>
              {marqueeText.map((text, i) => (
                <div key={i} className={styles.marqueeItem}>
                  <span>{text}</span>
                  <span className={styles.marqueeDot}></span>
                </div>
              ))}
            </div>
            <div className={styles.marqueeList} aria-hidden="true">
              {marqueeText.map((text, i) => (
                <div key={`dup-${i}`} className={styles.marqueeItem}>
                  <span>{text}</span>
                  <span className={styles.marqueeDot}></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
