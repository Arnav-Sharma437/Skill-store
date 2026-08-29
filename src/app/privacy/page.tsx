"use client";

import React from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import styles from "./PrivacyPage.module.css";

export default function PrivacyPolicyPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className={styles.main}>
        {/* Banner Header */}
        <div className={styles.bannerHeader}>
          <div className="container">
            <h1 className={styles.bannerTitle}>Privacy Policy</h1>
            <p className={styles.bannerSubtitle}>Last updated on 19/12/2023</p>
          </div>
        </div>

        {/* Policy Document Content */}
        <div className="container">
          <div className={styles.documentCard}>
            {/* Section 1 */}
            <section className={styles.policySection}>
              <h2>1. Introduction</h2>
              <p>
                Welcome to SkillStore! This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our website and services.
              </p>
            </section>

            {/* Section 2 */}
            <section className={styles.policySection}>
              <h2>2. Information We Collect</h2>
              <p>We may collect various types of information, including:</p>
              <ul className={styles.list}>
                <li><strong>Personal Information:</strong> Name, address, email, phone number.</li>
                <li><strong>Payment Information:</strong> Credit card details, billing information.</li>
                <li><strong>Order Information:</strong> Details about your purchases on our site.</li>
                <li><strong>Device Information:</strong> IP address, browser type, device type.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className={styles.policySection}>
              <h2>3. How We Use Your Information</h2>
              <p>We use your information for various purposes, including:</p>
              <ul className={styles.list}>
                <li>Processing and fulfilling orders.</li>
                <li>Communicating with you about your orders and inquiries.</li>
                <li>Improving our products and services.</li>
                <li>Marketing and promotional purposes with your consent.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className={styles.policySection}>
              <h2>4. Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to outside parties. However, we may share information with trusted third parties who assist us in operating our website, conducting our business, or servicing you.
              </p>
            </section>

            {/* Section 5 */}
            <section className={styles.policySection}>
              <h2>5. Security</h2>
              <p>
                We take reasonable measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction.
              </p>
            </section>

            {/* Section 6 */}
            <section className={styles.policySection}>
              <h2>6. Cookies</h2>
              <p>
                We use cookies to enhance your experience on our site. You can choose to disable cookies in your browser settings, but this may affect your ability to access certain features of our site.
              </p>
            </section>

            {/* Section 7 */}
            <section className={styles.policySection}>
              <h2>7. Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal information. Contact us using the information below to exercise these rights.
              </p>
            </section>

            {/* Section 8 */}
            <section className={styles.policySection}>
              <h2>8. Marketing Communications</h2>
              <p>
                With your consent, we may send you marketing communications about our products, services, and promotions. You can opt-out of these communications at any time.
              </p>
            </section>

            {/* Section 9 */}
            <section className={styles.policySection}>
              <h2>9. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these websites. Please review their privacy policies before providing any personal information.
              </p>
            </section>

            {/* Section 10 */}
            <section className={styles.policySection}>
              <h2>10. Children&apos;s Privacy</h2>
              <p>
                Our services are not directed to individuals under the age of 18. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us, and we will take steps to delete such information.
              </p>
            </section>

            {/* Section 11 */}
            <section className={styles.policySection}>
              <h2>11. Contact Information</h2>
              <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
              <div className={styles.contactDetails}>
                <p><strong>Phone:</strong> 8754301661</p>
                <p><strong>Email:</strong> <a href="mailto:skillstore.info@gmail.com">skillstore.info@gmail.com</a></p>
                <p><strong>Address:</strong> P.r.p Garden Road, Krishnarayapuram Illango Nagar, Coimbatore, 641004 - Coimbatore TN, India.</p>
              </div>
            </section>

            {/* Section 12 */}
            <section className={styles.policySection}>
              <h2>12. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. The latest version will be posted on our website with the effective date.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
