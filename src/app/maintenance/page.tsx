import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import styles from "./MaintenancePage.module.css";

export const metadata: Metadata = {
  title: "Under Maintenance - Skill Store",
  description: "Skill Store is currently undergoing scheduled maintenance. We will be back online shortly.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <div className={styles.container}>
      {/* Background ambient lighting effects */}
      <div className={styles.bgGlowTop} />
      <div className={styles.bgGlowBottom} />

      <main className={styles.card}>
        {/* Brand Header */}
        <div className={styles.logoSection}>
          <Image
            src="/images/logos/Skill Store Logo.png"
            alt="Skill Store Logo"
            width={160}
            height={44}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        {/* Live Status Badge */}
        <div className={styles.statusBadge}>
          <span className={styles.pulseDot} />
          <span>SCHEDULED SYSTEM MAINTENANCE</span>
        </div>

        {/* Main Heading & Description */}
        <h1 className={styles.heading}>
          We&apos;ll Be Back <span className={styles.highlight}>Shortly</span>
        </h1>

        <p className={styles.description}>
          We are currently upgrading our platform to provide you with an enhanced shopping experience, faster tool discovery, and smoother checkout.
        </p>

        {/* Progress Box */}
        <div className={styles.infoBox}>
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>⚡</div>
            <div>
              <strong>System Upgrades</strong>
              <p>Enhancing catalog speed &amp; security</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>🛠️</div>
            <div>
              <strong>Order Management</strong>
              <p>Current orders are being processed normally</p>
            </div>
          </div>
        </div>

        {/* Support & Contact Details */}
        <div className={styles.supportSection}>
          <p className={styles.supportTitle}>Need urgent assistance or order inquiries?</p>
          <div className={styles.contactButtons}>
            <a
              href="https://wa.me/919500694111"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              WhatsApp Support
            </a>

            <a href="tel:+919500694111" className={styles.phoneBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              +91 95006 94111
            </a>
          </div>
        </div>

        {/* Admin Gateway Access */}
        <div className={styles.adminFooter}>
          <Link href="/admin/login" className={styles.adminLink}>
            <span>Admin Portal Access</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>

      <footer className={styles.copyright}>
        &copy; {new Date().getFullYear()} Skill Store. All Rights Reserved.
      </footer>
    </div>
  );
}
