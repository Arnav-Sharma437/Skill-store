"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./SummerOffer.module.css";
import { SUMMER_OFFERS } from "@/data/home";

export default function SummerOffer() {
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
        </div>

        {/* Continuous Scrolling Offers Marquee Slider (Equal balance on left & right) */}
        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeTrack}>
            {/* Copy 1 */}
            <div className={styles.bannersRow}>
              {SUMMER_OFFERS.map((offer) => (
                <Link href={offer.link} key={`${offer.id}-1`} className={styles.bannerCard}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={offer.imageUrl}
                      alt={offer.title}
                      width={560}
                      height={340}
                      className={styles.image}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </Link>
              ))}
            </div>

            {/* Copy 2 (for seamless infinite loop) */}
            <div className={styles.bannersRow} aria-hidden="true">
              {SUMMER_OFFERS.map((offer) => (
                <Link href={offer.link} key={`${offer.id}-2`} className={styles.bannerCard}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={offer.imageUrl}
                      alt={offer.title}
                      width={560}
                      height={340}
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
