"use client";

import React, { useState, useMemo, use, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { useApp } from "@/context/AppContext";
import { optimizeProductDetail, optimizeGalleryThumbnail, optimizeProductCard } from "@/lib/imageOptimization";
import styles from "./ProductPage.module.css";

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

interface ProductVariant {
  id?: string;
  name?: string;
  type?: string;
  degree?: string;
  size?: string;
  style?: string;
  price?: number;
  originalPrice?: number;
  inStock?: boolean;
  imageUrl?: string;
}

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
  variants?: ProductVariant[];
}

export default function ProductPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist, recentlyViewed, addRecentlyViewed } = useApp();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const recentSliderRef = useRef<HTMLDivElement>(null);

  const scrollRecentSlider = (direction: "left" | "right") => {
    if (recentSliderRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      recentSliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const filteredRecent = useMemo(() => {
    return recentlyViewed.filter((item) => item.id !== id);
  }, [recentlyViewed, id]);

  // Variant selection states
  const [selectedDegree, setSelectedDegree] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedCustomVariant, setSelectedCustomVariant] = useState<string>("");

  // Helper to find image associated with a variant
  const findVariantImage = (type: "degree" | "size" | "style" | "general", value: string): string | null => {
    if (!product?.variants || !value) return null;
    const valLower = value.toLowerCase().trim();
    const matched = product.variants.find((v) => {
      const nameMatch = v.name && v.name.toLowerCase().trim() === valLower;
      const degMatch = v.degree && v.degree.toLowerCase().trim() === valLower;
      const sizeMatch = v.size && v.size.toLowerCase().trim() === valLower;
      const styleMatch = v.style && v.style.toLowerCase().trim() === valLower;
      return nameMatch || degMatch || sizeMatch || styleMatch;
    });
    return matched?.imageUrl && matched.imageUrl.trim() ? matched.imageUrl.trim() : null;
  };

  // When user clicks a variant pill, select it and update product display image if variant has an image
  const handleSelectVariant = (type: "degree" | "size" | "style" | "general", value: string) => {
    if (type === "degree") setSelectedDegree(value);
    if (type === "size") setSelectedSize(value);
    if (type === "style") setSelectedStyle(value);
    if (type === "general") setSelectedCustomVariant(value);

    const variantImg = findVariantImage(type, value);
    if (variantImg) {
      setSelectedImage(variantImg);
    }
  };

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
              variants: Array.isArray(d.variants) ? d.variants : [],
            };

            if (isMounted) {
              setProduct(normalized);
              let initialImage = normalized.imageUrl;

              if (normalized.degrees && normalized.degrees.length > 0) {
                const d0 = normalized.degrees[0];
                setSelectedDegree(d0);
                const matchedV = normalized.variants?.find((v) => (v.name && v.name.toLowerCase() === d0.toLowerCase()) || (v.degree && v.degree.toLowerCase() === d0.toLowerCase()));
                if (matchedV?.imageUrl) initialImage = matchedV.imageUrl;
              }
              if (normalized.sizes && normalized.sizes.length > 0) {
                const s0 = normalized.sizes[0];
                setSelectedSize(s0);
                const matchedV = normalized.variants?.find((v) => (v.name && v.name.toLowerCase() === s0.toLowerCase()) || (v.size && v.size.toLowerCase() === s0.toLowerCase()));
                if (matchedV?.imageUrl) initialImage = matchedV.imageUrl;
              }
              if (normalized.styles && normalized.styles.length > 0) {
                const st0 = normalized.styles[0];
                setSelectedStyle(st0);
                const matchedV = normalized.variants?.find((v) => (v.name && v.name.toLowerCase() === st0.toLowerCase()) || (v.style && v.style.toLowerCase() === st0.toLowerCase()));
                if (matchedV?.imageUrl) initialImage = matchedV.imageUrl;
              }
              if (normalized.variants && normalized.variants.length > 0) {
                const generalV = normalized.variants.find((v) => v.type === "general" || (!v.degree && !v.size && !v.style));
                if (generalV && generalV.name) {
                  setSelectedCustomVariant(generalV.name);
                  if (generalV.imageUrl) initialImage = generalV.imageUrl;
                }
              }

              setSelectedImage(initialImage);
              setNotFound(false);
              addRecentlyViewed({
                id: normalized.id,
                title: normalized.title,
                price: normalized.price,
                originalPrice: normalized.originalPrice,
                imageUrl: normalized.imageUrl,
                rating: normalized.rating,
                ratingCount: normalized.ratingCount,
              });
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

  // Active Matched Variant based on selections
  const activeMatchedVariant = useMemo(() => {
    if (!product?.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
      return null;
    }
    return product.variants.find((v) => {
      const vName = (v.name || "").trim().toLowerCase();
      if (selectedDegree && (vName === selectedDegree.toLowerCase() || (v.degree && v.degree.toLowerCase() === selectedDegree.toLowerCase()))) {
        return true;
      }
      if (selectedSize && (vName === selectedSize.toLowerCase() || (v.size && v.size.toLowerCase() === selectedSize.toLowerCase()))) {
        return true;
      }
      if (selectedStyle && (vName === selectedStyle.toLowerCase() || (v.style && v.style.toLowerCase() === selectedStyle.toLowerCase()))) {
        return true;
      }
      if (selectedCustomVariant && vName === selectedCustomVariant.toLowerCase()) {
        return true;
      }
      return false;
    }) || null;
  }, [product, selectedDegree, selectedSize, selectedStyle, selectedCustomVariant]);

  const activePrice = activeMatchedVariant?.price && activeMatchedVariant.price > 0 ? activeMatchedVariant.price : (product?.price || 0);
  const activeOriginalPrice = product ? Math.max(product.originalPrice || 0, activePrice) : activePrice;
  const savings = product ? Math.max(0, activeOriginalPrice - activePrice) : 0;
  const savingsPercent = activeOriginalPrice > 0 && savings > 0 ? Math.round((savings / activeOriginalPrice) * 100) : 0;

  // Selected variant configuration
  const currentVariant = useMemo(() => {
    if (!product) return undefined;
    const variantLabel = activeMatchedVariant?.name || selectedDegree || selectedSize || selectedStyle || selectedCustomVariant || "";
    const hasVar =
      Boolean(variantLabel) ||
      (product.degrees && product.degrees.length > 0) ||
      (product.sizes && product.sizes.length > 0) ||
      (product.styles && product.styles.length > 0);
    if (!hasVar) return undefined;
    return {
      name: variantLabel || undefined,
      degree: selectedDegree || undefined,
      size: selectedSize || undefined,
      style: selectedStyle || undefined,
    };
  }, [product, activeMatchedVariant, selectedDegree, selectedSize, selectedStyle, selectedCustomVariant]);

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

    // Include variant images in gallery if not already present
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        if (v.imageUrl && !list.includes(v.imageUrl)) {
          list.push(v.imageUrl);
        }
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
                {activeOriginalPrice > activePrice && (
                  <span className={styles.originalPrice}>Rs. {activeOriginalPrice.toLocaleString("en-IN")}.00</span>
                )}
                <span className={styles.currentPrice}>Rs. {activePrice.toLocaleString("en-IN")}.00</span>
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

              {/* Variant Selectors: Degree, Size, Style & Custom Variants */}
              {((product.degrees && product.degrees.length > 0) ||
                (product.sizes && product.sizes.length > 0) ||
                (product.styles && product.styles.length > 0) ||
                (product.variants && product.variants.length > 0)) && (
                <div className={styles.variantsContainer}>
                  {/* Degree Selector */}
                  {product.degrees && product.degrees.length > 0 && (
                    <div className={styles.variantGroup}>
                      <span className={styles.variantLabel}>
                        Spray Angle (Degree): <strong className={styles.variantActiveVal}>{selectedDegree}</strong>
                      </span>
                      <div className={styles.variantPills}>
                        {product.degrees.map((deg) => {
                          const vImg = findVariantImage("degree", deg);
                          const vObj = product.variants?.find((v) => (v.name && v.name.toLowerCase() === deg.toLowerCase()) || (v.degree && v.degree.toLowerCase() === deg.toLowerCase()));
                          return (
                            <button
                              key={deg}
                              type="button"
                              onClick={() => handleSelectVariant("degree", deg)}
                              className={`${styles.variantPill} ${selectedDegree === deg ? styles.variantPillActive : ""}`}
                            >
                              {vImg && (
                                <span className={styles.variantThumbBox}>
                                  <Image src={vImg} alt={deg} fill sizes="24px" style={{ objectFit: "contain" }} />
                                </span>
                              )}
                              <span>{deg}</span>
                              {vObj?.price && vObj.price > 0 && vObj.price !== product.price && (
                                <span style={{ fontSize: "11px", opacity: 0.85, fontWeight: 700 }}>(₹{vObj.price})</span>
                              )}
                            </button>
                          );
                        })}
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
                        {product.sizes.map((sz) => {
                          const vImg = findVariantImage("size", sz);
                          const vObj = product.variants?.find((v) => (v.name && v.name.toLowerCase() === sz.toLowerCase()) || (v.size && v.size.toLowerCase() === sz.toLowerCase()));
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleSelectVariant("size", sz)}
                              className={`${styles.variantPill} ${selectedSize === sz ? styles.variantPillActive : ""}`}
                            >
                              {vImg && (
                                <span className={styles.variantThumbBox}>
                                  <Image src={vImg} alt={sz} fill sizes="24px" style={{ objectFit: "contain" }} />
                                </span>
                              )}
                              <span>{sz}</span>
                              {vObj?.price && vObj.price > 0 && vObj.price !== product.price && (
                                <span style={{ fontSize: "11px", opacity: 0.85, fontWeight: 700 }}>(₹{vObj.price})</span>
                              )}
                            </button>
                          );
                        })}
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
                        {product.styles.map((st) => {
                          const vImg = findVariantImage("style", st);
                          const vObj = product.variants?.find((v) => (v.name && v.name.toLowerCase() === st.toLowerCase()) || (v.style && v.style.toLowerCase() === st.toLowerCase()));
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleSelectVariant("style", st)}
                              className={`${styles.variantPill} ${selectedStyle === st ? styles.variantPillActive : ""}`}
                            >
                              {vImg && (
                                <span className={styles.variantThumbBox}>
                                  <Image src={vImg} alt={st} fill sizes="24px" style={{ objectFit: "contain" }} />
                                </span>
                              )}
                              <span>{st}</span>
                              {vObj?.price && vObj.price > 0 && vObj.price !== product.price && (
                                <span style={{ fontSize: "11px", opacity: 0.85, fontWeight: 700 }}>(₹{vObj.price})</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* General / Custom Variants (if configured without explicit degree/size/style lists) */}
                  {product.variants &&
                    product.variants.filter((v) => v.type === "general" || (!product.degrees?.includes(v.name || "") && !product.sizes?.includes(v.name || "") && !product.styles?.includes(v.name || ""))).length > 0 && (
                      <div className={styles.variantGroup}>
                        <span className={styles.variantLabel}>
                          Choose Variation: <strong className={styles.variantActiveVal}>{selectedCustomVariant || product.variants[0]?.name}</strong>
                        </span>
                        <div className={styles.variantPills}>
                          {product.variants
                            .filter((v) => v.type === "general" || (!product.degrees?.includes(v.name || "") && !product.sizes?.includes(v.name || "") && !product.styles?.includes(v.name || "")))
                            .map((v, i) => (
                              <button
                                key={v.id || v.name || i}
                                type="button"
                                onClick={() => handleSelectVariant("general", v.name || "")}
                                className={`${styles.variantPill} ${selectedCustomVariant === v.name ? styles.variantPillActive : ""}`}
                              >
                                {v.imageUrl && (
                                  <span className={styles.variantThumbBox}>
                                    <Image src={v.imageUrl} alt={v.name || "Variant"} fill sizes="24px" style={{ objectFit: "contain" }} />
                                  </span>
                                )}
                                <span>{v.name}</span>
                                {v.price && <span style={{ fontSize: "11px", opacity: 0.85, fontWeight: 700 }}>(₹{v.price})</span>}
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
                        const variantImg = activeMatchedVariant?.imageUrl || selectedImage || product.imageUrl;
                        addToCart(
                          {
                            id: product.id,
                            productId: product.id,
                            title: product.title,
                            price: activePrice,
                            imageUrl: variantImg,
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
                        const variantImg = activeMatchedVariant?.imageUrl || selectedImage || product.imageUrl;
                        addToCart(
                          {
                            id: product.id,
                            productId: product.id,
                            title: product.title,
                            price: activePrice,
                            imageUrl: variantImg,
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
          {filteredRecent.length > 0 && (
            <div className={styles.recentSection}>
              <div className={styles.sectionHeaderRow}>
                <div className={styles.titleTab}>
                  <h2 className={styles.titleText}>BASED ON YOUR RECENT VIEWS</h2>
                </div>
                <div className={styles.headerLine}></div>

                {/* Navigation Arrows for Slider */}
                <div className={styles.navButtons}>
                  <button
                    className={styles.arrowBtn}
                    onClick={() => scrollRecentSlider("left")}
                    aria-label="Scroll left"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <button
                    className={styles.arrowBtn}
                    onClick={() => scrollRecentSlider("right")}
                    aria-label="Scroll right"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>

              {filteredRecent.length < 5 ? (
                <div className={styles.recentSliderContainer}>
                  <div className={styles.recentGrid} ref={recentSliderRef}>
                    {filteredRecent.map((prod) => (
                      <div key={prod.id} className={styles.recentCard}>
                        <Link href={`/product/${prod.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", flexGrow: 1 }}>
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
                              {[1, 2, 3, 4, 5].map((s) => (
                                <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="#ffd300" stroke="#ffd300" strokeWidth="1">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                              ))}
                              <span>{prod.ratingCount || 0} Reviews</span>
                            </div>
                            <div style={{ marginTop: "4px", fontSize: "14px", fontWeight: 800, color: "#132c66" }}>
                              ₹{prod.price.toLocaleString("en-IN")}
                            </div>
                          </div>
                        </Link>
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
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.recentMarqueeContainer} ref={recentSliderRef}>
                  <div className={styles.recentMarqueeTrack}>
                    {/* 4 Duplicated list copies for 100% gapless infinite loop */}
                    {[1, 2, 3, 4].map((copyIndex) => (
                      <div key={copyIndex} className={styles.recentRow} aria-hidden={copyIndex > 1 ? "true" : undefined}>
                        {filteredRecent.map((prod) => (
                          <div key={`${prod.id}-copy-${copyIndex}`} className={styles.recentCard}>
                            <Link href={`/product/${prod.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", flexGrow: 1 }}>
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
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="#ffd300" stroke="#ffd300" strokeWidth="1">
                                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                  ))}
                                  <span>{prod.ratingCount || 0} Reviews</span>
                                </div>
                                <div style={{ marginTop: "4px", fontSize: "14px", fontWeight: 800, color: "#132c66" }}>
                                  ₹{prod.price.toLocaleString("en-IN")}
                                </div>
                              </div>
                            </Link>
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
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
