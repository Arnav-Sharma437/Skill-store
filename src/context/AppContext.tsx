"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
}

interface AppContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (product: { id: string; title: string; price: number; imageUrl: string }, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: { id: string; title: string; price: number; imageUrl: string }) => void;
  isInWishlist: (productId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Load from LocalStorage on mount asynchronously to prevent cascading synchronous renders
  useEffect(() => {
    const savedCart = localStorage.getItem("skill_store_cart");
    const savedWishlist = localStorage.getItem("skill_store_wishlist");
    Promise.resolve().then(() => {
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    });
  }, []);

  // Save to LocalStorage on update
  useEffect(() => {
    localStorage.setItem("skill_store_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("skill_store_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Add to cart
  const addToCart = (product: { id: string; title: string; price: number; imageUrl: string }, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // Update cart quantity
  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Toggle wishlist
  const toggleWishlist = (product: { id: string; title: string; price: number; imageUrl: string }) => {
    setWishlist((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Check if in wishlist
  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
