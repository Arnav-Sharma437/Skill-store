"use client";

import React from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import styles from "./ContactPage.module.css";

export default function ContactPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className={styles.main}>
        {/* Banner Header */}
        <div className={styles.bannerHeader}>
          <div className="container">
            <h1 className={styles.bannerTitle}>Contact Information</h1>
            <p className={styles.bannerSubtitle}>
              Thank you for choosing SkillStore! We value your feedback and are here to assist you.
            </p>
          </div>
        </div>

        {/* 3-Column Info Cards Grid */}
        <div className="container">
          <div className={styles.contactGrid}>
            {/* Card 1: Call Us */}
            <div className={styles.infoCard}>
              <div className={styles.iconWrapper}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <h2>Customer Support</h2>
              <p className={styles.cardDesc}>
                If you have any questions, concerns, or need assistance with your order, our customer support team is ready to help.
              </p>
              <div className={styles.cardValue}>
                <a href="tel:8754301661">8754301661</a>
              </div>
              <span className={styles.cardNote}>Time : 10:00 AM - 7:00 PM</span>
            </div>

            {/* Card 2: Email Us */}
            <div className={styles.infoCard}>
              <div className={styles.iconWrapper}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <h2>Email Inbox</h2>
              <p className={styles.cardDesc}>
                Send us an email and we will get back to you shortly. Feel free to attach order invoices or support files.
              </p>
              <div className={styles.cardValue}>
                <a href="mailto:skillstore.info@gmail.com">skillstore.info@gmail.com</a>
              </div>
              <span className={styles.cardNote}>We reply within 24 hours</span>
            </div>

            {/* Card 3: Visit Us */}
            <div className={styles.infoCard}>
              <div className={styles.iconWrapper}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h2>Mailing Address</h2>
              <p className={styles.cardDesc}>
                Feel free to reach out to us via mail. Our physical office is located at Sidco Industrial Estate.
              </p>
              <div className={styles.addressBox}>
                <strong>SkillStore</strong>
                <span>E-45/B, Sidco Industrial Estate,</span>
                <span>Kurichi, Coimbatore - 641021</span>
              </div>
              <span className={styles.cardNote}>Monday - Saturday</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
