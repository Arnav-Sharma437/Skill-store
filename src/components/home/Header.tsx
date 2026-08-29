"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import styles from "./Header.module.css";

export default function Header() {
  const { cart, wishlist } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Searching for: ${searchQuery}`);
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

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <div className={styles.searchInputWrapper}>
              <input
                type="text"
                placeholder="Search Products and Categories"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                aria-label="Search"
              />
              <button type="button" className={styles.micButton} aria-label="Voice Search">
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
                  <span className={styles.submenuArrow}>&gt;</span>

                  {/* Washer Submenu */}
                  {activeSubmenu === "washer" && (
                    <div className={styles.submenuBox}>
                      <Link href="/category/domestic-pressure-washer" className={styles.submenuItem}>DOMESTIC PRESSURE WASHER</Link>
                      <Link href="/category/professional-pressure-washer" className={styles.submenuItem}>PROFESSIONAL PRESSURE WASHER</Link>
                    </div>
                  )}
                </div>

                {/* 2. Vaccum Cleaner */}
                <Link href="/category/vaccum-cleaner" className={styles.dropdownItem} onMouseEnter={() => setActiveSubmenu(null)}>
                  <div className={styles.dropdownLeft}>
                    <span className={styles.menuIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"></path>
                        <path d="M6 16h12"></path>
                      </svg>
                    </span>
                    <span>VACCUM CLEANER</span>
                  </div>
                </Link>

                {/* 3. Autocare Detailing */}
                <Link href="/category/autocare-detailing" className={styles.dropdownItem} onMouseEnter={() => setActiveSubmenu(null)}>
                  <div className={styles.dropdownLeft}>
                    <span className={styles.menuIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12.5V16c0 .6.4 1 1 1h2"></path>
                        <circle cx="7" cy="17" r="2"></circle>
                        <circle cx="17" cy="17" r="2"></circle>
                      </svg>
                    </span>
                    <span>AUTOCARE DETAILING</span>
                  </div>
                </Link>

                {/* 4. Accessories & Spares */}
                <Link href="/category/accessories-spares" className={styles.dropdownItem} onMouseEnter={() => setActiveSubmenu(null)}>
                  <div className={styles.dropdownLeft}>
                    <span className={styles.menuIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                    </span>
                    <span>ACCESSORIES & SPARES</span>
                  </div>
                </Link>

                {/* 5. Air Compressor */}
                <div 
                  className={`${styles.dropdownItem} ${activeSubmenu === "compressor" ? styles.dropdownItemActive : ""}`}
                  onMouseEnter={() => setActiveSubmenu("compressor")}
                >
                  <Link href="/category/air-compressor" className={styles.dropdownLeft}>
                    <span className={styles.menuIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 8V12l3 3"></path>
                        <path d="M16 4h4"></path>
                      </svg>
                    </span>
                    <span>AIR COMPRESSOR</span>
                  </Link>
                  <span className={styles.submenuArrow}>&gt;</span>

                  {/* Compressor Submenu */}
                  {activeSubmenu === "compressor" && (
                    <div className={styles.submenuBox}>
                      <Link href="/category/oil-free-compressor" className={styles.submenuItem}>OIL FREE</Link>
                      <Link href="/category/oil-type-compressor" className={styles.submenuItem}>OIL TYPE</Link>
                    </div>
                  )}
                </div>

                {/* 6. Cordless Tools */}
                <Link href="/category/cordless-tools" className={styles.dropdownItem} onMouseEnter={() => setActiveSubmenu(null)}>
                  <div className={styles.dropdownLeft}>
                    <span className={styles.menuIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 4H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h4v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-8h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                        <circle cx="10" cy="8" r="1"></circle>
                      </svg>
                    </span>
                    <span>CORDLESS TOOLS</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <div className={styles.subDivider}></div>

          {/* Shop By Brands Trigger */}
          <div 
            className={styles.subTabWrapper}
            onMouseEnter={() => setIsBrandsOpen(true)}
            onMouseLeave={() => setIsBrandsOpen(false)}
          >
            <div className={`${styles.subTab} ${isBrandsOpen ? styles.activeTab : ""}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              <span className={styles.subTabText}>SHOP BY BRANDS</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`${styles.chevron} ${isBrandsOpen ? styles.chevronRotate : ""}`}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {/* Brands Dropdown Menu (White Box) */}
            {isBrandsOpen && (
              <div className={styles.brandsDropdown}>
                {/* Brand 1: TUQO */}
                <Link href="/shop/tuqo" className={styles.brandDropdownItem}>
                  <svg width="100" height="28" viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="var(--font-accent)" fontStyle="italic" fontWeight="900" fontSize="18" fill="#000" letterSpacing="-0.5">TUQO</text>
                  </svg>
                </Link>
                {/* Brand 2: PUMPKIN */}
                <Link href="/shop/pumpkin" className={styles.brandDropdownItem}>
                  <svg width="100" height="28" viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="14" r="5" fill="#ff7a00" />
                    <path d="M12 9C12 7 13 6 13 6" stroke="#4caf50" strokeWidth="1.5" strokeLinecap="round" />
                    <text x="22" y="18" fontFamily="var(--font-sans)" fontWeight="700" fontSize="11" fill="#000">PUMPKIN</text>
                  </svg>
                </Link>
                {/* Brand 3: MITSUKI */}
                <Link href="/shop/mitsuki" className={styles.brandDropdownItem}>
                  <svg width="100" height="28" viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="900" fontSize="14" fill="#000" letterSpacing="1">MITSUKI</text>
                  </svg>
                </Link>
                {/* Brand 4: METSO */}
                <Link href="/shop/metso" className={styles.brandDropdownItem}>
                  <svg width="100" height="28" viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="900" fontSize="14" fill="#000" letterSpacing="0">METSO</text>
                  </svg>
                </Link>
                {/* Brand 5: COSTEC */}
                <Link href="/shop/costec" className={styles.brandDropdownItem}>
                  <svg width="100" height="28" viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="700" fontSize="13" fill="#000" letterSpacing="0.5">COSTEC</text>
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
