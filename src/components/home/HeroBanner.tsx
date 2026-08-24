"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { HERO_SLIDES } from "@/data/home";
import styles from "./HeroBanner.module.css";

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!isPaused) {
      slideInterval.current = setInterval(nextSlide, 5000); // 5s auto-scroll
    }

    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [isPaused, nextSlide]);

  return (
    <section 
      className={styles.heroSection}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Machinery Hero Banner"
    >
      {/* Slides Container */}
      <div 
        className={styles.slidesWrapper}
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {HERO_SLIDES.map((slide, idx) => (
          <div 
            key={slide.id} 
            className={styles.slide}
            aria-hidden={idx !== currentSlide}
          >
            <div className={styles.imageContainer}>
              <Image
                src={slide.imageUrl}
                alt={`TUQO Machinery Banner ${idx + 1}`}
                fill
                priority={idx === 0}
                className={styles.image}
                sizes="100vw"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows (White circles with black chevrons) */}
      <button 
        className={`${styles.navButton} ${styles.prevButton}`} 
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button 
        className={`${styles.navButton} ${styles.nextButton}`} 
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Pagination Dots (Centered on the bottom edge) */}
      <div className={styles.pagination}>
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            className={`${styles.dot} ${idx === currentSlide ? styles.activeDot : ""}`}
            onClick={() => goToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
