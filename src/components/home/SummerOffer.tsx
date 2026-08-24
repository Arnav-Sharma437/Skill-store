"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./SummerOffer.module.css";

export default function SummerOffer() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.bannerContainer}>
          {/* Text Content */}
          <div className={styles.textContent}>
            <span className={styles.tag}>LIMITED TIME SALE</span>
            <h2 className={styles.title}>Premium Summer Offer</h2>
            <p className={styles.discountText}>
              Save up to <span className={styles.highlight}>50% OFF</span> on all bundle packs
            </p>
            <p className={styles.description}>
              Unlock complete career tracks including Web Development, UI/UX Design, and AI Mastery. Get lifetime access, project files, and verified completion certificates.
            </p>
            <div className={styles.ctaWrapper}>
              <Link href="/shop" className={styles.ctaButton}>
                Claim Your Discount
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <div className={styles.timer}>
                <span className={styles.timerDot}></span>
                <span>Offer ends soon</span>
              </div>
            </div>
          </div>

          {/* Graphic Side */}
          <div className={styles.imageContent}>
            <Image
              src="/images/banners/summer-offer.jpg"
              alt="Premium Summer Offer Tech Workspace"
              fill
              className={styles.image}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
