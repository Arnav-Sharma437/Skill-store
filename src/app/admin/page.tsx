"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BRAND_CATEGORIES } from "@/data/home";
import { optimizeAdminPreview } from "@/lib/imageOptimization";
import { compressImageBeforeUpload } from "@/lib/clientImageCompressor";
import { DEFAULT_HOME_SETTINGS, IBrandItem, IUspItem, ISummerOfferItem } from "@/lib/homeDefaults";
import styles from "./AdminPage.module.css";

// --- Interfaces ---
interface IBanner {
  id: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link: string;
}

export interface ISubCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface ICategory {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  link: string;
  description?: string;
  subcategories?: ISubCategory[];
  order?: number;
}

interface IBrand {
  id: string;
  name: string;
  logo: string;
  tagline?: string;
  description?: string;
  enabled?: boolean;
  order?: number;
}

export interface IAdminVariant {
  id?: string;
  name: string;
  type: "degree" | "size" | "style" | "general";
  degree?: string;
  size?: string;
  style?: string;
  price?: number | string;
  originalPrice?: number | string;
  inStock?: boolean;
  imageUrl: string;
}

export interface IProduct {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  videoUrl?: string;
  gallery: string[];
  brand: string;
  category: string;
  subCategory: string;
  inStock: boolean;
  isBestSeller?: boolean;
  rating?: number;
  ratingCount?: number;
  description?: string[];
  specifications?: string[];
  whatsInBox?: string[];
  degrees?: string[];
  sizes?: string[];
  styles?: string[];
  variants?: IAdminVariant[];
}

interface IEnquiry {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

interface IAdminReview {
  _id: string;
  productId: string;
  productTitle?: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title?: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface IAdminOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  itemsCount: number;
  items: Array<{
    productId?: string;
    title: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  subtotal: number;
  gst: number;
  shipping?: number;
  grandTotal: number;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  receipt?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
    name?: string;
    country?: string;
  };
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  shiprocketAwbCode?: string;
  shiprocketCourierName?: string;
  shiprocketStatus?: string;
  shiprocketTrackingUrl?: string;
  shipmentError?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    breadth?: number;
    height?: number;
  };
}

// Fallback all system categories
const DEFAULT_SYSTEM_CATEGORIES: ICategory[] = Object.entries(BRAND_CATEGORIES).flatMap(([brandKey, brandObj]) =>
  brandObj.categories.map((cat) => ({
    id: cat.id,
    name: `${cat.name} (${brandObj.name})`,
    brand: brandKey,
    imageUrl: cat.imageUrl,
    link: cat.link,
  }))
);

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "categories" | "brands" | "orders" | "banners" | "homepage" | "reviews">("analytics");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data States
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [categories, setCategories] = useState<ICategory[]>(DEFAULT_SYSTEM_CATEGORIES);
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [enquiries, setEnquiries] = useState<IEnquiry[]>([]);
  const [reviews, setReviews] = useState<IAdminReview[]>([]);
  const [reviewFilter, setReviewFilter] = useState<string>("all");
  const [reviewActionLoading, setReviewActionLoading] = useState<string | null>(null);
  const [orders, setOrders] = useState<IAdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderActionLoading, setOrderActionLoading] = useState<string | null>(null);

  // Brand Management State
  const [brandSearch, setBrandSearch] = useState("");
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<IBrand | null>(null);
  const [brandActionLoading, setBrandActionLoading] = useState<string | null>(null);
  const [isUploadingBrandLogoImg, setIsUploadingBrandLogoImg] = useState(false);
  const [brandForm, setBrandForm] = useState<{
    id: string;
    name: string;
    logo: string;
    tagline: string;
    description: string;
    enabled: boolean;
    order: number;
  }>({
    id: "",
    name: "",
    logo: "",
    tagline: "",
    description: "",
    enabled: true,
    order: 0,
  });

  // Homepage CMS State
  const [homeSettings, setHomeSettings] = useState<{
    announcement: { enabled: boolean; text: string };
    brandsSection: { enabled: boolean; title: string; subtitle: string; brands: IBrandItem[] };
    trustMarquee: { enabled: boolean; items: IUspItem[] };
    summerOffer: { enabled: boolean; title: string; offers: ISummerOfferItem[] };
  }>({
    announcement: { ...DEFAULT_HOME_SETTINGS.announcement },
    brandsSection: { ...DEFAULT_HOME_SETTINGS.brandsSection, brands: [...DEFAULT_HOME_SETTINGS.brandsSection.brands] },
    trustMarquee: { ...DEFAULT_HOME_SETTINGS.trustMarquee, items: [...DEFAULT_HOME_SETTINGS.trustMarquee.items] },
    summerOffer: { ...DEFAULT_HOME_SETTINGS.summerOffer, offers: [...DEFAULT_HOME_SETTINGS.summerOffer.offers] },
  });
  const [homeCmsSavingSection, setHomeCmsSavingSection] = useState<string | null>(null);
  const [homeCmsSuccessMsg, setHomeCmsSuccessMsg] = useState<string | null>(null);
  const [newUspInput, setNewUspInput] = useState("");
  const [newBrandForm, setNewBrandForm] = useState({ name: "", slug: "", logo: "", tagline: "" });
  const [newOfferForm, setNewOfferForm] = useState({ title: "", imageUrl: "", link: "/shop" });
  const [isUploadingBrandLogo, setIsUploadingBrandLogo] = useState(false);
  const [isUploadingOfferImg, setIsUploadingOfferImg] = useState(false);

  // Search & Filter States
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productBrandFilter, setProductBrandFilter] = useState("all");
  const [productStockFilter, setProductStockFilter] = useState("all");

  const [categorySearch, setCategorySearch] = useState("");
  const [categoryBrandFilter, setCategoryBrandFilter] = useState("all");

  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState("all");

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [viewingProduct, setViewingProduct] = useState<IProduct | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<IAdminOrder | null>(null);

  // Category Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [categoryActionLoading, setCategoryActionLoading] = useState<string | null>(null);

  // Upload States
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingMobileBanner, setIsUploadingMobileBanner] = useState(false);
  const [isUploadingCategoryImg, setIsUploadingCategoryImg] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Product Form State
  const [productForm, setProductForm] = useState({
    id: "",
    title: "",
    price: "",
    originalPrice: "",
    imageUrl: "",
    videoUrl: "",
    gallery: [] as string[],
    brand: "tuqo",
    category: "high-pressure-washer",
    subCategory: "domestic",
    inStock: true,
    isBestSeller: false,
    descriptionText: "",
    specificationsText: "",
    whatsInBoxText: "",
    degreesText: "",
    sizesText: "",
    stylesText: "",
    variants: [] as IAdminVariant[],
  });


  // Category Form State
  const [categoryForm, setCategoryForm] = useState<{
    id: string;
    name: string;
    brand: string;
    customBrand: string;
    imageUrl: string;
    link: string;
    description: string;
    subcategories: ISubCategory[];
    order: number;
  }>({
    id: "",
    name: "",
    brand: "tuqo",
    customBrand: "",
    imageUrl: "",
    link: "",
    description: "",
    subcategories: [],
    order: 0,
  });

  const [newSubCatName, setNewSubCatName] = useState("");
  const [newSubCatSlug, setNewSubCatSlug] = useState("");

  // Banner Form State
  const [bannerForm, setBannerForm] = useState<{
    id: string;
    imageUrl: string;
    mobileImageUrl: string;
    link: string;
  }>({ id: "", imageUrl: "", mobileImageUrl: "", link: "" });
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // --- Data Fetching Callbacks ---
  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/banners?_t=${Date.now()}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setBanners(json.data);
    } catch (e) {
      console.error("Error fetching banners:", e);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/categories?_t=${Date.now()}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
      } else {
        setCategories([]);
      }
    } catch (e) {
      console.error("Error fetching categories:", e);
      setCategories([]);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/brands?_t=${Date.now()}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBrands(json.data);
      } else {
        setBrands([]);
      }
    } catch (e) {
      console.error("Error fetching brands:", e);
      setBrands([]);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/products?_t=${Date.now()}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (e) {
      console.error("Error fetching products:", e);
    }
  }, []);

  const fetchEnquiries = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/enquiries");
      const json = await res.json();
      if (json.success) setEnquiries(json.data);
    } catch (e) {
      console.error("Error fetching enquiries:", e);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      const json = await res.json();
      if (json.reviews && Array.isArray(json.reviews)) {
        setReviews(json.reviews);
      }
    } catch (e) {
      console.error("Error fetching reviews:", e);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchHomeSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/home-settings");
      const json = await res.json();
      if (json.success && json.data) {
        setHomeSettings(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch home settings:", e);
    }
  }, []);

  const saveHomeSettingsSection = async (
    sectionKey: "announcement" | "brandsSection" | "trustMarquee" | "summerOffer",
    updatedData: unknown
  ) => {
    setHomeCmsSavingSection(sectionKey);
    setHomeCmsSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/home-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [sectionKey]: updatedData }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setHomeSettings(json.data);
        setHomeCmsSuccessMsg(`Saved ${sectionKey} settings successfully!`);
        setTimeout(() => setHomeCmsSuccessMsg(null), 3500);
      } else {
        alert(`Error saving: ${json.error || "Failed to save settings"}`);
      }
    } catch {
      alert("Network error saving homepage settings.");
    } finally {
      setHomeCmsSavingSection(null);
    }
  };

  const uploadCustomMedia = async (file: File, folder: string = "skill-store/homepage"): Promise<string | null> => {
    try {
      const compressed = await compressImageBeforeUpload(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        targetFormat: "image/webp",
      });
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }
      return data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading file";
      alert(`Upload error: ${msg}`);
      return null;
    }
  };

  const initializeData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBanners(),
        fetchCategories(),
        fetchBrands(),
        fetchProducts(),
        fetchEnquiries(),
        fetchReviews(),
        fetchOrders(),
        fetchHomeSettings(),
      ]);
    } catch (e) {
      console.error("Initialization failed", e);
    } finally {
      setLoading(false);
    }
  }, [fetchBanners, fetchCategories, fetchBrands, fetchProducts, fetchEnquiries, fetchReviews, fetchOrders, fetchHomeSettings]);


  // Auth check
  useEffect(() => {
    const token = sessionStorage.getItem("skill_store_admin_token");
    const hasCookie = typeof document !== "undefined" && document.cookie.includes("skill_store_admin_token=logged_in");
    
    if (token !== "logged_in" && !hasCookie) {
      router.push("/admin/login");
    } else {
      if (!token) sessionStorage.setItem("skill_store_admin_token", "logged_in");
      if (!hasCookie) document.cookie = "skill_store_admin_token=logged_in; path=/; max-age=604800; SameSite=Lax";
      Promise.resolve().then(() => {
        setAuthorized(true);
        initializeData();
      });
    }
  }, [router, initializeData]);

  // Sign out
  const handleSignOut = () => {
    sessionStorage.removeItem("skill_store_admin_token");
    document.cookie = "skill_store_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    router.push("/admin/login");
  };

  // --- Upload Handlers ---
  const handleFileUpload = async (
    file: File,
    targetType: "main_image" | "video" | "gallery" | "banner" | "banner_mobile" | "category" | "brand"
  ) => {
    setUploadError(null);
    if (targetType === "main_image") setIsUploadingImage(true);
    if (targetType === "video") setIsUploadingVideo(true);
    if (targetType === "gallery") setIsUploadingGallery(true);
    if (targetType === "banner") setIsUploadingBanner(true);
    if (targetType === "banner_mobile") setIsUploadingMobileBanner(true);
    if (targetType === "category") setIsUploadingCategoryImg(true);
    if (targetType === "brand") setIsUploadingBrandLogoImg(true);

    try {
      // Automatically pre-compress and resize images (max width 1920px WebP) before upload
      let fileToUpload = file;
      if (targetType !== "video") {
        fileToUpload = await compressImageBeforeUpload(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          targetFormat: "image/webp",
        });
      }

      let uploadFolder = "skill-store/products";
      if (targetType === "banner") uploadFolder = "skill-store/banners";
      if (targetType === "banner_mobile") uploadFolder = "skill-store/banners/mobile";
      if (targetType === "category") uploadFolder = "skill-store/categories";
      if (targetType === "brand") uploadFolder = "skill-store/brands";

      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("folder", uploadFolder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "File upload failed");
      }

      if (targetType === "main_image") {
        setProductForm((prev) => ({ ...prev, imageUrl: data.url }));
      } else if (targetType === "video") {
        setProductForm((prev) => ({ ...prev, videoUrl: data.url }));
      } else if (targetType === "gallery") {
        setProductForm((prev) => ({
          ...prev,
          gallery: [...prev.gallery, data.url],
        }));
      } else if (targetType === "banner") {
        setBannerForm((prev) => ({ ...prev, imageUrl: data.url }));
      } else if (targetType === "banner_mobile") {
        setBannerForm((prev) => ({ ...prev, mobileImageUrl: data.url }));
      } else if (targetType === "category") {
        setCategoryForm((prev) => ({ ...prev, imageUrl: data.url }));
      } else if (targetType === "brand") {
        setBrandForm((prev) => ({ ...prev, logo: data.url }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading file";
      setUploadError(msg);
      alert(`Upload error: ${msg}`);
    } finally {
      if (targetType === "main_image") setIsUploadingImage(false);
      if (targetType === "video") setIsUploadingVideo(false);
      if (targetType === "gallery") setIsUploadingGallery(false);
      if (targetType === "banner") setIsUploadingBanner(false);
      if (targetType === "banner_mobile") setIsUploadingMobileBanner(false);
      if (targetType === "category") setIsUploadingCategoryImg(false);
      if (targetType === "brand") setIsUploadingBrandLogoImg(false);
    }
  };

  // --- Stock Toggle Handler ---
  const handleStockToggle = async (product: IProduct) => {
    const updatedStock = !product.inStock;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, inStock: updatedStock } : p))
    );

    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, inStock: updatedStock }),
      });
      const json = await res.json();
      if (!json.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, inStock: product.inStock } : p))
        );
        alert(`Error toggling stock: ${json.error}`);
      }
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: product.inStock } : p))
      );
      alert("Network error toggling stock");
    }
  };

  // --- Product Variant Image & Row Handlers ---
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState<number | null>(null);

  const handleVariantImageUpload = async (file: File, index: number) => {
    setUploadingVariantIndex(index);
    try {
      const uploadedUrl = await uploadCustomMedia(file, "skill-store/products/variants");
      if (uploadedUrl) {
        setProductForm((prev) => {
          const nextVariants = [...prev.variants];
          if (nextVariants[index]) {
            nextVariants[index] = { ...nextVariants[index], imageUrl: uploadedUrl };
          }
          return { ...prev, variants: nextVariants };
        });
      }
    } catch (err) {
      console.error("Variant image upload failed:", err);
    } finally {
      setUploadingVariantIndex(null);
    }
  };

  const addVariantRow = (type: "degree" | "size" | "style" | "general" = "general", name: string = "") => {
    setProductForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: name,
          type: type,
          degree: type === "degree" ? name : "",
          size: type === "size" ? name : "",
          style: type === "style" ? name : "",
          imageUrl: "",
          price: "",
          originalPrice: "",
          inStock: true,
        },
      ],
    }));
  };

  const removeVariantRow = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariantField = (index: number, field: keyof IAdminVariant, value: unknown) => {
    setProductForm((prev) => {
      const nextVariants = [...prev.variants];
      if (nextVariants[index]) {
        nextVariants[index] = { ...nextVariants[index], [field]: value };
        if (field === "name") {
          const t = nextVariants[index].type;
          if (t === "degree") nextVariants[index].degree = String(value);
          if (t === "size") nextVariants[index].size = String(value);
          if (t === "style") nextVariants[index].style = String(value);
        }
      }
      return { ...prev, variants: nextVariants };
    });
  };

  const syncVariantsFromAttributes = () => {
    const degs = productForm.degreesText.split(",").map((s) => s.trim()).filter(Boolean);
    const szs = productForm.sizesText.split(",").map((s) => s.trim()).filter(Boolean);
    const stls = productForm.stylesText.split(",").map((s) => s.trim()).filter(Boolean);

    const existing = [...productForm.variants];
    const newItems: IAdminVariant[] = [];

    degs.forEach((d) => {
      if (!existing.some((e) => e.name.toLowerCase() === d.toLowerCase())) {
        newItems.push({
          id: `var-deg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          name: d,
          type: "degree",
          degree: d,
          imageUrl: "",
          price: "",
          originalPrice: "",
          inStock: true,
        });
      }
    });

    szs.forEach((s) => {
      if (!existing.some((e) => e.name.toLowerCase() === s.toLowerCase())) {
        newItems.push({
          id: `var-sz-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          name: s,
          type: "size",
          size: s,
          imageUrl: "",
          price: "",
          originalPrice: "",
          inStock: true,
        });
      }
    });

    stls.forEach((st) => {
      if (!existing.some((e) => e.name.toLowerCase() === st.toLowerCase())) {
        newItems.push({
          id: `var-stl-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          name: st,
          type: "style",
          style: st,
          imageUrl: "",
          price: "",
          originalPrice: "",
          inStock: true,
        });
      }
    });

    if (newItems.length === 0 && degs.length === 0 && szs.length === 0 && stls.length === 0) {
      alert("Please enter degrees, sizes, or styles in the input boxes above first, or click '+ Add Variant'.");
      return;
    }

    setProductForm((prev) => ({
      ...prev,
      variants: [...prev.variants, ...newItems],
    }));
  };

  // --- Product CRUD Modals & Actions ---
  const openAddProductModal = () => {
    setEditingProduct(null);
    setUploadError(null);
    setProductForm({
      id: "",
      title: "",
      price: "",
      originalPrice: "",
      imageUrl: "",
      videoUrl: "",
      gallery: [],
      brand: "tuqo",
      category: "high-pressure-washer",
      subCategory: "domestic",
      inStock: true,
      isBestSeller: false,
      descriptionText: "",
      specificationsText: "",
      whatsInBoxText: "",
      degreesText: "",
      sizesText: "",
      stylesText: "",
      variants: [],
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: IProduct) => {
    setEditingProduct(prod);
    setUploadError(null);
    setProductForm({
      id: prod.id,
      title: prod.title,
      price: prod.price ? prod.price.toString() : "",
      originalPrice: prod.originalPrice ? prod.originalPrice.toString() : "",
      imageUrl: prod.imageUrl || "",
      videoUrl: prod.videoUrl || "",
      gallery: Array.isArray(prod.gallery) ? prod.gallery : [],
      brand: prod.brand || "tuqo",
      category: prod.category || "high-pressure-washer",
      subCategory: prod.subCategory || "domestic",
      inStock: prod.inStock !== false,
      isBestSeller: Boolean(prod.isBestSeller),
      descriptionText: Array.isArray(prod.description) ? prod.description.join("\n") : "",
      specificationsText: Array.isArray(prod.specifications) ? prod.specifications.join("\n") : "",
      whatsInBoxText: Array.isArray(prod.whatsInBox) ? prod.whatsInBox.join("\n") : "",
      degreesText: Array.isArray(prod.degrees) ? prod.degrees.join(", ") : "",
      sizesText: Array.isArray(prod.sizes) ? prod.sizes.join(", ") : "",
      stylesText: Array.isArray(prod.styles) ? prod.styles.join(", ") : "",
      variants: Array.isArray(prod.variants) ? prod.variants.map((v) => ({
        id: v.id || "",
        name: v.name || v.degree || v.size || v.style || "",
        type: v.type || (v.degree ? "degree" : v.size ? "size" : v.style ? "style" : "general"),
        degree: v.degree || "",
        size: v.size || "",
        style: v.style || "",
        price: v.price !== undefined ? v.price.toString() : "",
        originalPrice: v.originalPrice !== undefined ? v.originalPrice.toString() : "",
        inStock: v.inStock !== false,
        imageUrl: v.imageUrl || "",
      })) : [],
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct ? "PUT" : "POST";

    const payload = {
      id: productForm.id.trim(),
      title: productForm.title.trim(),
      price: Number(productForm.price),
      originalPrice: Number(productForm.originalPrice || productForm.price),
      imageUrl: productForm.imageUrl.trim(),
      videoUrl: productForm.videoUrl.trim(),
      gallery: productForm.gallery,
      brand: productForm.brand.toLowerCase(),
      category: productForm.category.toLowerCase(),
      subCategory: productForm.subCategory.toLowerCase(),
      inStock: productForm.inStock,
      isBestSeller: Boolean(productForm.isBestSeller),
      description: productForm.descriptionText.split("\n").filter((l) => l.trim().length > 0),
      specifications: productForm.specificationsText.split("\n").filter((l) => l.trim().length > 0),
      whatsInBox: productForm.whatsInBoxText.split("\n").filter((l) => l.trim().length > 0),
      degrees: productForm.degreesText.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: productForm.sizesText.split(",").map((s) => s.trim()).filter(Boolean),
      styles: productForm.stylesText.split(",").map((s) => s.trim()).filter(Boolean),
      variants: productForm.variants.map((v) => ({
        id: v.id || "",
        name: v.name.trim(),
        type: v.type || "general",
        degree: v.type === "degree" ? v.name.trim() : (v.degree || "").trim(),
        size: v.type === "size" ? v.name.trim() : (v.size || "").trim(),
        style: v.type === "style" ? v.name.trim() : (v.style || "").trim(),
        price: v.price !== undefined && v.price !== "" ? Number(v.price) : undefined,
        originalPrice: v.originalPrice !== undefined && v.originalPrice !== "" ? Number(v.originalPrice) : undefined,
        inStock: v.inStock !== false,
        imageUrl: (v.imageUrl || "").trim(),
      })).filter((v) => v.name || v.imageUrl),
    };

    try {
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setIsProductModalOpen(false);
        fetchProducts();
      } else {
        alert(`Error saving product: ${json.error}`);
      }
    } catch {
      alert("Network error saving product.");
    }
  };

  const handleBestSellerToggle = async (prod: IProduct) => {
    const updatedStatus = !prod.isBestSeller;
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prod.id, isBestSeller: updatedStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, isBestSeller: updatedStatus } : p))
        );
      } else {
        alert(`Error updating best seller status: ${json.error}`);
      }
    } catch {
      alert("Network error updating best seller status");
    }
  };


  const handleDeleteProduct = async (id: string) => {
    const idToDelete = id.trim();
    // Optimistically remove from state so it disappears instantly
    setProducts((prev) => prev.filter((p) => p.id !== idToDelete));
    setDeletingProductId(null);

    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(idToDelete)}`, {
        method: "DELETE",
        cache: "no-store",
      });
      const json = await res.json();
      if (!json.success) {
        alert(`Error deleting product: ${json.error}`);
        fetchProducts();
      } else {
        fetchProducts();
      }
    } catch {
      alert("Network error deleting product");
      fetchProducts();
    }
  };

  // --- Banner Actions ---
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingBannerId ? "PUT" : "POST";
    try {
      const res = await fetch("/api/admin/banners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bannerForm),
      });
      const json = await res.json();
      if (json.success) {
        alert(editingBannerId ? "Banner updated!" : "Banner created!");
        setBannerForm({ id: "", imageUrl: "", mobileImageUrl: "", link: "" });
        setEditingBannerId(null);
        fetchBanners();
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch {
      alert("Network error saving banner");
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    const idToDelete = id.trim();
    setBanners((prev) => prev.filter((b) => b.id !== idToDelete));
    try {
      const res = await fetch(`/api/admin/banners?id=${encodeURIComponent(idToDelete)}`, {
        method: "DELETE",
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) {
        fetchBanners();
      } else {
        alert(`Error: ${json.error}`);
        fetchBanners();
      }
    } catch {
      alert("Network error deleting banner");
      fetchBanners();
    }
  };

  // --- Category CRUD Handlers ---
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    const maxOrder = categories.length > 0 
      ? Math.max(...categories.map((c) => (typeof c.order === "number" && !isNaN(c.order) ? c.order : 0)))
      : 0;
    setCategoryForm({
      id: "",
      name: "",
      brand: "tuqo",
      customBrand: "",
      imageUrl: "",
      link: "",
      description: "",
      subcategories: [],
      order: maxOrder + 1,
    });
    setNewSubCatName("");
    setNewSubCatSlug("");
    setUploadError(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: ICategory) => {
    setEditingCategory(cat);
    const standardBrands = ["tuqo", "pumpkin", "mitsuki", "metso", "costec", "ultratouch"];
    const isStandard = standardBrands.includes((cat.brand || "").toLowerCase());
    const initialOrder = typeof cat.order === "number" && !isNaN(cat.order) && cat.order > 0 ? cat.order : 1;
    setCategoryForm({
      id: cat.id,
      name: cat.name,
      brand: isStandard ? cat.brand.toLowerCase() : "custom",
      customBrand: isStandard ? "" : cat.brand,
      imageUrl: cat.imageUrl,
      link: cat.link,
      description: cat.description || "",
      subcategories: Array.isArray(cat.subcategories) ? [...cat.subcategories] : [],
      order: initialOrder,
    });
    setNewSubCatName("");
    setNewSubCatSlug("");
    setUploadError(null);
    setIsCategoryModalOpen(true);
  };

  const handleAddSubCategory = () => {
    if (!newSubCatName.trim()) return;
    const name = newSubCatName.trim();
    const slug = newSubCatSlug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    
    if (categoryForm.subcategories.some((s) => s.id === slug)) {
      alert(`Subcategory with slug "${slug}" is already added.`);
      return;
    }

    setCategoryForm((prev) => ({
      ...prev,
      subcategories: [...prev.subcategories, { id: slug, name }],
    }));
    setNewSubCatName("");
    setNewSubCatSlug("");
  };

  const handleRemoveSubCategory = (subId: string) => {
    setCategoryForm((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((s) => s.id !== subId),
    }));
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      alert("Please enter a category name");
      return;
    }
    if (!categoryForm.imageUrl.trim()) {
      alert("Please upload or provide an image for the category");
      return;
    }

    const finalBrand = categoryForm.brand === "custom" 
      ? (categoryForm.customBrand.trim() || "tuqo")
      : categoryForm.brand;

    const slug = categoryForm.id.trim() || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const finalLink = categoryForm.link.trim() || `/category/${slug}`;

    const parsedOrder = Number(categoryForm.order);
    const finalOrder = !isNaN(parsedOrder) && parsedOrder > 0 ? parsedOrder : (editingCategory?.order || 1);

    setCategoryActionLoading("save");
    try {
      const isEdit = !!editingCategory;
      const res = await fetch("/api/admin/categories", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: isEdit ? editingCategory.id : slug,
          name: categoryForm.name.trim(),
          brand: finalBrand,
          imageUrl: categoryForm.imageUrl.trim(),
          link: finalLink,
          description: categoryForm.description.trim(),
          subcategories: categoryForm.subcategories,
          order: finalOrder,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save category");
      }

      await fetchCategories();
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving category";
      alert(`Error: ${msg}`);
    } finally {
      setCategoryActionLoading(null);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm(`Are you sure you want to delete category "${catId}"?`)) return;

    const idToDelete = catId.trim();
    setCategories((prev) => prev.filter((c) => c.id !== idToDelete));
    setCategoryActionLoading(idToDelete);
    try {
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(idToDelete)}`, {
        method: "DELETE",
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete category");
      }
      await fetchCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting category";
      alert(`Error: ${msg}`);
      await fetchCategories();
    } finally {
      setCategoryActionLoading(null);
    }
  };

  // --- Brand CRUD Handlers ---
  const openAddBrandModal = () => {
    setEditingBrand(null);
    setBrandForm({
      id: "",
      name: "",
      logo: "",
      tagline: "",
      description: "",
      enabled: true,
      order: brands.length,
    });
    setUploadError(null);
    setIsBrandModalOpen(true);
  };

  const openEditBrandModal = (brand: IBrand) => {
    setEditingBrand(brand);
    setBrandForm({
      id: brand.id,
      name: brand.name,
      logo: brand.logo,
      tagline: brand.tagline || "",
      description: brand.description || "",
      enabled: brand.enabled !== false,
      order: brand.order || 0,
    });
    setUploadError(null);
    setIsBrandModalOpen(true);
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.name.trim()) {
      alert("Please enter a brand name");
      return;
    }
    if (!brandForm.logo.trim()) {
      alert("Please upload or provide a brand logo");
      return;
    }

    const slug = (editingBrand ? editingBrand.id : brandForm.id.trim() || brandForm.name.trim())
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    setBrandActionLoading("save");
    try {
      const isEdit = !!editingBrand;
      const res = await fetch("/api/admin/brands", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: slug,
          name: brandForm.name.trim(),
          logo: brandForm.logo.trim(),
          tagline: brandForm.tagline.trim(),
          description: brandForm.description.trim(),
          enabled: brandForm.enabled,
          order: Number(brandForm.order) || 0,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save brand");
      }

      await fetchBrands();
      setIsBrandModalOpen(false);
      setEditingBrand(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving brand";
      alert(`Error: ${msg}`);
    } finally {
      setBrandActionLoading(null);
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    const brandToDelete = brands.find((b) => b.id === brandId);
    const brandName = brandToDelete ? brandToDelete.name : brandId;
    if (!confirm(`Are you sure you want to permanently delete the brand "${brandName}" (${brandId})?\n\nThis will remove the brand from the store.`)) return;

    const idToDelete = brandId.trim().toLowerCase();
    setBrands((prev) => prev.filter((b) => b.id !== idToDelete));
    setBrandActionLoading(idToDelete);
    try {
      const res = await fetch(`/api/admin/brands?id=${encodeURIComponent(idToDelete)}`, {
        method: "DELETE",
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete brand");
      }
      await fetchBrands();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting brand";
      alert(`Error: ${msg}`);
      await fetchBrands();
    } finally {
      setBrandActionLoading(null);
    }
  };

  const handleToggleBrand = async (brand: IBrand) => {
    const newEnabled = brand.enabled === false ? true : false;
    setBrands((prev) =>
      prev.map((b) => (b.id === brand.id ? { ...b, enabled: newEnabled } : b))
    );
    setBrandActionLoading(`toggle-${brand.id}`);
    try {
      const res = await fetch("/api/admin/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: brand.id,
          enabled: newEnabled,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update brand visibility");
      }
      await fetchBrands();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error toggling brand";
      alert(`Error: ${msg}`);
      await fetchBrands();
    } finally {
      setBrandActionLoading(null);
    }
  };

  // --- Shiprocket & Order Actions ---
  const handleRetryShiprocket = async (orderNumber: string) => {
    setOrderActionLoading(orderNumber);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderNumber, action: "retry_shiprocket" }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Shiprocket shipment generated successfully!");
        fetchOrders();
        if (selectedOrder?.orderNumber === orderNumber) {
          setSelectedOrder((prev) => (prev ? { ...prev, ...json.data } : null));
        }
      } else {
        alert(`Shiprocket Error: ${json.error}`);
      }
    } catch {
      alert("Network error retrying Shiprocket dispatch");
    } finally {
      setOrderActionLoading(null);
    }
  };

  const handleSyncTracking = async (orderNumber: string) => {
    setOrderActionLoading(orderNumber);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderNumber, action: "sync_tracking" }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Tracking updated: ${json.trackResult?.currentStatus || "Success"}`);
        fetchOrders();
        if (selectedOrder?.orderNumber === orderNumber) {
          setSelectedOrder((prev) => (prev ? { ...prev, ...json.data } : null));
        }
      } else {
        alert(`Sync Error: ${json.error}`);
      }
    } catch {
      alert("Network error syncing tracking status");
    } finally {
      setOrderActionLoading(null);
    }
  };

  const handleOrderStatusChange = async (orderNumber: string, newStatus: string) => {
    setOrderActionLoading(orderNumber);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderNumber, action: "update_status", newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        fetchOrders();
        if (selectedOrder?.orderNumber === orderNumber) {
          setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
        }
      } else {
        alert(`Error updating order status: ${json.error}`);
      }
    } catch {
      alert("Network error updating status");
    } finally {
      setOrderActionLoading(null);
    }
  };

  // --- Review Moderation Actions ---
  const handleUpdateReviewStatus = async (id: string, status: "approved" | "rejected" | "pending") => {
    setReviewActionLoading(id);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchReviews();
      } else {
        alert(json.error || "Failed to update review status");
      }
    } catch {
      alert("Network error updating review");
    } finally {
      setReviewActionLoading(null);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this customer review?")) return;
    setReviewActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        await fetchReviews();
      } else {
        alert(json.error || "Failed to delete review");
      }
    } catch {
      alert("Network error deleting review");
    } finally {
      setReviewActionLoading(null);
    }
  };

  // --- Filtered Datasets ---
  const filteredReviews = useMemo(() => {
    if (reviewFilter === "all") return reviews;
    return reviews.filter((r) => r.status === reviewFilter);
  }, [reviews, reviewFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        (p.title || "").toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.id || "").toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(productSearch.toLowerCase());

      const matchesCat =
        productCategoryFilter === "all" || p.category === productCategoryFilter;

      const matchesBrand =
        productBrandFilter === "all" || p.brand?.toLowerCase() === productBrandFilter.toLowerCase();

      const matchesStock =
        productStockFilter === "all" ||
        (productStockFilter === "in" && p.inStock) ||
        (productStockFilter === "out" && !p.inStock);

      return matchesSearch && matchesCat && matchesBrand && matchesStock;
    });
  }, [products, productSearch, productCategoryFilter, productBrandFilter, productStockFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        (o.orderNumber || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.userName || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.userEmail || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.shiprocketAwbCode || "").toLowerCase().includes(orderSearch.toLowerCase());

      const matchesStatus =
        orderStatusFilter === "all" || o.orderStatus === orderStatusFilter;

      const matchesPayment =
        orderPaymentFilter === "all" || o.paymentStatus === orderPaymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, orderSearch, orderStatusFilter, orderPaymentFilter]);


  // --- Analytics Calculations ---
  const analyticsData = useMemo(() => {
    const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;
    const inStock = products.filter((p) => p.inStock).length;
    const outOfStock = products.length - inStock;
    const dispatched = orders.filter((o) => !!o.shiprocketAwbCode || !!o.shiprocketOrderId).length;

    return {
      totalRevenue,
      paidOrdersCount: paidOrders.length,
      totalOrdersCount: orders.length,
      avgOrderValue,
      inStock,
      outOfStock,
      dispatched,
      totalProducts: products.length,
    };
  }, [orders, products]);

  if (!authorized) return null;

  return (
    <div className={styles.adminWrapper}>
      {/* Top Header Bar */}
      <header className={styles.adminHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className={styles.mobileMenuToggle}
            aria-label="Toggle Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {isMobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div className={styles.brandGroup}>
            <span className={styles.headerTitle}>Skill Store Central Control</span>
            <span className={styles.headerSubtitle}>Official E-Commerce Backend</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.adminMeta}>
            <strong>Super Admin</strong>
            <span>Verified Session</span>
          </div>

          <button onClick={handleSignOut} className={styles.signOutBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Sidebar Layout */}
      <div className={styles.adminLayout}>
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div className={styles.sidebarBackdrop} onClick={() => setIsMobileMenuOpen(false)} />
        )}

        <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarBrand}>
            <strong>SKILL STORE</strong>
            <span>Management Portal</span>
          </div>

          <nav className={styles.sidebarNav}>
            <button
              onClick={() => {
                setActiveTab("analytics");
                setIsMobileMenuOpen(false);
              }}
              className={`${styles.sidebarTab} ${activeTab === "analytics" ? styles.activeTab : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.tabIcon}>
                <rect x="3" y="3" width="7" height="9"></rect>
                <rect x="14" y="3" width="7" height="5"></rect>
                <rect x="14" y="12" width="7" height="9"></rect>
                <rect x="3" y="16" width="7" height="5"></rect>
              </svg>
              <span>Analytics &amp; KPI</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("orders");
                setIsMobileMenuOpen(false);
              }}
              className={`${styles.sidebarTab} ${activeTab === "orders" ? styles.activeTab : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.tabIcon}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Orders &amp; Logistics</span>
              {orders.length > 0 && <span className={styles.tabBadge}>{orders.length}</span>}
            </button>

            <button
              onClick={() => {
                setActiveTab("products");
                setIsMobileMenuOpen(false);
              }}
              className={`${styles.sidebarTab} ${activeTab === "products" ? styles.activeTab : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.tabIcon}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>Products Catalogue</span>
              {products.length > 0 && <span className={styles.tabBadge}>{products.length}</span>}
            </button>

            <button
              onClick={() => {
                setActiveTab("categories");
                setIsMobileMenuOpen(false);
              }}
              className={`${styles.sidebarTab} ${activeTab === "categories" ? styles.activeTab : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.tabIcon}>
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              <span>Categories</span>
              {categories.length > 0 && <span className={styles.tabBadge}>{categories.length}</span>}
            </button>

            <button
              onClick={() => {
                setActiveTab("brands");
                setIsMobileMenuOpen(false);
              }}
              className={`${styles.sidebarTab} ${activeTab === "brands" ? styles.activeTab : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.tabIcon}>
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
              <span>Brands</span>
              {brands.length > 0 && <span className={styles.tabBadge}>{brands.length}</span>}
            </button>

            <button
              onClick={() => {
                setActiveTab("banners");
                setIsMobileMenuOpen(false);
              }}
              className={`${styles.sidebarTab} ${activeTab === "banners" ? styles.activeTab : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.tabIcon}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>Hero Banners</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("homepage");
                setIsMobileMenuOpen(false);
              }}
              className={`${styles.sidebarTab} ${activeTab === "homepage" ? styles.activeTab : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.tabIcon}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Homepage CMS</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("reviews");
                setIsMobileMenuOpen(false);
              }}
              className={`${styles.sidebarTab} ${activeTab === "reviews" ? styles.activeTab : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.tabIcon}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Customer Reviews</span>
              {reviews.filter((r) => r.status === "pending").length > 0 && (
                <span className={styles.tabBadge} style={{ background: "#f59e0b" }}>
                  {reviews.filter((r) => r.status === "pending").length}
                </span>
              )}
            </button>
          </nav>


          <Link href="/" className={styles.viewWebsiteLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>Live Store Preview</span>
          </Link>
        </aside>

        {/* Dashboard Main Content Area */}
        <main className={styles.dashboardContent}>
          {loading ? (
            <div className={styles.loadingSpinner}>
              <span>SYNCING E-COMMERCE DATA...</span>
            </div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* TAB 1: ANALYTICS & DASHBOARD METRICS                    */}
              {/* ======================================================== */}
              {activeTab === "analytics" && (
                <div className={styles.tabContent}>
                  <div className={styles.analyticsIntro}>
                    <span>Executive Summary</span>
                    <h2>Store Performance &amp; Analytics</h2>
                    <p>Real-time revenue, orders pipeline, inventory metrics, and customer enquiries.</p>
                  </div>

                  {/* Top Stats Grid */}
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard} style={{ borderLeft: "4px solid #10b981" }}>
                      <div className={styles.statInfo}>
                        <span>Total Revenue (Paid)</span>
                        <strong style={{ color: "#10b981" }}>₹{analyticsData.totalRevenue.toLocaleString("en-IN")}</strong>
                      </div>
                      <div className={styles.statIconBox} style={{ background: "#d1fae5" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                      </div>
                    </div>

                    <div className={styles.statCard} style={{ borderLeft: "4px solid #38b6ff" }}>
                      <div className={styles.statInfo}>
                        <span>Total Orders</span>
                        <strong style={{ color: "#0284c7" }}>{analyticsData.totalOrdersCount}</strong>
                      </div>
                      <div className={styles.statIconBox} style={{ background: "#e0f2fe" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                        </svg>
                      </div>
                    </div>

                    <div className={styles.statCard} style={{ borderLeft: "4px solid #ffd300" }}>
                      <div className={styles.statInfo}>
                        <span>Average Order Value</span>
                        <strong style={{ color: "#b45309" }}>₹{analyticsData.avgOrderValue.toLocaleString("en-IN")}</strong>
                      </div>
                      <div className={styles.statIconBox} style={{ background: "#fef3c7" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.5">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                          <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                      </div>
                    </div>

                    <div className={styles.statCard} style={{ borderLeft: "4px solid #8b5cf6" }}>
                      <div className={styles.statInfo}>
                        <span>Shiprocket Dispatches</span>
                        <strong style={{ color: "#7c3aed" }}>{analyticsData.dispatched}</strong>
                      </div>
                      <div className={styles.statIconBox} style={{ background: "#ede9fe" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5">
                          <rect x="1" y="3" width="15" height="13"></rect>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                          <circle cx="5.5" cy="18.5" r="2.5"></circle>
                          <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Stock & Orders Dual Panel */}
                  <div className={styles.dualPanelGrid}>
                    {/* Left: Inventory Breakdown */}
                    <div className={styles.panelCard}>
                      <h3>Inventory Health</h3>
                      <div className={styles.inventoryBreakdown}>
                        <div className={styles.invRow}>
                          <span className={styles.invDot} style={{ background: "#10b981" }}></span>
                          <span>In Stock Ready to Ship</span>
                          <strong>{analyticsData.inStock} items</strong>
                        </div>
                        <div className={styles.invRow}>
                          <span className={styles.invDot} style={{ background: "#ef4444" }}></span>
                          <span>Out of Stock</span>
                          <strong style={{ color: "#ef4444" }}>{analyticsData.outOfStock} items</strong>
                        </div>
                        <div className={styles.invRow}>
                          <span className={styles.invDot} style={{ background: "#64748b" }}></span>
                          <span>Total Catalogued SKUs</span>
                          <strong>{analyticsData.totalProducts} items</strong>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab("products")} className={styles.panelActionBtn}>
                        Manage Products Catalogue →
                      </button>
                    </div>

                    {/* Right: Recent Customer Enquiries */}
                    <div className={styles.panelCard}>
                      <h3>Recent Customer Inquiries ({enquiries.length})</h3>
                      {enquiries.length === 0 ? (
                        <p style={{ color: "#64748b", fontSize: "13.5px" }}>No customer messages received yet.</p>
                      ) : (
                        <div className={styles.enquiriesList}>
                          {enquiries.slice(0, 4).map((enq) => (
                            <div key={enq._id} className={styles.enquiryItem}>
                              <div className={styles.enquiryTop}>
                                <strong>{enq.name}</strong>
                                <span>{enq.email}</span>
                              </div>
                              <p>{enq.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: ORDERS & SHIPROCKET LOGISTICS                    */}
              {/* ======================================================== */}
              {activeTab === "orders" && (
                <div className={styles.tabContent}>
                  <div className={styles.flexHeader}>
                    <div>
                      <h2>Orders &amp; Shiprocket Dispatch</h2>
                      <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "13.5px" }}>
                        Manage customer purchases, Razorpay payment verification, and Shiprocket live tracking.
                      </p>
                    </div>
                    <button
                      onClick={fetchOrders}
                      className={styles.primaryBtn}
                      style={{ height: "40px", padding: "0 18px", fontSize: "13px" }}
                      disabled={ordersLoading}
                    >
                      {ordersLoading ? "Refreshing..." : "↻ Refresh Orders"}
                    </button>
                  </div>

                  {/* Filters Bar */}
                  <div className={styles.searchFilterGrid}>
                    <input
                      type="text"
                      placeholder="Search order #, customer, email, AWB..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className={styles.searchInput}
                    />

                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="all">All Order Statuses</option>
                      <option value="processing">Processing</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                      value={orderPaymentFilter}
                      onChange={(e) => setOrderPaymentFilter(e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="all">All Payment Statuses</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  {/* Orders Table */}
                  <div className={styles.listCard} style={{ marginTop: "20px" }}>
                    <div className={styles.tableWrapper}>
                      <table className={styles.adminTable}>
                        <thead>
                          <tr>
                            <th>Order Ref &amp; Date</th>
                            <th>Customer Info</th>
                            <th>Items &amp; Value</th>
                            <th>Payment</th>
                            <th>Shiprocket Logistics</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                                {ordersLoading ? "Loading customer orders..." : "No orders found matching criteria."}
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map((o) => (
                              <tr key={o.id}>
                                <td>
                                  <strong style={{ color: "#0f172a", fontSize: "14px" }}>{o.orderNumber}</strong>
                                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: "750", color: "#1e293b" }}>{o.userName}</div>
                                  <div style={{ fontSize: "12px", color: "#64748b" }}>{o.userEmail}</div>
                                  {o.userPhone && <div style={{ fontSize: "12px", color: "#64748b" }}>📞 {o.userPhone}</div>}
                                </td>
                                <td>
                                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#132c66" }}>
                                    ₹{o.grandTotal.toLocaleString("en-IN")}
                                  </div>
                                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                                    {o.items?.map((it, idx) => (
                                      <div key={idx}>
                                        {it.title} <strong>x{it.quantity}</strong>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      fontSize: "11px",
                                      fontWeight: "800",
                                      textTransform: "uppercase",
                                      padding: "3px 8px",
                                      borderRadius: "4px",
                                      background: o.paymentStatus === "paid" ? "#dcfce7" : "#fef9c3",
                                      color: o.paymentStatus === "paid" ? "#15803d" : "#854d0e",
                                    }}
                                  >
                                    {o.paymentStatus}
                                  </span>
                                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                                    {o.paymentMethod || "Razorpay"}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                                    <span
                                      style={{
                                        display: "inline-block",
                                        width: "fit-content",
                                        fontSize: "11px",
                                        fontWeight: "800",
                                        textTransform: "uppercase",
                                        padding: "2px 7px",
                                        borderRadius: "4px",
                                        background: o.shiprocketAwbCode ? "#e0f2fe" : "#f1f5f9",
                                        color: o.shiprocketAwbCode ? "#0369a1" : "#475569",
                                      }}
                                    >
                                      {o.shiprocketStatus || "pending_shipment"}
                                    </span>
                                    {o.shiprocketAwbCode && (
                                      <span style={{ fontSize: "11.5px", color: "#1e293b", fontWeight: "600" }}>
                                        AWB: {o.shiprocketAwbCode} ({o.shiprocketCourierName || "Shiprocket"})
                                      </span>
                                    )}
                                    {o.shiprocketTrackingUrl && (
                                      <a
                                        href={o.shiprocketTrackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: "11.5px", color: "#0284c7", fontWeight: "700" }}
                                      >
                                        Live Track ↗
                                      </a>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <button
                                      onClick={() => setSelectedOrder(o)}
                                      className={styles.primaryBtn}
                                      style={{ padding: "6px 12px", fontSize: "12px" }}
                                      title="View Order Details"
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: PRODUCTS CATALOGUE MANAGEMENT                    */}
              {/* ======================================================== */}
              {activeTab === "products" && (
                <div className={styles.tabContent}>
                  <div className={styles.flexHeader}>
                    <div>
                      <h2>Products Catalogue Management</h2>
                      <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "13.5px" }}>
                        Add, view, edit, delete, upload media, and toggle stock availability.
                      </p>
                    </div>

                    <button onClick={openAddProductModal} className={styles.primaryBtn}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span>+ ADD NEW PRODUCT</span>
                    </button>
                  </div>

                  {/* Product Search & Filter Strip */}
                  <div className={styles.searchFilterGrid}>
                    <input
                      type="text"
                      placeholder="Search title, SKU, or brand..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className={styles.searchInput}
                    />

                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={productBrandFilter}
                      onChange={(e) => setProductBrandFilter(e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="all">All Brands</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>

                    <select
                      value={productStockFilter}
                      onChange={(e) => setProductStockFilter(e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="all">All Stock Statuses</option>
                      <option value="in">In Stock Only</option>
                      <option value="out">Out of Stock Only</option>
                    </select>
                  </div>

                  {/* Products Data Table */}
                  <div className={styles.listCard} style={{ marginTop: "20px" }}>
                    <div className={styles.tableWrapper}>
                      <table className={styles.adminTable}>
                        <thead>
                          <tr>
                            <th>Product Details</th>
                            <th>SKU ID</th>
                            <th>Brand &amp; Category</th>
                            <th>Selling Price</th>
                            <th>Stock Toggle</th>
                            <th>Media</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                                No products found matching criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((p) => (
                              <tr key={p.id}>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div className={styles.tableThumbnail}>
                                      <Image
                                        src={optimizeAdminPreview(p.imageUrl || "/images/products/hw2000.jpg")}
                                        alt={p.title}
                                        width={44}
                                        height={44}
                                        loading="lazy"
                                        style={{ objectFit: "contain" }}
                                      />
                                    </div>
                                    <div>
                                      <div>
                                        <strong className={styles.tableNameCell}>{p.title}</strong>
                                        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "2px" }}>
                                          {p.subCategory ? (
                                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                                              Sub: {p.subCategory}
                                            </span>
                                          ) : null}
                                          {p.isBestSeller && (
                                            <span style={{ fontSize: "10.5px", background: "#fef3c7", color: "#b45309", padding: "1px 6px", borderRadius: "4px", fontWeight: "800" }}>
                                              ⭐ Best Seller
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                                    {p.id}
                                  </code>
                                </td>
                                <td>
                                  <div style={{ fontWeight: "750", textTransform: "uppercase" }}>{p.brand}</div>
                                  <div style={{ fontSize: "11.5px", color: "#64748b" }}>{p.category}</div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: "800", color: "#132c66" }}>
                                    ₹{p.price.toLocaleString("en-IN")}
                                  </div>
                                  {p.originalPrice > p.price && (
                                    <del style={{ fontSize: "11px", color: "#94a3b8" }}>
                                      ₹{p.originalPrice.toLocaleString("en-IN")}
                                    </del>
                                  )}
                                </td>
                                <td>
                                  <div className={styles.switchWrapper}>
                                    <label className={styles.switch}>
                                      <input
                                        type="checkbox"
                                        checked={p.inStock}
                                        onChange={() => handleStockToggle(p)}
                                      />
                                      <span className={styles.slider}></span>
                                    </label>
                                    <span style={{ fontSize: "12px", color: p.inStock ? "#10b981" : "#ef4444", fontWeight: "700" }}>
                                      {p.inStock ? "In Stock" : "Out of Stock"}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                    {p.videoUrl ? (
                                      <span className={styles.mediaBadge} style={{ background: "#ede9fe", color: "#7c3aed" }} title="Has Video">
                                        🎬 Video
                                      </span>
                                    ) : null}
                                    {p.gallery && p.gallery.length > 0 ? (
                                      <span className={styles.mediaBadge} style={{ background: "#e0f2fe", color: "#0369a1" }} title={`${p.gallery.length} Gallery Photos`}>
                                        🖼️ {p.gallery.length}
                                      </span>
                                    ) : null}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    {/* Best Seller Quick Toggle */}
                                    <button
                                      onClick={() => handleBestSellerToggle(p)}
                                      className={styles.iconActionBtn}
                                      style={{
                                        background: p.isBestSeller ? "#fef3c7" : "#f1f5f9",
                                        color: p.isBestSeller ? "#b45309" : "#94a3b8"
                                      }}
                                      title={p.isBestSeller ? "Remove from Best Seller Carousel" : "Add to Best Seller Carousel"}
                                    >
                                      ⭐
                                    </button>

                                    {/* View Quick Preview */}
                                    <button
                                      onClick={() => setViewingProduct(p)}
                                      className={styles.iconActionBtn}
                                      title="Quick View Product"
                                    >
                                      👁️
                                    </button>

                                    {/* Edit Product */}
                                    <button
                                      onClick={() => openEditProductModal(p)}
                                      className={styles.iconActionBtn}
                                      title="Edit Product"
                                    >
                                      ✏️
                                    </button>

                                    {/* Delete Product */}
                                    <button
                                      onClick={() => setDeletingProductId(p.id)}
                                      className={styles.iconActionBtn}
                                      style={{ color: "#ef4444" }}
                                      title="Delete Product"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: CATEGORIES MANAGEMENT                            */}
              {/* ======================================================== */}
              {activeTab === "categories" && (
                <div className={styles.tabContent}>
                  <div className={styles.flexHeader}>
                    <div>
                      <h2>Categories Catalogue</h2>
                      <p style={{ color: "#64748b", fontSize: "13px", marginTop: "2px" }}>
                        Manage store categories, brands, and catalog classifications
                      </p>
                    </div>
                    <button onClick={openAddCategoryModal} className={styles.addProductBtn}>
                      <span>+ Add New Category</span>
                    </button>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className={styles.searchFilterGrid} style={{ marginTop: "16px", gridTemplateColumns: "1fr 200px" }}>
                    <div className={styles.searchBox}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" className={styles.searchIcon}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input
                        type="text"
                        placeholder="Search categories by name, slug or brand..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className={styles.searchInput}
                      />
                    </div>

                    <select
                      value={categoryBrandFilter}
                      onChange={(e) => setCategoryBrandFilter(e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="all">All Brands</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Categories Grid */}
                  <div className={styles.categoryGrid}>
                    {categories
                      .filter((c) => {
                        const matchesSearch = !categorySearch.trim() || 
                          c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                          c.id.toLowerCase().includes(categorySearch.toLowerCase()) ||
                          c.brand.toLowerCase().includes(categorySearch.toLowerCase());
                        const matchesBrand = categoryBrandFilter === "all" || c.brand.toLowerCase() === categoryBrandFilter.toLowerCase();
                        return matchesSearch && matchesBrand;
                      })
                      .map((cat) => {
                        const linkedProds = products.filter(
                          (p) => p.category?.toLowerCase() === cat.id.toLowerCase() || p.category?.toLowerCase() === cat.name.toLowerCase()
                        );
                        return (
                          <div key={cat.id} className={styles.categoryCard}>
                            <div className={styles.categoryCardTop}>
                              <div className={styles.categoryThumbBox}>
                                <Image
                                  src={optimizeAdminPreview(cat.imageUrl || "/images/products/hw2000.jpg")}
                                  alt={cat.name}
                                  width={50}
                                  height={50}
                                  loading="lazy"
                                  style={{ objectFit: "contain" }}
                                />
                              </div>
                              <div className={styles.categoryCardInfo}>
                                <h3 className={styles.categoryCardTitle} title={cat.name}>
                                  {cat.name}
                                </h3>
                                <div className={styles.categoryCardMeta}>
                                  <span className={styles.categoryBrandTag}>{cat.brand}</span>
                                  <span className={styles.categorySlugBadge}>{cat.id}</span>
                                  {cat.order !== undefined && (
                                    <span className={styles.categorySlugBadge} style={{ background: "#e0f2fe", color: "#0369a1", borderColor: "#bae6fd" }}>
                                      Order: #{cat.order}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {cat.description && (
                              <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0", lineHeight: 1.4 }}>
                                {cat.description}
                              </p>
                            )}

                            {cat.subcategories && cat.subcategories.length > 0 && (
                              <div className={styles.subCatGridPills}>
                                {cat.subcategories.map((sub) => (
                                  <span key={sub.id} className={styles.subCatGridPill} title={`Slug: ${sub.id}`}>
                                    {sub.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className={styles.categoryCardBottom}>
                              <span className={styles.categoryProdCount}>
                                📦 {linkedProds.length} Products
                              </span>
                              <div className={styles.categoryCardActions}>
                                <button
                                  onClick={() => openEditCategoryModal(cat)}
                                  className={styles.iconActionBtn}
                                  title="Edit Category"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className={styles.iconActionBtn}
                                  style={{ color: "#ef4444" }}
                                  disabled={categoryActionLoading === cat.id}
                                  title="Delete Category"
                                >
                                  {categoryActionLoading === cat.id ? "..." : "🗑️"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB: BRANDS MANAGEMENT                                  */}
              {/* ======================================================== */}
              {activeTab === "brands" && (
                <div className={styles.tabContent}>
                  <div className={styles.flexHeader}>
                    <div>
                      <h2>Brand Management</h2>
                      <p style={{ color: "#64748b", fontSize: "13px", marginTop: "2px" }}>
                        Manage official brand partners, brand logos, taglines, and store visibility
                      </p>
                    </div>
                    <button onClick={openAddBrandModal} className={styles.addProductBtn}>
                      <span>+ Add New Brand</span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className={styles.searchFilterGrid} style={{ marginTop: "16px", gridTemplateColumns: "1fr" }}>
                    <div className={styles.searchBox}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" className={styles.searchIcon}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input
                        type="text"
                        placeholder="Search brands by name, slug or tagline..."
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className={styles.searchInput}
                      />
                    </div>
                  </div>

                  {/* Brands Grid */}
                  <div className={styles.categoryGrid}>
                    {brands
                      .filter((b) => {
                        if (!brandSearch.trim()) return true;
                        const query = brandSearch.toLowerCase();
                        return (
                          b.name.toLowerCase().includes(query) ||
                          b.id.toLowerCase().includes(query) ||
                          (b.tagline && b.tagline.toLowerCase().includes(query))
                        );
                      })
                      .map((brand) => {
                        const linkedProds = products.filter(
                          (p) => p.brand?.toLowerCase() === brand.id.toLowerCase() || p.brand?.toLowerCase() === brand.name.toLowerCase()
                        );
                        const linkedCats = categories.filter(
                          (c) => c.brand?.toLowerCase() === brand.id.toLowerCase() || c.brand?.toLowerCase() === brand.name.toLowerCase()
                        );
                        const isEnabled = brand.enabled !== false;

                        return (
                          <div key={brand.id} className={styles.categoryCard} style={{ opacity: isEnabled ? 1 : 0.65 }}>
                            <div className={styles.categoryCardTop}>
                              <div className={styles.categoryThumbBox} style={{ background: "#ffffff", padding: "4px" }}>
                                <Image
                                  src={optimizeAdminPreview(brand.logo || "/images/brands/tuqo.svg")}
                                  alt={brand.name}
                                  width={70}
                                  height={36}
                                  loading="lazy"
                                  style={{ objectFit: "contain" }}
                                />
                              </div>
                              <div className={styles.categoryCardInfo}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                                  <h3 className={styles.categoryCardTitle} title={brand.name}>
                                    {brand.name}
                                  </h3>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      padding: "2px 8px",
                                      borderRadius: "12px",
                                      background: isEnabled ? "#dcfce7" : "#fee2e2",
                                      color: isEnabled ? "#166534" : "#991b1b",
                                    }}
                                  >
                                    {isEnabled ? "Active" : "Disabled"}
                                  </span>
                                </div>
                                <div className={styles.categoryCardMeta}>
                                  <span className={styles.categorySlugBadge}>/shop/{brand.id}</span>
                                </div>
                              </div>
                            </div>

                            {brand.tagline && (
                              <p style={{ fontSize: "12px", color: "#64748b", margin: "6px 0 2px", fontStyle: "italic", lineHeight: 1.4 }}>
                                &quot;{brand.tagline}&quot;
                              </p>
                            )}

                            {brand.description && (
                              <p style={{ fontSize: "12px", color: "#475569", margin: "4px 0", lineHeight: 1.4 }}>
                                {brand.description}
                              </p>
                            )}

                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "8px 0" }}>
                              <span className={styles.categoryProdCount} style={{ fontSize: "11px" }}>
                                📦 {linkedProds.length} Products
                              </span>
                              <span className={styles.categoryProdCount} style={{ fontSize: "11px", background: "#f0fdf4", borderColor: "#bbf7d0", color: "#166534" }}>
                                🗂️ {linkedCats.length} Categories
                              </span>
                            </div>

                            <div className={styles.categoryCardBottom}>
                              <button
                                type="button"
                                onClick={() => handleToggleBrand(brand)}
                                style={{
                                  fontSize: "11.5px",
                                  fontWeight: 600,
                                  background: isEnabled ? "#fef2f2" : "#f0fdf4",
                                  color: isEnabled ? "#b91c1c" : "#15803d",
                                  border: `1px solid ${isEnabled ? "#fecaca" : "#bbf7d0"}`,
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                                disabled={brandActionLoading === `toggle-${brand.id}`}
                              >
                                {brandActionLoading === `toggle-${brand.id}` ? "Updating..." : isEnabled ? "Disable" : "Enable"}
                              </button>

                              <div className={styles.categoryCardActions}>
                                <Link
                                  href={`/shop/${brand.id}`}
                                  target="_blank"
                                  className={styles.iconActionBtn}
                                  title="View Brand Store Page"
                                  style={{ textDecoration: "none" }}
                                >
                                  🔗
                                </Link>
                                <button
                                  onClick={() => openEditBrandModal(brand)}
                                  className={styles.iconActionBtn}
                                  title="Edit Brand"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteBrand(brand.id)}
                                  className={styles.iconActionBtn}
                                  style={{ color: "#ef4444" }}
                                  disabled={brandActionLoading === brand.id}
                                  title="Delete Brand"
                                >
                                  {brandActionLoading === brand.id ? "..." : "🗑️"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 5: HERO BANNERS MANAGEMENT                          */}
              {/* ======================================================== */}
              {activeTab === "banners" && (
                <div className={styles.tabContent}>
                  <div className={styles.flexHeader}>
                    <h2>Homepage Hero Banners</h2>
                  </div>

                  <div className={styles.gridFormLayout}>
                    <div className={styles.formCard}>
                      <h3>{editingBannerId ? "Edit Hero Banner" : "Add New Banner"}</h3>
                      <form onSubmit={handleBannerSubmit} className={styles.form}>
                        <div className={styles.inputField}>
                          <label htmlFor="form-banner-id">Banner ID *</label>
                          <input
                            id="form-banner-id"
                            type="text"
                            placeholder="e.g. hero-1"
                            value={bannerForm.id}
                            onChange={(e) => setBannerForm({ ...bannerForm, id: e.target.value })}
                            required
                            disabled={!!editingBannerId}
                          />
                        </div>

                        {/* Desktop Banner Image Upload & URL input */}
                        <div className={styles.mediaUploadBox}>
                          <label><strong>Desktop Banner Image * (1920x600 Widescreen)</strong></label>
                          <div className={styles.uploadRow}>
                            <input
                              id="form-banner-image"
                              type="text"
                              placeholder="e.g. /images/banners/banner1.jpg or upload below"
                              value={bannerForm.imageUrl}
                              onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                              required
                              style={{ flex: 1 }}
                            />
                            <label className={styles.uploadBtn}>
                              {isUploadingBanner ? "Uploading..." : "📁 Upload Desktop Banner"}
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file, "banner");
                                }}
                              />
                            </label>
                          </div>
                          {bannerForm.imageUrl && (
                            <div className={styles.mediaPreview} style={{ width: "100%", height: "90px", marginTop: "4px" }}>
                              <Image
                                src={optimizeAdminPreview(bannerForm.imageUrl)}
                                alt="Desktop Banner Preview"
                                width={240}
                                height={80}
                                loading="lazy"
                                style={{ objectFit: "contain", maxHeight: "80px" }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Mobile Banner Image Upload & URL input */}
                        <div className={styles.mediaUploadBox}>
                          <label><strong>📱 Mobile Banner Image (Optional for phones, e.g. 750x600 or 1080x720)</strong></label>
                          <div className={styles.uploadRow}>
                            <input
                              id="form-banner-mobile-image"
                              type="text"
                              placeholder="e.g. /images/banners/banner1-mobile.jpg (Optional)"
                              value={bannerForm.mobileImageUrl}
                              onChange={(e) => setBannerForm({ ...bannerForm, mobileImageUrl: e.target.value })}
                              style={{ flex: 1 }}
                            />
                            <label className={styles.uploadBtn} style={{ background: "#38b6ff", color: "#ffffff" }}>
                              {isUploadingMobileBanner ? "Uploading..." : "📱 Upload Mobile Banner"}
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file, "banner_mobile");
                                }}
                              />
                            </label>
                          </div>
                          {bannerForm.mobileImageUrl && (
                            <div className={styles.mediaPreview} style={{ width: "100%", height: "90px", marginTop: "4px" }}>
                              <Image
                                src={optimizeAdminPreview(bannerForm.mobileImageUrl)}
                                alt="Mobile Banner Preview"
                                width={120}
                                height={80}
                                loading="lazy"
                                style={{ objectFit: "contain", maxHeight: "80px" }}
                              />
                            </div>
                          )}
                          <small style={{ color: "#64748b", fontSize: "11px", display: "block", marginTop: "2px" }}>
                            If provided, mobile visitors will see this optimized banner instead of the desktop widescreen.
                          </small>
                        </div>

                        <div className={styles.inputField}>
                          <label htmlFor="form-banner-link">Target Link</label>
                          <input
                            id="form-banner-link"
                            type="text"
                            placeholder="e.g. /category/high-pressure-washer"
                            value={bannerForm.link}
                            onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                          />
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                          {editingBannerId ? "UPDATE BANNER" : "CREATE BANNER"}
                        </button>
                        {editingBannerId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBannerId(null);
                              setBannerForm({ id: "", imageUrl: "", mobileImageUrl: "", link: "" });
                            }}
                            className={styles.cancelBtn}
                          >
                            Cancel
                          </button>
                        )}
                      </form>
                    </div>

                    <div className={styles.listCard}>
                      <h3>Active Banner Slides ({banners.length})</h3>
                      <div className={styles.bannersList}>
                        {banners.map((b) => (
                          <div key={b.id} className={styles.bannerRow}>
                            <div className={styles.bannerPreview}>
                              <Image
                                src={optimizeAdminPreview(b.imageUrl)}
                                alt={b.id}
                                width={120}
                                height={50}
                                loading="lazy"
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                            <div className={styles.bannerInfo}>
                              <strong>{b.id}</strong>
                              <span>Link: {b.link}</span>
                              {b.mobileImageUrl && (
                                <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: 700 }}>
                                  📱 Has Mobile Banner
                                </span>
                              )}
                            </div>
                            <div className={styles.rowActions}>
                              <button
                                onClick={() => {
                                  setEditingBannerId(b.id);
                                  setBannerForm({
                                    id: b.id,
                                    imageUrl: b.imageUrl,
                                    mobileImageUrl: b.mobileImageUrl || "",
                                    link: b.link,
                                  });
                                }}
                                className={styles.editBtn}
                              >
                                Edit
                              </button>
                              <button onClick={() => deleteBanner(b.id)} className={styles.deleteBtn}>
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 6: HOMEPAGE CMS MANAGEMENT                          */}
              {/* ======================================================== */}
              {activeTab === "homepage" && (
                <div className={styles.tabContent}>
                  <div className={styles.flexHeader}>
                    <div>
                      <h2>Homepage Sections CMS</h2>
                      <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "13.5px" }}>
                        Manage Announcement Bar, Shop by Brands, Trust/USP Line, and Premium Summer Offers in real-time.
                      </p>
                    </div>
                    {homeCmsSuccessMsg && (
                      <div style={{ background: "#ecfdf5", border: "1px solid #10b981", color: "#065f46", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "13px" }}>
                        ✓ {homeCmsSuccessMsg}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "28px", marginTop: "16px" }}>

                    {/* --- 1. TOP ANNOUNCEMENT BAR --- */}
                    <div className={styles.formCard} style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "20px" }}>📢</span>
                          <div>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>1. Top Announcement / Scrolling Line</h3>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>Top black bar displaying promotional scrolling announcements.</span>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <label className={styles.switch}>
                            <input
                              type="checkbox"
                              checked={homeSettings.announcement.enabled}
                              onChange={(e) =>
                                setHomeSettings((prev) => ({
                                  ...prev,
                                  announcement: { ...prev.announcement, enabled: e.target.checked },
                                }))
                              }
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <span style={{ fontSize: "12px", fontWeight: "800", color: homeSettings.announcement.enabled ? "#10b981" : "#94a3b8" }}>
                            {homeSettings.announcement.enabled ? "ENABLED" : "DISABLED"}
                          </span>
                        </div>
                      </div>

                      <div className={styles.form}>
                        <div className={styles.inputField}>
                          <label htmlFor="announcement-text">Announcement Message Text *</label>
                          <input
                            id="announcement-text"
                            type="text"
                            value={homeSettings.announcement.text}
                            onChange={(e) =>
                              setHomeSettings((prev) => ({
                                ...prev,
                                announcement: { ...prev.announcement, text: e.target.value },
                              }))
                            }
                            placeholder="e.g. *2% Discount On Prepaid Orders / Free Shipment & COD Available*"
                          />
                        </div>

                        {/* Live Preview Box */}
                        <div style={{ background: "#000000", color: "#ffffff", padding: "10px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", textAlign: "center", letterSpacing: "0.5px" }}>
                          {homeSettings.announcement.text || "No announcement text entered."}
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                          <button
                            type="button"
                            onClick={() => saveHomeSettingsSection("announcement", homeSettings.announcement)}
                            className={styles.primaryBtn}
                            disabled={homeCmsSavingSection === "announcement"}
                          >
                            {homeCmsSavingSection === "announcement" ? "Saving..." : "💾 Save Announcement Bar"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* --- 2. SHOP BY BRANDS --- */}
                    <div className={styles.formCard} style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "20px" }}>🏷️</span>
                          <div>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>2. Shop by Brands</h3>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>Manage official partner brands displayed on the homepage marquee.</span>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <label className={styles.switch}>
                            <input
                              type="checkbox"
                              checked={homeSettings.brandsSection.enabled}
                              onChange={(e) =>
                                setHomeSettings((prev) => ({
                                  ...prev,
                                  brandsSection: { ...prev.brandsSection, enabled: e.target.checked },
                                }))
                              }
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <span style={{ fontSize: "12px", fontWeight: "800", color: homeSettings.brandsSection.enabled ? "#10b981" : "#94a3b8" }}>
                            {homeSettings.brandsSection.enabled ? "ENABLED" : "DISABLED"}
                          </span>
                        </div>
                      </div>

                      <div className={styles.inputGrid2} style={{ marginBottom: "20px" }}>
                        <div className={styles.inputField}>
                          <label>Section Subtitle</label>
                          <input
                            type="text"
                            value={homeSettings.brandsSection.subtitle || ""}
                            onChange={(e) =>
                              setHomeSettings((prev) => ({
                                ...prev,
                                brandsSection: { ...prev.brandsSection, subtitle: e.target.value },
                              }))
                            }
                            placeholder="e.g. OFFICIAL PARTNERS"
                          />
                        </div>
                        <div className={styles.inputField}>
                          <label>Section Title</label>
                          <input
                            type="text"
                            value={homeSettings.brandsSection.title || ""}
                            onChange={(e) =>
                              setHomeSettings((prev) => ({
                                ...prev,
                                brandsSection: { ...prev.brandsSection, title: e.target.value },
                              }))
                            }
                            placeholder="e.g. SHOP BY BRANDS"
                          />
                        </div>
                      </div>

                      {/* Brands List */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "750", color: "#334155" }}>
                          Brands Catalogue ({homeSettings.brandsSection.brands.length})
                        </label>

                        {homeSettings.brandsSection.brands.map((brand, idx) => (
                          <div
                            key={brand.id || brand.slug || idx}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "80px 1fr 1fr 140px 100px 90px",
                              alignItems: "center",
                              gap: "12px",
                              background: brand.enabled !== false ? "#f8fafc" : "#f1f5f9",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              padding: "12px 16px",
                              opacity: brand.enabled !== false ? 1 : 0.6,
                            }}
                          >
                            {/* Brand Logo Thumbnail & Quick Upload */}
                            <div style={{ position: "relative", width: "70px", height: "36px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                              {brand.logo ? (
                                <Image
                                  src={optimizeAdminPreview(brand.logo)}
                                  alt={brand.name}
                                  width={60}
                                  height={30}
                                  style={{ objectFit: "contain" }}
                                />
                              ) : (
                                <span style={{ fontSize: "10px", color: "#94a3b8" }}>No Logo</span>
                              )}
                            </div>

                            {/* Name & Slug */}
                            <div>
                              <input
                                type="text"
                                value={brand.name}
                                onChange={(e) => {
                                  const updated = [...homeSettings.brandsSection.brands];
                                  updated[idx] = { ...updated[idx], name: e.target.value };
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    brandsSection: { ...prev.brandsSection, brands: updated },
                                  }));
                                }}
                                placeholder="Brand Name"
                                style={{ fontWeight: "750", width: "100%", fontSize: "13px", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                              />
                              <span style={{ fontSize: "11px", color: "#64748b" }}>Slug: /shop/{brand.slug}</span>
                            </div>

                            {/* Tagline */}
                            <div>
                              <input
                                type="text"
                                value={brand.tagline || ""}
                                onChange={(e) => {
                                  const updated = [...homeSettings.brandsSection.brands];
                                  updated[idx] = { ...updated[idx], tagline: e.target.value };
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    brandsSection: { ...prev.brandsSection, brands: updated },
                                  }));
                                }}
                                placeholder="Brand Tagline / Description"
                                style={{ width: "100%", fontSize: "12px", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                              />
                            </div>

                            {/* Logo File Upload / URL */}
                            <div>
                              <label className={styles.uploadBtn} style={{ fontSize: "11px", padding: "4px 8px", width: "100%", textAlign: "center", display: "block" }}>
                                📁 Replace Logo
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: "none" }}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const url = await uploadCustomMedia(file, "skill-store/brands");
                                    if (url) {
                                      const updated = [...homeSettings.brandsSection.brands];
                                      updated[idx] = { ...updated[idx], logo: url };
                                      setHomeSettings((prev) => ({
                                        ...prev,
                                        brandsSection: { ...prev.brandsSection, brands: updated },
                                      }));
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            {/* Show on Home Toggle */}
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <input
                                type="checkbox"
                                id={`brand-toggle-${idx}`}
                                checked={brand.enabled !== false}
                                onChange={(e) => {
                                  const updated = [...homeSettings.brandsSection.brands];
                                  updated[idx] = { ...updated[idx], enabled: e.target.checked };
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    brandsSection: { ...prev.brandsSection, brands: updated },
                                  }));
                                }}
                                style={{ width: "16px", height: "16px", cursor: "pointer" }}
                              />
                              <label htmlFor={`brand-toggle-${idx}`} style={{ fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
                                {brand.enabled !== false ? "Visible" : "Hidden"}
                              </label>
                            </div>

                            {/* Actions (Reorder / Delete) */}
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                title="Move Up"
                                disabled={idx === 0}
                                onClick={() => {
                                  if (idx === 0) return;
                                  const updated = [...homeSettings.brandsSection.brands];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx - 1];
                                  updated[idx - 1] = temp;
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    brandsSection: { ...prev.brandsSection, brands: updated },
                                  }));
                                }}
                                style={{ padding: "4px 8px", cursor: idx === 0 ? "not-allowed" : "pointer", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#ffffff" }}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                title="Move Down"
                                disabled={idx === homeSettings.brandsSection.brands.length - 1}
                                onClick={() => {
                                  if (idx === homeSettings.brandsSection.brands.length - 1) return;
                                  const updated = [...homeSettings.brandsSection.brands];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx + 1];
                                  updated[idx + 1] = temp;
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    brandsSection: { ...prev.brandsSection, brands: updated },
                                  }));
                                }}
                                style={{ padding: "4px 8px", cursor: idx === homeSettings.brandsSection.brands.length - 1 ? "not-allowed" : "pointer", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#ffffff" }}
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                title="Delete Brand"
                                onClick={() => {
                                  if (!confirm(`Remove ${brand.name} from homepage?`)) return;
                                  const updated = homeSettings.brandsSection.brands.filter((_, i) => i !== idx);
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    brandsSection: { ...prev.brandsSection, brands: updated },
                                  }));
                                }}
                                style={{ padding: "4px 8px", cursor: "pointer", borderRadius: "4px", border: "1px solid #fecaca", background: "#fee2e2", color: "#b91c1c" }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add New Brand Inline Box */}
                      <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "750", color: "#1e293b", display: "block", marginBottom: "10px" }}>
                          + Add Brand To Section
                        </span>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr 140px auto", gap: "10px", alignItems: "center" }}>
                          <input
                            type="text"
                            placeholder="Brand Name (e.g. ULTRA TOUCH)"
                            value={newBrandForm.name}
                            onChange={(e) => {
                              const name = e.target.value;
                              const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                              setNewBrandForm((prev) => ({ ...prev, name, slug: prev.slug || slug }));
                            }}
                            style={{ fontSize: "12px", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                          />
                          <input
                            type="text"
                            placeholder="Slug (e.g. ultratouch)"
                            value={newBrandForm.slug}
                            onChange={(e) => setNewBrandForm((prev) => ({ ...prev, slug: e.target.value }))}
                            style={{ fontSize: "12px", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                          />
                          <input
                            type="text"
                            placeholder="Tagline (e.g. Microfiber & Car Care)"
                            value={newBrandForm.tagline}
                            onChange={(e) => setNewBrandForm((prev) => ({ ...prev, tagline: e.target.value }))}
                            style={{ fontSize: "12px", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                          />
                          <label className={styles.uploadBtn} style={{ fontSize: "11px", padding: "6px 8px", textAlign: "center", display: "block" }}>
                            {isUploadingBrandLogo ? "Uploading..." : "📁 Logo File"}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setIsUploadingBrandLogo(true);
                                const url = await uploadCustomMedia(file, "skill-store/brands");
                                setIsUploadingBrandLogo(false);
                                if (url) setNewBrandForm((prev) => ({ ...prev, logo: url }));
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              if (!newBrandForm.name.trim()) {
                                alert("Please enter a brand name.");
                                return;
                              }
                              const slug = newBrandForm.slug.trim() || newBrandForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                              const newBrand: IBrandItem = {
                                id: `brand-${slug}`,
                                slug,
                                name: newBrandForm.name.trim(),
                                logo: newBrandForm.logo.trim() || "/images/brands/tuqo.png",
                                tagline: newBrandForm.tagline.trim(),
                                enabled: true,
                                order: homeSettings.brandsSection.brands.length + 1,
                              };
                              setHomeSettings((prev) => ({
                                ...prev,
                                brandsSection: {
                                  ...prev.brandsSection,
                                  brands: [...prev.brandsSection.brands, newBrand],
                                },
                              }));
                              setNewBrandForm({ name: "", slug: "", logo: "", tagline: "" });
                            }}
                            className={styles.secondaryBtn}
                            style={{ fontSize: "12px", padding: "6px 14px", height: "36px" }}
                          >
                            Add Brand
                          </button>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => saveHomeSettingsSection("brandsSection", homeSettings.brandsSection)}
                          className={styles.primaryBtn}
                          disabled={homeCmsSavingSection === "brandsSection"}
                        >
                          {homeCmsSavingSection === "brandsSection" ? "Saving..." : "💾 Save Brands Section"}
                        </button>
                      </div>
                    </div>

                    {/* --- 3. TRUST / USP SCROLLING LINE --- */}
                    <div className={styles.formCard} style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "20px" }}>🛡️</span>
                          <div>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>3. Trust / USP Scrolling Line</h3>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>Blue marquee bar below Shop by Brands highlighting store commitments.</span>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <label className={styles.switch}>
                            <input
                              type="checkbox"
                              checked={homeSettings.trustMarquee.enabled}
                              onChange={(e) =>
                                setHomeSettings((prev) => ({
                                  ...prev,
                                  trustMarquee: { ...prev.trustMarquee, enabled: e.target.checked },
                                }))
                              }
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <span style={{ fontSize: "12px", fontWeight: "800", color: homeSettings.trustMarquee.enabled ? "#10b981" : "#94a3b8" }}>
                            {homeSettings.trustMarquee.enabled ? "ENABLED" : "DISABLED"}
                          </span>
                        </div>
                      </div>

                      {/* USP Items List */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "750", color: "#334155" }}>
                          USP Items ({homeSettings.trustMarquee.items.length})
                        </label>

                        {homeSettings.trustMarquee.items.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 100px 90px",
                              alignItems: "center",
                              gap: "12px",
                              background: item.enabled !== false ? "#f8fafc" : "#f1f5f9",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              padding: "10px 16px",
                              opacity: item.enabled !== false ? 1 : 0.6,
                            }}
                          >
                            <input
                              type="text"
                              value={item.text}
                              onChange={(e) => {
                                const updated = [...homeSettings.trustMarquee.items];
                                updated[idx] = { ...updated[idx], text: e.target.value };
                                setHomeSettings((prev) => ({
                                  ...prev,
                                  trustMarquee: { ...prev.trustMarquee, items: updated },
                                }));
                              }}
                              placeholder="e.g. AUTHORIZED BRAND DISTRIBUTOR"
                              style={{ width: "100%", fontSize: "13px", fontWeight: "700", padding: "6px 10px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                            />

                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <input
                                type="checkbox"
                                id={`usp-toggle-${idx}`}
                                checked={item.enabled !== false}
                                onChange={(e) => {
                                  const updated = [...homeSettings.trustMarquee.items];
                                  updated[idx] = { ...updated[idx], enabled: e.target.checked };
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    trustMarquee: { ...prev.trustMarquee, items: updated },
                                  }));
                                }}
                                style={{ width: "16px", height: "16px", cursor: "pointer" }}
                              />
                              <label htmlFor={`usp-toggle-${idx}`} style={{ fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
                                {item.enabled !== false ? "Active" : "Off"}
                              </label>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                title="Move Up"
                                disabled={idx === 0}
                                onClick={() => {
                                  if (idx === 0) return;
                                  const updated = [...homeSettings.trustMarquee.items];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx - 1];
                                  updated[idx - 1] = temp;
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    trustMarquee: { ...prev.trustMarquee, items: updated },
                                  }));
                                }}
                                style={{ padding: "4px 8px", cursor: idx === 0 ? "not-allowed" : "pointer", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#ffffff" }}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                title="Move Down"
                                disabled={idx === homeSettings.trustMarquee.items.length - 1}
                                onClick={() => {
                                  if (idx === homeSettings.trustMarquee.items.length - 1) return;
                                  const updated = [...homeSettings.trustMarquee.items];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx + 1];
                                  updated[idx + 1] = temp;
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    trustMarquee: { ...prev.trustMarquee, items: updated },
                                  }));
                                }}
                                style={{ padding: "4px 8px", cursor: idx === homeSettings.trustMarquee.items.length - 1 ? "not-allowed" : "pointer", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#ffffff" }}
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                title="Delete USP Item"
                                onClick={() => {
                                  const updated = homeSettings.trustMarquee.items.filter((_, i) => i !== idx);
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    trustMarquee: { ...prev.trustMarquee, items: updated },
                                  }));
                                }}
                                style={{ padding: "4px 8px", cursor: "pointer", borderRadius: "4px", border: "1px solid #fecaca", background: "#fee2e2", color: "#b91c1c" }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add New USP Box */}
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px" }}>
                        <input
                          type="text"
                          placeholder="New USP Text (e.g. PAN-INDIA EXPRESS DELIVERY)"
                          value={newUspInput}
                          onChange={(e) => setNewUspInput(e.target.value)}
                          style={{ flex: 1, fontSize: "13px", padding: "6px 10px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newUspInput.trim()) return;
                            const newItem: IUspItem = {
                              id: `usp-${Date.now()}`,
                              text: newUspInput.trim().toUpperCase(),
                              enabled: true,
                              order: homeSettings.trustMarquee.items.length + 1,
                            };
                            setHomeSettings((prev) => ({
                              ...prev,
                              trustMarquee: { ...prev.trustMarquee, items: [...prev.trustMarquee.items, newItem] },
                            }));
                            setNewUspInput("");
                          }}
                          className={styles.secondaryBtn}
                          style={{ fontSize: "12px", padding: "6px 14px", height: "36px" }}
                        >
                          + Add USP
                        </button>
                      </div>

                      {/* Live Blue Marquee Preview */}
                      <div style={{ background: "#132c66", color: "#ffffff", padding: "12px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center", gap: "16px", overflowX: "auto", whiteSpace: "nowrap" }}>
                        {homeSettings.trustMarquee.items
                          .filter((i) => i.enabled !== false)
                          .map((item, i) => (
                            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                              {item.text} <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#ffffff", display: "inline-block" }}></span>
                            </span>
                          ))}
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                        <button
                          type="button"
                          onClick={() => saveHomeSettingsSection("trustMarquee", homeSettings.trustMarquee)}
                          className={styles.primaryBtn}
                          disabled={homeCmsSavingSection === "trustMarquee"}
                        >
                          {homeCmsSavingSection === "trustMarquee" ? "Saving..." : "💾 Save Trust/USP Line"}
                        </button>
                      </div>
                    </div>

                    {/* --- 4. PREMIUM SUMMER OFFER --- */}
                    <div className={styles.formCard} style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "20px" }}>☀️</span>
                          <div>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>4. Premium Summer Offer</h3>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>Manage the high-impact summer offer promotional banners &amp; cards.</span>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <label className={styles.switch}>
                            <input
                              type="checkbox"
                              checked={homeSettings.summerOffer.enabled}
                              onChange={(e) =>
                                setHomeSettings((prev) => ({
                                  ...prev,
                                  summerOffer: { ...prev.summerOffer, enabled: e.target.checked },
                                }))
                              }
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <span style={{ fontSize: "12px", fontWeight: "800", color: homeSettings.summerOffer.enabled ? "#10b981" : "#94a3b8" }}>
                            {homeSettings.summerOffer.enabled ? "ENABLED" : "DISABLED"}
                          </span>
                        </div>
                      </div>

                      <div className={styles.inputField} style={{ marginBottom: "20px" }}>
                        <label>Section Header Tab Title</label>
                        <input
                          type="text"
                          value={homeSettings.summerOffer.title || ""}
                          onChange={(e) =>
                            setHomeSettings((prev) => ({
                              ...prev,
                              summerOffer: { ...prev.summerOffer, title: e.target.value },
                            }))
                          }
                          placeholder="e.g. PREMIUM SUMMER OFFER"
                        />
                      </div>

                      {/* Offers List */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "750", color: "#334155" }}>
                          Offer Cards ({homeSettings.summerOffer.offers.length})
                        </label>

                        {homeSettings.summerOffer.offers.map((offer, idx) => (
                          <div
                            key={offer.id || idx}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "110px 1fr 1fr 140px 100px 90px",
                              alignItems: "center",
                              gap: "12px",
                              background: offer.enabled !== false ? "#f8fafc" : "#f1f5f9",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              padding: "12px 16px",
                              opacity: offer.enabled !== false ? 1 : 0.6,
                            }}
                          >
                            {/* Preview */}
                            <div style={{ position: "relative", width: "100px", height: "60px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                              {offer.imageUrl ? (
                                <Image
                                  src={optimizeAdminPreview(offer.imageUrl)}
                                  alt={offer.title || "Offer"}
                                  width={100}
                                  height={60}
                                  style={{ objectFit: "contain" }}
                                />
                              ) : (
                                <span style={{ fontSize: "10px", color: "#94a3b8" }}>No Image</span>
                              )}
                            </div>

                            {/* Title */}
                            <div>
                              <input
                                type="text"
                                value={offer.title || ""}
                                onChange={(e) => {
                                  const updated = [...homeSettings.summerOffer.offers];
                                  updated[idx] = { ...updated[idx], title: e.target.value };
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    summerOffer: { ...prev.summerOffer, offers: updated },
                                  }));
                                }}
                                placeholder="Offer Title (e.g. Summer Offer 1)"
                                style={{ width: "100%", fontWeight: "700", fontSize: "13px", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                              />
                            </div>

                            {/* Link */}
                            <div>
                              <input
                                type="text"
                                value={offer.link || ""}
                                onChange={(e) => {
                                  const updated = [...homeSettings.summerOffer.offers];
                                  updated[idx] = { ...updated[idx], link: e.target.value };
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    summerOffer: { ...prev.summerOffer, offers: updated },
                                  }));
                                }}
                                placeholder="Target Link (e.g. /shop?offer=1)"
                                style={{ width: "100%", fontSize: "12px", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                              />
                            </div>

                            {/* File Upload Button */}
                            <div>
                              <label className={styles.uploadBtn} style={{ fontSize: "11px", padding: "6px 8px", width: "100%", textAlign: "center", display: "block" }}>
                                📁 Replace Banner
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: "none" }}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const url = await uploadCustomMedia(file, "skill-store/offers");
                                    if (url) {
                                      const updated = [...homeSettings.summerOffer.offers];
                                      updated[idx] = { ...updated[idx], imageUrl: url };
                                      setHomeSettings((prev) => ({
                                        ...prev,
                                        summerOffer: { ...prev.summerOffer, offers: updated },
                                      }));
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            {/* Toggle active */}
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <input
                                type="checkbox"
                                id={`offer-toggle-${idx}`}
                                checked={offer.enabled !== false}
                                onChange={(e) => {
                                  const updated = [...homeSettings.summerOffer.offers];
                                  updated[idx] = { ...updated[idx], enabled: e.target.checked };
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    summerOffer: { ...prev.summerOffer, offers: updated },
                                  }));
                                }}
                                style={{ width: "16px", height: "16px", cursor: "pointer" }}
                              />
                              <label htmlFor={`offer-toggle-${idx}`} style={{ fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
                                {offer.enabled !== false ? "Visible" : "Hidden"}
                              </label>
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                title="Move Up"
                                disabled={idx === 0}
                                onClick={() => {
                                  if (idx === 0) return;
                                  const updated = [...homeSettings.summerOffer.offers];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx - 1];
                                  updated[idx - 1] = temp;
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    summerOffer: { ...prev.summerOffer, offers: updated },
                                  }));
                                }}
                                style={{ padding: "4px 8px", cursor: idx === 0 ? "not-allowed" : "pointer", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#ffffff" }}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                title="Move Down"
                                disabled={idx === homeSettings.summerOffer.offers.length - 1}
                                onClick={() => {
                                  if (idx === homeSettings.summerOffer.offers.length - 1) return;
                                  const updated = [...homeSettings.summerOffer.offers];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx + 1];
                                  updated[idx + 1] = temp;
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    summerOffer: { ...prev.summerOffer, offers: updated },
                                  }));
                                }}
                                style={{ padding: "4px 8px", cursor: idx === homeSettings.summerOffer.offers.length - 1 ? "not-allowed" : "pointer", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#ffffff" }}
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                title="Delete Offer"
                                onClick={() => {
                                  if (!confirm(`Delete ${offer.title || "this offer"}?`)) return;
                                  const updated = homeSettings.summerOffer.offers.filter((_, i) => i !== idx);
                                  setHomeSettings((prev) => ({
                                    ...prev,
                                    summerOffer: { ...prev.summerOffer, offers: updated },
                                  }));
                                }}
                                style={{ padding: "4px 8px", cursor: "pointer", borderRadius: "4px", border: "1px solid #fecaca", background: "#fee2e2", color: "#b91c1c" }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add New Offer Card Inline Box */}
                      <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "750", color: "#1e293b", display: "block", marginBottom: "10px" }}>
                          + Add New Offer Banner
                        </span>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px auto", gap: "10px", alignItems: "center" }}>
                          <input
                            type="text"
                            placeholder="Offer Title (e.g. Monsoon Washer Deals)"
                            value={newOfferForm.title}
                            onChange={(e) => setNewOfferForm((prev) => ({ ...prev, title: e.target.value }))}
                            style={{ fontSize: "12px", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                          />
                          <input
                            type="text"
                            placeholder="Link URL (e.g. /shop?offer=special)"
                            value={newOfferForm.link}
                            onChange={(e) => setNewOfferForm((prev) => ({ ...prev, link: e.target.value }))}
                            style={{ fontSize: "12px", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                          />
                          <label className={styles.uploadBtn} style={{ fontSize: "11px", padding: "6px 8px", textAlign: "center", display: "block" }}>
                            {isUploadingOfferImg ? "Uploading..." : "📁 Banner Image"}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setIsUploadingOfferImg(true);
                                const url = await uploadCustomMedia(file, "skill-store/offers");
                                setIsUploadingOfferImg(false);
                                if (url) setNewOfferForm((prev) => ({ ...prev, imageUrl: url }));
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              if (!newOfferForm.imageUrl.trim()) {
                                alert("Please upload or provide an image for the offer banner.");
                                return;
                              }
                              const newOffer: ISummerOfferItem = {
                                id: `offer-${Date.now()}`,
                                title: newOfferForm.title.trim() || `Offer ${homeSettings.summerOffer.offers.length + 1}`,
                                imageUrl: newOfferForm.imageUrl.trim(),
                                link: newOfferForm.link.trim() || "/shop",
                                enabled: true,
                                order: homeSettings.summerOffer.offers.length + 1,
                              };
                              setHomeSettings((prev) => ({
                                ...prev,
                                summerOffer: {
                                  ...prev.summerOffer,
                                  offers: [...prev.summerOffer.offers, newOffer],
                                },
                              }));
                              setNewOfferForm({ title: "", imageUrl: "", link: "/shop" });
                            }}
                            className={styles.secondaryBtn}
                            style={{ fontSize: "12px", padding: "6px 14px", height: "36px" }}
                          >
                            Add Offer
                          </button>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => saveHomeSettingsSection("summerOffer", homeSettings.summerOffer)}
                          className={styles.primaryBtn}
                          disabled={homeCmsSavingSection === "summerOffer"}
                        >
                          {homeCmsSavingSection === "summerOffer" ? "Saving..." : "💾 Save Summer Offers"}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 7: CUSTOMER REVIEWS MODERATION                      */}
              {/* ======================================================== */}
              {activeTab === "reviews" && (
                <div className={styles.tabContent}>
                  <div className={styles.tabHeaderRow}>
                    <div>
                      <h2>Customer Reviews Moderation ({reviews.length})</h2>
                      <p>Review, approve, or reject customer feedback before it appears on the live store product pages.</p>
                    </div>
                    <div className={styles.filterGroup}>
                      {["all", "pending", "approved", "rejected"].map((st) => (
                        <button
                          key={st}
                          onClick={() => setReviewFilter(st)}
                          className={`${styles.filterBtn} ${reviewFilter === st ? styles.activeFilter : ""}`}
                          style={{ textTransform: "capitalize" }}
                        >
                          {st} {st === "pending" && reviews.filter((r) => r.status === "pending").length > 0 && `(${reviews.filter((r) => r.status === "pending").length})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredReviews.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>No reviews found matching the selected filter ({reviewFilter}).</p>
                    </div>
                  ) : (
                    <div className={styles.tableCard}>
                      <table className={styles.dataTable}>
                        <thead>
                          <tr>
                            <th>Rating &amp; Review</th>
                            <th>Reviewer</th>
                            <th>Product Info</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReviews.map((rev) => (
                            <tr key={rev._id}>
                              <td style={{ minWidth: "260px" }}>
                                <div style={{ display: "flex", gap: "2px", marginBottom: "4px" }}>
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <svg
                                      key={s}
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill={s <= rev.rating ? "#ffd300" : "#d1d5db"}
                                      stroke={s <= rev.rating ? "#ffd300" : "#d1d5db"}
                                      strokeWidth="1"
                                    >
                                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                  ))}
                                </div>
                                {rev.title && <div style={{ fontWeight: "700", fontSize: "13px", color: "#132c66" }}>{rev.title}</div>}
                                <div style={{ fontSize: "12.5px", color: "#475569", marginTop: "2px", lineHeight: 1.4 }}>
                                  &ldquo;{rev.comment}&rdquo;
                                </div>
                              </td>
                              <td>
                                <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "13px" }}>{rev.userName}</div>
                                {rev.userEmail && <div style={{ fontSize: "11px", color: "#64748b" }}>{rev.userEmail}</div>}
                              </td>
                              <td>
                                <div style={{ fontWeight: "700", fontSize: "12px", color: "#132c66" }}>SKU: {rev.productId}</div>
                                {rev.productTitle && (
                                  <div style={{ fontSize: "11px", color: "#64748b", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {rev.productTitle}
                                  </div>
                                )}
                              </td>
                              <td style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>
                                {new Date(rev.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </td>
                              <td>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    textTransform: "uppercase",
                                    background:
                                      rev.status === "approved"
                                        ? "#dcfce7"
                                        : rev.status === "rejected"
                                        ? "#fee2e2"
                                        : "#fef3c7",
                                    color:
                                      rev.status === "approved"
                                        ? "#166534"
                                        : rev.status === "rejected"
                                        ? "#991b1b"
                                        : "#92400e",
                                  }}
                                >
                                  {rev.status}
                                </span>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                                  {rev.status !== "approved" && (
                                    <button
                                      onClick={() => handleUpdateReviewStatus(rev._id, "approved")}
                                      disabled={reviewActionLoading === rev._id}
                                      style={{
                                        background: "#16a34a",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "6px",
                                        padding: "6px 10px",
                                        fontSize: "11.5px",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                      }}
                                      title="Approve Review"
                                    >
                                      ✓ Approve
                                    </button>
                                  )}
                                  {rev.status !== "rejected" && (
                                    <button
                                      onClick={() => handleUpdateReviewStatus(rev._id, "rejected")}
                                      disabled={reviewActionLoading === rev._id}
                                      style={{
                                        background: "#eab308",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "6px",
                                        padding: "6px 10px",
                                        fontSize: "11.5px",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                      }}
                                      title="Reject Review"
                                    >
                                      ✕ Reject
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteReview(rev._id)}
                                    disabled={reviewActionLoading === rev._id}
                                    className={styles.deleteBtn}
                                    style={{ padding: "6px 10px", fontSize: "11.5px" }}
                                    title="Delete Review"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>


      {/* ============================================================ */}
      {/* MODAL 1: ADD / EDIT PRODUCT WITH UPLOADS & GALLERY           */}
      {/* ============================================================ */}
      {isProductModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: "780px" }}>
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#132c66" }}>
                  {editingProduct ? `Edit Product: ${editingProduct.title}` : "Add New Product to Catalogue"}
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {editingProduct ? `SKU: ${editingProduct.id}` : "Fill in details, pricing, media and specifications"}
                </span>
              </div>
              <button onClick={() => setIsProductModalOpen(false)} className={styles.closeModalBtn}>
                &times;
              </button>
            </div>

            {uploadError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "8px 12px", borderRadius: "8px", fontSize: "12.5px", margin: "4px 0" }}>
                ⚠️ {uploadError}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className={styles.form} style={{ gap: "14px" }}>
              {/* 1. Essential Product Info */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>1. Basic Details &amp; Categorization</div>
                <div className={styles.inputGrid3}>
                  <div className={styles.inputField}>
                    <label htmlFor="form-prod-id">Product SKU *</label>
                    <input
                      id="form-prod-id"
                      type="text"
                      placeholder="e.g. hpw-1 or prod-10"
                      value={productForm.id}
                      onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                      required
                      disabled={!!editingProduct}
                    />
                  </div>

                  <div className={styles.inputField} style={{ gridColumn: "span 2" }}>
                    <label htmlFor="form-prod-title">Product Title *</label>
                    <input
                      id="form-prod-title"
                      type="text"
                      placeholder="e.g. TUQO High Pressure Washer HW2000"
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGrid3}>
                  <div className={styles.inputField}>
                    <label htmlFor="form-prod-brand">Brand *</label>
                    <select
                      id="form-prod-brand"
                      value={productForm.brand}
                      onChange={(e) => {
                        const newBrand = e.target.value;
                        setProductForm((prev) => {
                          const brandCats = categories.filter((c) => c.brand?.toLowerCase() === newBrand.toLowerCase());
                          const nextCat = brandCats.length > 0 ? brandCats[0].id : prev.category;
                          return { ...prev, brand: newBrand, category: nextCat };
                        });
                      }}
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.inputField}>
                    <label htmlFor="form-prod-category">Category *</label>
                    <select
                      id="form-prod-category"
                      value={productForm.category}
                      onChange={(e) => {
                        const nextCatId = e.target.value;
                        const matchedCat = categories.find((c) => c.id.toLowerCase() === nextCatId.toLowerCase());
                        const defaultSub = matchedCat?.subcategories?.[0]?.id || "domestic";
                        setProductForm({ ...productForm, category: nextCatId, subCategory: defaultSub });
                      }}
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.inputField}>
                    <label htmlFor="form-prod-subcat">Sub-Category</label>
                    {(() => {
                      const activeCat = categories.find(
                        (c) => c.id.toLowerCase() === productForm.category.toLowerCase()
                      );
                      const subcats = activeCat?.subcategories || [];
                      if (subcats.length > 0) {
                        return (
                          <select
                            id="form-prod-subcat"
                            value={productForm.subCategory}
                            onChange={(e) => setProductForm({ ...productForm, subCategory: e.target.value })}
                          >
                            {subcats.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name}
                              </option>
                            ))}
                            <option value="domestic">Domestic</option>
                            <option value="commercial">Commercial / Industrial</option>
                            <option value="accessory">Accessories &amp; Spares</option>
                            <option value="general">General</option>
                          </select>
                        );
                      }
                      return (
                        <input
                          id="form-prod-subcat"
                          type="text"
                          placeholder="e.g. domestic, commercial, accessory"
                          value={productForm.subCategory}
                          onChange={(e) => setProductForm({ ...productForm, subCategory: e.target.value })}
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* 2. Pricing & Stock */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>2. Pricing &amp; Stock Availability</div>
                <div className={styles.inputGrid3}>
                  <div className={styles.inputField}>
                    <label htmlFor="form-prod-price">Selling Price (₹) *</label>
                    <input
                      id="form-prod-price"
                      type="number"
                      placeholder="4999"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.inputField}>
                    <label htmlFor="form-prod-orig-price">MRP Price (₹)</label>
                    <input
                      id="form-prod-orig-price"
                      type="number"
                      placeholder="6999"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    />
                  </div>

                  <div className={styles.inputField} style={{ justifyContent: "center" }}>
                    <label>Stock Status</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={productForm.inStock}
                          onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                        />
                        <span className={styles.slider}></span>
                      </label>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: productForm.inStock ? "#10b981" : "#ef4444" }}>
                        {productForm.inStock ? "IN STOCK" : "OUT OF STOCK"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.inputField} style={{ justifyContent: "center" }}>
                    <label>Show in Best Seller Products</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={Boolean(productForm.isBestSeller)}
                          onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                        />
                        <span className={styles.slider}></span>
                      </label>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: productForm.isBestSeller ? "#eab308" : "#94a3b8" }}>
                        {productForm.isBestSeller ? "⭐ BEST SELLER" : "NORMAL"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Media Assets */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>3. Media Assets (Image, Video &amp; Gallery)</div>
                <div className={styles.inputRow}>
                  {/* Main Product Image */}
                  <div className={styles.mediaUploadBox} style={{ flex: 1 }}>
                    <label><strong>Main Image *</strong></label>
                    <div className={styles.uploadRow}>
                      <input
                        type="text"
                        placeholder="Image URL or upload"
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                        required
                        style={{ flex: 1, minWidth: "140px" }}
                      />
                      <label className={styles.uploadBtn}>
                        {isUploadingImage ? "..." : "📁 Upload"}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "main_image");
                          }}
                        />
                      </label>
                    </div>
                    {productForm.imageUrl && (
                      <div className={styles.mediaPreview} style={{ marginTop: "6px" }}>
                        <Image
                          src={optimizeAdminPreview(productForm.imageUrl)}
                          alt="Preview"
                          width={70}
                          height={70}
                          loading="lazy"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Video */}
                  <div className={styles.mediaUploadBox} style={{ flex: 1 }}>
                    <label><strong>Product Video</strong></label>
                    <div className={styles.uploadRow}>
                      <input
                        type="text"
                        placeholder="Video URL or upload MP4"
                        value={productForm.videoUrl}
                        onChange={(e) => setProductForm({ ...productForm, videoUrl: e.target.value })}
                        style={{ flex: 1, minWidth: "140px" }}
                      />
                      <label className={styles.uploadBtn}>
                        {isUploadingVideo ? "..." : "🎬 Upload"}
                        <input
                          type="file"
                          accept="video/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "video");
                          }}
                        />
                      </label>
                    </div>
                    {productForm.videoUrl && (
                      <div style={{ fontSize: "11px", color: "#166534", marginTop: "4px" }}>
                        ✓ Video attached
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery Images */}
                <div className={styles.mediaUploadBox} style={{ marginTop: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label><strong>Additional Gallery Images ({productForm.gallery.length})</strong></label>
                    <label className={styles.uploadBtn} style={{ fontSize: "11px", padding: "4px 10px" }}>
                      {isUploadingGallery ? "Uploading..." : "+ Add Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "gallery");
                        }}
                      />
                    </label>
                  </div>
                  {productForm.gallery.length > 0 && (
                    <div className={styles.galleryThumbGrid} style={{ marginTop: "8px" }}>
                      {productForm.gallery.map((imgUrl, idx) => (
                        <div key={idx} className={styles.galleryThumbCard}>
                          <Image
                            src={optimizeAdminPreview(imgUrl)}
                            alt={`Gallery ${idx}`}
                            width={55}
                            height={55}
                            loading="lazy"
                            style={{ objectFit: "contain" }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setProductForm((prev) => ({
                                ...prev,
                                gallery: prev.gallery.filter((_, i) => i !== idx),
                              }));
                            }}
                            className={styles.removeGalleryBtn}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Specifications & Highlights */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>4. Product Description &amp; Specifications (One line per bullet point)</div>
                <div className={styles.inputGrid3}>
                  <div className={styles.inputField}>
                    <label><strong>Product Description / Features *</strong></label>
                    <textarea
                      rows={4}
                      placeholder="HIGH PERFORMANCE HEAVY-DUTY MOTOR&#10;SOLID BRASS FITTINGS &amp; PRESSURE HOSE&#10;DRAW WATER FROM BUCKETS, TANKS OR TAP"
                      value={productForm.descriptionText}
                      onChange={(e) => setProductForm({ ...productForm, descriptionText: e.target.value })}
                    />
                    <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", lineHeight: "1.3" }}>
                      💡 Enter points on new lines. This replaces generic info and shows dynamically on product page!
                    </span>
                  </div>

                  <div className={styles.inputField}>
                    <label><strong>Technical Specifications</strong></label>
                    <textarea
                      rows={4}
                      placeholder="Power: 2000W / 240V&#10;Pressure: 140 Bar Max&#10;Flow: 420 L/hr&#10;Warranty: 1 Year"
                      value={productForm.specificationsText}
                      onChange={(e) => setProductForm({ ...productForm, specificationsText: e.target.value })}
                    />
                    <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", lineHeight: "1.3" }}>
                      💡 Enter each spec on a separate line.
                    </span>
                  </div>

                  <div className={styles.inputField}>
                    <label><strong>What&apos;s in the Box</strong></label>
                    <textarea
                      rows={4}
                      placeholder="1x High Pressure Washer Machine&#10;1x Trigger Spray Gun&#10;1x 5m Pressure Hose Pipe"
                      value={productForm.whatsInBoxText}
                      onChange={(e) => setProductForm({ ...productForm, whatsInBoxText: e.target.value })}
                    />
                    <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", lineHeight: "1.3" }}>
                      💡 Enter package contents on separate lines.
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Product Variants & Images (Degree, Size, Style) */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>5. Product Variants &amp; Variant Images (Optional)</div>
                <div className={styles.inputGrid3}>
                  <div className={styles.inputField}>
                    <label htmlFor="form-prod-degrees"><strong>Degrees (Spray Angle)</strong></label>
                    <input
                      id="form-prod-degrees"
                      type="text"
                      placeholder="e.g. 0°, 15°, 25°, 40°, 60°"
                      value={productForm.degreesText}
                      onChange={(e) => setProductForm({ ...productForm, degreesText: e.target.value })}
                    />
                    <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", lineHeight: "1.3" }}>
                      💡 Separate multiple degrees with commas
                    </span>
                  </div>

                  <div className={styles.inputField}>
                    <label htmlFor="form-prod-sizes"><strong>Sizes / Lengths</strong></label>
                    <input
                      id="form-prod-sizes"
                      type="text"
                      placeholder="e.g. 5M, 10M, 15M, 1/4 inch, M22"
                      value={productForm.sizesText}
                      onChange={(e) => setProductForm({ ...productForm, sizesText: e.target.value })}
                    />
                    <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", lineHeight: "1.3" }}>
                      💡 Separate multiple sizes with commas
                    </span>
                  </div>

                  <div className={styles.inputField}>
                    <label htmlFor="form-prod-styles"><strong>Styles / Types</strong></label>
                    <input
                      id="form-prod-styles"
                      type="text"
                      placeholder="e.g. Standard, Quick Connect, Heavy Duty"
                      value={productForm.stylesText}
                      onChange={(e) => setProductForm({ ...productForm, stylesText: e.target.value })}
                    />
                    <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", lineHeight: "1.3" }}>
                      💡 Separate multiple styles with commas
                    </span>
                  </div>
                </div>

                {/* Variant Image Manager */}
                <div className={styles.variantManager}>
                  <div className={styles.variantHeaderRow}>
                    <span className={styles.variantHeaderTitle}>
                      🖼️ Variation Images (Selecting a variation on the product page will show its image)
                    </span>
                    <div className={styles.variantActionBtns}>
                      <button
                        type="button"
                        onClick={syncVariantsFromAttributes}
                        className={styles.variantSyncBtn}
                        title="Generate rows from Degrees, Sizes and Styles inputs above"
                      >
                        ⚡ Sync from Inputs
                      </button>
                      <button
                        type="button"
                        onClick={() => addVariantRow("general", "")}
                        className={styles.variantAddBtn}
                      >
                        + Add Variant
                      </button>
                    </div>
                  </div>

                  {productForm.variants.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "16px", color: "#64748b", fontSize: "12.5px" }}>
                      No variant images configured yet. Click <strong>&quot;⚡ Sync from Inputs&quot;</strong> or <strong>&quot;+ Add Variant&quot;</strong> to attach specific images to degrees, sizes, or styles.
                    </div>
                  ) : (
                    <div className={styles.variantList}>
                      {productForm.variants.map((variant, index) => (
                        <div key={variant.id || index} className={styles.variantCardRow}>
                          {/* Variant Type */}
                          <select
                            value={variant.type || "general"}
                            onChange={(e) => updateVariantField(index, "type", e.target.value as "degree" | "size" | "style" | "general")}
                            className={styles.variantTypeSelect}
                          >
                            <option value="degree">Degree (°)</option>
                            <option value="size">Size/Length</option>
                            <option value="style">Style/Type</option>
                            <option value="general">Custom</option>
                          </select>

                          {/* Variant Name / Value */}
                          <input
                            type="text"
                            placeholder="e.g. 0° / 5M / Red"
                            value={variant.name}
                            onChange={(e) => updateVariantField(index, "name", e.target.value)}
                            className={styles.variantNameInput}
                            required
                          />

                          {/* Variant Image Upload & URL */}
                          <div className={styles.variantImageUploadBox}>
                            {variant.imageUrl ? (
                              <Image
                                src={variant.imageUrl}
                                alt={variant.name || "Variant Image"}
                                width={36}
                                height={36}
                                className={styles.variantThumbPreview}
                              />
                            ) : (
                              <div className={styles.variantThumbPreview} style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#94a3b8" }}>
                                📷
                              </div>
                            )}

                            <input
                              type="text"
                              placeholder="Image URL..."
                              value={variant.imageUrl}
                              onChange={(e) => updateVariantField(index, "imageUrl", e.target.value)}
                              className={styles.variantUrlInput}
                            />

                            <label className={styles.variantUploadLabel}>
                              {uploadingVariantIndex === index ? "Uploading..." : "Upload"}
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                disabled={uploadingVariantIndex === index}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleVariantImageUpload(file, index);
                                }}
                              />
                            </label>
                          </div>

                          {/* Price Override (optional) */}
                          <input
                            type="number"
                            placeholder="Price (₹)"
                            value={variant.price || ""}
                            onChange={(e) => updateVariantField(index, "price", e.target.value)}
                            className={styles.variantPriceInput}
                            title="Optional Price override for this variant"
                          />

                          {/* Delete Variant */}
                          <button
                            type="button"
                            onClick={() => removeVariantRow(index)}
                            className={styles.variantDeleteBtn}
                            title="Delete this variant"
                            aria-label="Delete variant"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} style={{ marginTop: 0 }}>
                  {editingProduct ? "SAVE PRODUCT CHANGES" : "CREATE PRODUCT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: PRODUCT QUICK VIEW PREVIEW MODAL                    */}
      {/* ============================================================ */}
      {viewingProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: "650px" }}>
            <div className={styles.modalHeader}>
              <h3>Product Preview: {viewingProduct.title}</h3>
              <button onClick={() => setViewingProduct(null)} className={styles.closeModalBtn}>
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <div className={styles.tableThumbnail} style={{ width: "120px", height: "120px" }}>
                  <Image
                    src={optimizeAdminPreview(viewingProduct.imageUrl || "/images/products/hw2000.jpg")}
                    alt={viewingProduct.title}
                    width={110}
                    height={110}
                    loading="lazy"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#132c66" }}>{viewingProduct.title}</h4>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>SKU ID: <strong>{viewingProduct.id}</strong></div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>Brand: <strong>{viewingProduct.brand.toUpperCase()}</strong> | Category: <strong>{viewingProduct.category}</strong></div>
                  <div style={{ fontSize: "18px", fontWeight: "900", color: "#132c66", marginTop: "8px" }}>
                    ₹{viewingProduct.price.toLocaleString("en-IN")}{" "}
                    {viewingProduct.originalPrice > viewingProduct.price && (
                      <del style={{ fontSize: "13px", color: "#94a3b8" }}>₹{viewingProduct.originalPrice.toLocaleString("en-IN")}</del>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Player */}
              {viewingProduct.videoUrl && (
                <div>
                  <strong>Product Demonstration Video:</strong>
                  <video src={viewingProduct.videoUrl} controls style={{ width: "100%", maxHeight: "220px", borderRadius: "8px", marginTop: "6px" }}>
                    Your browser does not support video.
                  </video>
                </div>
              )}

              {/* Gallery */}
              {viewingProduct.gallery && viewingProduct.gallery.length > 0 && (
                <div>
                  <strong>Gallery Photos ({viewingProduct.gallery.length}):</strong>
                  <div className={styles.galleryThumbGrid} style={{ marginTop: "6px" }}>
                    {viewingProduct.gallery.map((img, idx) => (
                      <div key={idx} className={styles.galleryThumbCard}>
                        <Image
                          src={optimizeAdminPreview(img)}
                          alt={`Gallery ${idx}`}
                          width={60}
                          height={60}
                          loading="lazy"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specs & Description */}
              {viewingProduct.description && viewingProduct.description.length > 0 && (
                <div>
                  <strong>Key Features:</strong>
                  <ul style={{ margin: "4px 0 0 18px", fontSize: "13px", color: "#475569" }}>
                    {viewingProduct.description.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.modalActions}>
                <button onClick={() => setViewingProduct(null)} className={styles.cancelBtn}>
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    const p = viewingProduct;
                    setViewingProduct(null);
                    openEditProductModal(p);
                  }}
                  className={styles.submitBtn}
                  style={{ marginTop: 0 }}
                >
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: DELETE PRODUCT CONFIRMATION MODAL                   */}
      {/* ============================================================ */}
      {deletingProductId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: "440px", textAlign: "center" }}>
            <h3 style={{ color: "#ef4444", margin: "0 0 10px 0" }}>Delete Product?</h3>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px 0" }}>
              Are you sure you want to delete product SKU <strong>{deletingProductId}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => setDeletingProductId(null)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={() => handleDeleteProduct(deletingProductId)} className={styles.deleteBtn} style={{ padding: "8px 20px" }}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: DETAILED ORDER & SHIPROCKET LOGISTICS MODAL         */}
      {/* ============================================================ */}
      {selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: "720px" }}>
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0 }}>Order Details: {selectedOrder.orderNumber}</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className={styles.closeModalBtn}>
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
              {/* Customer & Address Card */}
              <div className={styles.orderDetailSection}>
                <h4>Customer &amp; Shipping Address</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13.5px" }}>
                  <div>
                    <strong>Customer Name:</strong> {selectedOrder.userName}<br />
                    <strong>Email:</strong> {selectedOrder.userEmail}<br />
                    <strong>Phone:</strong> {selectedOrder.userPhone || "N/A"}
                  </div>
                  <div>
                    <strong>Street:</strong> {selectedOrder.shippingAddress?.street || "Not specified"}<br />
                    <strong>City:</strong> {selectedOrder.shippingAddress?.city || "N/A"}<br />
                    <strong>State &amp; PIN:</strong> {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className={styles.orderDetailSection}>
                <h4>Items in this Order ({selectedOrder.items?.length || 0})</h4>
                <div className={styles.tableWrapper}>
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((it, idx) => (
                        <tr key={idx}>
                          <td>{it.title}</td>
                          <td>{it.quantity}</td>
                          <td>₹{it.price.toLocaleString("en-IN")}</td>
                          <td><strong>₹{(it.price * it.quantity).toLocaleString("en-IN")}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ textAlign: "right", marginTop: "12px", fontSize: "15px", fontWeight: "800", color: "#132c66" }}>
                  Grand Total (incl. GST): ₹{selectedOrder.grandTotal.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Shiprocket Logistics Dispatch Section */}
              <div className={styles.orderDetailSection} style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, color: "#166534" }}>Shiprocket Logistics Status</h4>
                  <span
                    style={{
                      background: selectedOrder.shiprocketAwbCode ? "#dcfce7" : "#fef9c3",
                      color: selectedOrder.shiprocketAwbCode ? "#15803d" : "#854d0e",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "800",
                    }}
                  >
                    {selectedOrder.shiprocketStatus || "pending_shipment"}
                  </span>
                </div>

                <div style={{ marginTop: "10px", fontSize: "13px", color: "#1e293b", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div>
                    <strong>Shiprocket Order ID:</strong> {selectedOrder.shiprocketOrderId || "Not dispatched yet"}<br />
                    <strong>Shipment ID:</strong> {selectedOrder.shiprocketShipmentId || "N/A"}<br />
                    <strong>Assigned Courier:</strong> {selectedOrder.shiprocketCourierName || "N/A"}
                  </div>
                  <div>
                    <strong>AWB Code:</strong> {selectedOrder.shiprocketAwbCode || "N/A"}<br />
                    {selectedOrder.shiprocketTrackingUrl && (
                      <a
                        href={selectedOrder.shiprocketTrackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#0284c7", fontWeight: "750", textDecoration: "underline" }}
                      >
                        Open Live Tracking ↗
                      </a>
                    )}
                  </div>
                </div>

                {selectedOrder.shipmentError && (
                  <div style={{ color: "#b91c1c", fontSize: "12px", marginTop: "8px", background: "#fef2f2", padding: "6px 10px", borderRadius: "6px" }}>
                    ⚠️ {selectedOrder.shipmentError}
                  </div>
                )}

                {/* Shiprocket Actions */}
                <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                  <button
                    onClick={() => handleRetryShiprocket(selectedOrder.orderNumber)}
                    disabled={orderActionLoading === selectedOrder.orderNumber}
                    className={styles.editBtn}
                    style={{ fontSize: "12.5px" }}
                  >
                    {orderActionLoading === selectedOrder.orderNumber ? "Processing..." : "🚀 Dispatch / Retry Shiprocket"}
                  </button>
                  {(selectedOrder.shiprocketAwbCode || selectedOrder.shiprocketShipmentId) && (
                    <button
                      onClick={() => handleSyncTracking(selectedOrder.orderNumber)}
                      disabled={orderActionLoading === selectedOrder.orderNumber}
                      className={styles.cancelBtn}
                      style={{ fontSize: "12.5px" }}
                    >
                      ↻ Sync Live Tracking
                    </button>
                  )}
                </div>
              </div>

              {/* Status Update Control */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "750" }}>Change Order Status:</label>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleOrderStatusChange(selectedOrder.orderNumber, e.target.value)}
                    className={styles.filterSelect}
                    style={{ width: "160px", height: "36px", fontSize: "12.5px" }}
                  >
                    <option value="processing">Processing</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: ADD / EDIT CATEGORY MODAL                           */}
      {/* ============================================================ */}
      {isCategoryModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: "560px" }}>
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0 }}>
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Define category name, brand, image, and dynamic slug
                </span>
              </div>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                }}
                className={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className={styles.form} style={{ marginTop: "16px" }}>
              {uploadError && (
                <div style={{ padding: "10px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "13px" }}>
                  {uploadError}
                </div>
              )}

              {/* Category Name */}
              <div className={styles.inputField}>
                <label htmlFor="cat-form-name">Category Name *</label>
                <input
                  id="cat-form-name"
                  type="text"
                  placeholder="e.g. High Pressure Washers, Foam Guns"
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                    setCategoryForm((prev) => ({
                      ...prev,
                      name,
                      id: editingCategory ? prev.id : autoSlug,
                      link: editingCategory ? prev.link : `/category/${autoSlug}`,
                    }));
                  }}
                  required
                />
              </div>

              {/* Category ID / Slug */}
              <div className={styles.inputField}>
                <label htmlFor="cat-form-id">Category ID / Slug *</label>
                <input
                  id="cat-form-id"
                  type="text"
                  placeholder="e.g. high-pressure-washer"
                  value={categoryForm.id}
                  onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value })}
                  required
                  disabled={!!editingCategory}
                />
                <span style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                  Used in URLs (e.g. /category/{categoryForm.id || "slug"})
                </span>
              </div>

              {/* Brand Selector */}
              <div className={styles.inputField}>
                <label htmlFor="cat-form-brand">Brand *</label>
                <select
                  id="cat-form-brand"
                  value={categoryForm.brand}
                  onChange={(e) => setCategoryForm({ ...categoryForm, brand: e.target.value })}
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                  <option value="custom">Other / Custom Brand</option>
                </select>
              </div>

              {categoryForm.brand === "custom" && (
                <div className={styles.inputField}>
                  <label htmlFor="cat-form-custom-brand">Custom Brand Name *</label>
                  <input
                    id="cat-form-custom-brand"
                    type="text"
                    placeholder="Enter custom brand"
                    value={categoryForm.customBrand}
                    onChange={(e) => setCategoryForm({ ...categoryForm, customBrand: e.target.value })}
                    required
                  />
                </div>
              )}

              {/* Category Image Upload */}
              <div className={styles.mediaUploadBox}>
                <label><strong>Category Image * (Upload or paste URL)</strong></label>
                <div className={styles.uploadRow}>
                  <input
                    id="cat-form-image"
                    type="text"
                    placeholder="https://res.cloudinary.com/... or upload"
                    value={categoryForm.imageUrl}
                    onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                    required
                    style={{ flex: 1, minWidth: "140px" }}
                  />
                  <label className={styles.uploadBtn}>
                    {isUploadingCategoryImg ? "Uploading..." : "📁 Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "category");
                      }}
                    />
                  </label>
                </div>
                {categoryForm.imageUrl && (
                  <div className={styles.mediaPreview} style={{ marginTop: "8px" }}>
                    <Image
                      src={optimizeAdminPreview(categoryForm.imageUrl)}
                      alt="Category Preview"
                      width={64}
                      height={64}
                      loading="lazy"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                )}
              </div>

              {/* Target Link & Display Order */}
              <div className={styles.inputGrid2}>
                <div className={styles.inputField}>
                  <label htmlFor="cat-form-link">Target Store Link</label>
                  <input
                    id="cat-form-link"
                    type="text"
                    placeholder="/category/slug or /shop/brand/category"
                    value={categoryForm.link}
                    onChange={(e) => setCategoryForm({ ...categoryForm, link: e.target.value })}
                  />
                </div>

                <div className={styles.inputField}>
                  <label htmlFor="cat-form-order">Display Order / Position (1, 2, 3...)</label>
                  <input
                    id="cat-form-order"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={categoryForm.order === 0 ? "" : categoryForm.order}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCategoryForm((prev) => ({
                        ...prev,
                        order: val === "" ? 0 : Math.max(1, parseInt(val, 10) || 1),
                      }));
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                    Lower number appears first (1st, 2nd, 3rd...).
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className={styles.inputField}>
                <label htmlFor="cat-form-desc">Category Description (Optional)</label>
                <textarea
                  id="cat-form-desc"
                  rows={2}
                  placeholder="Short description of this category for store catalog..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #cbd5e1" }}
                />
              </div>

              {/* Sub-Categories Section */}
              <div className={styles.subCategoryBuilder}>
                <label style={{ fontSize: "13px", fontWeight: "750", color: "#0f172a" }}>
                  🗂️ Sub-Categories ({categoryForm.subcategories.length})
                </label>
                <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                  Define sub-categories to organize products under this category (e.g., Domestic, Commercial, Spares)
                </span>

                <div className={styles.subCatInputRow}>
                  <input
                    type="text"
                    placeholder="Sub-category Name (e.g. Domestic Washer)"
                    value={newSubCatName}
                    onChange={(e) => setNewSubCatName(e.target.value)}
                    className={styles.subCatInput}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSubCategory();
                      }
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Slug (optional, auto-generated)"
                    value={newSubCatSlug}
                    onChange={(e) => setNewSubCatSlug(e.target.value)}
                    className={styles.subCatInput}
                    style={{ maxWidth: "160px" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSubCategory();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSubCategory}
                    className={styles.addSubCatBtn}
                  >
                    + Add
                  </button>
                </div>

                {categoryForm.subcategories.length > 0 ? (
                  <div className={styles.subCatTagList}>
                    {categoryForm.subcategories.map((sub) => (
                      <div key={sub.id} className={styles.subCatTagItem}>
                        <span>{sub.name} <code style={{ fontSize: "10px", color: "#64748b" }}>({sub.id})</code></span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubCategory(sub.id)}
                          className={styles.subCatRemoveBtn}
                          title="Remove Subcategory"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>
                    No sub-categories added yet. Type a name above and click &quot;+ Add&quot;.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={styles.modalActions} style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categoryActionLoading === "save" || isUploadingCategoryImg}
                  className={styles.submitBtn}
                  style={{ marginTop: 0 }}
                >
                  {categoryActionLoading === "save" ? "Saving..." : editingCategory ? "Update Category" : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD / EDIT BRAND MODAL                                */}
      {/* ============================================================ */}
      {isBrandModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: "560px" }}>
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0 }}>
                  {editingBrand ? "Edit Brand" : "Add New Brand"}
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Define brand name, logo, tagline, description, and store slug
                </span>
              </div>
              <button
                onClick={() => {
                  setIsBrandModalOpen(false);
                  setEditingBrand(null);
                }}
                className={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBrandSubmit} className={styles.form} style={{ marginTop: "16px" }}>
              {uploadError && (
                <div style={{ padding: "10px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "13px" }}>
                  {uploadError}
                </div>
              )}

              {/* Brand Name */}
              <div className={styles.inputField}>
                <label htmlFor="brand-form-name">Brand Name *</label>
                <input
                  id="brand-form-name"
                  type="text"
                  placeholder="e.g. TUQO, MAKITA, DEWALT"
                  value={brandForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                    setBrandForm((prev) => ({
                      ...prev,
                      name,
                      id: editingBrand ? prev.id : autoSlug,
                    }));
                  }}
                  required
                />
              </div>

              {/* Brand Slug / ID */}
              <div className={styles.inputField}>
                <label htmlFor="brand-form-id">Brand Slug / ID *</label>
                <input
                  id="brand-form-id"
                  type="text"
                  placeholder="e.g. tuqo, makita"
                  value={brandForm.id}
                  onChange={(e) => setBrandForm({ ...brandForm, id: e.target.value })}
                  required
                  disabled={!!editingBrand}
                />
                <span style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                  Used in URL paths (e.g. /shop/{brandForm.id || "brand-slug"})
                </span>
              </div>

              {/* Brand Logo Upload */}
              <div className={styles.mediaUploadBox}>
                <label><strong>Brand Logo * (Upload or paste URL)</strong></label>
                <div className={styles.uploadRow}>
                  <input
                    id="brand-form-logo"
                    type="text"
                    placeholder="https://res.cloudinary.com/... or upload"
                    value={brandForm.logo}
                    onChange={(e) => setBrandForm({ ...brandForm, logo: e.target.value })}
                    required
                    style={{ flex: 1, minWidth: "140px" }}
                  />
                  <label className={styles.uploadBtn}>
                    {isUploadingBrandLogoImg ? "Uploading..." : "📁 Upload Logo"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "brand");
                      }}
                    />
                  </label>
                </div>
                {brandForm.logo && (
                  <div className={styles.mediaPreview} style={{ marginTop: "8px", background: "#f8fafc", padding: "8px", borderRadius: "6px", display: "inline-block" }}>
                    <Image
                      src={optimizeAdminPreview(brandForm.logo)}
                      alt="Brand Logo Preview"
                      width={100}
                      height={40}
                      loading="lazy"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                )}
              </div>

              {/* Tagline */}
              <div className={styles.inputField}>
                <label htmlFor="brand-form-tagline">Tagline / Slogan (Optional)</label>
                <input
                  id="brand-form-tagline"
                  type="text"
                  placeholder="e.g. German Engineering Power Tools"
                  value={brandForm.tagline}
                  onChange={(e) => setBrandForm({ ...brandForm, tagline: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className={styles.inputField}>
                <label htmlFor="brand-form-desc">Description (Optional)</label>
                <textarea
                  id="brand-form-desc"
                  rows={2}
                  placeholder="Short overview of the brand and heritage..."
                  value={brandForm.description}
                  onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #cbd5e1" }}
                />
              </div>

              {/* Order & Visibility Grid */}
              <div className={styles.inputGrid2}>
                <div className={styles.inputField}>
                  <label htmlFor="brand-form-order">Display Order</label>
                  <input
                    id="brand-form-order"
                    type="number"
                    value={brandForm.order}
                    onChange={(e) => setBrandForm({ ...brandForm, order: Number(e.target.value) || 0 })}
                  />
                </div>

                <div className={styles.inputField} style={{ justifyContent: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "24px" }}>
                    <input
                      type="checkbox"
                      checked={brandForm.enabled}
                      onChange={(e) => setBrandForm({ ...brandForm, enabled: e.target.checked })}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a" }}>
                      Active / Enabled in Store
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.modalActions} style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsBrandModalOpen(false);
                    setEditingBrand(null);
                  }}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={brandActionLoading === "save" || isUploadingBrandLogoImg}
                  className={styles.submitBtn}
                  style={{ marginTop: 0 }}
                >
                  {brandActionLoading === "save" ? "Saving..." : editingBrand ? "Update Brand" : "Save Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
