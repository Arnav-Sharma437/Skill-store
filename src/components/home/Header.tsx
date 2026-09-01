"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { searchProductsAndCategories } from "@/data/categories";
import styles from "./Header.module.css";

export default function Header() {
  const { cart, wishlist } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Live Instant Search Preview
  const liveResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      return { products: [], categories: [] };
    }
    const res = searchProductsAndCategories(searchQuery);
    return {
      products: res.products.slice(0, 4),
      categories: res.categories.slice(0, 3)
    };
  }, [searchQuery]);

  // Close search preview on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleVoiceSearch = () => {
    if (typeof window !== "undefined") {
      const windowObj = window as unknown as {
        SpeechRecognition?: new () => {
          lang: string;
          onresult: (e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
          start: () => void;
        };
        webkitSpeechRecognition?: new () => {
          lang: string;
          onresult: (e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
          start: () => void;
        };
      };

      const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = "en-IN";
          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
            setIsSearchFocused(false);
            router.push(`/search?q=${encodeURIComponent(transcript.trim())}`);
          };
          recognition.start();
        } catch {
          alert("Voice search is active. Please speak now...");
        }
      } else {
        alert("Voice search is not supported in this browser. Please type your search query.");
      }
    }
  };

  return (
    <header className={styles.header}>
      {/* Main Header Row */}
      <div className={styles.mainHeader}>
        <div className={styles.logoBg}></div>
        <div className={`${styles.container} container`}>
          {/* Logo */}
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logo}>
              <Image 
                src="/images/logos/Skill Store Logo.png" 
                alt="Skill Store Logo" 
                width={130} 
                height={36} 
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </Link>

          {/* Search Bar with Live Suggestions Dropdown */}
          <div className={styles.searchWrapper} ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <div className={styles.searchInputWrapper}>
                <input
                  type="text"
                  placeholder="Search Products, Washers, Compressors..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  className={styles.searchInput}
                  aria-label="Search"
                />
                <button 
                  type="button" 
                  onClick={handleVoiceSearch} 
                  className={styles.micButton} 
                  aria-label="Voice Search"
                  title="Voice Search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </button>
              </div>
              <button type="submit" className={styles.searchButton} aria-label="Submit search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>

            {/* Instant Live Search Results Popup */}
            {isSearchFocused && searchQuery.trim().length >= 2 && (
              <div className={styles.liveSearchDropdown}>
                {/* Category matches */}
                {liveResults.categories.length > 0 && (
                  <div className={styles.liveSection}>
                    <span className={styles.liveSectionTitle}>CATEGORIES</span>
                    <div className={styles.liveCategoriesList}>
                      {liveResults.categories.map((cat) => (
                        <Link 
                          key={cat.slug} 
                          href={`/category/${cat.slug}`}
                          onClick={() => setIsSearchFocused(false)}
                          className={styles.liveCatItem}
                        >
                          <span>{cat.name}</span>
                          <span className={styles.liveCatCount}>({cat.count} items)</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product matches */}
                {liveResults.products.length > 0 ? (
                  <div className={styles.liveSection}>
                    <span className={styles.liveSectionTitle}>MATCHING PRODUCTS</span>
                    <div className={styles.liveProductsList}>
                      {liveResults.products.map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/product/${prod.id}`}
                          onClick={() => setIsSearchFocused(false)}
                          className={styles.liveProductItem}
                        >
                          <div className={styles.liveProdImgBox}>
                            <Image 
                              src={prod.imageUrl} 
                              alt={prod.title} 
                              width={40} 
                              height={40} 
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                          <div className={styles.liveProdInfo}>
                            <h4 className={styles.liveProdTitle}>{prod.title}</h4>
                            <div className={styles.liveProdMeta}>
                              <span className={styles.liveProdPrice}>₹{prod.price.toLocaleString("en-IN")}</span>
                              {prod.originalPrice > prod.price && (
                                <span className={styles.liveProdOriginal}>₹{prod.originalPrice.toLocaleString("en-IN")}</span>
                              )}
                              <span className={styles.liveProdBrand}>{prod.brand || "TUQO"}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={styles.liveNoResults}>
                    <p>No instant matches found. Press &ldquo;Enter&rdquo; to search the entire store catalog.</p>
                  </div>
                )}

                {/* View All Search CTA */}
                <div className={styles.liveSearchFooter}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchFocused(false);
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    }}
                    className={styles.viewAllResultsBtn}
                  >
                    <span>View all matching results for &ldquo;{searchQuery}&rdquo;</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className={styles.desktopNav}>
            <Link href="/" className={styles.navLink}>HOME</Link>
            <Link href="/about" className={styles.navLink}>ABOUT</Link>
            <Link href="/contact" className={styles.navLink}>CONTACT US</Link>
          </nav>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <Link href="/wishlist" className={styles.actionIcon} aria-label="Favourites">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {wishlist.length > 0 && (
                <span className={styles.badge}>{wishlist.length}</span>
              )}
            </Link>

            <Link href="/cart" className={styles.actionIcon} aria-label="Shopping Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cart.length > 0 && (
                <span className={styles.badge}>{cart.reduce((total, item) => total + item.quantity, 0)}</span>
              )}
            </Link>

            <Link href="/account" className={styles.actionIcon} aria-label="Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Sky Blue Sub-Header Navigation Bar with Dropdowns */}
      <div className={styles.subHeader}>
        <div className={styles.subContainer}>
          {/* Shop By Category Trigger */}
          <div 
            className={styles.subTabWrapper}
            onMouseEnter={() => setIsCategoryOpen(true)}
            onMouseLeave={() => {
              setIsCategoryOpen(false);
              setActiveSubmenu(null);
            }}
          >
            <Link href="/categories" className={`${styles.subTab} ${isCategoryOpen ? styles.activeTab : ""}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
              <span className={styles.subTabText}>SHOP BY CATEGORY</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`${styles.chevron} ${isCategoryOpen ? styles.chevronRotate : ""}`}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </Link>

            {/* Category Dropdown Menu */}
            {isCategoryOpen && (
              <div className={styles.categoryDropdown}>
                {/* 1. High Pressure Washer */}
                <div 
                  className={`${styles.dropdownItem} ${activeSubmenu === "washer" ? styles.dropdownItemActive : ""}`}
                  onMouseEnter={() => setActiveSubmenu("washer")}
                >
                  <Link href="/category/high-pressure-washer" className={styles.dropdownLeft}>
                    <span className={styles.menuIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 16H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3"></path>
                        <path d="M12 12h10"></path>
                        <path d="M18 8l4 4-4 4"></path>
                        <path d="M7 6v12a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2z"></path>
                      </svg>
                    </span>
                    <span>HIGH PRESSURE WASHER</span>
                  </Link>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.submenuCaret}>
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>

                  {/* Washer Submenu */}
                  {activeSubmenu === "washer" && (
                    <div className={styles.submenuBox}>
                      <Link href="/category/domestic-pressure-washer" className={styles.submenuItem}>
                        <span>DOMESTIC PRESSURE WASHER</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </Link>
                      <Link href="/category/professional-pressure-washer" className={styles.submenuItem}>
                        <span>PROFESSIONAL PRESSURE WASHER</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 2. Vaccum Cleaner */}
                <Link href="/category/vaccum-cleaner" className={styles.dropdownItem} onMouseEnter={() => setActiveSubmenu(null)}>
                  <div className={styles.dropdownLeft}>
                    <span className={styles.menuIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <ellipse cx="12" cy="12" rx="9" ry="6"></ellipse>
                        <path d="M12 6v12"></path>
                      </svg>
                    </span>
                    <span>VACCUM CLEANER</span>
                  </div>
                </Link>

                {/* 3. Air Compressor */}
                <div 
                  className={`${styles.dropdownItem} ${activeSubmenu === "compressor" ? styles.dropdownItemActive : ""}`}
                  onMouseEnter={() => setActiveSubmenu("compressor")}
                >
                  <Link href="/category/air-compressor" className={styles.dropdownLeft}>
                    <span className={styles.menuIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9"></circle>
                        <line x1="12" y1="7" x2="12" y2="12"></line>
                        <line x1="12" y1="12" x2="16" y2="14"></line>
                      </svg>
                    </span>
                    <span>AIR COMPRESSOR</span>
                  </Link>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.submenuCaret}>
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>

                  {/* Compressor Submenu */}
                  {activeSubmenu === "compressor" && (
                    <div className={styles.submenuBox}>
                      <Link href="/category/oil-free-compressor" className={styles.submenuItem}>
                        <span>OIL FREE COMPRESSOR</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </Link>
                      <Link href="/category/oil-type-compressor" className={styles.submenuItem}>
                        <span>OIL TYPE COMPRESSOR</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 4. Autocare & Detailing Products */}
                <Link href="/category/autocare-detailing" className={styles.dropdownItem} onMouseEnter={() => setActiveSubmenu(null)}>
                  <div className={styles.dropdownLeft}>
                    <span className={styles.menuIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                        <circle cx="7" cy="17" r="2"></circle>
                        <path d="M9 17h6"></path>
                        <circle cx="17" cy="17" r="2"></circle>
                      </svg>
                    </span>
                    <span>AUTOCARE &amp; DETAILING</span>
                  </div>
                </Link>

                {/* 5. Accessories & Spares */}
                <Link href="/category/accessories-spares" className={styles.dropdownItem} onMouseEnter={() => setActiveSubmenu(null)}>
                  <div className={styles.dropdownLeft}>
                    <span className={styles.menuIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                    </span>
                    <span>ACCESSORIES &amp; SPARES</span>
                  </div>
                </Link>

                {/* 6. Cordless Tools */}
                <Link href="/category/cordless-tools" className={styles.dropdownItem} onMouseEnter={() => setActiveSubmenu(null)}>
                  <div className={styles.dropdownLeft}>
                    <span className={styles.menuIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                    </span>
                    <span>CORDLESS TOOLS</span>
                  </div>
                </Link>

                {/* 7. Power Tools */}
                <Link href="/category/power-tools" className={styles.dropdownItem} onMouseEnter={() => setActiveSubmenu(null)}>
                  <div className={styles.dropdownLeft}>
                    <span className={styles.menuIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                      </svg>
                    </span>
                    <span>POWER TOOLS</span>
                  </div>
                </Link>

                {/* 8. Hand Tools */}
                <Link href="/category/hand-tools" className={styles.dropdownItem} onMouseEnter={() => setActiveSubmenu(null)}>
                  <div className={styles.dropdownLeft}>
                    <span className={styles.menuIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2l4 4-10 10H8v-4L18 2z"></path>
                        <path d="M14 6l4 4"></path>
                      </svg>
                    </span>
                    <span>HAND TOOLS</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Shop By Brands Trigger */}
          <div 
            className={styles.subTabWrapper}
            onMouseEnter={() => setIsBrandsOpen(true)}
            onMouseLeave={() => setIsBrandsOpen(false)}
          >
            <Link href="/#brands" className={`${styles.subTab} ${isBrandsOpen ? styles.activeTab : ""}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span className={styles.subTabText}>SHOP BY BRANDS</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`${styles.chevron} ${isBrandsOpen ? styles.chevronRotate : ""}`}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </Link>

            {/* Brands Dropdown Menu */}
            {isBrandsOpen && (
              <div className={styles.brandsDropdown}>
                <Link href="/shop/tuqo" className={styles.brandDropdownItem}>
                  <div className={styles.brandLogoBox}>
                    <Image src="/images/brands/tuqo.png" alt="TUQO" width={75} height={24} style={{ objectFit: 'contain' }} />
                  </div>
                  <span className={styles.brandName}>TUQO</span>
                </Link>
                <Link href="/shop/pumpkin" className={styles.brandDropdownItem}>
                  <div className={styles.brandLogoBox}>
                    <Image src="/images/brands/pumpkin.png" alt="PUMPKIN" width={75} height={24} style={{ objectFit: 'contain' }} />
                  </div>
                  <span className={styles.brandName}>PUMPKIN</span>
                </Link>
                <Link href="/shop/mitsuki" className={styles.brandDropdownItem}>
                  <div className={styles.brandLogoBox}>
                    <Image src="/images/brands/mitsuki.png" alt="MITSUKI" width={75} height={24} style={{ objectFit: 'contain' }} />
                  </div>
                  <span className={styles.brandName}>MITSUKI</span>
                </Link>
                <Link href="/shop/metso" className={styles.brandDropdownItem}>
                  <div className={styles.brandLogoBox}>
                    <Image src="/images/brands/metso.png" alt="METSO" width={75} height={24} style={{ objectFit: 'contain' }} />
                  </div>
                  <span className={styles.brandName}>METSO</span>
                </Link>
                <Link href="/shop/costec" className={styles.brandDropdownItem}>
                  <div className={styles.brandLogoBox}>
                    <Image src="/images/brands/costec.png" alt="COSTEC" width={75} height={24} style={{ objectFit: 'contain' }} />
                  </div>
                  <span className={styles.brandName}>COSTEC</span>
                </Link>
                <Link href="/shop/ultratouch" className={styles.brandDropdownItem}>
                  <div className={styles.brandLogoBox}>
                    <Image src="/images/brands/ultratouch.svg" alt="Ultra TOUCH" width={75} height={24} style={{ objectFit: 'contain' }} />
                  </div>
                  <span className={styles.brandName}>Ultra TOUCH</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
