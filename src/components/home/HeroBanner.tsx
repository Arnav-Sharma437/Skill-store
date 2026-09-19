"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { HERO_SLIDES, HeroSlide } from "@/data/home";
import { optimizeHeroBanner } from "@/lib/imageOptimization";
import styles from "./HeroBanner.module.css";

export default function HeroBanner() {
  const [slides, setSlides] = useState<HeroSlide[]>(HERO_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadBanners() {
      try {
        const res = await fetch("/api/banners");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const dbSlides: HeroSlide[] = json.data.map((b: { id: string; imageUrl: string; mobileImageUrl?: string; link?: string }) => ({
              id: b.id,
              imageUrl: b.imageUrl,
              mobileImageUrl: b.mobileImageUrl || "",
              link: b.link || "/"
            }));
            if (isMounted && dbSlides.length > 0) {
              setSlides(dbSlides);
            }
          }
        }
      } catch {
        // Fallback to static slides
      }
    }
    loadBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!isPaused && slides.length > 1) {
      slideInterval.current = setInterval(nextSlide, 5000); // 5s auto-scroll
    }

    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [isPaused, nextSlide, slides.length]);

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
        {slides.map((slide, idx) => (
          <div 
            key={slide.id || idx} 
            className={styles.slide}
            aria-hidden={idx !== currentSlide}
          >
            <div className={styles.imageContainer}>
              {/* Desktop Banner Image */}
              <Image
                src={optimizeHeroBanner(slide.imageUrl)}
                alt={`Machinery Banner ${idx + 1}`}
                fill
                priority={idx === 0}
                loading={idx === 0 ? "eager" : "lazy"}
                className={slide.mobileImageUrl ? styles.desktopImage : styles.image}
                sizes="100vw"
              />
              {/* Dedicated Mobile Banner Image (if available) */}
              {slide.mobileImageUrl && (
                <Image
                  src={optimizeHeroBanner(slide.mobileImageUrl)}
                  alt={`Machinery Banner Mobile ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  loading={idx === 0 ? "eager" : "lazy"}
                  className={styles.mobileImage}
                  sizes="100vw"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
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

          {/* Pagination Dots */}
          <div className={styles.pagination}>
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`${styles.dot} ${idx === currentSlide ? styles.activeDot : ""}`}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
