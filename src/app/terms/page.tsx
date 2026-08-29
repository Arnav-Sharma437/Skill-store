"use client";

import React from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import styles from "./TermsPage.module.css";

export default function TermsOfServicePage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className={styles.main}>
        {/* Banner Header */}
        <div className={styles.bannerHeader}>
          <div className="container">
            <h1 className={styles.bannerTitle}>Terms &amp; Conditions</h1>
            <p className={styles.bannerSubtitle}>Terms of Service for SkillStore</p>
          </div>
        </div>

        {/* Policy Document Content */}
        <div className="container">
          <div className={styles.documentCard}>
            <p className={styles.introText}>
              This Terms of Service agreement (the &quot;Agreement&quot;) is entered into by and between SkillStore (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) and you, the user (&quot;you&quot; or &quot;your&quot;). This Agreement sets forth the terms and conditions of your use of the SkillStore website and services.
            </p>

            {/* Section 1 */}
            <section className={styles.policySection}>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using the SkillStore website and services, you agree to be bound by the terms and conditions of this Agreement. If you do not agree with these terms, please do not use our website.
              </p>
            </section>

            {/* Section 2 */}
            <section className={styles.policySection}>
              <h2>2. Use of the Website</h2>
              <p>
                You agree to use the SkillStore website and services for lawful purposes only and in accordance with this Agreement. You are responsible for ensuring that your use of the website complies with all applicable laws and regulations.
              </p>
            </section>

            {/* Section 3 */}
            <section className={styles.policySection}>
              <h2>3. Product Information</h2>
              <p>
                We make every effort to display accurate and up-to-date information about our products. However, we do not guarantee the accuracy, completeness, or reliability of any product descriptions, pricing, or other content on the website.
              </p>
            </section>

            {/* Section 4 */}
            <section className={styles.policySection}>
              <h2>4. Order Acceptance</h2>
              <p>
                Your placement of an order on SkillStore is an offer to purchase our products. We reserve the right to accept or decline your order for any reason. In the event that we cannot fulfill your order, we will notify you and issue a refund.
              </p>
            </section>

            {/* Section 5 */}
            <section className={styles.policySection}>
              <h2>5. Pricing and Payment</h2>
              <p>
                Prices for products are as listed on the website. We reserve the right to change prices at any time. Payment is required at the time of purchase, and we accept the payment methods indicated on the website.
              </p>
            </section>

            {/* Section 6 */}
            <section className={styles.policySection}>
              <h2>6. Intellectual Property</h2>
              <p>
                All content on the SkillStore website, including text, graphics, logos, images, and software, is the property of SkillStore and is protected by intellectual property laws. You may not use, reproduce, or distribute any content without our express written consent.
              </p>
            </section>

            {/* Section 7 */}
            <section className={styles.policySection}>
              <h2>7. Limitation of Liability</h2>
              <p>
                SkillStore is not liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the website or services.
              </p>
            </section>

            {/* Section 8 */}
            <section className={styles.policySection}>
              <h2>8. Governing Law</h2>
              <p>
                This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with this Agreement shall be resolved in the state or federal courts located within Coimbatore, Tamil Nadu, India.
              </p>
            </section>

            {/* Section 9 */}
            <section className={styles.policySection}>
              <h2>9. Changes to the Agreement</h2>
              <p>
                We reserve the right to modify or update this Agreement at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after any such changes constitutes acceptance of the new terms.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
