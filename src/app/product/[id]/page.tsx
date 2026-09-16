"use client";

import React, { useState, useMemo, use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { useApp } from "@/context/AppContext";
import { optimizeProductDetail, optimizeGalleryThumbnail, optimizeProductCard } from "@/lib/imageOptimization";
import styles from "./ProductPage.module.css";

// Accessory Products for "Based on your recent views"
const RECENT_PRODUCTS = [
  { id: "acc-1", title: "Brass Coupler Connector Fitting Quick Join", price: 499, imageUrl: "/images/products/nozzle_tips.jpg", rating: 5, ratingCount: 241 },
  { id: "acc-2", title: "TUQO Premium 4Pcs Spray Nozzle Set", price: 899, imageUrl: "/images/products/nozzle_tips.jpg", rating: 5, ratingCount: 780 },
  { id: "acc-3", title: "Heavy Duty Brass Adapter Coupling Male/Female", price: 650, imageUrl: "/images/products/trigger_gun.jpg", rating: 4, ratingCount: 605 },
  { id: "acc-4", title: "Universal Red Adapter Quick Release Fitting", price: 399, imageUrl: "/images/products/trigger_gun.jpg", rating: 4, ratingCount: 420 },
  { id: "acc-5", title: "High Pressure Washer Water Hose 5 Meters", price: 1200, imageUrl: "/images/products/hw2000.jpg", rating: 5, ratingCount: 241 }
];

interface ReviewItem {
  _id: string;
  productId: string;
  productTitle?: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title?: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

interface ProductData {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  videoUrl?: string;
  gallery?: string[];
  rating: number;
  ratingCount: number;
  brand?: string;
  category?: string;
  categorySlug?: string;
  categoryName?: string;
  subCategory?: string;
  subType?: "domestic" | "commercial" | "accessory" | "general";
  description?: string[] | string;
  specifications?: string[] | string;
  whatsInBox?: string[] | string;
  inStock?: boolean;
  degrees?: string[];
  sizes?: string[];
  styles?: string[];
}

export default function ProductPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useApp();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // Variant selection states
  const [selectedDegree, setSelectedDegree] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("");

  // Live reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");
  const [reviewForm, setReviewForm] = useState({
    userName: "",
    userEmail: "",
    rating: 5,
    title: "",
    comment: "",
  });

  // Fetch live product & reviews from MongoDB
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [prodRes, revRes] = await Promise.all([
          fetch(`/api/products/${encodeURIComponent(id)}`),
          fetch(`/api/reviews?productId=${encodeURIComponent(id)}`),
        ]);

        if (prodRes.ok) {
          const json = await prodRes.json();
          if (json.success && json.data) {
            const d = json.data;
            const normalized: ProductData = {
              id: d.id,
              title: d.title,
              price: d.price,
              originalPrice: d.originalPrice || d.price,
              imageUrl: d.imageUrl,
              videoUrl: d.videoUrl || "",
              gallery: Array.isArray(d.gallery) ? d.gallery : [],
              rating: d.rating || 5,
              ratingCount: d.ratingCount || 0,
              brand: d.brand ? d.brand.toUpperCase() : "TUQO",
              category: d.category || "high-pressure-washer",
              categorySlug: d.category ? d.category.toLowerCase().replace(/\s+/g, "-") : "high-pressure-washer",
              categoryName: d.category ? d.category.toUpperCase() : "MACHINERY",
              subCategory: d.subCategory || "domestic",
              description: d.description || [],
              specifications: d.specifications || [],
              whatsInBox: d.whatsInBox || [],
              inStock: d.inStock !== false,
              degrees: Array.isArray(d.degrees) ? d.degrees : [],
              sizes: Array.isArray(d.sizes) ? d.sizes : [],
              styles: Array.isArray(d.styles) ? d.styles : [],
            };

            if (isMounted) {
              setProduct(normalized);
              setSelectedImage(normalized.imageUrl);
              if (normalized.degrees && normalized.degrees.length > 0) {
                setSelectedDegree(normalized.degrees[0]);
              }
              if (normalized.sizes && normalized.sizes.length > 0) {
                setSelectedSize(normalized.sizes[0]);
              }
              if (normalized.styles && normalized.styles.length > 0) {
                setSelectedStyle(normalized.styles[0]);
              }
              setNotFound(false);
            }
          } else {
            if (isMounted) setNotFound(true);
          }
        } else {
          if (isMounted) setNotFound(true);
        }

        if (revRes.ok) {
          const revJson = await revRes.json();
          if (isMounted && revJson.reviews && Array.isArray(revJson.reviews)) {
            setReviews(revJson.reviews);
          }
        }
      } catch {
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);


  // Submit review handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.userName.trim() || !reviewForm.comment.trim()) {
      alert("Please provide your name and review comment.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          productTitle: product?.title || id,
          userName: reviewForm.userName,
          userEmail: reviewForm.userEmail,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
        }),
      });

      if (res.ok) {
        setReviewSuccessMsg("Thank you! Your review has been submitted and will appear once approved by the admin.");
        setReviewForm({ userName: "", userEmail: "", rating: 5, title: "", comment: "" });
        setTimeout(() => {
          setIsReviewModalOpen(false);
          setReviewSuccessMsg("");
        }, 3000);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit review.");
      }
    } catch {
      alert("Error submitting review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const isFavourite = product ? isInWishlist(product.id) : false;
  const savings = product ? Math.max(0, product.originalPrice - product.price) : 0;
  const savingsPercent = product && product.originalPrice > 0 ? Math.round((savings / product.originalPrice) * 100) : 0;

  // Selected variant configuration
  const currentVariant = useMemo(() => {
    if (!product) return undefined;
    const hasVar =
      (product.degrees && product.degrees.length > 0) ||
      (product.sizes && product.sizes.length > 0) ||
      (product.styles && product.styles.length > 0);
    if (!hasVar) return undefined;
    return {
      degree: selectedDegree || undefined,
      size: selectedSize || undefined,
      style: selectedStyle || undefined,
    };
  }, [product, selectedDegree, selectedSize, selectedStyle]);

  // Gallery thumbnails
  const gallery = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (product.imageUrl) list.push(product.imageUrl);
    if (product.gallery && Array.isArray(product.gallery)) {
      product.gallery.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }

    // Default thumbnails if less than 3
    const defaultThumbs = [
      "/images/products/cdw400.jpg",
      "/images/products/hw2000.jpg",
      "/images/products/nozzle_tips.jpg",
      "/images/products/trigger_gun.jpg",
      "/images/products/compressor.jpg"
    ];

    defaultThumbs.forEach((img) => {
      if (list.length < 5 && !list.includes(img)) {
        list.push(img);
      }
    });

    return list;
  }, [product]);

  const handleNextImage = () => {
    if (!gallery.length) return;
    const currentIndex = gallery.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % gallery.length;
    setSelectedImage(gallery[nextIndex]);
  };

  const handlePrevImage = () => {
    if (!gallery.length) return;
    const currentIndex = gallery.indexOf(selectedImage);
    const prevIndex = (currentIndex - 1 + gallery.length) % gallery.length;
    setSelectedImage(gallery[prevIndex]);
  };

  // Convert description to string array
  const descItems = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.description) && product.description.length > 0) {
      return product.description.filter(Boolean);
    }
    if (typeof product.description === "string" && product.description.trim()) {
      return product.description.split("\n").map((s) => s.trim()).filter(Boolean);
    }
    return [
      "HIGH PERFORMANCE OUTPUT - Precision-engineered machinery for professional use.",
      "VERSATILE & RELIABLE - Equipped for robust multi-purpose operation.",
      "PORTABLE & ERGONOMIC - Designed for convenient handling and hassle-free operation."
    ];
  }, [product]);

  const specItems = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.specifications) && product.specifications.length > 0) {
      return product.specifications.filter(Boolean);
    }
    if (typeof product.specifications === "string" && product.specifications.trim()) {
      return product.specifications.split("\n").map((s) => s.trim()).filter(Boolean);
    }
    return [
      `Brand: ${product.brand || "SkillStore"}`,
      `Model SKU: ${product.id}`,
      `Category: ${product.categoryName || "Machinery"}`,
      "Operating Voltage: 220V - 240V / 50Hz",
      "Warranty: 1 Year Official Manufacturer Warranty"
    ];
  }, [product]);

  const boxItems = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.whatsInBox) && product.whatsInBox.length > 0) {
      return product.whatsInBox.filter(Boolean);
    }
    if (typeof product.whatsInBox === "string" && product.whatsInBox.trim()) {
      return product.whatsInBox.split("\n").map((s) => s.trim()).filter(Boolean);
    }
    return [
      `1x ${product.title}`,
      "1x Accessories / Fittings Set",
      "1x User Instruction Manual & Warranty Card"
    ];
  }, [product]);

  // Live rating calculation from approved reviews if available
  const displayRating = useMemo(() => {
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      return (sum / reviews.length).toFixed(1);
    }
    return product ? (product.rating || 5).toFixed(1) : "5.0";
  }, [reviews, product]);

  const totalReviewsCount = useMemo(() => {
    if (reviews.length > 0) return reviews.length;
    return product?.ratingCount || 0;
  }, [reviews, product]);

  // Loading state
  if (loading) {
    return (
      <>
        <AnnouncementBar />
        <Header />
        <main className={styles.main}>
          <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
            <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "#132c66", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
            <p style={{ marginTop: "16px", color: "#64748b", fontWeight: 600 }}>Loading product details...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Not Found / Deleted Product Screen
  if (notFound || !product) {
    return (
      <>
        <AnnouncementBar />
        <Header />
        <main className={styles.main}>
          <div className="container">
            <div className={styles.notFoundContainer}>
              <h1 className={styles.notFoundTitle}>Product Not Found</h1>
              <p className={styles.notFoundText}>
                The product you are looking for has been removed, deleted, or is no longer available.
              </p>
              <Link href="/categories" className={styles.notFoundBtn}>
                Browse All Categories &amp; Products
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isInStock = product.inStock !== false;

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className={styles.main}>
        {/* Sky Blue Breadcrumb Banner */}
        <div className={styles.breadcrumbBar}>
          <div className="container">
            <div className={styles.breadcrumbContent}>
              <Link href="/">HOME</Link>
              <span className={styles.separator}>/</span>
              <Link href="/categories">CATEGORIES</Link>
              <span className={styles.separator}>/</span>
              <Link href={`/category/${product.categorySlug || "high-pressure-washer"}`}>
                {(product.categoryName || "PRODUCTS").toUpperCase()}
              </Link>
              <span className={styles.separator}>/</span>
              <span className={styles.activePath}>{product.title}</span>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Main Info Columns */}
          <div className={styles.productBlock}>
            {/* Left Column: Image Gallery */}
            <div className={styles.galleryColumn}>
              <div className={styles.mainImageWrapper}>
                <button onClick={handlePrevImage} className={styles.galleryArrowLeft} aria-label="Previous image">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <div className={styles.mainImageContainer}>
                  <Image
                    src={optimizeProductDetail(selectedImage || product.imageUrl)}
                    alt={product.title}
                    width={400}
                    height={400}
                    className={styles.mainImage}
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <button onClick={handleNextImage} className={styles.galleryArrowRight} aria-label="Next image">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>

              {/* Thumbnails row */}
              <div className={styles.thumbnailsWrapper}>
                <div className={styles.thumbnailsGrid}>
                  {gallery.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`${styles.thumbnailCard} ${selectedImage === img ? styles.activeThumbnail : ""}`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <Image
                        src={optimizeGalleryThumbnail(img)}
                        alt={`Thumbnail ${index + 1}`}
                        width={60}
                        height={60}
                        loading="lazy"
                        className={styles.thumbnailImg}
                        style={{ objectFit: "contain" }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Details & Actions */}
            <div className={styles.infoColumn}>
              <div className={styles.headerRow}>
                <h1 className={styles.productTitle}>
                  {product.title}
                </h1>
                <button 
                  onClick={() => toggleWishlist({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    imageUrl: product.imageUrl
                  })} 
                  className={styles.shareBtn} 
                  aria-label="Add to wishlist"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavourite ? "#ef4444" : "none"} stroke={isFavourite ? "#ef4444" : "#132c66"} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>

              {/* In Stock / Out of Stock status */}
              <div style={{ marginBottom: "12px" }}>
                {isInStock ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#16a34a" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a" }}></span>
                    In Stock &bull; Ready to Dispatch
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#dc2626" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#dc2626" }}></span>
                    Currently Out of Stock
                  </span>
                )}
              </div>

              {/* Price block */}
              <div className={styles.priceContainer}>
                {product.originalPrice > product.price && (
                  <span className={styles.originalPrice}>Rs. {product.originalPrice.toLocaleString("en-IN")}.00</span>
                )}
                <span className={styles.currentPrice}>Rs. {product.price.toLocaleString("en-IN")}.00</span>
                {savings > 0 && (
                  <span className={styles.savingsTag}>You Save : Rs. {savings.toLocaleString("en-IN")} ({savingsPercent}%)</span>
                )}
              </div>

              {/* Review summary */}
              <div className={styles.ratingsRow}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={s <= Math.round(Number(displayRating)) ? "#ffd300" : "#d1d5db"} stroke={s <= Math.round(Number(displayRating)) ? "#ffd300" : "#d1d5db"} strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  ))}
                </div>
                <span className={styles.reviewsCount}>({totalReviewsCount} Verified Customer {totalReviewsCount === 1 ? "Review" : "Reviews"})</span>
              </div>

              {/* Variant Selectors: Degree, Size, Style */}
              {((product.degrees && product.degrees.length > 0) ||
                (product.sizes && product.sizes.length > 0) ||
                (product.styles && product.styles.length > 0)) && (
                <div className={styles.variantsContainer}>
                  {/* Degree Selector */}
                  {product.degrees && product.degrees.length > 0 && (
                    <div className={styles.variantGroup}>
                      <span className={styles.variantLabel}>
                        Spray Angle (Degree): <strong className={styles.variantActiveVal}>{selectedDegree}</strong>
                      </span>
                      <div className={styles.variantPills}>
                        {product.degrees.map((deg) => (
                          <button
                            key={deg}
                            type="button"
                            onClick={() => setSelectedDegree(deg)}
                            className={`${styles.variantPill} ${selectedDegree === deg ? styles.variantPillActive : ""}`}
                          >
                            {deg}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selector */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className={styles.variantGroup}>
                      <span className={styles.variantLabel}>
                        Size / Length: <strong className={styles.variantActiveVal}>{selectedSize}</strong>
                      </span>
                      <div className={styles.variantPills}>
                        {product.sizes.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSize(sz)}
                            className={`${styles.variantPill} ${selectedSize === sz ? styles.variantPillActive : ""}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Style Selector */}
                  {product.styles && product.styles.length > 0 && (
                    <div className={styles.variantGroup}>
                      <span className={styles.variantLabel}>
                        Style / Type: <strong className={styles.variantActiveVal}>{selectedStyle}</strong>
                      </span>
                      <div className={styles.variantPills}>
                        {product.styles.map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setSelectedStyle(st)}
                            className={`${styles.variantPill} ${selectedStyle === st ? styles.variantPillActive : ""}`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity Picker */}
              {isInStock && (
                <div className={styles.quantityContainer}>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className={styles.qtyBtn}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className={styles.qtyInput}
                    aria-label="Product quantity"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className={styles.qtyBtn}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className={styles.actionsBlock}>
                {isInStock ? (
                  <>
                    <button 
                      onClick={() => {
                        addToCart(
                          {
                            id: product.id,
                            title: product.title,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            selectedVariant: currentVariant,
                          },
                          quantity
                        );
                        router.push("/cart");
                      }}
                      className={styles.buyNowBtn}
                    >
                      Buy Now
                    </button>
                    <button 
                      onClick={() => {
                        addToCart(
                          {
                            id: product.id,
                            title: product.title,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            selectedVariant: currentVariant,
                          },
                          quantity
                        );
                      }}
                      className={styles.addToCartBtn}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      <span>Add to Cart</span>
                    </button>
                  </>
                ) : (
                  <button 
                    disabled 
                    style={{
                      width: "100%",
                      padding: "14px 20px",
                      background: "#9ca3af",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: 700,
                      cursor: "not-allowed"
                    }}
                  >
                    Item Out of Stock
                  </button>
                )}
              </div>

              {/* Dynamic Product Info List (Description from MongoDB) */}
              <div className={styles.infoSection}>
                <h4 className={styles.infoHeading}>PRODUCT INFORMATION</h4>
                <ul className={styles.infoList}>
                  {descItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Description / Specification tabs */}
          <div className={styles.tabsSection}>
            <div className={styles.tabHeaderBar}>
              <button 
                onClick={() => setActiveTab("description")}
                className={`${styles.tabBtn} ${activeTab === "description" ? styles.activeTab : ""}`}
              >
                Description
              </button>
              <button 
                onClick={() => setActiveTab("specification")}
                className={`${styles.tabBtn} ${activeTab === "specification" ? styles.activeTab : ""}`}
              >
                Specification
              </button>
              <button 
                onClick={() => setActiveTab("box")}
                className={`${styles.tabBtn} ${activeTab === "box" ? styles.activeTab : ""}`}
              >
                What is in the box?
              </button>
            </div>

            <div className={styles.tabContentArea}>
              {activeTab === "description" && (
                <ol className={styles.descriptionList}>
                  {descItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ol>
              )}
              {activeTab === "specification" && (
                <div className={styles.tabPane}>
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {specItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {activeTab === "box" && (
                <div className={styles.tabPane}>
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {boxItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Section: Dedicated Customer Reviews */}
          <div className={styles.reviewsSection}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.titleTab}>
                <h2 className={styles.titleText}>CUSTOMER REVIEWS &amp; RATINGS</h2>
              </div>
              <div className={styles.headerLine}></div>
            </div>

            {/* Ratings Overview Card */}
            <div className={styles.reviewsSummaryCard}>
              <div className={styles.scoreCol}>
                <span className={styles.bigScore}>{displayRating}</span>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="18" height="18" viewBox="0 0 24 24" fill={s <= Math.round(Number(displayRating)) ? "#ffd300" : "#d1d5db"} stroke={s <= Math.round(Number(displayRating)) ? "#ffd300" : "#d1d5db"} strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  ))}
                </div>
                <span className={styles.totalReviewsCount}>Based on {totalReviewsCount} verified reviews</span>
              </div>

              {/* Dynamic Progress Bars */}
              <div className={styles.barsCol}>
                {[5, 4, 3, 2, 1].map((starNum) => {
                  const matchingCount = reviews.filter((r) => r.rating === starNum).length;
                  const pct = reviews.length > 0 ? Math.round((matchingCount / reviews.length) * 100) : (starNum === 5 ? 100 : 0);
                  return (
                    <div key={starNum} className={styles.barRow}>
                      <span className={styles.barLabel}>{starNum} Star</span>
                      <div className={styles.barTrack}>
                        <div className={styles.barFill} style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className={styles.barPct}>{pct}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Action Column */}
              <div className={styles.writeReviewCol}>
                <h4>Have you used this product?</h4>
                <p>Share your review to help other workshop owners and detailers make the right choice.</p>
                <button 
                  onClick={() => setIsReviewModalOpen(true)} 
                  className={styles.writeReviewBtn}
                >
                  Write a Product Review
                </button>
              </div>
            </div>

            {/* Reviews List Cards */}
            {reviews.length > 0 ? (
              <div className={styles.reviewsListGrid}>
                {reviews.map((rev) => (
                  <div key={rev._id} className={styles.reviewCard}>
                    <div className={styles.reviewCardHeader}>
                      <div className={styles.authorBadgeGroup}>
                        <div className={styles.reviewAvatar}>
                          {rev.userName.split(" ").map((n) => n[0]).join("").toUpperCase() || "U"}
                        </div>
                        <div>
                          <h4 className={styles.reviewerName}>{rev.userName}</h4>
                          <span className={styles.reviewerLocation}>Verified Customer</span>
                        </div>
                      </div>
                      <div className={styles.dateAndBadge}>
                        <span className={styles.verifiedBuyerTag}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Verified Buyer
                        </span>
                        <span className={styles.reviewDate}>
                          {new Date(rev.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    <div className={styles.reviewStarsRow}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#ffd300" stroke="#ffd300" strokeWidth="1">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      ))}
                    </div>

                    {rev.title && <h5 className={styles.reviewTitle}>{rev.title}</h5>}
                    <p className={styles.reviewComment}>&ldquo;{rev.comment}&rdquo;</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "36px 20px", background: "#ffffff", borderRadius: "12px", border: "1px dashed #cbd5e1", marginTop: "24px" }}>
                <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontWeight: 600 }}>
                  No customer reviews yet. Be the first to share your experience with this machine!
                </p>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  style={{ marginTop: "12px", background: "#132c66", color: "#ffffff", border: "none", padding: "8px 18px", borderRadius: "6px", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}
                >
                  Write the First Review
                </button>
              </div>
            )}
          </div>

          {/* Section: Based on your recent views */}
          <div className={styles.recentSection}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.titleTab}>
                <h2 className={styles.titleText}>BASED ON YOUR RECENT VIEWS</h2>
              </div>
              <div className={styles.headerLine}></div>
            </div>

            <div className={styles.recentMarqueeContainer}>
              <div className={styles.recentMarqueeTrack}>
                {/* First Copy */}
                <div className={styles.recentRow}>
                  {RECENT_PRODUCTS.map((prod) => (
                    <div key={`${prod.id}-1`} className={styles.recentCard}>
                      <div className={styles.recentImgBox}>
                        <Image
                          src={optimizeProductCard(prod.imageUrl)}
                          alt={prod.title}
                          width={160}
                          height={120}
                          loading="lazy"
                          className={styles.recentImg}
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                      <div className={styles.recentInfo}>
                        <h4 className={styles.recentTitle} title={prod.title}>{prod.title}</h4>
                        <div className={styles.starsRow}>
                          {[1,2,3,4,5].map((s) => (
                            <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="#ffd300" stroke="#ffd300" strokeWidth="1">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                          ))}
                          <span>{prod.ratingCount} Reviews</span>
                        </div>
                        <div className={styles.cardActions}>
                          <button 
                            onClick={() => addToCart({ id: prod.id, title: prod.title, price: prod.price, imageUrl: prod.imageUrl })}
                            className={styles.cardCartBtn}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="9" cy="21" r="1"></circle>
                              <circle cx="20" cy="21" r="1"></circle>
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            <span>Add To Cart</span>
                          </button>
                          <button 
                            onClick={() => toggleWishlist({ id: prod.id, title: prod.title, price: prod.price, imageUrl: prod.imageUrl })}
                            className={`${styles.cardHeartBtn} ${isInWishlist(prod.id) ? styles.cardHeartActive : ""}`}
                            aria-label="Toggle Wishlist"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill={isInWishlist(prod.id) ? "#ef4444" : "none"} stroke={isInWishlist(prod.id) ? "#ef4444" : "#132c66"} strokeWidth="2.5">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Duplicate Copy */}
                <div className={styles.recentRow} aria-hidden="true">
                  {RECENT_PRODUCTS.map((prod) => (
                    <div key={`${prod.id}-2`} className={styles.recentCard}>
                      <div className={styles.recentImgBox}>
                        <Image
                          src={optimizeProductCard(prod.imageUrl)}
                          alt={prod.title}
                          width={160}
                          height={120}
                          loading="lazy"
                          className={styles.recentImg}
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                      <div className={styles.recentInfo}>
                        <h4 className={styles.recentTitle} title={prod.title}>{prod.title}</h4>
                        <div className={styles.starsRow}>
                          {[1,2,3,4,5].map((s) => (
                            <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="#ffd300" stroke="#ffd300" strokeWidth="1">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                          ))}
                          <span>{prod.ratingCount} Reviews</span>
                        </div>
                        <div className={styles.cardActions}>
                          <button 
                            onClick={() => addToCart({ id: prod.id, title: prod.title, price: prod.price, imageUrl: prod.imageUrl })}
                            className={styles.cardCartBtn}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="9" cy="21" r="1"></circle>
                              <circle cx="20" cy="21" r="1"></circle>
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            <span>Add To Cart</span>
                          </button>
                          <button 
                            onClick={() => toggleWishlist({ id: prod.id, title: prod.title, price: prod.price, imageUrl: prod.imageUrl })}
                            className={`${styles.cardHeartBtn} ${isInWishlist(prod.id) ? styles.cardHeartActive : ""}`}
                            aria-label="Toggle Wishlist"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill={isInWishlist(prod.id) ? "#ef4444" : "none"} stroke={isInWishlist(prod.id) ? "#ef4444" : "#132c66"} strokeWidth="2.5">
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
          </div>
        </div>
      </main>

      {/* Write a Product Review Modal */}
      {isReviewModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !submittingReview && setIsReviewModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Write a Review</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsReviewModalOpen(false)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {reviewSuccessMsg ? (
              <div style={{ padding: "20px 0", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>✅</div>
                <h4 style={{ color: "#16a34a", fontSize: "16px", marginBottom: "8px", fontWeight: 800 }}>Review Submitted</h4>
                <p style={{ color: "#475569", fontSize: "13.5px" }}>{reviewSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Rating *</label>
                  <div className={styles.starRatingPicker}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className={styles.starPickBtn}
                      >
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          fill={star <= reviewForm.rating ? "#ffd300" : "#d1d5db"}
                          stroke={star <= reviewForm.rating ? "#ffd300" : "#d1d5db"}
                          strokeWidth="1"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </button>
                    ))}
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#132c66", marginLeft: "6px" }}>
                      {reviewForm.rating} of 5 Stars
                    </span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={reviewForm.userName}
                    onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Your Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@example.com"
                    value={reviewForm.userEmail}
                    onChange={(e) => setReviewForm({ ...reviewForm, userEmail: e.target.value })}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Review Headline / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Excellent pressure washer for workshop!"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Detailed Review *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Share your detailed experience with the performance, build quality, fittings and usage..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className={styles.formTextarea}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className={styles.formSubmitBtn}
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
