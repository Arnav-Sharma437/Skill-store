"use client";

import React, { useState } from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import styles from "./ContactPage.module.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setFormData({ name: "", email: "", message: "" });
      } else {
        setError(json.error || "Failed to submit enquiry. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className={styles.main}>
        {/* Banner header */}
        <div className={styles.bannerHeader}>
          <div className="container">
            <h1 className={styles.bannerTitle}>CONTACT INFORMATION</h1>
            <p className={styles.bannerSubtitle}>We value your feedback and are here to assist you.</p>
          </div>
        </div>

        <div className="container">
          <div className={styles.contactLayout}>
            {/* Left: Contact Form */}
            <div className={styles.formCard}>
              <h2>Send us a Message</h2>
              <p>Fill out the form below and our customer support team will get back to you shortly.</p>

              <form onSubmit={handleSubmit} className={styles.form}>
                {success && (
                  <div className={styles.successAlert}>
                    <strong>Thank you!</strong> Your message has been sent successfully. We will contact you soon.
                  </div>
                )}
                {error && <div className={styles.errorAlert}>{error}</div>}

                <div className={styles.inputGroup}>
                  <label htmlFor="form-name">Full Name</label>
                  <input
                    id="form-name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="form-email">Email Address</label>
                  <input
                    id="form-email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="form-msg">Message</label>
                  <textarea
                    id="form-msg"
                    rows={5}
                    placeholder="How can we help you today?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? "SENDING MESSAGE..." : "SUBMIT ENQUIRY"}
                </button>
              </form>
            </div>

            {/* Right: Contact details */}
            <div className={styles.detailsColumn}>
              <div className={styles.detailsCard}>
                <h2>Customer Support</h2>
                <p>If you have any questions, concerns, or need assistance with your order, our customer support team is ready to help.</p>

                <div className={styles.infoList}>
                  {/* Phone Item */}
                  <div className={styles.infoItem}>
                    <div className={styles.iconCircle}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div className={styles.infoMeta}>
                      <h3>Phone</h3>
                      <p><strong>8754301661</strong></p>
                      <span>Time: 10:00 AM - 7:00 PM</span>
                    </div>
                  </div>

                  {/* Email Item */}
                  <div className={styles.infoItem}>
                    <div className={styles.iconCircle}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <div className={styles.infoMeta}>
                      <h3>Email Address</h3>
                      <p><a href="mailto:skillstore.info@gmail.com"><strong>skillstore.info@gmail.com</strong></a></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className={styles.detailsCard}>
                <h2>Mailing Address</h2>
                <p>Feel free to reach out to us via mail. Our physical address is:</p>

                <div className={styles.infoItem} style={{ border: "none", padding: 0 }}>
                  <div className={styles.iconCircle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div className={styles.infoMeta}>
                    <h3>SkillStore Coimbatore Office</h3>
                    <p className={styles.addressText}>
                      E-45/B, Sidco Industrial Estate,<br />
                      Kurichi, Coimbatore - 641021
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
