"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./SummerOffer.module.css";
import { SUMMER_OFFERS } from "@/data/home";

export default function SummerOffer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalItems = SUMMER_OFFERS.length;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
  };

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Section Header Row */}
        <div className={styles.headerRow}>
          {/* Angled Section Tab */}
          <div className={styles.titleTab}>
            <h2 className={styles.title}>PREMIUM SUMMER OFFER</h2>
          </div>
          {/* Bottom underline */}
          <div className={styles.headerLine}></div>
          {/* Carousel Arrows */}
          <div className={styles.arrows}>
            <button onClick={handlePrev} className={styles.arrowBtn} aria-label="Scroll left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button onClick={handleNext} className={styles.arrowBtn} aria-label="Scroll right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Banners Row with CSS Transition */}
        <div className={styles.scrollContainer}>
          <div 
            className={styles.bannersRow}
            style={{ 
              transform: `translateX(-${currentIndex * 470}px)`,
              transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
            }}
          >
            {SUMMER_OFFERS.map((offer) => {
              const isNarrow = offer.id === "offer-3";
              const cardClass = isNarrow ? styles.narrowCard : styles.wideCard;
              const imgWidth = isNarrow ? 300 : 450;
              const imgHeight = isNarrow ? 400 : 338;
              
              return (
                <Link href={offer.link} key={offer.id} className={`${styles.bannerCard} ${cardClass}`}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={offer.imageUrl}
                      alt={offer.title}
                      width={imgWidth}
                      height={imgHeight}
                      className={styles.image}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
