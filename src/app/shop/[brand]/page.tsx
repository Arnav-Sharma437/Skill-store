import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { BRAND_CATEGORIES } from "@/data/home";
import { optimizeProductCard } from "@/lib/imageOptimization";
import { connectToDatabase } from "@/lib/db";
import { Brand, Category } from "@/lib/schemas";
import styles from "./BrandPage.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ brand: string }>;
};

export default async function BrandPage({ params }: PageProps) {
  const { brand } = await params;
  const normalizedBrand = brand.toLowerCase();

  let brandName = normalizedBrand.toUpperCase();
  let categoriesList: Array<{ id: string; name: string; link: string; imageUrl: string }> = [];

  try {
    await connectToDatabase();
    
    // Check Brand document
    const brandDoc = await Brand.findOne({ id: normalizedBrand }).lean();
    if (brandDoc && (brandDoc as { name?: string }).name) {
      brandName = (brandDoc as { name: string }).name;
    } else if (BRAND_CATEGORIES[normalizedBrand]) {
      brandName = BRAND_CATEGORIES[normalizedBrand].name;
    }

    // Fetch DB categories for this brand
    const dbCategories = await Category.find({ brand: normalizedBrand }).lean();

    if (dbCategories && dbCategories.length > 0) {
      categoriesList = dbCategories.map((c) => ({
        id: (c as { id: string }).id,
        name: (c as { name: string }).name,
        link: (c as { link?: string; id: string }).link || `/category/${(c as { id: string }).id}`,
        imageUrl: (c as { imageUrl: string }).imageUrl,
      }));
    } else if (BRAND_CATEGORIES[normalizedBrand]) {
      categoriesList = BRAND_CATEGORIES[normalizedBrand].categories;
    } else if (!brandDoc) {
      notFound();
    }
  } catch (error) {
    console.error("Error loading brand page data:", error);
    if (BRAND_CATEGORIES[normalizedBrand]) {
      brandName = BRAND_CATEGORIES[normalizedBrand].name;
      categoriesList = BRAND_CATEGORIES[normalizedBrand].categories;
    } else {
      notFound();
    }
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      
      <main className={styles.main}>
        {/* Sky Blue Breadcrumb Bar */}
        <div className={styles.breadcrumbBar}>
          <div className="container">
            <div className={styles.breadcrumbContent}>
              <Link href="/">HOME</Link>
              <span className={styles.separator}>/</span>
              <span className={styles.activeBrand}>{brandName.toUpperCase()}</span>
              <span className={styles.separator}>/</span>
              <span>CATEGORY</span>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Main Title Section */}
          <div className={styles.titleContainer}>
            <span className={styles.subtitle}>EXPLORE THE RANGE</span>
            <h1 className={styles.title}>CATEGORIES</h1>
            <div className={styles.titleUnderline}></div>
          </div>

          {/* Premium Categories Grid */}
          {categoriesList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              <p style={{ fontSize: "1.1rem", marginBottom: "16px" }}>No categories available for {brandName} at the moment.</p>
              <Link href="/shop" style={{ color: "#0284c7", fontWeight: 600, textDecoration: "underline" }}>
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {categoriesList.map((category) => (
                <Link 
                  href={category.link} 
                  key={category.id} 
                  className={styles.categoryCard}
                >
                  <div className={styles.imageContainer}>
                    <Image
                      src={optimizeProductCard(category.imageUrl)}
                      alt={category.name}
                      width={180}
                      height={180}
                      loading="lazy"
                      className={styles.image}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  <div className={styles.arrowLink}>
                    <span>EXPLORE</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
