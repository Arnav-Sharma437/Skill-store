"use client";

import React from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import styles from "./AboutPage.module.css";

export default function AboutPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className={styles.main}>
        {/* Banner Header */}
        <div className={styles.bannerHeader}>
          <div className="container">
            <h1 className={styles.bannerTitle}>About Us</h1>
            <p className={styles.bannerSubtitle}>
              Welcome to SkillStore – India&apos;s leading platform for premium hardware and power tools.
            </p>
          </div>
        </div>

        <div className="container">
          <div className={styles.contentLayout}>
            {/* Left Column: Visual Story / Timeline Details */}
            <div className={styles.visualColumn}>
              <div className={styles.storyCard}>
                <div className={styles.yearBadge}>ESTD. 1995</div>
                <h2>OUR JOURNEY</h2>
                <p>
                  From a small local shop to India&apos;s top hand and power tools supplier, SkillStore has evolved to hold the online platform to serve you better.
                </p>
                <div className={styles.divider}></div>
                <div className={styles.statsRow}>
                  <div className={styles.statBox}>
                    <strong>30+</strong>
                    <span>Years Experience</span>
                  </div>
                  <div className={styles.statBox}>
                    <strong>100%</strong>
                    <span>Genuine Tools</span>
                  </div>
                </div>
              </div>

              {/* Core Values grid */}
              <div className={styles.valuesGrid}>
                <div className={styles.valueCard}>
                  <span className={styles.valueIcon}>✓</span>
                  <strong>Quality</strong>
                </div>
                <div className={styles.valueCard}>
                  <span className={styles.valueIcon}>✓</span>
                  <strong>Reliability</strong>
                </div>
                <div className={styles.valueCard}>
                  <span className={styles.valueIcon}>✓</span>
                  <strong>Performance</strong>
                </div>
                <div className={styles.valueCard}>
                  <span className={styles.valueIcon}>✓</span>
                  <strong>Safety</strong>
                </div>
              </div>
            </div>

            {/* Right Column: History & Mission details */}
            <div className={styles.textColumn}>
              {/* Text Block 1 */}
              <div className={styles.textBlock}>
                <h3>Who We Are</h3>
                <p>
                  Welcome to SkillStore, a trusted name in machine tools and equipment since 1995. Discover a diverse range of high-quality machine shop tools, from Power tools to hand tools and cordless options. Our commitment to precision and quality sets us apart, providing superior products and outstanding service.
                </p>
              </div>

              {/* Text Block 2 */}
              <div className={styles.textBlock}>
                <h3>Our Mission</h3>
                <p>
                  SkillStore aims to meet international standards, ensuring customer satisfaction in quality, cost, performance, safety, and reliability. Our mission involves fostering teamwork, nurturing talent, and delivering premium products with pace, pride, and passion.
                </p>
              </div>

              {/* Text Block 3 */}
              <div className={styles.textBlock}>
                <h3>Our Promise</h3>
                <p>
                  Explore our extensive online catalog for tools that empower your industrial and DIY projects. We guarantee high-wear resistance, solid craftsmanship, and outstanding customer support for every product in our catalog.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
