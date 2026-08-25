"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import SummerOffer from "@/components/home/SummerOffer";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import styles from "./ProductPage.module.css";

// Sample Accessory Products for "Based on your recent views"
const RECENT_PRODUCTS = [
  { id: "rec-1", title: "Brass Coupler Connector Fitting Quick Join", imageUrl: "/images/products/nozzle_tips.jpg", rating: 5, ratingCount: 241 },
  { id: "rec-2", title: "TUQO Premium 4Pcs Spray Nozzle Set", imageUrl: "/images/products/nozzle_tips.jpg", rating: 5, ratingCount: 780 },
  { id: "rec-3", title: "Heavy Duty Brass Adapter Coupling Male/Female", imageUrl: "/images/products/trigger_gun.jpg", rating: 4, ratingCount: 605 },
  { id: "rec-4", title: "Universal Red Adapter Quick Release Fitting", imageUrl: "/images/products/trigger_gun.jpg", rating: 4, ratingCount: 420 },
  { id: "rec-5", title: "High Pressure Washer Water Hose 5 Meters", imageUrl: "/images/products/hw2000.jpg", rating: 5, ratingCount: 241 }
];

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ProductPage({ params }: PageProps) {
  // Using params to trigger suspense/render binding
  use(params);
  
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const isFavourite = isInWishlist("prod-3");
  
  // States
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedImage, setSelectedImage] = useState("/images/products/cdw400.jpg");

  // Gallery thumbnails
  const gallery = [
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
              <Link href="/shop/tuqo">HIGH PRESSURE WASHER</Link>
              <span className={styles.separator}>/</span>
              <Link href="/shop/tuqo">DOMESTIC PRESSURE WASHER</Link>
              <span className={styles.separator}>/</span>
              <span className={styles.activePath}>TUQO Cordless High Pressure Washer CDW400</span>
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
                  &lt;
                </button>
                <div className={styles.mainImageContainer}>
                  <Image
                    src={selectedImage}
                    alt="Product Main Image"
                    width={400}
                    height={400}
                    className={styles.mainImage}
                    priority
                  />
                </div>
                <button onClick={handleNextImage} className={styles.galleryArrowRight} aria-label="Next image">
                  &gt;
                </button>
              </div>

              {/* Thumbnails row */}
              <div className={styles.thumbnailsWrapper}>
                <button className={styles.thumbNavBtn} onClick={handlePrevImage}>&lt;</button>
                <div className={styles.thumbnailsGrid}>
                  {gallery.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`${styles.thumbnailCard} ${selectedImage === img ? styles.activeThumbnail : ""}`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        width={60}
                        height={60}
                        className={styles.thumbnailImg}
                      />
                    </button>
                  ))}
                </div>
                <button className={styles.thumbNavBtn} onClick={handleNextImage}>&gt;</button>
              </div>
            </div>

            {/* Right Column: Details & Actions */}
            <div className={styles.infoColumn}>
              <div className={styles.headerRow}>
                <h1 className={styles.productTitle}>
                  TUQO Cordless Pressure Washer | 4000mAh Rechargeable Battery | Type-C Charging | Portable Washer Gun with AdjustableNozzle & 5M Hose for Car, Bike, Cycle,Roof & Floor Cleaning CDW400
                </h1>
                <button 
                  onClick={() => toggleWishlist({
                    id: "prod-3",
                    title: "TUQO Cordless High Pressure Washer CDW400",
                    price: 6299,
                    imageUrl: "/images/products/cdw400.jpg"
                  })} 
                  className={styles.shareBtn} 
                  aria-label="Add to wishlist"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavourite ? "#132c66" : "none"} stroke="#132c66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>

              {/* Price block */}
              <div className={styles.priceContainer}>
                <span className={styles.originalPrice}>Rs. 8,299.00</span>
                <span className={styles.currentPrice}>Rs. 6,299.00</span>
                <span className={styles.savingsTag}>You Save : Rs. 2000(25%)</span>
              </div>

              {/* Review summary */}
              <div className={styles.ratingsRow}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="#ffd300" stroke="#ffd300" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  ))}
                </div>
                <span className={styles.reviewsCount}>241 Reviews</span>
              </div>

              {/* Quantity block */}
              <div className={styles.quantityContainer}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className={styles.qtyBtn}
                >
                  -
                </button>
                <input 
                  type="text" 
                  value={quantity} 
                  readOnly 
                  className={styles.qtyInput}
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className={styles.qtyBtn}
                >
                  +
                </button>
              </div>

              {/* Main Actions */}
              <div className={styles.actionsBlock}>
                <button 
                  onClick={() => {
                    addToCart({
                      id: "prod-3",
                      title: "TUQO Cordless Pressure Washer | 4000mAh Rechargeable Battery | Type-C Charging | Portable Washer Gun",
                      price: 6299,
                      imageUrl: "/images/products/cdw400.jpg"
                    }, quantity);
                    router.push("/cart");
                  }}
                  className={styles.buyNowBtn}
                >
                  Buy Now
                </button>
                <button 
                  onClick={() => addToCart({
                    id: "prod-3",
                    title: "TUQO Cordless Pressure Washer | 4000mAh Rechargeable Battery | Type-C Charging | Portable Washer Gun",
                    price: 6299,
                    imageUrl: "/images/products/cdw400.jpg"
                  }, quantity)}
                  className={styles.addToCartBtn}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.cartIcon}>
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <span>Add to Cart</span>
                </button>
              </div>

              {/* Product Information List */}
              <div className={styles.infoSection}>
                <h3 className={styles.infoHeading}>PRODUCT INFORMATION</h3>
                <ul className={styles.infoList}>
                  <li>POWER : 180W/35BAR</li>
                  <li>LOW NOISE AND POWERFULL MOTOR</li>
                  <li>LIGHTWEIGHT AND SUPER COMPACT</li>
                  <li>POWERFULL CORDLESS AND RECHARGEABLE 4000 MAH BATTERY WITH TYPE-C</li>
                  <li>SIMPLE ASSEMBLY AND DRAW WATER FROM ANYWHERE</li>
                </ul>
              </div>

              {/* Trust Badges */}
              <div className={styles.badgesRow}>
                <div className={styles.badgeItem}>
                  <div className={styles.badgeCircle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#132c66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
                      <polyline points="2 8.5 12 15 22 8.5"></polyline>
                      <polyline points="12 22 12 15"></polyline>
                    </svg>
                  </div>
                  <span>Top Brands</span>
                </div>
                <div className={styles.badgeItem}>
                  <div className={styles.badgeCircle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#132c66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <span>100% Verified</span>
                </div>
                <div className={styles.badgeItem}>
                  <div className={styles.badgeCircle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#132c66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              <button 
                onClick={() => setActiveTab("reviews")}
                className={`${styles.tabBtn} ${activeTab === "reviews" ? styles.activeTab : ""}`}
              >
                Customer Reviews
              </button>
            </div>

            <div className={styles.tabContentArea}>
              {activeTab === "description" && (
                <ol className={styles.descriptionList}>
                  <li><strong>POWER MACHINE</strong> - EXPERIENCE ENHANCED POWER WITH THE 180W TUQO CORDLESS PORTABLE WASHER, DELIVERING UP TO 35BAR OF PRESSURE AND A RATED WATER FLOW OF 4L/MIN. THIS POWERHOUSE PROVIDES TWICE THE PRESSURE OF A GARDEN HOSE WITH A NOZZLE, WHILE OFFERING THE CONVENIENCE AND PORTABILITY TO TAKE YOUR CLEANING TASKS ANYWHERE.</li>
                  <li><strong>IN THE BOX</strong> - TUQO CORDLESS PRESSURE WASHER COMES EQUIPPED WITH AN ADJUSTABLE NOZZLE, FOAM LANCE AND HOSE. MAKING IT A VERSATILE TOOL FOR VARIOUS CLEANING TASKS. THE FOAM MODE IS PARTICULARLY EFFECTIVE FOR TACKLING STUBBORN STAINS—JUST ADD SHAMPOO TO THE FOAM BOTTLE, AND THIS MULTIFUNCTIONAL WASHING GUN DELIVERS A MORE CONVENIENT AND EFFICIENT CLEANING EXPERIENCE COMPARED TO STANDARD CLEANING METHODS, THANKS TO ITS POWERFUL MOTOR.</li>
                  <li><strong>LIGHTWEIGHT, POCKET SIZE & EASY TO ASSEMBLE</strong> - WEIGHING JUST 940 GRAMS, THE TUQO HIGH PRESSURE CORDLESS WASHER IS DESIGNED FOR ULTIMATE PORTABILITY AND CONVENIENCE. UNLIKE TRADITIONAL WASHING MACHINES, THIS CORDLESS WASHER IS SIGNIFICANTLY LIGHTER AND EASIER TO STORE, MAKING IT PERFECT FOR QUICK AND EFFICIENT CLEANING ON THE GO. WITH ITS SIMPLE AND QUICK INSTALLATION PROCESS, YOU CAN BE READY TO TACKLE ANY CLEANING TASK IN JUST MINUTES.</li>
                  <li><strong>LESS NOISE, MORE POWER</strong> - IT COMES WITH A 5-METER LONG GARDEN HOSE, ALLOWING YOU TO DRAW WATER FROM ANY FRESH WATER SOURCE, SUCH AS A BOTTLE, POOL, LAKE, OR BUCKET.</li>
                  <li><strong>MULTI-USE PRESSURE WASHER</strong> - IDEAL FOR CLEANING AND MAINTAINING MOTOR VEHICLES, AGRICULTURAL MACHINERY, AND MORE, OUR PRESSURE WASHER GUN EXCELS AT TACKLING TOUGH EXTERIOR SURFACES LIKE BUILDING WALLS, FLOORS, BATHS, POOLS, DOORS, WINDOWS, AND HARD-TO-REACH CORNERS. IT&apos;S THE PERFECT PRESSURE WASHER FOR OUTDOOR CAMPING AND LONG TRIPS.</li>
                  <li>IT IS SUGGESTED CUSTOMERS USE 5WATT CHARGER TO CHARGE THE PRODUCT</li>
                </ol>
              )}
              {activeTab === "specification" && (
                <div className={styles.tabPane}>
                  <p>Motor Power: 180W | Max Pressure: 35 Bar | Rated Flow: 4 L/min | Battery Capacity: 4000mAh | Interface: Type-C USB Charging</p>
                </div>
              )}
              {activeTab === "box" && (
                <div className={styles.tabPane}>
                  <p>1x TUQO Cordless Pressure Washer CDW400, 1x Foam Spray Bottle Lance, 1x 5m Inlet Water Hose, 1x Multi-functional Nozzle, 1x USB-C Cable, 1x Manual Guide.</p>
                </div>
              )}
              {activeTab === "reviews" && (
                <div className={styles.tabPane}>
                  <p>Verified Ratings: 5/5 stars based on 241 reviews. Customer praise the excellent portable motor force, strong pressure output and high durability battery.</p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Based on your recent views */}
          <div className={styles.recentSection}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.titleTab}>
                <h2 className={styles.titleText}>BASED ON YOUR RECENT VIEWS</h2>
              </div>
              <div className={styles.headerLine}></div>
            </div>

            <div className={styles.recentGrid}>
              {RECENT_PRODUCTS.map((prod) => (
                <div key={prod.id} className={styles.recentCard}>
                  <div className={styles.recentImgBox}>
                    <Image src={prod.imageUrl} alt={prod.title} width={160} height={120} className={styles.recentImg} />
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
                        onClick={() => addToCart({ id: prod.id, title: prod.title, price: 499, imageUrl: prod.imageUrl })}
                        className={styles.cardCartBtn}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span>Add To Cart</span>
                      </button>
                      <button 
                        onClick={() => toggleWishlist({ id: prod.id, title: prod.title, price: 499, imageUrl: prod.imageUrl })}
                        className={`${styles.cardHeartBtn} ${isInWishlist(prod.id) ? styles.cardHeartActive : ""}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill={isInWishlist(prod.id) ? "#132c66" : "none"} stroke="#132c66" strokeWidth="2.5">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Premium Summer Offer */}
          <div className={styles.recentSection}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.titleTab}>
                <h2 className={styles.titleText}>PREMIUM SUMMER OFFER</h2>
              </div>
              <div className={styles.headerLine}></div>
            </div>
            <SummerOffer />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
