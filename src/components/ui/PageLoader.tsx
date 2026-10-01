"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./PageLoader.module.css";

export default function PageLoader() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Lock body scroll while loader is active
    document.body.style.overflow = "hidden";

    let fadeTimer: NodeJS.Timeout;
    let removeTimer: NodeJS.Timeout;

    const handleReady = () => {
      // Smooth minimum display time so it doesn't flash abruptly
      fadeTimer = setTimeout(() => {
        setFadeOut(true);
        removeTimer = setTimeout(() => {
          setLoading(false);
          document.body.style.overflow = "";
        }, 400); // 400ms fadeout transition
      }, 700);
    };

    if (document.readyState === "complete") {
      handleReady();
    } else {
      window.addEventListener("load", handleReady, { once: true });
      // Safety fallback after 1.8s in case external assets take too long
      const safetyTimer = setTimeout(handleReady, 1800);
      return () => {
        window.removeEventListener("load", handleReady);
        clearTimeout(safetyTimer);
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
        document.body.style.overflow = "";
      };
    }

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!loading) return null;

  return (
    <div className={`${styles.loaderOverlay} ${fadeOut ? styles.fadeOut : ""}`} aria-hidden="true">
      <div className={styles.loaderBox}>
        {/* Brand Logo with Glow */}
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
        <span className={styles.loaderTagline}>PREMIUM MACHINERY &amp; TOOLS</span>
      </div>
    </div>
  );
}
