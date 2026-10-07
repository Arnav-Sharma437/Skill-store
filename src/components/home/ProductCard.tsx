"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { optimizeProductCard } from "@/lib/imageOptimization";
import styles from "./ProductCard.module.css";
import { Product } from "@/data/home";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const isFavourite = isInWishlist(product.id);

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    const stockQty = typeof product.stockQuantity === "number" ? product.stockQuantity : (product.inStock !== false ? 10 : 0);
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price || 4999,
      imageUrl: product.imageUrl,
      stockQuantity: stockQty,
    });
  };

  const handleToggleFavourite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist({
      id: product.id,
      title: product.title,
      price: product.price || 4999,
      imageUrl: product.imageUrl
    });
  };

  // Helper to render the yellow stars
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={styles.starIcon}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={i <= rating ? "#ffd300" : "#d1d5db"} // Yellow or grey
          stroke={i <= rating ? "#ffd300" : "#d1d5db"}
          strokeWidth="1"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      );
    }
    return stars;
  };

  return (
    <div className={styles.card}>
      {/* Product Image Box */}
      <Link href={`/product/${product.id}`} className={styles.imageLink}>
        <div className={styles.imageContainer}>
          <Image
            src={optimizeProductCard(product.imageUrl)}
            alt={product.title}
            width={240}
            height={180}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className={styles.image}
            style={{ objectFit: "contain" }}
          />
        </div>
      </Link>

      {/* Product Metadata */}
      <div className={styles.details}>
        <Link href={`/product/${product.id}`} className={styles.titleLink}>
          <h3 className={styles.title} title={product.title}>
            {product.title}
          </h3>
        </Link>

        {/* Rating Row */}
        <div className={styles.ratingRow}>
          <div className={styles.stars}>{renderStars(product.rating)}</div>
          <span className={styles.reviewCount}>{product.ratingCount} Reviews</span>
        </div>

        {/* Stock Availability Badge (Only show when Out of Stock) */}
        {(() => {
          const isOutOfStock = product.inStock === false || (typeof product.stockQuantity === "number" && product.stockQuantity <= 0);

          if (isOutOfStock) {
            return (
              <div style={{ margin: "2px 0 6px 0" }}>
                <span style={{ fontSize: "11px", fontWeight: "750", color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", padding: "1px 6px", borderRadius: "4px", display: "inline-block" }}>
                  ❌ Out of Stock
                </span>
              </div>
            );
          }
          return null;
        })()}

        {/* Price Row */}
        <div className={styles.priceRow}>
          <span className={styles.price}>Rs. {(product.price || 4999).toLocaleString("en-IN")}.00</span>
          {product.originalPrice && product.originalPrice > (product.price || 4999) && (
            <span className={styles.originalPrice}>Rs. {product.originalPrice.toLocaleString("en-IN")}</span>
          )}
        </div>

        {/* Action Row */}
        <div className={styles.actionRow}>
          {/* Add to Cart Button */}
          {(() => {
            const isOutOfStock = product.inStock === false || (typeof product.stockQuantity === "number" && product.stockQuantity <= 0);
            return (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={styles.cartButton}
                style={isOutOfStock ? { background: "#e2e8f0", color: "#94a3b8", cursor: "not-allowed" } : undefined}
                aria-label={isOutOfStock ? `${product.title} is out of stock` : `Add ${product.title} to cart`}
              >
                {/* Cart SVG */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.cartIcon}>
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>{isOutOfStock ? "Out of Stock" : "Add To Cart"}</span>
              </button>
            );
          })()}

          {/* Favourite Button */}
          <button 
            onClick={handleToggleFavourite} 
            className={`${styles.favouriteButton} ${isFavourite ? styles.favouriteActive : ""}`}
            aria-label="Add to favourites"
          >
            {/* Heart SVG */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill={isFavourite ? "#132c66" : "none"} stroke="#132c66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
