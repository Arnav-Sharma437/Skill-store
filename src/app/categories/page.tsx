"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { CATEGORIES_DATA } from "@/data/categories";
import { optimizeGalleryThumbnail } from "@/lib/imageOptimization";
import styles from "./CategoriesPage.module.css";

interface DisplaySubCategory {
  name: string;
  slug: string;
}

interface DisplayCategory {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  productCount: number;
  subCategories?: DisplaySubCategory[];
}

export default function CategoriesPage() {
  const primaryCategorySlugs = [
    "high-pressure-washer",
    "vaccum-cleaner",
    "autocare-detailing",
    "accessories-spares",
    "air-compressor",
    "cordless-tools"
  ];

  const defaultList: DisplayCategory[] = primaryCategorySlugs
    .map((slug) => {
      const staticCat = CATEGORIES_DATA[slug];
      if (!staticCat) return null;
      return {
        slug: staticCat.slug,
        name: staticCat.name,
        description: staticCat.description,
        imageUrl: getCategoryImage(staticCat.slug),
        productCount: staticCat.products.length,
        subCategories: staticCat.subCategories || []
      };
    })
    .filter(Boolean) as DisplayCategory[];

  const [categoriesList, setCategoriesList] = useState<DisplayCategory[]>(defaultList);

  // Helper images for top categories
  function getCategoryImage(slug: string, fallbackImg?: string) {
    if (fallbackImg && fallbackImg.startsWith("http")) return fallbackImg;
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
        return fallbackImg || "/images/products/hw2000.jpg";
    }
  }

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          const mapped: DisplayCategory[] = data.categories.map((c: {
            id?: string;
            slug?: string;
            name?: string;
            description?: string;
            imageUrl?: string;
            image?: string;
            productCount?: number;
            subcategories?: Array<{ id: string; name: string }>;
            subCategories?: Array<{ slug: string; name: string }>;
          }) => {
            const rawSubcats = c.subcategories || c.subCategories || [];
            const subCategories: DisplaySubCategory[] = rawSubcats.map((s) => ({
              slug: (s as { id?: string; slug?: string }).id || (s as { slug?: string }).slug || "",
              name: s.name || ""
            }));

            const slug = c.slug || c.id || "";
            return {
              slug,
              name: c.name || slug,
              description: c.description || `Explore our high-quality range of ${c.name || slug}.`,
              imageUrl: getCategoryImage(slug, c.imageUrl || c.image),
              productCount: c.productCount !== undefined ? c.productCount : 0,
              subCategories
            };
          });

          if (mapped.length > 0) {
            setCategoriesList(mapped);
          }
        }
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

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
                      src={optimizeGalleryThumbnail(cat.imageUrl)}
                      alt={cat.name}
                      width={70}
                      height={70}
                      loading="lazy"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <div className={styles.cardMeta}>
                    <h2 className={styles.categoryName}>{cat.name}</h2>
                    <span className={styles.productCount}>{cat.productCount} Products</span>
                  </div>
                </div>

                <p className={styles.categoryDesc}>{cat.description}</p>

                {cat.subCategories && cat.subCategories.length > 0 && (
                  <div className={styles.subCatLinks}>
                    {cat.subCategories.map((sub) => (
                      <span key={sub.slug || sub.name} className={styles.subCatTag}>
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
