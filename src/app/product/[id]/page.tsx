"use client";

import React, { useState, useMemo, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { useApp } from "@/context/AppContext";
import { getProductById } from "@/data/categories";
import styles from "./ProductPage.module.css";

// Accessory Products for "Based on your recent views"
const RECENT_PRODUCTS = [
  { id: "acc-1", title: "Brass Coupler Connector Fitting Quick Join", price: 499, imageUrl: "/images/products/nozzle_tips.jpg", rating: 5, ratingCount: 241 },
  { id: "acc-2", title: "TUQO Premium 4Pcs Spray Nozzle Set", price: 899, imageUrl: "/images/products/nozzle_tips.jpg", rating: 5, ratingCount: 780 },
  { id: "acc-3", title: "Heavy Duty Brass Adapter Coupling Male/Female", price: 650, imageUrl: "/images/products/trigger_gun.jpg", rating: 4, ratingCount: 605 },
  { id: "acc-4", title: "Universal Red Adapter Quick Release Fitting", price: 399, imageUrl: "/images/products/trigger_gun.jpg", rating: 4, ratingCount: 420 },
  { id: "acc-5", title: "High Pressure Washer Water Hose 5 Meters", price: 1200, imageUrl: "/images/products/hw2000.jpg", rating: 5, ratingCount: 241 }
];

// Verified Product Reviews
const PRODUCT_REVIEWS = [
  {
    id: 1,
    name: "Maheshwaran S.",
    location: "Coimbatore, Tamil Nadu",
    rating: 5,
    date: "August 2026",
    badge: "Verified Buyer",
    title: "Exceptional Cleaning Pressure & Rock-Solid Build Quality",
    comment: "Purchased this washer for regular auto detailing and patio cleaning. The motor runs smoothly with consistent pressure output. High grade brass attachments and prompt delivery from Skill Store."
  },
  {
    id: 2,
    name: "Karan Gill",
    location: "Delhi NCR",
    rating: 5,
    date: "July 2026",
    badge: "Verified Buyer",
    title: "Great Value for Heavy Duty Workshop Work",
    comment: "Very easy to assemble, lightweight yet powerful. The pressure gun and adjustable nozzles make washing cars and machinery effortless. 100% genuine spares."
  },
  {
    id: 3,
    name: "Deepak Varma",
    location: "Bengaluru, Karnataka",
    rating: 5,
    date: "June 2026",
    badge: "Verified Buyer",
    title: "Original Genuine Machine & Super Fast Dispatch",
    comment: "Received the package in 2 days. 100% authentic manufacturer warranty and very reliable performance. Highly recommended machinery store in India!"
  }
];

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ProductPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useApp();

  // Resolve Product
  const product = useMemo(() => {
    const found = getProductById(id);
    if (found) return found;

    // Fallback default product
    return {
      id: id,
      title: "TUQO Cordless High Pressure Washer CDW400 / 24V Lithium",
      price: 6299,
      originalPrice: 8299,
      imageUrl: "/images/products/cdw400.jpg",
      rating: 5,
      ratingCount: 241,
      brand: "TUQO",
      categorySlug: "high-pressure-washer",
      categoryName: "High Pressure Washer",
      subType: "domestic" as const,
      inStock: true
    };
  }, [id]);

  const isFavourite = isInWishlist(product.id);
  const savings = Math.max(0, product.originalPrice - product.price);
  const savingsPercent = Math.round((savings / product.originalPrice) * 100);

  // States
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedImage, setSelectedImage] = useState(product.imageUrl);

  // Gallery thumbnails
  const gallery = [
    product.imageUrl,
    "/images/products/cdw400.jpg",
    "/images/products/hw2000.jpg",
    "/images/products/nozzle_tips.jpg",
    "/images/products/trigger_gun.jpg",
    "/images/products/compressor.jpg"
  ];

  const handleNextImage = () => {
    const currentIndex = gallery.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % gallery.length;
    setSelectedImage(gallery[nextIndex]);
  };

  const handlePrevImage = () => {
    const currentIndex = gallery.indexOf(selectedImage);
    const prevIndex = (currentIndex - 1 + gallery.length) % gallery.length;
    setSelectedImage(gallery[prevIndex]);
  };

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
                    src={selectedImage || product.imageUrl}
                    alt={product.title}
                    width={400}
                    height={400}
                    className={styles.mainImage}
                    priority
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <button onClick={handleNextImage} className={styles.galleryArrowRight} aria-label="Next image">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>

              {/* Thumbnails row (Auto / touch scrollable strip without manual arrow clutter) */}
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
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        width={60}
                        height={60}
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
                    <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={s <= product.rating ? "#ffd300" : "#d1d5db"} stroke={s <= product.rating ? "#ffd300" : "#d1d5db"} strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  ))}
                </div>
                <span className={styles.reviewsCount}>({product.ratingCount || 241} Verified Customer Reviews)</span>
              </div>

              {/* Quantity Picker */}
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

              {/* Action Buttons */}
              <div className={styles.actionsBlock}>
                <button 
                  onClick={() => {
                    for (let i = 0; i < quantity; i++) {
                      addToCart({ id: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl });
                    }
                    router.push("/cart");
                  }}
                  className={styles.buyNowBtn}
                >
                  Buy Now
                </button>
                <button 
                  onClick={() => {
                    for (let i = 0; i < quantity; i++) {
                      addToCart({ id: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl });
                    }
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
              </div>

              {/* Product Info List */}
              <div className={styles.infoSection}>
                <h4 className={styles.infoHeading}>PRODUCT INFORMATION</h4>
                <ul className={styles.infoList}>
                  <li>HIGH PERFORMANCE HEAVY-DUTY INDUSTRIAL MOTOR</li>
                  <li>LOW NOISE &amp; ULTRA RELIABLE MECHANISM</li>
                  <li>LIGHTWEIGHT, COMPACT &amp; EASY ERGONOMIC HANDLING</li>
                  <li>SOLID BRASS FITTINGS &amp; PREMIUM PRESSURE TOLERANCE</li>
                  <li>DRAW WATER FROM BUCKETS, TANKS OR TAP CONNECTORS</li>
                </ul>
              </div>

              {/* Trust Badges */}
              <div className={styles.badgesRow}>
                <div className={styles.badgeItem}>
                  <div className={styles.badgeCircle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#132c66" strokeWidth="2.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                  </div>
                  <span>Top Brands</span>
                </div>
                <div className={styles.badgeItem}>
                  <div className={styles.badgeCircle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#132c66" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span>100% Verified</span>
                </div>
                <div className={styles.badgeItem}>
                  <div className={styles.badgeCircle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#132c66" strokeWidth="2.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <span>Safe Payments</span>
                </div>
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
                  <li><strong>HIGH PERFORMANCE OUTPUT</strong> - Experience powerful high performance cleaning with our precision-engineered machine. Delivers continuous pressure output and consistent water flow for rigorous automotive and industrial cleaning jobs.</li>
                  <li><strong>VERSATILE ALL-WEATHER OPERATION</strong> - Comes equipped with multi-functional quick connectors, spray lances, and inlet hoses. Tackles tough grease, grime, road salt, and mud easily.</li>
                  <li><strong>PORTABLE &amp; EASY TO ASSEMBLE</strong> - Designed for convenient handling and hassle-free operation. Simple plug-and-play assembly allows you to begin cleaning within minutes.</li>
                  <li><strong>LOW NOISE MOTOR</strong> - Built with high efficiency cooling and vibration dampening technology for quiet, long-lasting reliability.</li>
                </ol>
              )}
              {activeTab === "specification" && (
                <div className={styles.tabPane}>
                  <p>Brand: {product.brand || "SkillStore"} | Model: {product.id} | Operating Voltage: 220V - 240V / 24V DC | Construction: Reinforced Industrial Composite | Finish: Matte Premium | Warranty: 1 Year Official Manufacturer Warranty</p>
                </div>
              )}
              {activeTab === "box" && (
                <div className={styles.tabPane}>
                  <p>1x {product.title}, 1x Pressure Nozzle Set, 1x Reinforced Hose, 1x Quick Connector Coupler, 1x Foam Bottle attachment, 1x Instruction Manual &amp; Warranty Card.</p>
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
                <span className={styles.bigScore}>4.9</span>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="18" height="18" viewBox="0 0 24 24" fill="#ffd300" stroke="#ffd300" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  ))}
                </div>
                <span className={styles.totalReviewsCount}>Based on {product.ratingCount || 241} verified reviews</span>
              </div>

              {/* Progress Bars */}
              <div className={styles.barsCol}>
                {[
                  { star: "5 Star", pct: 88 },
                  { star: "4 Star", pct: 9 },
                  { star: "3 Star", pct: 2 },
                  { star: "2 Star", pct: 1 },
                  { star: "1 Star", pct: 0 }
                ].map((row, idx) => (
                  <div key={idx} className={styles.barRow}>
                    <span className={styles.barLabel}>{row.star}</span>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${row.pct}%` }}></div>
                    </div>
                    <span className={styles.barPct}>{row.pct}%</span>
                  </div>
                ))}
              </div>

              {/* Action Column */}
              <div className={styles.writeReviewCol}>
                <h4>Have you used this product?</h4>
                <p>Share your review to help other workshop owners and detailers make the right choice.</p>
                <button 
                  onClick={() => alert("Thank you for your feedback! Review submission dialog will open.")} 
                  className={styles.writeReviewBtn}
                >
                  Write a Product Review
                </button>
              </div>
            </div>

            {/* Reviews List Cards */}
            <div className={styles.reviewsListGrid}>
              {PRODUCT_REVIEWS.map((rev) => (
                <div key={rev.id} className={styles.reviewCard}>
                  <div className={styles.reviewCardHeader}>
                    <div className={styles.authorBadgeGroup}>
                      <div className={styles.reviewAvatar}>
                        {rev.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <h4 className={styles.reviewerName}>{rev.name}</h4>
                        <span className={styles.reviewerLocation}>{rev.location}</span>
                      </div>
                    </div>
                    <div className={styles.dateAndBadge}>
                      <span className={styles.verifiedBuyerTag}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        {rev.badge}
                      </span>
                      <span className={styles.reviewDate}>{rev.date}</span>
                    </div>
                  </div>

                  <div className={styles.reviewStarsRow}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#ffd300" stroke="#ffd300" strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>

                  <h5 className={styles.reviewTitle}>{rev.title}</h5>
                  <p className={styles.reviewComment}>&ldquo;{rev.comment}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Based on your recent views (Continuous Scrolling Marquee) */}
          <div className={styles.recentSection}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.titleTab}>
                <h2 className={styles.titleText}>BASED ON YOUR RECENT VIEWS</h2>
              </div>
              <div className={styles.headerLine}></div>
            </div>

            {/* Continuous Scrolling Marquee Slider Track for Recent Views */}
            <div className={styles.recentMarqueeContainer}>
              <div className={styles.recentMarqueeTrack}>
                {/* First Copy */}
                <div className={styles.recentRow}>
                  {RECENT_PRODUCTS.map((prod) => (
                    <div key={`${prod.id}-1`} className={styles.recentCard}>
                      <div className={styles.recentImgBox}>
                        <Image src={prod.imageUrl} alt={prod.title} width={160} height={120} className={styles.recentImg} style={{ objectFit: "contain" }} />
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

                {/* Duplicate Copy for Seamless Infinite Scrolling */}
                <div className={styles.recentRow} aria-hidden="true">
                  {RECENT_PRODUCTS.map((prod) => (
                    <div key={`${prod.id}-2`} className={styles.recentCard}>
                      <div className={styles.recentImgBox}>
                        <Image src={prod.imageUrl} alt={prod.title} width={160} height={120} className={styles.recentImg} style={{ objectFit: "contain" }} />
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

      <Footer />
    </>
  );
}
