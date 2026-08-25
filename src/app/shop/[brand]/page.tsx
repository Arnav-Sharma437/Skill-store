import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { BRAND_CATEGORIES } from "@/data/home";
import styles from "./BrandPage.module.css";

type PageProps = {
  params: Promise<{ brand: string }>;
};

export default async function BrandPage({ params }: PageProps) {
  const { brand } = await params;
  const brandData = BRAND_CATEGORIES[brand.toLowerCase()];

  if (!brandData) {
    notFound();
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
              <span className={styles.activeBrand}>{brandData.name.toUpperCase()}</span>
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
          <div className={styles.grid}>
            {brandData.categories.map((category) => (
              <Link 
                href={category.link} 
                key={category.id} 
                className={styles.categoryCard}
              >
                <div className={styles.imageContainer}>
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    width={180}
                    height={180}
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
        </div>
      </main>

      <Footer />
    </>
  );
}
