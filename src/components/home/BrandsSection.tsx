"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./BrandsSection.module.css";

export default function BrandsSection() {
  const renderBrandCards = () => (
    <>
      {/* TUQO Logo Card */}
      <Link href="/shop/tuqo" className={styles.brandCard} aria-label="TUQO">
        <Image 
          src="/images/brands/tuqo.svg" 
          alt="TUQO" 
          width={130} 
          height={40} 
          style={{ objectFit: "contain" }}
        />
      </Link>

      {/* COSTEC Logo Card */}
      <Link href="/shop/costec" className={styles.brandCard} aria-label="COSTEC">
        <Image 
          src="/images/brands/costec.svg" 
          alt="COSTEC" 
          width={130} 
          height={38} 
          style={{ objectFit: "contain" }}
        />
      </Link>

      {/* METSO Logo Card */}
      <Link href="/shop/metso" className={styles.brandCard} aria-label="METSO">
        <Image 
          src="/images/brands/metso.svg" 
          alt="METSO" 
          width={130} 
          height={40} 
          style={{ objectFit: "contain" }}
        />
      </Link>

      {/* PUMPKIN Logo Card */}
      <Link href="/shop/pumpkin" className={styles.brandCard} aria-label="PUMPKIN">
        <Image 
          src="/images/brands/pumpkin.svg" 
          alt="PUMPKIN" 
          width={140} 
          height={40} 
          style={{ objectFit: "contain" }}
        />
      </Link>

      {/* MITSUKI Logo Card */}
      <Link href="/shop/mitsuki" className={styles.brandCard} aria-label="MITSUKI">
        <Image 
          src="/images/brands/mitsuki.svg" 
          alt="MITSUKI" 
          width={130} 
          height={36} 
          style={{ objectFit: "contain" }}
        />
      </Link>

      {/* Ultra TOUCH Logo Card */}
      <Link href="/shop/ultratouch" className={styles.brandCard} aria-label="Ultra TOUCH">
        <Image 
          src="/images/brands/ultratouch.svg" 
          alt="Ultra TOUCH" 
          width={130} 
          height={38} 
          style={{ objectFit: "contain" }}
        />
      </Link>
    </>
  );

  return (
    <section className={styles.section}>
      {/* Full-width Navy Title Bar */}
      <div className={styles.titleBar}>
        <h2 className={styles.title}>TOP OUR BRANDS</h2>
      </div>

      {/* Brand Logos Infinite Marquee Container */}
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack}>
          <div className={styles.marqueeList}>
            {renderBrandCards()}
          </div>
          <div className={styles.marqueeList} aria-hidden="true">
            {renderBrandCards()}
          </div>
        </div>
      </div>
    </section>
  );
}
