"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./PageLoader.module.css";

export default function PageLoader() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show loader on initial page mount/reload until everything loads
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setLoading(false);
      }, 400); // 400ms fadeout transition
    }, 750); // 750ms brand loader

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className={`${styles.loaderOverlay} ${fadeOut ? styles.fadeOut : ""}`}>
      <div className={styles.loaderBox}>
        {/* Brand Logo with Pulsing Glow */}
        <div className={styles.logoWrapper}>
          <Image
            src="/images/logos/Skill Store Logo.png"
            alt="Skill Store"
            width={180}
            height={50}
            priority
            className={styles.logoImg}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Sleek Gradient Progress Line */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}></div>
        </div>

        {/* Subtitle */}
        <span className={styles.loaderTagline}>PREMIUM MACHINERY & TOOLS</span>
      </div>
    </div>
  );
}
