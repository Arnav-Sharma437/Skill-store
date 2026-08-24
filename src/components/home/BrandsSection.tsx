"use client";

import React from "react";
import styles from "./BrandsSection.module.css";

export default function BrandsSection() {
  const renderBrandCards = () => (
    <>
      {/* TUQO Logo Card */}
      <div className={styles.brandCard} aria-label="TUQO">
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="var(--font-accent)" fontStyle="italic" fontWeight="900" fontSize="28" fill="#000000" letterSpacing="-1">TUQO</text>
        </svg>
      </div>

      {/* COSTEC Logo Card */}
      <div className={styles.brandCard} aria-label="COSTEC">
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="700" fontSize="22" fill="#000000" letterSpacing="1">COSTEC</text>
        </svg>
      </div>

      {/* METSO Logo Card */}
      <div className={styles.brandCard} aria-label="METSO">
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="50%" y="42%" dominantBaseline="middle" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="900" fontSize="24" fill="#000000" letterSpacing="0">METSO</text>
          <text x="50%" y="78%" dominantBaseline="middle" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="600" fontSize="6.5" fill="#666666" letterSpacing="0.2">UNLEASH YOUR POWER</text>
        </svg>
      </div>

      {/* PUMPKIN Logo Card */}
      <div className={styles.brandCard} aria-label="PUMPKIN">
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="20" r="8" fill="#ff7a00" />
          <circle cx="12" cy="20" r="7.5" fill="#ff9124" />
          <path d="M16 12C16 10 17 9 17 9" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" />
          <text x="29" y="25" fontFamily="var(--font-sans)" fontWeight="700" fontSize="16" fill="#000000" letterSpacing="0.5">PUMPKIN</text>
        </svg>
      </div>

      {/* Ultra TOUCH Logo Card */}
      <div className={styles.brandCard} aria-label="Ultra TOUCH">
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="700" fontSize="20" fill="#0071BC">Ultra TOUCH</text>
        </svg>
      </div>
    </>
  );

  return (
    <section className={styles.section}>
      {/* Full-width Navy Title Bar */}
      <div className={styles.titleBar}>
        <h2 className={styles.title}>TOP OUR BRANDS</h2>
      </div>

      {/* Brand Logos Infinite Marquee Container */}
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack}>
          <div className={styles.marqueeList}>
            {renderBrandCards()}
          </div>
          <div className={styles.marqueeList} aria-hidden="true">
            {renderBrandCards()}
          </div>
        </div>
      </div>
    </section>
  );
}
