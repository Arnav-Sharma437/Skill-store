"use client";

import React, { useState, useEffect } from "react";
import styles from "./AnnouncementBar.module.css";

export default function AnnouncementBar() {
  const [enabled, setEnabled] = useState(true);
  const [text, setText] = useState("*2% Discount On Prepaid Orders / Free Shipment & COD Available*");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadAnnouncement() {
      try {
        const res = await fetch("/api/home-settings");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.announcement) {
            if (isMounted) {
              setEnabled(Boolean(json.data.announcement.enabled));
              setText(json.data.announcement.text || "");
            }
          }
        }
      } catch (err) {
        console.error("Failed to load announcement bar settings:", err);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }
    loadAnnouncement();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoaded && (!enabled || !text.trim())) {
    return null;
  }

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
