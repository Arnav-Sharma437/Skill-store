import React from "react";
import Link from "next/link";
import Image from "next/image";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { CATEGORIES_DATA } from "@/data/categories";
import styles from "./CategoriesPage.module.css";

export const metadata = {
  title: "Shop By Categories - Skill Store",
  description: "Browse our complete range of high pressure washers, vacuum cleaners, air compressors, power tools, and accessories.",
};

export default function CategoriesPage() {
  const primaryCategorySlugs = [
    "high-pressure-washer",
    "vaccum-cleaner",
    "autocare-detailing",
    "accessories-spares",
    "air-compressor",
    "cordless-tools"
  ];
  const categoriesList = primaryCategorySlugs
    .map((slug) => CATEGORIES_DATA[slug])
    .filter(Boolean);

  // Helper images for top categories
  const getCategoryImage = (slug: string) => {
    switch (slug) {
      case "high-pressure-washer":
      case "domestic-pressure-washer":
        return "/images/products/cdw400.jpg";
      case "professional-pressure-washer":
      case "air-compressor":
      case "oil-free-compressor":
      case "oil-type-compressor":
        return "/images/products/compressor.jpg";
      case "vaccum-cleaner":
        return "/images/products/cdw400.jpg";
      case "autocare-detailing":
      case "accessories-spares":
        return "/images/products/trigger_gun.jpg";
      case "cordless-tools":
      case "power-tools":
        return "/images/products/hw2000.jpg";
      case "hand-tools":
        return "/images/products/nozzle_tips.jpg";
      default:
        return "/images/products/hw2000.jpg";
    }
  };

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className={styles.main}>
        {/* Sky Blue Breadcrumb Strip */}
        <div className={styles.breadcrumbBar}>
          <div className="container">
            <div className={styles.breadcrumbContent}>
              <Link href="/">HOME</Link>
              <span className={styles.separator}>/</span>
              <span className={styles.activeCrumb}>SHOP BY CATEGORIES</span>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Header Title */}
          <div className={styles.headerBlock}>
            <span className={styles.subtitle}>COMPLETE PRODUCT DIRECTORY</span>
            <h1 className={styles.title}>SHOP BY CATEGORIES</h1>
            <div className={styles.titleUnderline}></div>
          </div>

          {/* Categories Grid */}
          <div className={styles.categoriesGrid}>
            {categoriesList.map((cat) => (
              <Link href={`/category/${cat.slug}`} key={cat.slug} className={styles.categoryCard}>
                <div className={styles.cardTop}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={getCategoryImage(cat.slug)}
                      alt={cat.name}
                      width={70}
                      height={70}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <div className={styles.cardMeta}>
                    <h2 className={styles.categoryName}>{cat.name}</h2>
                    <span className={styles.productCount}>{cat.products.length} Products</span>
                  </div>
                </div>

                <p className={styles.categoryDesc}>{cat.description}</p>

                {cat.subCategories && cat.subCategories.length > 0 && (
                  <div className={styles.subCatLinks}>
                    {cat.subCategories.map((sub) => (
                      <span key={sub.slug} className={styles.subCatTag}>
                        {sub.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className={styles.exploreBtn}>
                  <span>Explore Range</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
