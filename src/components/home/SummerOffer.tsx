"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./SummerOffer.module.css";
import { SUMMER_OFFERS } from "@/data/home";

export default function SummerOffer() {
  const [offers, setOffers] = useState(SUMMER_OFFERS);

  const scrollLeft = () => {
    // Shift elements to the right (move last to first)
    setOffers((prev) => [prev[prev.length - 1], ...prev.slice(0, prev.length - 1)]);
  };

  const scrollRight = () => {
    // Shift elements to the left (move first to last)
    setOffers((prev) => [...prev.slice(1), prev[0]]);
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
            <button onClick={scrollLeft} className={styles.arrowBtn} aria-label="Scroll left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button onClick={scrollRight} className={styles.arrowBtn} aria-label="Scroll right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Banners Row */}
        <div className={styles.scrollContainer}>
          <div className={styles.bannersRow}>
            {offers.map((offer) => {
              // The third banner (idx === 2) in the initial array was narrow, but since they rotate,
              // we can map the styling based on the original offer id so that specific cards stay styled correctly!
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
