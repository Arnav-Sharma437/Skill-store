"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import Image from "next/image";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { useApp } from "@/context/AppContext";
import { CATEGORIES_DATA, CategoryDetail } from "@/data/categories";
import styles from "./CategoryPage.module.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function CategoryPage({ params }: PageProps) {
  const { slug } = use(params);
  const { addToCart, toggleWishlist, isInWishlist } = useApp();

  const [filterType, setFilterType] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // Format fallback title if slug not explicitly mapped
  const formatTitle = (rawSlug: string) => {
    return rawSlug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const categoryDetail: CategoryDetail = useMemo(() => {
    const directMatch = CATEGORIES_DATA[slug.toLowerCase()];
    if (directMatch) return directMatch;

    // Fallback dynamic category
    const title = formatTitle(slug);
    return {
      slug: slug.toLowerCase(),
      name: title,
      subtitle: "PREMIUM SELECTION",
      description: `Browse our professional quality range of ${title} engineered for exceptional durability and maximum efficiency.`,
      subCategories: [
        { name: "High Pressure Washer", slug: "high-pressure-washer" },
        { name: "Air Compressor", slug: "air-compressor" },
        { name: "Accessories & Spares", slug: "accessories-spares" }
      ],
      products: [
        {
          id: `prod-${slug}-1`,
          title: `TUQO High Performance ${title} HW2000`,
          price: 4999,
          originalPrice: 6999,
          imageUrl: "/images/products/hw2000.jpg",
          rating: 5,
          ratingCount: 240,
          subType: "domestic",
          brand: "TUQO",
          inStock: true
        },
        {
          id: `prod-${slug}-2`,
          title: `TUQO Professional Cordless ${title} CDW400`,
          price: 6299,
          originalPrice: 8299,
          imageUrl: "/images/products/cdw400.jpg",
          rating: 5,
          ratingCount: 380,
          subType: "domestic",
          brand: "TUQO",
          inStock: true
        },
        {
          id: `prod-${slug}-3`,
          title: `TUQO Heavy Duty ${title} Commercial Grade`,
          price: 14500,
          originalPrice: 18500,
          imageUrl: "/images/products/compressor.jpg",
          rating: 4,
          ratingCount: 150,
          subType: "commercial",
          brand: "TUQO",
          inStock: true
        },
        {
          id: `prod-${slug}-4`,
          title: `TUQO ${title} Premium Brass Attachment & Spares`,
          price: 999,
          originalPrice: 1499,
          imageUrl: "/images/products/trigger_gun.jpg",
          rating: 5,
          ratingCount: 420,
          subType: "accessory",
          brand: "TUQO",
          inStock: true
        }
      ]
    };
  }, [slug]);

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
    let list = [...categoryDetail.products];

    // Filter by Type
    if (filterType !== "all") {
      list = list.filter((p) => p.subType === filterType);
    }

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
  }, [categoryDetail, filterType, filterPrice, sortBy]);

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
              <Link href="/categories">CATEGORIES</Link>
              <span className={styles.separator}>/</span>
              <span className={styles.activeCrumb}>{categoryDetail.name.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Category Banner */}
          <div className={styles.categoryBanner}>
            <span className={styles.bannerSubtitle}>{categoryDetail.subtitle}</span>
            <h1 className={styles.bannerTitle}>{categoryDetail.name}</h1>
            <p className={styles.bannerDesc}>{categoryDetail.description}</p>
            {categoryDetail.subCategories && categoryDetail.subCategories.length > 0 && (
              <div className={styles.subCatPills}>
                {categoryDetail.subCategories.map((sub) => (
                  <Link href={`/category/${sub.slug}`} key={sub.slug} className={styles.subCatPill}>
                    {sub.name} &rarr;
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Filter & Sorting Controls */}
          <div className={styles.filterBar}>
            <div className={styles.resultsCount}>
              Showing {filteredProducts.length} of {categoryDetail.products.length} Products
            </div>

            <div className={styles.controls}>
              <div className={styles.selectWrapper}>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={styles.select}
                  aria-label="Filter by Type"
                >
                  <option value="all">Category: All Types</option>
                  <option value="domestic">Domestic</option>
                  <option value="commercial">Commercial / Industrial</option>
                  <option value="accessory">Accessories &amp; Spares</option>
                </select>
              </div>

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

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className={styles.productsGrid}>
              {filteredProducts.map((product) => {
                const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                return (
                  <div key={product.id} className={styles.productCard}>
                    {discount > 0 && <span className={styles.discountBadge}>{discount}% OFF</span>}
                    
                    <Link href={`/product/prod-3`} className={styles.imageLink}>
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
                      {product.brand && <span className={styles.brandTag}>{product.brand}</span>}
                      
                      <Link href={`/product/prod-3`} className={styles.titleLink}>
                        <h3 className={styles.productTitle} title={product.title}>
                          {product.title}
                        </h3>
                      </Link>

                      <div className={styles.ratingRow}>
                        {renderStars(product.rating)}
                        <span className={styles.reviewsCount}>({product.ratingCount})</span>
                      </div>

                      <div className={styles.priceBlock}>
                        <span className={styles.price}>Rs. {product.price.toLocaleString("en-IN")}.00</span>
                        {product.originalPrice > product.price && (
                          <span className={styles.originalPrice}>Rs. {product.originalPrice.toLocaleString("en-IN")}</span>
                        )}
                      </div>

                      <div className={styles.actionRow}>
                        <button
                          onClick={() =>
                            addToCart({
                              id: product.id,
                              title: product.title,
                              price: product.price,
                              imageUrl: product.imageUrl,
                            })
                          }
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
                          onClick={() =>
                            toggleWishlist({
                              id: product.id,
                              title: product.title,
                              price: product.price,
                              imageUrl: product.imageUrl,
                            })
                          }
                          className={`${styles.favouriteButton} ${isInWishlist(product.id) ? styles.favActive : ""}`}
                          aria-label="Toggle Wishlist"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill={isInWishlist(product.id) ? "#ef4444" : "none"}
                            stroke={isInWishlist(product.id) ? "#ef4444" : "#132c66"}
                            strokeWidth="2.5"
                          >
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
            <div className={styles.emptyBlock}>
              <h3>No products found</h3>
              <p>Try changing your filter options to view available machinery and tools.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
