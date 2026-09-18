"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./BrandShowcase.module.css";
import { DEFAULT_HOME_SETTINGS, IBrandItem, IUspItem } from "@/lib/homeDefaults";

export default function BrandShowcase() {
  const [brandsEnabled, setBrandsEnabled] = useState(true);
  const [sectionTitle, setSectionTitle] = useState("SHOP BY BRANDS");
  const [sectionSubtitle, setSectionSubtitle] = useState("OFFICIAL PARTNERS");
  const [brands, setBrands] = useState<IBrandItem[]>(DEFAULT_HOME_SETTINGS.brandsSection.brands);

  const [trustEnabled, setTrustEnabled] = useState(true);
  const [uspItems, setUspItems] = useState<IUspItem[]>(DEFAULT_HOME_SETTINGS.trustMarquee.items);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadBrandAndTrustSettings() {
      try {
        const [settingsRes, brandsRes] = await Promise.allSettled([
          fetch("/api/home-settings", { cache: "no-store" }),
          fetch("/api/brands", { cache: "no-store" }),
        ]);

        if (settingsRes.status === "fulfilled" && settingsRes.value.ok) {
          const json = await settingsRes.value.json();
          if (json.success && json.data && isMounted) {
            if (json.data.brandsSection) {
              setBrandsEnabled(Boolean(json.data.brandsSection.enabled));
              setSectionTitle(json.data.brandsSection.title || "SHOP BY BRANDS");
              setSectionSubtitle(json.data.brandsSection.subtitle || "OFFICIAL PARTNERS");
            }
            if (json.data.trustMarquee) {
              setTrustEnabled(Boolean(json.data.trustMarquee.enabled));
              if (Array.isArray(json.data.trustMarquee.items)) {
                setUspItems(json.data.trustMarquee.items);
              }
            }
          }
        }

        if (brandsRes.status === "fulfilled" && brandsRes.value.ok) {
          const json = await brandsRes.value.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0 && isMounted) {
            const mappedBrands: IBrandItem[] = json.data.map((b: { id: string; name: string; logo: string; tagline?: string; enabled?: boolean; order?: number }) => ({
              id: b.id,
              slug: b.id,
              name: b.name,
              logo: b.logo,
              tagline: b.tagline || "",
              enabled: b.enabled !== false,
              order: b.order || 0,
            }));
            mappedBrands.sort((a, b) => (a.order || 0) - (b.order || 0));
            setBrands(mappedBrands);
          }
        }
      } catch (err) {
        console.error("Failed to load Brand & USP settings:", err);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }
    loadBrandAndTrustSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeBrands = brands.filter((b) => b.enabled !== false);
  const activeUspItems = uspItems.filter((item) => item.enabled !== false && item.text?.trim());

  if (isLoaded && !brandsEnabled && !trustEnabled) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Header & Brands Section */}
        {brandsEnabled && activeBrands.length > 0 && (
          <>
            <div className={styles.headerRow}>
              <div className={styles.titleArea}>
                <span className={styles.subtitle}>{sectionSubtitle}</span>
                <h2 className={styles.title}>{sectionTitle}</h2>
              </div>
            </div>

            {/* Display static grid without cloning if few brands, else continuous marquee */}
            {activeBrands.length <= 4 ? (
              <div className={styles.brandsGrid}>
                {activeBrands.map((brand) => (
                  <Link href={`/shop/${brand.slug}`} key={brand.slug} className={styles.brandCard}>
                    <div className={styles.logoContainer}>
                      <Image
                        src={brand.logo}
                        alt={`${brand.name} Logo`}
                        width={brand.width || 110}
                        height={brand.height || 34}
                        loading="lazy"
                        className={styles.brandLogo}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <p className={styles.tagline}>{brand.tagline}</p>
                    <div className={styles.shopBrandBtn}>
                      <span>Shop {brand.name}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.brandsMarqueeContainer}>
                <div className={styles.brandsMarqueeTrack}>
                  {/* Copy 1 */}
                  <div className={styles.brandsRow}>
                    {activeBrands.map((brand) => (
                      <Link href={`/shop/${brand.slug}`} key={`${brand.slug}-1`} className={styles.brandCard}>
                        <div className={styles.logoContainer}>
                          <Image
                            src={brand.logo}
                            alt={`${brand.name} Logo`}
                            width={brand.width || 110}
                            height={brand.height || 34}
                            loading="lazy"
                            className={styles.brandLogo}
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                        <p className={styles.tagline}>{brand.tagline}</p>
                        <div className={styles.shopBrandBtn}>
                          <span>Shop {brand.name}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Copy 2 (for infinite loop) */}
                  <div className={styles.brandsRow} aria-hidden="true">
                    {activeBrands.map((brand) => (
                      <Link href={`/shop/${brand.slug}`} key={`${brand.slug}-2`} className={styles.brandCard}>
                        <div className={styles.logoContainer}>
                          <Image
                            src={brand.logo}
                            alt={`${brand.name} Logo`}
                            width={brand.width || 110}
                            height={brand.height || 34}
                            loading="lazy"
                            className={styles.brandLogo}
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                        <p className={styles.tagline}>{brand.tagline}</p>
                        <div className={styles.shopBrandBtn}>
                          <span>Shop {brand.name}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Animated Brand Trust Marquee Bar */}
        {trustEnabled && activeUspItems.length > 0 && (
          <div className={styles.marqueeWrapper} style={{ marginTop: brandsEnabled && activeBrands.length > 0 ? undefined : "0" }}>
            <div className={styles.marqueeTrack}>
              <div className={styles.marqueeList}>
                {activeUspItems.map((item, i) => (
                  <div key={item.id || i} className={styles.marqueeItem}>
                    <span>{item.text}</span>
                    <span className={styles.marqueeDot}></span>
                  </div>
                ))}
              </div>
              <div className={styles.marqueeList} aria-hidden="true">
                {activeUspItems.map((item, i) => (
                  <div key={`dup-${item.id || i}`} className={styles.marqueeItem}>
                    <span>{item.text}</span>
                    <span className={styles.marqueeDot}></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
