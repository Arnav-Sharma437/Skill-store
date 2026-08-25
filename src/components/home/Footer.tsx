"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
      {/* Deeper Concave Curved SVG Separator with a thick Sky Blue stroke */}
      <div className={styles.curveWrapper}>
        <svg viewBox="0 0 1440 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.curveSvg} preserveAspectRatio="none">
          {/* Thick sky-blue line */}
          <path d="M0,10 C480,150 960,150 1440,10" stroke="#38b6ff" strokeWidth="10" fill="none"/>
          {/* Solid navy blue fill below line */}
          <path d="M0,15 C480,154 960,154 1440,15 L1440,160 L0,160 Z" fill="#132c66"/>
        </svg>

        {/* Social Icons floating on the curve (styled with original brand colors) */}
        <div className={styles.socialsFloating}>
          <a href="https://facebook.com" className={`${styles.socialCircle} ${styles.socialFacebook}`} aria-label="Facebook">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
            </svg>
          </a>
          <a href="https://instagram.com" className={`${styles.socialCircle} ${styles.socialInstagram}`} aria-label="Instagram">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="https://wa.me" className={`${styles.socialCircle} ${styles.socialWhatsapp}`} aria-label="WhatsApp">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
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
              <Image 
                src="/images/logos/footer-logo.png" 
                alt="Skill Store Logo" 
                width={150} 
                height={42} 
                style={{ objectFit: 'contain' }}
              />
            </div>
            <p className={styles.slogan}>Elevate Your Expertise With Quality Tools & Power</p>

            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#132c66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </span>
                <span className={styles.contactText}>E-45/B, Sidco Industrial Estate, Kurichi, Coimbatore - 641021</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#132c66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </span>
                <span className={styles.contactText}>Phone: 9500694111 (Time : 10:00 AM - 7:00 PM)</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#132c66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
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
