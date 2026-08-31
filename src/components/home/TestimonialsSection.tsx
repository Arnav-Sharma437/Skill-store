"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./TestimonialsSection.module.css";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  verifiedBadge: string;
  rating: number;
  quote: string;
  avatarColor: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Rajesh Kannan",
    role: "Founder, AutoSpa Detailing Studio",
    location: "Coimbatore, Tamil Nadu",
    verifiedBadge: "Verified Workshop Owner",
    rating: 5,
    quote: "We purchased 3 units of the TUQO HW2000 140 Bar High Pressure Washer for our detailing workshop. The continuous pressure output, brass pump durability, and build quality are exceptional. Best machinery supplier in India!",
    avatarColor: "#132c66"
  },
  {
    id: 2,
    name: "Vikramaditya Sharma",
    role: "Owner, Apex Auto Garage",
    location: "Delhi NCR",
    verifiedBadge: "Verified Commercial Buyer",
    rating: 5,
    quote: "The cordless pressure washer CDW400 and foam cannon attachments completely transformed our doorstep detailing service. Fast 48h dispatch, 100% genuine spares, and awesome support from the Coimbatore team!",
    avatarColor: "#0284c7"
  },
  {
    id: 3,
    name: "Manoj Prabhakar",
    role: "Lead Contractor, Precision Woodworks",
    location: "Bengaluru, Karnataka",
    verifiedBadge: "Verified Industrial Contractor",
    rating: 5,
    quote: "Ordered the Pumpkin miter saw and direct-drive air compressor. Machine precision is top tier, with very low vibration and quiet motor cooling. Delivered with rock-solid protective packaging.",
    avatarColor: "#0f766e"
  },
  {
    id: 4,
    name: "Ankit Deshmukh",
    role: "Detailing Specialist, SpeedShine Care",
    location: "Pune, Maharashtra",
    verifiedBadge: "Verified Detailing Pro",
    rating: 5,
    quote: "Skill Store is our single source for high-pressure hoses, nozzles, and quick couplers. Finding genuine replacement parts was always a headache until we discovered Skill Store. 10/10 recommendation!",
    avatarColor: "#7c3aed"
  },
  {
    id: 5,
    name: "Suresh Sundaram",
    role: "Chief Engineer, Sundaram Engineering",
    location: "Chennai, Tamil Nadu",
    verifiedBadge: "Verified Workshop Mechanic",
    rating: 5,
    quote: "Heavy-duty machinery at very honest prices. The technical team guided us with exact pressure specs and nozzle sizing. Truly professional after-sales service and unmatched reliability.",
    avatarColor: "#b45309"
  }
];

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = TESTIMONIALS.length;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleNext = React.useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  // Continuous Auto-rotation every 3.5 seconds
  useEffect(() => {
    timerRef.current = setInterval(() => {
      handleNext();
    }, 3500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [handleNext]);

  // Calculate card position relative to active card
  const getCardClass = (index: number) => {
    const diff = (index - activeIndex + total) % total;
    if (diff === 0) return styles.cardCenter;
    if (diff === 1 || diff === -(total - 1)) return styles.cardRight;
    if (diff === total - 1 || diff === -1) return styles.cardLeft;
    return styles.cardHidden;
  };

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Header */}
        <div className={styles.headerRow}>
          <span className={styles.subtitle}>REAL EXPERIENCES &amp; REVIEWS</span>
          <h2 className={styles.title}>CLIENT TESTIMONIALS</h2>
          <p className={styles.leadText}>
            Trusted by over 50,000+ automotive detailers, workshop mechanics, industrial contractors, and DIY enthusiasts across India.
          </p>
        </div>

        {/* 3D Testimonials Stage */}
        <div className={styles.stageContainer}>
          <div className={styles.carouselTrack}>
            {TESTIMONIALS.map((item, index) => {
              const cardPositionClass = getCardClass(index);
              const isCenter = cardPositionClass === styles.cardCenter;

              return (
                <div
                  key={item.id}
                  className={`${styles.testimonialCard} ${cardPositionClass}`}
                  onClick={() => {
                    if (!isCenter) setActiveIndex(index);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Testimonial from ${item.name}`}
                >
                  {/* Quote Icon Background */}
                  <div className={styles.quoteIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>

                  {/* Star Ratings & Badge */}
                  <div className={styles.cardTop}>
                    <div className={styles.starsRow}>
                      {[...Array(item.rating)].map((_, i) => (
                        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#ffd300" stroke="#ffd300" strokeWidth="1">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      ))}
                    </div>
                    <span className={styles.verifiedTag}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {item.verifiedBadge}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className={styles.quoteText}>&ldquo;{item.quote}&rdquo;</p>

                  {/* Author Profile */}
                  <div className={styles.authorRow}>
                    <div 
                      className={styles.avatar}
                      style={{ backgroundColor: item.avatarColor }}
                    >
                      {item.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className={styles.authorInfo}>
                      <h4 className={styles.authorName}>{item.name}</h4>
                      <p className={styles.authorRole}>{item.role}</p>
                      <span className={styles.authorLocation}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {item.location}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className={styles.controlsWrapper}>
            <button onClick={handlePrev} className={styles.navBtn} aria-label="Previous Testimonial">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {/* Pagination Dots */}
            <div className={styles.dots}>
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`${styles.dot} ${idx === activeIndex ? styles.activeDot : ""}`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>

            <button onClick={handleNext} className={styles.navBtn} aria-label="Next Testimonial">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
