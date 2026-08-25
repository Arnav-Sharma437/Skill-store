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
          {/* Main Title */}
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>CATEGORIES</h1>
            <div className={styles.titleUnderline}></div>
          </div>

          {/* Categories Grid */}
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
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
