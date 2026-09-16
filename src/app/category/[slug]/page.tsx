"use client";

import React, { useState, useMemo, use, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { useApp } from "@/context/AppContext";
import { CATEGORIES_DATA, CategoryDetail, CategoryProduct } from "@/data/categories";
import { optimizeProductCard } from "@/lib/imageOptimization";
import styles from "./CategoryPage.module.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function CategoryPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useApp();

  const [filterType, setFilterType] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [dbProducts, setDbProducts] = useState<CategoryProduct[]>([]);
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);

  // Format fallback title if slug not explicitly mapped
  const formatTitle = (rawSlug: string) => {
    return rawSlug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const initialDetail: CategoryDetail = useMemo(() => {
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
      products: []
    };
  }, [slug]);

  const [dbCategory, setDbCategory] = useState<CategoryDetail | null>(null);

  // Fetch live products and category details from MongoDB for this category
  useEffect(() => {
    let isMounted = true;

    async function loadCategoryData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/products?category=${encodeURIComponent(slug)}`),
          fetch(`/api/categories?slug=${encodeURIComponent(slug)}`),
        ]);

        if (catRes.ok) {
          const catJson = await catRes.json();
          if (catJson.success && Array.isArray(catJson.categories) && catJson.categories.length > 0) {
            const rawCat = catJson.categories[0];
            const rawSubcats = rawCat.subcategories || rawCat.subCategories || [];
            const subCategories = rawSubcats.map((s: { id?: string; slug?: string; name: string }) => ({
              slug: s.id || s.slug || "",
              name: s.name || ""
            }));

            if (isMounted) {
              setDbCategory({
                slug: rawCat.id || slug,
                name: rawCat.name || formatTitle(slug),
                subtitle: "PREMIUM SELECTION",
                description: rawCat.description || `Browse our professional quality range of ${rawCat.name || formatTitle(slug)}.`,
                subCategories,
                products: []
              });
            }
          }
        }

        if (prodRes.ok) {
          const json = await prodRes.json();
          if (json.success && Array.isArray(json.data)) {
            const mapped: CategoryProduct[] = json.data.map((item: {
              id: string;
              title: string;
              price: number;
              originalPrice?: number;
              imageUrl: string;
              rating?: number;
              ratingCount?: number;
              subCategory?: string;
              brand?: string;
              inStock?: boolean;
            }) => ({
              id: item.id,
              title: item.title,
              price: item.price,
              originalPrice: item.originalPrice || item.price,
              imageUrl: item.imageUrl,
              rating: item.rating || 5,
              ratingCount: item.ratingCount || 0,
              subType: (item.subCategory || "domestic") as "domestic" | "commercial" | "accessory" | "general",
              brand: item.brand ? item.brand.toUpperCase() : "TUQO",
              inStock: item.inStock !== false
            }));

            if (isMounted) {
              setDbProducts(mapped);
              setIsProductsLoaded(true);
            }
          }
        }
      } catch {
        if (isMounted) setIsProductsLoaded(true);
      }
    }

    loadCategoryData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const currentCategoryDetail = useMemo(() => {
    if (dbCategory) {
      return {
        ...dbCategory,
        subCategories: dbCategory.subCategories && dbCategory.subCategories.length > 0
          ? dbCategory.subCategories
          : initialDetail.subCategories
      };
    }
    return initialDetail;
  }, [dbCategory, initialDetail]);

  // Strictly use live DB products once loaded so deleted products never resurrect
  const allProducts = useMemo(() => {
    if (isProductsLoaded) {
      return dbProducts;
    }
    return initialDetail.products;
  }, [isProductsLoaded, dbProducts, initialDetail.products]);


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
    let list = [...allProducts];

    // Filter by Type
    if (filterType !== "all") {
      const target = filterType.toLowerCase();
      list = list.filter((p) => {
        const sub = (p.subType || "").toLowerCase();
        return sub === target || sub.includes(target) || target.includes(sub);
      });
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
  }, [allProducts, filterType, filterPrice, sortBy]);

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
              <span className={styles.activeCrumb}>{currentCategoryDetail.name.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Category Banner with Merged Filters & Back Option */}
          <div className={styles.categoryBanner}>
            {/* Top Action Row with Back Button */}
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
              <span className={styles.bannerSubtitle}>{currentCategoryDetail.subtitle}</span>
            </div>

            <h1 className={styles.bannerTitle}>{currentCategoryDetail.name}</h1>
            <p className={styles.bannerDesc}>{currentCategoryDetail.description}</p>
            
            {currentCategoryDetail.subCategories && currentCategoryDetail.subCategories.length > 0 && (
              <div className={styles.subCatPills}>
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`${styles.subCatPill} ${filterType === "all" ? styles.activeSubCatPill : ""}`}
                >
                  All
                </button>
                {currentCategoryDetail.subCategories.map((sub) => {
                  const subKey = sub.slug || sub.name;
                  const isActive = filterType.toLowerCase() === subKey.toLowerCase();
                  return (
                    <button
                      type="button"
                      key={subKey}
                      onClick={() => setFilterType(isActive ? "all" : subKey)}
                      className={`${styles.subCatPill} ${isActive ? styles.activeSubCatPill : ""}`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Merged Filter & Sorting Controls Strip */}
            <div className={styles.bannerFilterRow}>
              <div className={styles.resultsCount}>
                Showing <strong className={styles.countHighlight}>{filteredProducts.length}</strong> of {allProducts.length} Products
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
                    {currentCategoryDetail.subCategories && currentCategoryDetail.subCategories.map((sub) => (
                      <option key={sub.slug || sub.name} value={sub.slug || sub.name}>
                        {sub.name}
                      </option>
                    ))}
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
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className={styles.productsGrid}>
              {filteredProducts.map((product) => {
                const discount = product.originalPrice > product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
                return (
                  <div key={product.id} className={styles.productCard}>
                    {discount > 0 && <span className={styles.discountBadge}>{discount}% OFF</span>}
                    
                    <Link href={`/product/${product.id}`} className={styles.imageLink}>
                      <div className={styles.imageContainer}>
                        <Image
                          src={optimizeProductCard(product.imageUrl)}
                          alt={product.title}
                          width={200}
                          height={170}
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
            <div className={styles.noResults}>
              <h3>No products found</h3>
              <p>Try clearing or adjusting your filters to find what you are looking for.</p>
              <button
                onClick={() => {
                  setFilterType("all");
                  setFilterPrice("all");
                  setSortBy("default");
                }}
                className={styles.resetBtn}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
