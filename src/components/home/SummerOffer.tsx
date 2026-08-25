"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./SummerOffer.module.css";
import { SUMMER_OFFERS } from "@/data/home";

export default function SummerOffer() {
  const [offers, setOffers] = useState(SUMMER_OFFERS);
  const [offset, setOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setOffset(-620); // Slide left by wide card width (600px) + gap (20px)
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setOffset(620); // Slide right by wide card width + gap
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (offset < 0) {
      // Next: shift first offer to the end
      setOffers((prev) => [...prev.slice(1), prev[0]]);
    } else if (offset > 0) {
      // Prev: shift last offer to the front
      setOffers((prev) => [prev[prev.length - 1], ...prev.slice(0, prev.length - 1)]);
    }
    setOffset(0); // Reset translation offset instantly
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

        {/* Banners Row with Seamless Transition */}
        <div className={styles.scrollContainer}>
          <div 
            className={styles.bannersRow}
            style={{ 
              transform: `translateX(${offset}px)`,
              transition: isTransitioning ? "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)" : "none"
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {offers.map((offer) => {
              const cardClass = styles.wideCard;
              const imgWidth = 600;
              const imgHeight = 370;
              
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
