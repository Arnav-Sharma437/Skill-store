"use client";

import React from "react";
import styles from "./BrandsSection.module.css";

export default function BrandsSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>Trusted by Leading Tech Teams</h2>
        <div className={styles.grid}>
          {/* Google Logo */}
          <div className={`${styles.brandLogo} ${styles.google}`} aria-label="Google">
            <svg width="120" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 2.234 15.427 1 12.24 1 6.012 1 1 6.012 1 12.24s5.012 11.24 11.24 11.24c6.502 0 10.822-4.57 10.822-11.023 0-.742-.08-1.303-.178-1.782h-10.64z"/>
            </svg>
          </div>

          {/* Amazon Logo */}
          <div className={`${styles.brandLogo} ${styles.amazon}`} aria-label="Amazon">
            <svg width="120" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.9 19.3c-2.4 1.6-5.8 2.4-8.8 2.4-4.2 0-8-1.5-10.8-4-.3-.3-.1-.7.3-.5 3.1 1.7 7 2.7 11 2.7 2.7 0 5.8-.6 8.2-1.8.5-.3.8.2.2.2zm.8-1.9c-.3-.4-1.8-.2-2.5-.1-.3 0-.3-.3 0-.4 1.1-.3 2.9-.6 3.1-.2.2.3-.2 2.1-.7 3.1-.2.3-.4.2-.3-.1.3-.9.7-2 .4-2.3zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1.6 13.2c-.8.6-1.9.9-3.2.9-2.3 0-3.5-1.1-3.5-2.8 0-2.3 2.1-3.4 5.7-3.4v-.2c0-.7-.4-1.3-1.6-1.3-1.1 0-2.2.4-2.9.9-.2.2-.5 0-.4-.3.4-1 1-1.7 2.6-2.1.3-.1.7-.1 1.1-.1 2.8 0 3.9 1.4 3.9 3.8v3.5c0 1.2.5 1.7.9 2.1.2.2.2.5-.1.6-.4.4-1.5 1.1-2.1 1.1-.5 0-.6-.3-.6-.7l.1-1.5zm-3.2-1.9c1.6 0 2.4-.6 2.4-1.7v-.9c-1.8 0-3.3.4-3.3 1.5 0 .7.4 1.1.9 1.1z"/>
            </svg>
          </div>

          {/* Meta Logo */}
          <div className={`${styles.brandLogo} ${styles.meta}`} aria-label="Meta">
            <svg width="120" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.887 6.452a5.548 5.548 0 0 0-3.87 1.585l-1.94 1.945-1.94-1.945a5.548 5.548 0 0 0-3.87-1.585A5.556 5.556 0 0 0 1.71 12a5.556 5.556 0 0 0 5.557 5.548 5.548 5.548 0 0 0 3.87-1.585l1.94-1.945 1.94 1.945a5.548 5.548 0 0 0 3.87 1.585A5.556 5.556 0 0 0 22.29 12a5.556 5.556 0 0 0-3.403-5.548zm-11.62 9.07c-1.94 0-3.522-1.582-3.522-3.522s1.582-3.522 3.522-3.522c1.077 0 2.036.488 2.678 1.258l-2.678 2.678c-.287-.287-.492-.638-.598-1.026a.916.916 0 0 0-1.77.478 2.748 2.748 0 0 1 1.794 3.082 3.535 3.535 0 0 1-2.904-.948zm11.62 0c-1.94 0-3.522-1.582-3.522-3.522s1.582-3.522 3.522-3.522c1.077 0 2.036.488 2.678 1.258l-2.678 2.678c-.287-.287-.492-.638-.598-1.026a.916.916 0 0 0-1.77.478 2.748 2.748 0 0 1 1.794 3.082 3.535 3.535 0 0 1-2.904-.948z"/>
            </svg>
          </div>

          {/* Microsoft Logo */}
          <div className={`${styles.brandLogo} ${styles.microsoft}`} aria-label="Microsoft">
            <svg width="120" height="32" viewBox="0 0 23 23" fill="currentColor">
              <path d="M0 0h11v11H0z" fill="#f25022"/><path d="M12 0h11v11H12z" fill="#7fba00"/><path d="M0 12h11v11H0z" fill="#00a4ef"/><path d="M12 12h11v11H12z" fill="#ffb900"/>
            </svg>
          </div>

          {/* Netflix Logo */}
          <div className={`${styles.brandLogo} ${styles.netflix}`} aria-label="Netflix">
            <svg width="120" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.5 1h3.3v17.2L20.5 1h3.3V23h-3.3V5.8L8.8 23H5.5V1z"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
