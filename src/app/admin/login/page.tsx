"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./AdminLogin.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to admin
    const token = sessionStorage.getItem("skill_store_admin_token");
    if (token === "logged_in") {
      router.push("/admin");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulated login validation matching admin@skillstore.com / admin123
    setTimeout(() => {
      if (email === "admin@skillstore.com" && password === "admin123") {
        sessionStorage.setItem("skill_store_admin_token", "logged_in");
        router.push("/admin");
      } else {
        setError("Invalid email address or password. Please try again.");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.glassCard}>
        <div className={styles.logoRow}>
          <h1 className={styles.logoText}>SKILL STORE</h1>
          <span className={styles.logoSub}>ADMIN CONTROL CENTER</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="admin-email" className={styles.label}>Email Address</label>
            <input
              id="admin-email"
              type="email"
              placeholder="admin@skillstore.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="admin-password" className={styles.label}>Password</label>
            <input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={styles.loginBtn}
          >
            {loading ? "AUTHENTICATING..." : "LOG IN TO DASHBOARD"}
          </button>
        </form>
      </div>
    </div>
  );
}
