"use client";

import React, { useState } from "react";
import styles from "./AnnouncementBar.module.css";

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.content}>
        <span className={styles.badge}>SUMMER SALE</span>
        <p className={styles.text}>
          ⚡ Get 50% off on all master bundles with code: <strong>SUMMERSKILLS50</strong> (Limited Time Offer)
        </p>
      </div>
      <button 
        className={styles.closeBtn} 
        onClick={() => setIsVisible(false)}
        aria-label="Close announcement"
      >
        &times;
      </button>
    </div>
  );
}
