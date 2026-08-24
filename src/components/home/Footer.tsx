"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      alert(`Subscribed: ${email}`);
      setEmail("");
    }
  };

  return (
    <footer className={styles.footer}>
      {/* Concave Curved SVG Separator at the top of the footer */}
      <div className={styles.curveWrapper}>
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.curveSvg} preserveAspectRatio="none">
          <path d="M0,0 C480,50 960,50 1440,0 L1440,60 L0,60 Z" fill="#132c66"/>
        </svg>

        {/* Social Icons floating on the curve */}
        <div className={styles.socialsFloating}>
          <a href="https://facebook.com" className={styles.socialCircle} aria-label="Facebook">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
            </svg>
          </a>
          <a href="https://instagram.com" className={styles.socialCircle} aria-label="Instagram">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
          <a href="https://wa.me" className={styles.socialCircle} aria-label="WhatsApp">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.51 5.276 3.508 8.48-.005 6.66-5.343 11.998-11.956 11.998-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.666.988 3.31 1.488 5.347 1.489 5.32 0 9.646-4.326 9.65-9.65.002-2.577-1.002-5.002-2.825-6.827C17.001 2.34 14.57 1.336 12 1.336 6.685 1.336 2.36 5.662 2.356 10.98c-.001 2.046.507 3.7 1.503 5.378L2.83 21.053l4.817-1.261z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Footer Content Grid */}
      <div className={styles.mainFooter}>
        <div className={`${styles.container} container`}>
          {/* Column 1: Info & Brand */}
          <div className={styles.columnBrand}>
            <div className={styles.logo}>
              <span className={styles.logoSkill}>SKILL</span>
              <span className={styles.logoStore}>STORE</span>
            </div>
            <p className={styles.slogan}>Elevate Your Expertise With Quality Tools & Power</p>

            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>🏠</span>
                <span className={styles.contactText}>E-45/B, Sidco Industrial Estate, Kurichi, Coimbatore - 641021</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📞</span>
                <span className={styles.contactText}>Phone: 9500694111 (Time : 10:00 AM - 7:00 PM)</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>✉️</span>
                <span className={styles.contactText}>Email: skillstore.info@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Column 2: Service & Support */}
          <div className={styles.columnLinks}>
            <h4 className={styles.columnTitle}>SERVICE & SUPPORT</h4>
            <nav className={styles.nav}>
              <Link href="/about" className={styles.link}>ABOUT US</Link>
              <Link href="/contact" className={styles.link}>CONTACT US</Link>
              <Link href="/privacy" className={styles.link}>PRIVACY POLICY</Link>
              <Link href="/terms" className={styles.link}>TERMS & CONDITIONS</Link>
              <Link href="/refunds" className={styles.link}>CANCELLATION & REFUND POLICY</Link>
            </nav>
          </div>

          {/* Column 3: Quick Links */}
          <div className={styles.columnLinks}>
            <h4 className={styles.columnTitle}>QUICK LINKS</h4>
            <nav className={styles.nav}>
              <Link href="/shop?category=pressure_washers" className={styles.link}>PRESSURE WASHERS</Link>
              <Link href="/shop?category=power_tools" className={styles.link}>POWER TOOLS</Link>
              <Link href="/shop?category=hand_tools" className={styles.link}>HAND TOOLS</Link>
              <Link href="/shop?category=spares" className={styles.link}>ACCESSORIES & SPARES</Link>
            </nav>
          </div>

          {/* Column 4: Information */}
          <div className={styles.columnLinks}>
            <h4 className={styles.columnTitle}>INFORMATION</h4>
            <nav className={styles.nav}>
              <Link href="/account" className={styles.link}>MY ACCOUNT</Link>
              <Link href="/orders" className={styles.link}>ORDER HISTORY</Link>
              <Link href="/wishlist" className={styles.link}>MY WISHLIST</Link>
              <Link href="/track" className={styles.link}>TRACKING YOUR ORDER</Link>
            </nav>
          </div>
        </div>

        {/* Newsletter Subscription Row */}
        <div className={`${styles.newsletterContainer} container`}>
          <div className={styles.newsletterInner}>
            <h4 className={styles.newsletterTitle}>SUBSCRIBE NEWSLETTER</h4>
            <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="XXXXXXXX@EMAIL.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.newsletterInput}
                required
                aria-label="Email address"
              />
              <button type="submit" className={styles.newsletterBtn}>
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Black Copyright Bar */}
      <div className={styles.copyrightBar}>
        <p className={styles.copyrightText}>COPYRIGHT © 2025 SKILLSTORE ALL RIGHT RESERVED</p>
      </div>
    </footer>
  );
}
