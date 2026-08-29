"use client";

import React from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import styles from "./RefundPage.module.css";

export default function RefundPolicyPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className={styles.main}>
        {/* Banner Header */}
        <div className={styles.bannerHeader}>
          <div className="container">
            <h1 className={styles.bannerTitle}>Cancellation & Refund Policy</h1>
            <p className={styles.bannerSubtitle}>Thank you for shopping with SkillStore!</p>
          </div>
        </div>

        {/* Policy Document Content */}
        <div className="container">
          <div className={styles.documentCard}>
            <p className={styles.introText}>
              We want to ensure your satisfaction with every purchase. Please review our return and refund policy below:
            </p>

            {/* Section 1 */}
            <section className={styles.policySection}>
              <h2>Returns and Replacements</h2>
              <p>
                In the event of a misalignment, breakage, or malfunction of any item received, SkillStore will gladly accept returns and provide replacements under the following conditions:
              </p>
              <ul className={styles.list}>
                <li>
                  <strong>Notification:</strong> Please notify us of any issues within the <strong>same day</strong> of receiving your order. Contact our customer support team immediately.
                </li>
                <li>
                  <strong>Condition of Return:</strong> Returned items must be unused, in their original packaging, and in the same condition as when you received them.
                </li>
                <li>
                  <strong>Evidence:</strong> To process a return, we may request photographic or other evidence of the reported issue.
                </li>
                <li>
                  <strong>Return Authorization:</strong> SkillStore reserves the right to authorize or decline returns based on the provided information.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className={styles.policySection}>
              <h2>Refund Policy</h2>
              <p>SkillStore offers replacements for items that meet the conditions outlined above. Please note the following:</p>
              <ul className={styles.list}>
                <li>
                  <strong>No Refunds:</strong> We do not offer cash or bank refunds for returned items. Replacements will be provided for eligible products.
                </li>
                <li>
                  <strong>Damaged or Defective Items:</strong> If you receive a damaged or defective item, we will promptly replace it with a new one. If a replacement is not available, we will offer an alternative item or store credit.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className={styles.policySection}>
              <h2>Return Process</h2>
              <p>To initiate a return or replacement, follow these steps:</p>
              <ol className={styles.orderedList}>
                <li>
                  Contact our customer support team via Phone at <strong>8754301661</strong> or Email at <a href="mailto:skillstore.info@gmail.com"><strong>skillstore.info@gmail.com</strong></a> to report the issue and receive official authorization.
                </li>
                <li>
                  Ship the item back to the specific warehouse address provided by our customer support team.
                </li>
                <li>
                  Include a copy of the original packing slip or order confirmation email inside the return package.
                </li>
              </ol>
            </section>

            {/* Section 4 */}
            <section className={styles.policySection}>
              <h2>Shipping Costs</h2>
              <p>
                SkillStore will cover the cost of shipping for returns or replacements due to damaged or defective items. Customers are responsible for return shipping costs in all other cases.
              </p>
            </section>

            {/* Section 5 */}
            <section className={styles.policySection}>
              <h2>Contact Information</h2>
              <p>If you have any questions or concerns about our return and refund policy, please contact our customer support team:</p>
              <div className={styles.contactDetails}>
                <p><strong>Phone Support:</strong> 8754301661</p>
                <p><strong>Email Support:</strong> <a href="mailto:skillstore.info@gmail.com">skillstore.info@gmail.com</a></p>
              </div>
            </section>

            {/* Section 6 */}
            <section className={styles.policySection}>
              <h2>Changes to Policy</h2>
              <p>
                SkillStore reserves the right to update or modify this return and refund policy at any time. Any changes will be posted immediately on our website.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
