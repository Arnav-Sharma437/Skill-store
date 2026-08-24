"use client";

import React from "react";
import styles from "./AnnouncementBar.module.css";

export default function AnnouncementBar() {
  const text = "*2% Discount On Prepaid Orders / Free Shipment & COD Available*";
  // Repeat the text to create a scrolling marquee or filled top bar
  const repeatedText = `${text}   ${text}   ${text}   ${text}   ${text}`;

  return (
    <div className={styles.bar}>
      <div className={styles.marquee}>
        <span className={styles.text}>{repeatedText}</span>
      </div>
    </div>
  );
}
