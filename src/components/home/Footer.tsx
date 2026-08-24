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
      <div className={`${styles.container} container`}>
        {/* Branding & Socials */}
        <div className={styles.columnBranding}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>SKILL STORE</span>
          </div>
          <p className={styles.description}>
            Empowering professionals worldwide with elite technical skills, masterclasses, and certified career tracks.
          </p>
          <div className={styles.socials}>
            <a href="https://facebook.com" className={styles.socialLink} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </a>
            <a href="https://twitter.com" className={styles.socialLink} aria-label="Twitter" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.95 4.57a10 10 0 01-2.82.78 4.96 4.96 0 002.16-2.72 9.97 9.97 0 01-3.13 1.2 4.93 4.93 0 00-8.4 4.48 14 14 0 01-10.16-5.15 4.93 4.93 0 001.52 6.57 4.9 4.9 0 01-2.23-.62c-.01 2.4 1.72 4.4 4 4.86a4.96 4.96 0 01-2.23.08 4.93 4.93 0 004.6 3.42A9.9 9.9 0 010 19.54a13.94 13.94 0 007.55 2.21c9.05 0 14-7.5 14-14 0-.21 0-.43-.02-.65 1-.7 1.8-1.6 2.4-2.5z"/>
              </svg>
            </a>
            <a href="https://instagram.com" className={styles.socialLink} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="https://github.com" className={styles.socialLink} aria-label="GitHub" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className={styles.columnLinks}>
          <h4 className={styles.title}>Quick Links</h4>
          <nav className={styles.nav}>
            <Link href="/" className={styles.link}>Home</Link>
            <Link href="/about" className={styles.link}>About Us</Link>
            <Link href="/contact" className={styles.link}>Contact Us</Link>
            <Link href="/shop" className={styles.link}>All Skills</Link>
            <Link href="/faq" className={styles.link}>FAQs</Link>
          </nav>
        </div>

        {/* Column 3: Categories */}
        <div className={styles.columnLinks}>
          <h4 className={styles.title}>Top Categories</h4>
          <nav className={styles.nav}>
            <Link href="/shop?category=development" className={styles.link}>Web Development</Link>
            <Link href="/shop?category=design" className={styles.link}>UI/UX Design</Link>
            <Link href="/shop?category=ai" className={styles.link}>Data Science & AI</Link>
            <Link href="/shop?category=marketing" className={styles.link}>Digital Marketing</Link>
            <Link href="/shop?category=business" className={styles.link}>Business & Management</Link>
          </nav>
        </div>

        {/* Column 4: Newsletter */}
        <div className={styles.columnNewsletter}>
          <h4 className={styles.title}>Newsletter</h4>
          <p className={styles.newsletterText}>
            Subscribe to receive premium coupons, free skill resources, and early course releases.
          </p>
          <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.newsletterInput}
              required
              aria-label="Email address for newsletter"
            />
            <button type="submit" className={styles.newsletterBtn} aria-label="Subscribe">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>

      <div className={`${styles.bottom} container`}>
        <div className={styles.bottomContent}>
          <p className={styles.copy}>
            &copy; {new Date().getFullYear()} Skill Store. All rights reserved.
          </p>
          <div className={styles.bottomLinks}>
            <Link href="/privacy" className={styles.bottomLink}>Privacy Policy</Link>
            <Link href="/terms" className={styles.bottomLink}>Terms of Service</Link>
            <Link href="/refunds" className={styles.bottomLink}>Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
