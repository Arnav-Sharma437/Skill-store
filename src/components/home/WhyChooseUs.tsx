import React from "react";
import Link from "next/link";
import styles from "./WhyChooseUs.module.css";

export default function WhyChooseUs() {
  const pillars = [
    {
      stat: "50K+",
      title: "Active Customers",
      desc: "Trusted by mechanics, workshops, detailers, and homeowners across India."
    },
    {
      stat: "100%",
      title: "Genuine Spares",
      desc: "Direct brass fittings, high-pressure pumps, motors, and authentic manufacturer accessories."
    },
    {
      stat: "24-48h",
      title: "Fast Dispatch",
      desc: "Orders processed rapidly with secure heavy-goods transit and live shipment tracking."
    },
    {
      stat: "5-Star",
      title: "After-Sales Support",
      desc: "Dedicated technical service center based in Sidco Industrial Estate, Coimbatore."
    }
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Header */}
        <div className={styles.headerRow}>
          <span className={styles.subtitle}>INDIA&apos;S PREMIER TOOLS HUB</span>
          <h2 className={styles.title}>WHY CHOOSE SKILL STORE?</h2>
          <p className={styles.leadText}>
            We provide heavy-duty machinery, professional pressure washers, compressors, and high-performance workshop tools built for maximum durability, performance, and reliability.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className={styles.pillarsGrid}>
          {pillars.map((item, idx) => (
            <div key={idx} className={styles.pillarCard}>
              <span className={styles.statNumber}>{item.stat}</span>
              <h3 className={styles.pillarTitle}>{item.title}</h3>
              <p className={styles.pillarDesc}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className={styles.ctaRow}>
          <Link href="/categories" className={styles.primaryBtn}>
            <span>Browse All Machinery</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
          <Link href="/contact" className={styles.secondaryBtn}>
            <span>Contact Tech Support</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
