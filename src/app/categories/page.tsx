"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
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
  const [categoriesList, setCategoriesList] = useState<DisplayCategory[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetch("/api/categories?_t=" + Date.now(), { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
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

          setCategoriesList(mapped);
        } else {
          setCategoriesList([]);
        }
      })
      .catch((err) => {
        console.error("Error loading categories:", err);
        setCategoriesList([]);
      })
      .finally(() => {
        setLoading(false);
      });
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

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ display: "inline-block", width: "36px", height: "36px", border: "4px solid #e2e8f0", borderTopColor: "#132c66", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
              <p style={{ marginTop: "12px", color: "#64748b", fontWeight: 600, fontSize: "14px" }}>Loading categories...</p>
            </div>
          ) : categoriesList.length > 0 ? (
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
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <p style={{ color: "#64748b", fontWeight: 600, fontSize: "15px", margin: 0 }}>No categories available yet.</p>
              <Link href="/" style={{ display: "inline-block", marginTop: "16px", background: "#132c66", color: "#ffffff", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, textDecoration: "none", fontSize: "13px" }}>
                Return to Home
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
