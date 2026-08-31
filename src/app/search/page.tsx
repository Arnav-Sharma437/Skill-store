"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { useApp } from "@/context/AppContext";
import { searchProductsAndCategories } from "@/data/categories";
import styles from "./SearchPage.module.css";

const POPULAR_SEARCHES = [
  "High Pressure Washer",
  "Air Compressor",
  "Cordless Washer",
  "Nozzle Tips",
  "Trigger Gun",
  "Vacuum Cleaner",
  "Power Tools"
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const { addToCart, toggleWishlist, isInWishlist } = useApp();

  const [filterPrice, setFilterPrice] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // Search Results
  const searchResults = useMemo(() => {
    return searchProductsAndCategories(query);
  }, [query]);

  // Star Rating Helper
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

  // Filter and Sort Pipeline
  const filteredProducts = useMemo(() => {
    let list = [...searchResults.products];

    // Filter by Price
    if (filterPrice === "under5k") {
      list = list.filter((p) => p.price < 5000);
    } else if (filterPrice === "5kto15k") {
      list = list.filter((p) => p.price >= 5000 && p.price <= 15000);
    } else if (filterPrice === "above15k") {
      list = list.filter((p) => p.price > 15000);
    }

    // Sorting
    if (sortBy === "priceLowHigh") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceHighLow") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [searchResults.products, filterPrice, sortBy]);

  return (
    <>
      {/* Sky Blue Breadcrumb Strip */}
      <div className={styles.breadcrumbBar}>
        <div className="container">
          <div className={styles.breadcrumbContent}>
            <Link href="/">HOME</Link>
            <span className={styles.separator}>/</span>
            <Link href="/categories">PRODUCTS</Link>
            <span className={styles.separator}>/</span>
            <span className={styles.activeCrumb}>
              {query ? `SEARCH: "${query.toUpperCase()}"` : "ALL PRODUCTS SEARCH"}
            </span>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Search Header Banner */}
        <div className={styles.searchBanner}>
          <div className={styles.bannerTopRow}>
            <button 
              onClick={() => router.back()} 
              className={styles.backBtn}
              aria-label="Go to previous page"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>Back</span>
            </button>
            <span className={styles.bannerSubtitle}>PRODUCT CATALOG SEARCH</span>
          </div>

          <h1 className={styles.bannerTitle}>
            {query ? `RESULTS FOR "${query}"` : "EXPLORE ALL MACHINERY & TOOLS"}
          </h1>
          <p className={styles.bannerDesc}>
            Found {searchResults.products.length} matching machinery tools, spare attachments, and workshop equipment.
          </p>

          {/* Matched Categories quick pills */}
          {searchResults.categories.length > 0 && (
            <div className={styles.categoryPillsRow}>
              <span className={styles.pillsLabel}>Matching Categories:</span>
              <div className={styles.pillsList}>
                {searchResults.categories.map((cat) => (
                  <Link href={`/category/${cat.slug}`} key={cat.slug} className={styles.catPill}>
                    {cat.name} ({cat.count}) &rarr;
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Merged Filter Bar Strip */}
          <div className={styles.bannerFilterRow}>
            <div className={styles.resultsCount}>
              Showing <strong className={styles.countHighlight}>{filteredProducts.length}</strong> of {searchResults.products.length} Products
            </div>

            <div className={styles.controls}>
              <div className={styles.selectWrapper}>
                <select
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(e.target.value)}
                  className={styles.select}
                  aria-label="Filter by Price"
                >
                  <option value="all">Price: All Ranges</option>
                  <option value="under5k">Under Rs. 5,000</option>
                  <option value="5kto15k">Rs. 5,000 - Rs. 15,000</option>
                  <option value="above15k">Above Rs. 15,000</option>
                </select>
              </div>

              <div className={styles.selectWrapper}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.select}
                  aria-label="Sort products"
                >
                  <option value="default">Sort: Featured</option>
                  <option value="priceLowHigh">Price: Low to High</option>
                  <option value="priceHighLow">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Grid */}
        {filteredProducts.length > 0 ? (
          <div className={styles.productsGrid}>
            {filteredProducts.map((product) => {
              const discount = Math.round(
                ((product.originalPrice - product.price) / product.originalPrice) * 100
              );
              return (
                <div key={product.id} className={styles.productCard}>
                  {discount > 0 && <span className={styles.discountBadge}>{discount}% OFF</span>}
                  
                  <Link href={`/product/${product.id}`} className={styles.imageLink}>
                    <div className={styles.imageContainer}>
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        width={200}
                        height={170}
                        className={styles.image}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  </Link>

                  <div className={styles.cardDetails}>
                    <div className={styles.ratingRow}>
                      {renderStars(product.rating)}
                      <span className={styles.reviewsCount}>({product.ratingCount} Reviews)</span>
                    </div>

                    <Link href={`/product/${product.id}`} className={styles.titleLink}>
                      <h3 className={styles.productTitle} title={product.title}>
                        {product.title}
                      </h3>
                    </Link>

                    <div className={styles.priceBlock}>
                      <span className={styles.price}>
                        ₹{product.price.toLocaleString("en-IN")}.00
                      </span>
                      {product.originalPrice > product.price && (
                        <span className={styles.originalPrice}>
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <div className={styles.actionRow}>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className={styles.cartButton}
                        aria-label={`Add ${product.title} to cart`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span>Add to Cart</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product)}
                        className={`${styles.favouriteButton} ${isInWishlist(product.id) ? styles.favouriteActive : ""}`}
                        aria-label={`Add ${product.title} to wishlist`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? "#132c66" : "none"} stroke="#132c66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.noResultsCard}>
            <div className={styles.noResultsIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#38b6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </div>
            <h2>No matching products found for &ldquo;{query}&rdquo;</h2>
            <p>Check the spelling or try searching with more general keywords.</p>

            {/* Popular search chips */}
            <div className={styles.popularSearchesBlock}>
              <h4>Popular Searches:</h4>
              <div className={styles.chipsWrapper}>
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                    className={styles.searchChip}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <Link href="/categories" className={styles.browseAllBtn}>
              Browse All Categories
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className={styles.main}>
        <Suspense
          fallback={
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Searching Skill Store catalog...</p>
            </div>
          }
        >
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
