"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import { useApp } from "@/context/AppContext";
import styles from "./AccountPage.module.css";

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

interface Address {
  id: string;
  type: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  pincode: string;
}

export default function AccountPage() {
  const { wishlist, toggleWishlist } = useApp();
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user_session");
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>(() => {
    if (typeof window !== "undefined") {
      const savedAddresses = localStorage.getItem("user_addresses");
      if (savedAddresses) {
        return JSON.parse(savedAddresses);
      }
      const defaultAddresses = [
        {
          id: "addr-1",
          type: "Home",
          name: "Arnav Sharma",
          phone: "8754301661",
          street: "P.r.p Garden Road, Krishnarayapuram Illango Nagar",
          city: "Coimbatore",
          pincode: "641004"
        }
      ];
      localStorage.setItem("user_addresses", JSON.stringify(defaultAddresses));
      return defaultAddresses;
    }
    return [];
  });
  
  // Address Form State
  const [newAddress, setNewAddress] = useState({
    type: "Home",
    name: "",
    phone: "",
    street: "",
    city: "",
    pincode: ""
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  const handleGoogleLogin = () => {
    setShowLoginPopup(true);
  };

  const selectAccount = (name: string, email: string, avatar: string) => {
    const profile = { name, email, avatar };
    setUser(profile);
    localStorage.setItem("user_session", JSON.stringify(profile));
    setShowLoginPopup(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user_session");
    setActiveTab("overview");
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.name || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.pincode) return;

    const addressToAdd: Address = {
      id: `addr-${Date.now()}`,
      ...newAddress
    };

    const updatedAddresses = [...addresses, addressToAdd];
    setAddresses(updatedAddresses);
    localStorage.setItem("user_addresses", JSON.stringify(updatedAddresses));

    // Reset Form
    setNewAddress({
      type: "Home",
      name: "",
      phone: "",
      street: "",
      city: "",
      pincode: ""
    });
    setShowAddressForm(false);
  };

  const handleDeleteAddress = (id: string) => {
    const updatedAddresses = addresses.filter((addr) => addr.id !== id);
    setAddresses(updatedAddresses);
    localStorage.setItem("user_addresses", JSON.stringify(updatedAddresses));
  };

  // Mock Orders list
  const mockOrders = [
    {
      id: "ORD-8841",
      date: "August 24, 2026",
      total: 6299,
      status: "Shipped",
      items: [
        {
          name: "TUQO Cordless Pressure Washer CDW400",
          qty: 1,
          price: 6299
        }
      ]
    },
    {
      id: "ORD-8410",
      date: "July 12, 2026",
      total: 12598,
      status: "Delivered",
      items: [
        {
          name: "TUQO Cordless Pressure Washer CDW400",
          qty: 2,
          price: 6299
        }
      ]
    }
  ];

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className={styles.main}>
        {/* Banner Header */}
        <div className={styles.bannerHeader}>
          <div className="container">
            <h1 className={styles.bannerTitle}>My Account</h1>
            <p className={styles.bannerSubtitle}>
              {user ? `Welcome back, ${user.name}!` : "Sign in to track orders and manage your profile."}
            </p>
          </div>
        </div>

        <div className="container">
          {!user ? (
            /* Logged Out view: Login Gate */
            <div className={styles.loginGate}>
              <div className={styles.loginCard}>
                <div className={styles.logoRow}>
                  <span className={styles.logoSkill}>SKILL</span>
                  <span className={styles.logoStore}>STORE</span>
                </div>
                <h2>Access Your Dashboard</h2>
                <p>Track order shipments, manage shipping address listings, and sync your favorite items instantly.</p>
                
                <button onClick={handleGoogleLogin} className={styles.googleBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Sign In with Google</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged In view: Account Dashboard */
            <div className={styles.dashboardLayout}>
              {/* Left Sidebar */}
              <aside className={styles.sidebar}>
                <div className={styles.profileHeader}>
                  <img src={user.avatar} alt={user.name} className={styles.avatar} />
                  <div className={styles.profileMeta}>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                  </div>
                </div>

                <nav className={styles.sidebarNav}>
                  <button 
                    onClick={() => setActiveTab("overview")} 
                    className={`${styles.navBtn} ${activeTab === "overview" ? styles.activeNavBtn : ""}`}
                  >
                    Dashboard Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab("orders")} 
                    className={`${styles.navBtn} ${activeTab === "orders" ? styles.activeNavBtn : ""}`}
                  >
                    My Orders
                  </button>
                  <button 
                    onClick={() => setActiveTab("addresses")} 
                    className={`${styles.navBtn} ${activeTab === "addresses" ? styles.activeNavBtn : ""}`}
                  >
                    Address Book
                  </button>
                  <button 
                    onClick={() => setActiveTab("wishlist")} 
                    className={`${styles.navBtn} ${activeTab === "wishlist" ? styles.activeNavBtn : ""}`}
                  >
                    My Wishlist ({wishlist.length})
                  </button>
                  <button onClick={handleLogout} className={`${styles.navBtn} ${styles.logoutBtn}`}>
                    Sign Out
                  </button>
                </nav>
              </aside>

              {/* Right Content Area */}
              <div className={styles.contentArea}>
                {/* 1. Overview Tab */}
                {activeTab === "overview" && (
                  <div className={styles.tabContent}>
                    <h2>Account Overview</h2>
                    <p>Manage your account settings, order history, and active deliveries easily.</p>

                    <div className={styles.statsGrid}>
                      <div className={styles.statCard}>
                        <h3>{mockOrders.length}</h3>
                        <p>Total Orders</p>
                      </div>
                      <div className={styles.statCard}>
                        <h3>{wishlist.length}</h3>
                        <p>Wishlist Items</p>
                      </div>
                      <div className={styles.statCard}>
                        <h3>{addresses.length}</h3>
                        <p>Saved Addresses</p>
                      </div>
                    </div>

                    <div className={styles.profileSummary}>
                      <h3>Personal Information</h3>
                      <div className={styles.profileDetailsRow}>
                        <div className={styles.profileDetail}>
                          <strong>Name:</strong>
                          <span>{user.name}</span>
                        </div>
                        <div className={styles.profileDetail}>
                          <strong>Email:</strong>
                          <span>{user.email}</span>
                        </div>
                        <div className={styles.profileDetail}>
                          <strong>Registered Platform:</strong>
                          <span>Google Sign-In</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. My Orders Tab */}
                {activeTab === "orders" && (
                  <div className={styles.tabContent}>
                    <h2>Order History</h2>
                    <p>Check the delivery status of your recent transactions.</p>

                    {mockOrders.length === 0 ? (
                      <p className={styles.emptyText}>You haven&apos;t placed any orders yet.</p>
                    ) : (
                      <div className={styles.ordersTableWrapper}>
                        <table className={styles.ordersTable}>
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Date</th>
                              <th>Product Description</th>
                              <th>Total Amount</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockOrders.map((order) => (
                              <tr key={order.id}>
                                <td className={styles.orderId}>{order.id}</td>
                                <td>{order.date}</td>
                                <td>
                                  {order.items.map((it, idx) => (
                                    <div key={idx}>
                                      {it.name} <strong>x {it.qty}</strong>
                                    </div>
                                  ))}
                                </td>
                                <td className={styles.orderTotal}>₹{order.total.toLocaleString("en-IN")}</td>
                                <td>
                                  <span className={`${styles.statusBadge} ${order.status === "Delivered" ? styles.statusDelivered : styles.statusShipped}`}>
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Address Book Tab */}
                {activeTab === "addresses" && (
                  <div className={styles.tabContent}>
                    <div className={styles.tabHeaderWithAction}>
                      <h2>Address Book</h2>
                      {!showAddressForm && (
                        <button onClick={() => setShowAddressForm(true)} className={styles.addBtn}>
                          + Add Address
                        </button>
                      )}
                    </div>

                    {showAddressForm ? (
                      /* Address Add Form */
                      <form onSubmit={handleAddAddress} className={styles.addressForm}>
                        <h3>New Shipping Address</h3>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label htmlFor="address-type">Address Type</label>
                            <select
                              id="address-type"
                              value={newAddress.type}
                              onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
                            >
                              <option value="Home">Home</option>
                              <option value="Office">Office</option>
                              <option value="Billing">Billing</option>
                            </select>
                          </div>
                          <div className={styles.formGroup}>
                            <label htmlFor="address-name">Full Name</label>
                            <input
                              id="address-name"
                              type="text"
                              placeholder="Arnav Sharma"
                              value={newAddress.name}
                              onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label htmlFor="address-phone">Phone Number</label>
                            <input
                              id="address-phone"
                              type="tel"
                              placeholder="8754301661"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                              required
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label htmlFor="address-pincode">Pincode</label>
                            <input
                              id="address-pincode"
                              type="text"
                              placeholder="641004"
                              value={newAddress.pincode}
                              onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="address-street">Street Address</label>
                          <input
                            id="address-street"
                            type="text"
                            placeholder="P.r.p Garden Road, Krishnarayapuram Illango Nagar"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            required
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="address-city">City &amp; State</label>
                          <input
                            id="address-city"
                            type="text"
                            placeholder="Coimbatore, Tamil Nadu"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            required
                          />
                        </div>

                        <div className={styles.formActions}>
                          <button type="submit" className={styles.saveBtn}>Save Address</button>
                          <button type="button" onClick={() => setShowAddressForm(false)} className={styles.cancelBtn}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      /* Address Lists */
                      <div className={styles.addressListGrid}>
                        {addresses.map((addr) => (
                          <div key={addr.id} className={styles.addressCard}>
                            <div className={styles.addressCardHeader}>
                              <span className={styles.typeBadge}>{addr.type}</span>
                              <button onClick={() => handleDeleteAddress(addr.id)} className={styles.deleteBtn} aria-label="Delete address">
                                Delete
                              </button>
                            </div>
                            <h3>{addr.name}</h3>
                            <p>{addr.street}</p>
                            <p>{addr.city} - {addr.pincode}</p>
                            <p className={styles.phoneLabel}>Phone: {addr.phone}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Wishlist Tab */}
                {activeTab === "wishlist" && (
                  <div className={styles.tabContent}>
                    <h2>My Wishlist</h2>
                    <p>Your saved favorites are listed here. You can add them straight to your shopping cart.</p>

                    {wishlist.length === 0 ? (
                      <p className={styles.emptyText}>Your wishlist is empty.</p>
                    ) : (
                      <div className={styles.wishlistGrid}>
                        {wishlist.map((item) => (
                          <div key={item.id} className={styles.wishlistCard}>
                            <img src={item.imageUrl} alt={item.title} className={styles.wishlistImg} />
                            <div className={styles.wishlistMeta}>
                              <h4>{item.title}</h4>
                              <p className={styles.wishlistPrice}>₹{item.price.toLocaleString("en-IN")}</p>
                              <div className={styles.wishlistActions}>
                                <Link href={`/product/prod-3`} className={styles.viewProductBtn}>
                                  View Item
                                </Link>
                                <button onClick={() => toggleWishlist(item)} className={styles.removeWishlistBtn}>
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Realistic Google Accounts Selector Popup Overlay */}
        {showLoginPopup && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>
              <div className={styles.modalHeader}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Sign in with Google</span>
              </div>
              <p className={styles.modalSub}>to continue to <strong>SkillStore</strong></p>

              <div className={styles.accountsList}>
                {/* Account 1 */}
                <button 
                  onClick={() => selectAccount(
                    "Arnav Sharma",
                    "arnav.sharma@gmail.com",
                    "https://api.dicebear.com/7.x/adventurer/svg?seed=Arnav"
                  )} 
                  className={styles.accountRow}
                >
                  <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Arnav" alt="Arnav Avatar" />
                  <div className={styles.accountText}>
                    <strong>Arnav Sharma</strong>
                    <span>arnav.sharma@gmail.com</span>
                  </div>
                </button>

                {/* Account 2 */}
                <button 
                  onClick={() => selectAccount(
                    "SkillStore Support",
                    "skillstore.info@gmail.com",
                    "https://api.dicebear.com/7.x/adventurer/svg?seed=Store"
                  )} 
                  className={styles.accountRow}
                >
                  <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Store" alt="Support Avatar" />
                  <div className={styles.accountText}>
                    <strong>SkillStore Support</strong>
                    <span>skillstore.info@gmail.com</span>
                  </div>
                </button>
              </div>

              <button onClick={() => setShowLoginPopup(false)} className={styles.closeModalBtn}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
