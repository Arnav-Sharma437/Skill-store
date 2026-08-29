"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import styles from "./ComingSoon.module.css";

function ComingSoonContent() {
  const searchParams = useSearchParams();
  const pageName = searchParams.get("page") || "This Page";

  return (
    <div className={styles.card}>
      <div className={styles.logoRow}>
        <span className={styles.logoSkill}>SKILL</span>
        <span className={styles.logoStore}>STORE</span>
      </div>
      <h1 className={styles.title}>COMING SOON</h1>
      <h2 className={styles.subtitle}>{pageName.toUpperCase()}</h2>
      <p className={styles.text}>
        We are currently setting up this section of the premium store.
        Stay tuned! Our high-end hardware products and support services will be available here very soon.
      </p>
      <Link href="/" className={styles.btn}>
        RETURN TO HOME
      </Link>
    </div>
  );
}

export default function ComingSoonPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className={styles.wrapper}>
        <Suspense fallback={
          <div className={styles.card}>
            <h1 className={styles.title}>LOADING...</h1>
          </div>
        }>
          <ComingSoonContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
