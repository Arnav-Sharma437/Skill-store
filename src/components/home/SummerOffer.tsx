"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./SummerOffer.module.css";
import { optimizeProductDetail } from "@/lib/imageOptimization";
import { DEFAULT_HOME_SETTINGS, ISummerOfferItem } from "@/lib/homeDefaults";

export default function SummerOffer() {
  const [enabled, setEnabled] = useState(true);
  const [title, setTitle] = useState("PREMIUM SUMMER OFFER");
  const [offers, setOffers] = useState<ISummerOfferItem[]>(DEFAULT_HOME_SETTINGS.summerOffer.offers);
  const [isLoaded, setIsLoaded] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadSummerOffers() {
      try {
        const res = await fetch("/api/home-settings");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.summerOffer) {
            if (isMounted) {
              setEnabled(Boolean(json.data.summerOffer.enabled));
              setTitle(json.data.summerOffer.title || "PREMIUM SUMMER OFFER");
              if (Array.isArray(json.data.summerOffer.offers)) {
                setOffers(json.data.summerOffer.offers);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load Summer Offer settings:", err);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }
    loadSummerOffers();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeOffers = offers.filter((o) => o.enabled !== false && o.imageUrl);

  if (isLoaded && (!enabled || activeOffers.length === 0)) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Section Header Row */}
        <div className={styles.headerRow}>
          {/* Angled Section Tab */}
          <div className={styles.titleTab}>
            <h2 className={styles.title}>{title}</h2>
          </div>
          {/* Bottom underline */}
          <div className={styles.headerLine}></div>

          {/* Navigation Arrows for Slider */}
          <div className={styles.navButtons}>
            <button
              className={styles.arrowBtn}
              onClick={() => scrollSlider("left")}
              aria-label="Scroll left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              className={styles.arrowBtn}
              onClick={() => scrollSlider("right")}
              aria-label="Scroll right"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Continuous Scrolling Offers Marquee Slider (Equal balance on left & right) */}
        <div className={styles.marqueeContainer} ref={sliderRef}>
          <div className={styles.marqueeTrack}>
            {/* Copy 1 */}
            <div className={styles.bannersRow}>
              {activeOffers.map((offer) => (
                <Link href={offer.link || "/shop"} key={`${offer.id}-1`} className={styles.bannerCard}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={optimizeProductDetail(offer.imageUrl)}
                      alt={offer.title || title}
                      width={560}
                      height={340}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 560px"
                      className={styles.image}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </Link>
              ))}
            </div>

            {/* Copy 2 (for seamless infinite loop) */}
            <div className={styles.bannersRow} aria-hidden="true">
              {activeOffers.map((offer) => (
                <Link href={offer.link || "/shop"} key={`${offer.id}-2`} className={styles.bannerCard}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={optimizeProductDetail(offer.imageUrl)}
                      alt={offer.title || title}
                      width={560}
                      height={340}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 560px"
                      className={styles.image}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
