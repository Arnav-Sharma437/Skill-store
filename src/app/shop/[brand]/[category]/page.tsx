"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import Image from "next/image";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { useApp } from "@/context/AppContext";
import { CATEGORIES_DATA } from "@/data/categories";
import styles from "./CategoryProductsPage.module.css";

type PageProps = {
  params: Promise<{ brand: string; category: string }>;
};

export default function CategoryProductsPage({ params }: PageProps) {
  const { brand, category } = use(params);
  const { addToCart, toggleWishlist, isInWishlist } = useApp();

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

  // Dynamic Product Resolution
  const categoryProducts = useMemo(() => {
    // 1. Direct match in CATEGORIES_DATA
    const directCat = CATEGORIES_DATA[category.toLowerCase()];
    if (directCat && directCat.products && directCat.products.length > 0) {
      return directCat.products;
    }

    // 2. Fallback generated items for this brand/category
    return [
      {
        id: `${brand}-${category}-1`,
        title: `${brandName} Premium ${categoryName} Pro-Series 2000`,
        price: 4999,
        originalPrice: 6999,
        imageUrl: "/images/products/hw2000.jpg",
        rating: 5,
        ratingCount: 241,
        subType: "domestic" as const,
        brand: brandName,
        inStock: true
      },
      {
        id: `${brand}-${category}-2`,
        title: `${brandName} Cordless ${categoryName} Max Power 24V`,
        price: 6299,
        originalPrice: 8299,
        imageUrl: "/images/products/cdw400.jpg",
        rating: 5,
        ratingCount: 380,
        subType: "domestic" as const,
        brand: brandName,
        inStock: true
      },
      {
        id: `${brand}-${category}-3`,
        title: `${brandName} Heavy Duty Commercial ${categoryName} 2800 PSI`,
        price: 14500,
        originalPrice: 18500,
        imageUrl: "/images/products/compressor.jpg",
        rating: 4,
        ratingCount: 195,
        subType: "commercial" as const,
        brand: brandName,
        inStock: true
      },
      {
        id: `${brand}-${category}-4`,
        title: `${brandName} Industrial High Output ${categoryName} 3000 PSI`,
        price: 18999,
        originalPrice: 24500,
        imageUrl: "/images/products/compressor.jpg",
        rating: 5,
        ratingCount: 140,
        subType: "commercial" as const,
        brand: brandName,
        inStock: true
      },
      {
        id: `${brand}-${category}-5`,
        title: `${brandName} ${categoryName} Brass Coupler Connector Quick Join`,
        price: 499,
        originalPrice: 799,
        imageUrl: "/images/products/nozzle_tips.jpg",
        rating: 5,
        ratingCount: 310,
        subType: "accessory" as const,
        brand: brandName,
        inStock: true
      },
      {
        id: `${brand}-${category}-6`,
        title: `${brandName} High Pressure Trigger Gun & Spray Wand Set`,
        price: 999,
        originalPrice: 1499,
        imageUrl: "/images/products/trigger_gun.jpg",
        rating: 5,
        ratingCount: 450,
        subType: "accessory" as const,
        brand: brandName,
        inStock: true
      }
    ];
  }, [brand, category, brandName, categoryName]);

  // Star Ratings Helper
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

  // Domestic/Primary section products
  const processedDomestic = useMemo(() => {
    let result = categoryProducts.filter((p) => p.subType === "domestic" || p.subType === "general" || !p.subType);
    if (result.length === 0) result = categoryProducts.slice(0, 4);

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
  }, [categoryProducts, filterPrice, sortBy]);

  // Commercial section products
  const processedCommercial = useMemo(() => {
    let result = categoryProducts.filter((p) => p.subType === "commercial");
    if (result.length === 0 && categoryProducts.length > 4) {
      result = categoryProducts.slice(4);
    }

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
  }, [categoryProducts, filterPrice, sortBy]);

  // Accessories section products
  const processedAccessories = useMemo(() => {
    let result = categoryProducts.filter((p) => p.subType === "accessory");
    if (result.length === 0) {
      result = [
        {
          id: `acc-${brand}-1`,
          title: `${brandName} DS102 Premium 4Pcs Nozzle Tips`,
          price: 399,
          originalPrice: 599,
          imageUrl: "/images/products/nozzle_tips.jpg",
          rating: 5,
          ratingCount: 320,
          subType: "accessory" as const,
          brand: brandName,
          inStock: true
        },
        {
          id: `acc-${brand}-2`,
          title: `${brandName} HG12 High Pressure Washer Trigger Gun`,
          price: 999,
          originalPrice: 1499,
          imageUrl: "/images/products/trigger_gun.jpg",
          rating: 5,
          ratingCount: 450,
          subType: "accessory" as const,
          brand: brandName,
          inStock: true
        },
        {
          id: `acc-${brand}-3`,
          title: `${brandName} Brass Coupler Connector Quick Join M22`,
          price: 499,
          originalPrice: 799,
          imageUrl: "/images/products/nozzle_tips.jpg",
          rating: 4,
          ratingCount: 180,
          subType: "accessory" as const,
          brand: brandName,
          inStock: true
        }
      ];
    }
    return result;
  }, [categoryProducts, brand, brandName]);

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
          {/* Dashboard Filter Bar */}
          <div className={styles.filterBar}>
            <div className={styles.resultsCount}>
              Showing {processedDomestic.length + processedCommercial.length} Products for {categoryName}
            </div>
            
            <div className={styles.controls}>
              <div className={styles.selectWrapper}>
                <select 
                  id="price-filter"
                  value={filterPrice} 
                  onChange={(e) => setFilterPrice(e.target.value)}
                  className={styles.select}
                  aria-label="Filter by Price"
                >
                  <option value="all">Filter: All Prices</option>
                  <option value="under5k">Under Rs. 5,000</option>
                  <option value="above5k">Rs. 5,000 &amp; Above</option>
                </select>
              </div>
              
              <div className={styles.selectWrapper}>
                <select 
                  id="sort-select"
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.select}
                  aria-label="Sort by"
                >
                  <option value="default">Sort: Default</option>
                  <option value="priceLowHigh">Price: Low to High</option>
                  <option value="priceHighLow">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 1: Domestic / Primary Products */}
          {processedDomestic.length > 0 && (
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
                    <Link href={`/product/prod-3`} className={styles.imageLink}>
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
                      <Link href={`/product/prod-3`} className={styles.titleLink}>
                        <h3 className={styles.productTitle} title={product.title}>
                          {product.title}
                        </h3>
                      </Link>

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
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                          </svg>
                          <span>Add To Cart</span>
                        </button>
                        <button 
                          onClick={() => toggleWishlist({ id: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl })} 
                          className={`${styles.favouriteButton} ${isInWishlist(product.id) ? styles.favActive : ""}`}
                          aria-label="Toggle Wishlist"
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
          )}

          {/* Section 2: Commercial Products */}
          {processedCommercial.length > 0 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeaderRow}>
                <div className={styles.titleTab}>
                  <h2 className={styles.titleText}>COMMERCIAL {categoryName.toUpperCase()}</h2>
                </div>
                <div className={styles.headerLine}></div>
              </div>

              <div className={styles.grid}>
                {processedCommercial.map((product) => (
                  <div key={product.id} className={styles.productCard}>
                    <Link href={`/product/prod-3`} className={styles.imageLink}>
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
                      <Link href={`/product/prod-3`} className={styles.titleLink}>
                        <h3 className={styles.productTitle} title={product.title}>
                          {product.title}
                        </h3>
                      </Link>

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
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                          </svg>
                          <span>Add To Cart</span>
                        </button>
                        <button 
                          onClick={() => toggleWishlist({ id: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl })} 
                          className={`${styles.favouriteButton} ${isInWishlist(product.id) ? styles.favActive : ""}`}
                          aria-label="Toggle Wishlist"
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
          )}

          {/* Section 3: Accessories & Spares */}
          {processedAccessories.length > 0 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeaderRow}>
                <div className={styles.titleTab}>
                  <h2 className={styles.titleText}>ACCESSORIES &amp; SPARES</h2>
                </div>
                <div className={styles.headerLine}></div>
              </div>

              <div className={styles.gridAccessories}>
                {processedAccessories.map((product) => (
                  <div key={product.id} className={styles.productCard}>
                    <Link href={`/product/prod-3`} className={styles.imageLink}>
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
                      <Link href={`/product/prod-3`} className={styles.titleLink}>
                        <h3 className={styles.productTitle} title={product.title}>
                          {product.title}
                        </h3>
                      </Link>

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
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                          </svg>
                          <span>Add To Cart</span>
                        </button>
                        <button 
                          onClick={() => toggleWishlist({ id: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl })} 
                          className={`${styles.favouriteButton} ${isInWishlist(product.id) ? styles.favActive : ""}`}
                          aria-label="Toggle Wishlist"
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
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
