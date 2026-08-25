"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import Image from "next/image";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { useApp } from "@/context/AppContext";
import styles from "./CategoryProductsPage.module.css";

// Sample datasets for TUQO / Category pages
const INITIAL_DOMESTIC = [
  { id: "dom-1", title: "TUQO Cordless High Pressure Washer CDW400", price: 6299, imageUrl: "/images/products/cdw400.jpg", rating: 5, ratingCount: 241 },
  { id: "dom-2", title: "TUQO High Pressure Washer HW1200", price: 3999, imageUrl: "/images/products/hw2000.jpg", rating: 5, ratingCount: 780 },
  { id: "dom-3", title: "TUQO High Pressure Washer HW2000 / 140 Bar", price: 4999, imageUrl: "/images/products/hw2000.jpg", rating: 4, ratingCount: 605 },
  { id: "dom-4", title: "TUQO Heavy Duty High Pressure Washer 2200W", price: 5999, imageUrl: "/images/products/cdw400.jpg", rating: 4, ratingCount: 420 },
  { id: "dom-5", title: "TUQO High Pressure Washer 1500W Portable", price: 6100, imageUrl: "/images/products/hw2000.jpg", rating: 5, ratingCount: 241 },
  { id: "dom-6", title: "TUQO High Pressure Washer 1200W Classic", price: 3999, imageUrl: "/images/products/hw2000.jpg", rating: 5, ratingCount: 780 },
  { id: "dom-7", title: "TUQO High Pressure Washer 1800W Advanced", price: 4999, imageUrl: "/images/products/cdw400.jpg", rating: 4, ratingCount: 605 },
  { id: "dom-8", title: "TUQO Cordless High Pressure Washer 24V", price: 5999, imageUrl: "/images/products/cdw400.jpg", rating: 4, ratingCount: 420 },
];

const INITIAL_COMMERCIAL = [
  { id: "com-1", title: "TUQO Commercial Pressure Washer 2800 PSI", price: 12500, imageUrl: "/images/products/compressor.jpg", rating: 5, ratingCount: 241 },
  { id: "com-2", title: "TUQO Industrial Pressure Washer 3000 PSI", price: 14999, imageUrl: "/images/products/compressor.jpg", rating: 5, ratingCount: 780 },
  { id: "com-3", title: "TUQO Heavy Duty Commercial Washer 150 Bar", price: 18500, imageUrl: "/images/products/compressor.jpg", rating: 4, ratingCount: 605 },
  { id: "com-4", title: "TUQO High Flow Commercial Pressure Washer 4000", price: 22000, imageUrl: "/images/products/compressor.jpg", rating: 4, ratingCount: 420 },
  { id: "com-5", title: "TUQO Commercial Pressure Washer 15HP Gas", price: 28999, imageUrl: "/images/products/compressor.jpg", rating: 5, ratingCount: 241 },
  { id: "com-6", title: "TUQO Mobile Gas-Powered Commercial Washer", price: 24500, imageUrl: "/images/products/compressor.jpg", rating: 5, ratingCount: 780 },
  { id: "com-7", title: "TUQO Professional Commercial Cleaner 3.0 GPM", price: 19999, imageUrl: "/images/products/compressor.jpg", rating: 4, ratingCount: 605 },
  { id: "com-8", title: "TUQO Heavy Duty Skid Mounted Pressure Washer", price: 32000, imageUrl: "/images/products/compressor.jpg", rating: 4, ratingCount: 420 },
];

const ACCESSORIES = [
  { id: "acc-1", title: "Brass Coupler Connector Fitting Quick Join", price: 499, imageUrl: "/images/products/nozzle_tips.jpg", rating: 5, ratingCount: 241 },
  { id: "acc-2", title: "TUQO Premium 4Pcs Spray Nozzle Set", price: 899, imageUrl: "/images/products/nozzle_tips.jpg", rating: 5, ratingCount: 780 },
  { id: "acc-3", title: "Heavy Duty Brass Adapter Coupling Male/Female", price: 650, imageUrl: "/images/products/trigger_gun.jpg", rating: 4, ratingCount: 605 },
  { id: "acc-4", title: "Universal Red Adapter Quick Release Fitting", price: 399, imageUrl: "/images/products/trigger_gun.jpg", rating: 4, ratingCount: 420 },
  { id: "acc-5", title: "High Pressure Washer Water Hose 5 Meters", price: 1200, imageUrl: "/images/products/hw2000.jpg", rating: 5, ratingCount: 241 }
];

type PageProps = {
  params: Promise<{ brand: string; category: string }>;
};

export default function CategoryProductsPage({ params }: PageProps) {
  const { brand, category } = use(params);
  const { addToCart, toggleWishlist, isInWishlist } = useApp();

  // States
  const [filterPrice, setFilterPrice] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const formatTitle = (slug: string) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const brandName = brand.toUpperCase();
  const categoryName = formatTitle(category);

  // Helper to render stars
  const renderStars = (rating: number) => {
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            className={styles.starIcon}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={s <= rating ? "#ffd300" : "#d1d5db"}
            stroke={s <= rating ? "#ffd300" : "#d1d5db"}
            strokeWidth="1"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        ))}
      </div>
    );
  };

  // Filter & Sort Logic for Domestic
  const processedDomestic = useMemo(() => {
    let result = [...INITIAL_DOMESTIC];

    if (filterPrice === "under5k") {
      result = result.filter((p) => p.price < 5000);
    } else if (filterPrice === "above5k") {
      result = result.filter((p) => p.price >= 5000);
    }

    if (sortBy === "priceLowHigh") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceHighLow") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [filterPrice, sortBy]);

  // Filter & Sort Logic for Commercial
  const processedCommercial = useMemo(() => {
    let result = [...INITIAL_COMMERCIAL];

    if (filterPrice === "under15k") {
      result = result.filter((p) => p.price < 15000);
    } else if (filterPrice === "above15k") {
      result = result.filter((p) => p.price >= 15000);
    }

    if (sortBy === "priceLowHigh") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceHighLow") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [filterPrice, sortBy]);

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
              <Link href={`/shop/${brand.toLowerCase()}`}>{brandName}</Link>
              <span className={styles.separator}>/</span>
              <span className={styles.activeBrand}>CATEGORIES</span>
              <span className={styles.separator}>/</span>
              <span>{categoryName}</span>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Dashboard Premium Filter controls row */}
          <div className={styles.filterBar}>
            <div className={styles.resultsCount}>
              Showing {processedDomestic.length + processedCommercial.length} Products for {categoryName}
            </div>
            
            <div className={styles.controls}>
              <div className={styles.selectWrapper}>
                <label htmlFor="price-filter" className="sr-only">Filter by Price</label>
                <select 
                  id="price-filter"
                  value={filterPrice} 
                  onChange={(e) => setFilterPrice(e.target.value)}
                  className={styles.select}
                >
                  <option value="all">Filter: All Prices</option>
                  <option value="under5k">Under Rs. 5,000</option>
                  <option value="above5k">Rs. 5,000 & Above</option>
                </select>
              </div>
              
              <div className={styles.selectWrapper}>
                <label htmlFor="sort-select" className="sr-only">Sort by</label>
                <select 
                  id="sort-select"
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.select}
                >
                  <option value="default">Sort: Default</option>
                  <option value="priceLowHigh">Price: Low to High</option>
                  <option value="priceHighLow">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 1: Domestic Products */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.titleTab}>
                <h2 className={styles.titleText}>DOMESTIC {categoryName.toUpperCase()}</h2>
              </div>
              <div className={styles.headerLine}></div>
            </div>

            <div className={styles.grid}>
              {processedDomestic.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  <Link href={`/product/${product.id}`} className={styles.imageLink}>
                    <div className={styles.imageContainer}>
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        width={220}
                        height={165}
                        className={styles.image}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  </Link>
                  <div className={styles.cardDetails}>
                    <Link href={`/product/${product.id}`} className={styles.titleLink}>
                      <h3 className={styles.productTitle} title={product.title}>
                        {product.title}
                      </h3>
                    </Link>

                    {/* Ratings row */}
                    <div className={styles.ratingRow}>
                      {renderStars(product.rating)}
                      <span className={styles.reviewsCount}>{product.ratingCount} Reviews</span>
                    </div>

                    <span className={styles.price}>Rs. {product.price.toLocaleString("en-IN")}.00</span>
                    <div className={styles.actionRow}>
                      <button 
                        onClick={() => addToCart({ id: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl })} 
                        className={styles.cartButton}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span>Add To Cart</span>
                      </button>
                      <button 
                        onClick={() => toggleWishlist({ id: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl })} 
                        className={`${styles.favouriteButton} ${isInWishlist(product.id) ? styles.favActive : ""}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? "#132c66" : "none"} stroke="#132c66" strokeWidth="2.5">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Commercial Products */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.titleTab}>
                <h2 className={styles.titleText}>COMMERICAL {categoryName.toUpperCase()}</h2>
              </div>
              <div className={styles.headerLine}></div>
            </div>

            <div className={styles.grid}>
              {processedCommercial.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  <Link href={`/product/${product.id}`} className={styles.imageLink}>
                    <div className={styles.imageContainer}>
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        width={220}
                        height={165}
                        className={styles.image}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  </Link>
                  <div className={styles.cardDetails}>
                    <Link href={`/product/${product.id}`} className={styles.titleLink}>
                      <h3 className={styles.productTitle} title={product.title}>
                        {product.title}
                      </h3>
                    </Link>

                    {/* Ratings row */}
                    <div className={styles.ratingRow}>
                      {renderStars(product.rating)}
                      <span className={styles.reviewsCount}>{product.ratingCount} Reviews</span>
                    </div>

                    <span className={styles.price}>Rs. {product.price.toLocaleString("en-IN")}.00</span>
                    <div className={styles.actionRow}>
                      <button 
                        onClick={() => addToCart({ id: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl })} 
                        className={styles.cartButton}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span>Add To Cart</span>
                      </button>
                      <button 
                        onClick={() => toggleWishlist({ id: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl })} 
                        className={`${styles.favouriteButton} ${isInWishlist(product.id) ? styles.favActive : ""}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? "#132c66" : "none"} stroke="#132c66" strokeWidth="2.5">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Accessories & Spares */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.titleTab}>
                <h2 className={styles.titleText}>ACCESSORIES & SPARES</h2>
              </div>
              <div className={styles.headerLine}></div>
            </div>

            <div className={styles.gridAccessories}>
              {ACCESSORIES.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  <Link href={`/product/${product.id}`} className={styles.imageLink}>
                    <div className={styles.imageContainer}>
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        width={220}
                        height={165}
                        className={styles.image}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  </Link>
                  <div className={styles.cardDetails}>
                    <Link href={`/product/${product.id}`} className={styles.titleLink}>
                      <h3 className={styles.productTitle} title={product.title}>
                        {product.title}
                      </h3>
                    </Link>

                    {/* Ratings row */}
                    <div className={styles.ratingRow}>
                      {renderStars(product.rating)}
                      <span className={styles.reviewsCount}>{product.ratingCount} Reviews</span>
                    </div>

                    <span className={styles.price}>Rs. {product.price.toLocaleString("en-IN")}.00</span>
                    <div className={styles.actionRow}>
                      <button 
                        onClick={() => addToCart({ id: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl })} 
                        className={styles.cartButton}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span>Add To Cart</span>
                      </button>
                      <button 
                        onClick={() => toggleWishlist({ id: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl })} 
                        className={`${styles.favouriteButton} ${isInWishlist(product.id) ? styles.favActive : ""}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? "#132c66" : "none"} stroke="#132c66" strokeWidth="2.5">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
