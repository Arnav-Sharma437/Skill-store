"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./SummerOffer.module.css";
import { SUMMER_OFFERS } from "@/data/home";

export default function SummerOffer() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
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

        {/* Banners Row (Scrollable carousel container) */}
        <div ref={scrollRef} className={styles.scrollContainer}>
          <div className={styles.bannersRow}>
            {SUMMER_OFFERS.map((offer, idx) => {
              // The third banner is narrow (3:4 ratio), others are wider (4:3 ratio)
              const cardClass = idx === 2 ? styles.narrowCard : styles.wideCard;
              const imgWidth = idx === 2 ? 300 : 450;
              const imgHeight = idx === 2 ? 400 : 338;
              
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
