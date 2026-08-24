"use client";

import React from "react";
import styles from "./ProductCard.module.css";
import { Product } from "@/data/home";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Select gradient and SVG based on category
  const renderCardArtwork = () => {
    let gradientClass = styles.gradientDev;
    let svgIcon = (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    );

    if (product.category.toLowerCase().includes("design")) {
      gradientClass = styles.gradientDesign;
      svgIcon = (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path>
          <path d="M12 6V12L16 14"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      );
    } else if (product.category.toLowerCase().includes("data") || product.category.toLowerCase().includes("ai")) {
      gradientClass = styles.gradientAI;
      svgIcon = (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      );
    } else if (product.category.toLowerCase().includes("marketing")) {
      gradientClass = styles.gradientMarketing;
      svgIcon = (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      );
    } else if (product.category.toLowerCase().includes("business")) {
      gradientClass = styles.gradientBusiness;
      svgIcon = (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      );
    }

    return (
      <div className={`${styles.imageWrapper} ${gradientClass}`}>
        {product.badge && <span className={styles.productBadge}>{product.badge}</span>}
        <div className={styles.iconContainer}>{svgIcon}</div>
      </div>
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    alert(`Added to Cart: ${product.title}`);
  };

  return (
    <div className={styles.card}>
      {/* Visual Artwork Banner */}
      {renderCardArtwork()}

      {/* Card Content */}
      <div className={styles.content}>
        <div className={styles.categoryRow}>
          <span className={styles.category}>{product.category}</span>
          <div className={styles.rating}>
            <svg className={styles.starIcon} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span className={styles.ratingVal}>{product.rating.toFixed(1)}</span>
            <span className={styles.ratingCount}>({product.ratingCount.toLocaleString()})</span>
          </div>
        </div>

        <h3 className={styles.title} title={product.title}>
          {product.title}
        </h3>
        <p className={styles.instructor}>{product.instructor}</p>

        {/* Pricing Row */}
        <div className={styles.footerRow}>
          <div className={styles.pricing}>
            <span className={styles.price}>${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button 
            className={styles.cartButton} 
            onClick={handleAddToCart}
            aria-label={`Add ${product.title} to cart`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
