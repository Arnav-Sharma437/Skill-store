"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SessionProvider } from "next-auth/react";

export interface CartItem {
  id: string;
  productId?: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stockQuantity?: number;
  selectedVariant?: {
    name?: string;
    degree?: string;
    size?: string;
    style?: string;
  };
}

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
}

export interface RecentlyViewedItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating?: number;
  ratingCount?: number;
}

interface AppContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  recentlyViewed: RecentlyViewedItem[];
  addToCart: (
    product: {
      id: string;
      productId?: string;
      title: string;
      price: number;
      imageUrl: string;
      stockQuantity?: number;
      selectedVariant?: { name?: string; degree?: string; size?: string; style?: string };
    },
    quantity?: number
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: { id: string; title: string; price: number; imageUrl: string }) => void;
  isInWishlist: (productId: string) => boolean;
  addRecentlyViewed: (product: RecentlyViewedItem) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);

  // Load from LocalStorage on mount asynchronously to prevent cascading synchronous renders
  useEffect(() => {
    const savedCart = localStorage.getItem("skill_store_cart");
    const savedWishlist = localStorage.getItem("skill_store_wishlist");
    const savedRecent = localStorage.getItem("skill_store_recently_viewed");
    Promise.resolve().then(() => {
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      if (savedRecent) setRecentlyViewed(JSON.parse(savedRecent));
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
  const addToCart = useCallback(
    (
      product: {
        id: string;
        productId?: string;
        title: string;
        price: number;
        imageUrl: string;
        stockQuantity?: number;
        selectedVariant?: { name?: string; degree?: string; size?: string; style?: string };
      },
      quantity = 1
    ) => {
      const pId = product.productId || product.id;
      const varKey = product.selectedVariant
        ? [
            product.selectedVariant.name,
            product.selectedVariant.degree,
            product.selectedVariant.size,
            product.selectedVariant.style,
          ]
            .filter(Boolean)
            .join("-")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
        : "";
      const uniqueCartId = varKey ? `${pId}-${varKey}` : pId;

      setCart((prev) => {
        const existing = prev.find((item) => item.id === uniqueCartId);
        if (existing) {
          const maxStock = typeof product.stockQuantity === "number" ? product.stockQuantity : (typeof existing.stockQuantity === "number" ? existing.stockQuantity : 99);
          const newQty = Math.min(maxStock, existing.quantity + quantity);
          return prev.map((item) =>
            item.id === uniqueCartId
              ? {
                  ...item,
                  quantity: newQty,
                  price: product.price || item.price,
                  imageUrl: product.imageUrl || item.imageUrl,
                  stockQuantity: typeof product.stockQuantity === "number" ? product.stockQuantity : item.stockQuantity,
                }
              : item
          );
        }
        const maxStock = typeof product.stockQuantity === "number" ? product.stockQuantity : 99;
        const safeQuantity = Math.max(1, Math.min(maxStock, quantity));
        return [
          ...prev,
          {
            id: uniqueCartId,
            productId: pId,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: safeQuantity,
            stockQuantity: product.stockQuantity,
            selectedVariant: product.selectedVariant,
          },
        ];
      });
    },
    []
  );

  // Remove from cart
  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  }, []);

  // Update cart quantity
  const updateCartQuantity = useCallback((cartItemId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== cartItemId) return item;
        const maxStock = typeof item.stockQuantity === "number" ? item.stockQuantity : 99;
        const safeQty = Math.max(1, Math.min(maxStock, quantity));
        return { ...item, quantity: safeQty };
      })
    );
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Toggle wishlist
  const toggleWishlist = useCallback((product: { id: string; title: string; price: number; imageUrl: string }) => {
    setWishlist((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlist.some((item) => item.id === productId);
    },
    [wishlist]
  );

  // Track and add recently viewed product
  const addRecentlyViewed = useCallback((product: RecentlyViewedItem) => {
    if (!product || !product.id) return;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== product.id);
      const updated = [product, ...filtered].slice(0, 10);
      localStorage.setItem("skill_store_recently_viewed", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <SessionProvider>
      <AppContext.Provider
        value={{
          cart,
          wishlist,
          recentlyViewed,
          addToCart,
          removeFromCart,
          updateCartQuantity,
          clearCart,
          toggleWishlist,
          isInWishlist,
          addRecentlyViewed,
        }}
      >
        {children}
      </AppContext.Provider>
    </SessionProvider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
