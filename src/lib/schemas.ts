import mongoose, { Schema, Document, Model } from "mongoose";

// Product Interface
export interface IProduct extends Document {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  videoUrl?: string;
  gallery: string[];
  rating: number;
  ratingCount: number;
  brand: string;
  category: string;
  subCategory: string; // "domestic" | "commercial" | "accessory"
  description: string[];
  specifications: string[];
  whatsInBox: string[];
  inStock: boolean;
  isBestSeller?: boolean;
}

const ProductSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    videoUrl: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    rating: { type: Number, default: 5 },
    ratingCount: { type: Number, default: 0 },
    brand: { type: String, required: true }, // e.g. "tuqo", "pumpkin"
    category: { type: String, required: true }, // e.g. "high-pressure-washer", "vaccum"
    subCategory: { type: String, default: "domestic" }, // "domestic", "commercial", "accessory"
    description: { type: [String], default: [] },
    specifications: { type: [String], default: [] },
    whatsInBox: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
    isBestSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);


// Subcategory Interface
export interface ISubCategory {
  id: string; // slug e.g. "domestic-pressure-washer"
  name: string; // e.g. "Domestic Pressure Washer"
  description?: string;
  imageUrl?: string;
}

const SubCategorySchema: Schema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { _id: false }
);

// Category Interface
export interface ICategory extends Document {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  link: string;
  description?: string;
  subcategories?: ISubCategory[];
}

const CategorySchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brand: { type: String, required: true }, // e.g. "tuqo", "pumpkin"
    imageUrl: { type: String, required: true },
    link: { type: String, required: true }, // e.g. "/shop/tuqo/high-pressure-washer"
    description: { type: String, default: "" },
    subcategories: { type: [SubCategorySchema], default: [] },
  },
  { timestamps: true }
);

// Banner Interface
export interface IBanner extends Document {
  id: string;
  imageUrl: string;
  link: string;
}

const BannerSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    imageUrl: { type: String, required: true },
    link: { type: String, default: "/" },
  },
  { timestamps: true }
);

// Enquiry Interface
export interface IEnquiry extends Document {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

const EnquirySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

// Review Interface
export interface IReview extends Document {
  productId: string;
  productTitle: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    productId: { type: String, required: true, index: true },
    productTitle: { type: String, default: "" },
    userName: { type: String, required: true },
    userEmail: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "" },
    comment: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

import {
  IBrandItem,
  IUspItem,
  ISummerOfferItem,
  IHomeSettingsConfig,
  DEFAULT_HOME_SETTINGS,
} from "./homeDefaults";

export type { IBrandItem, IUspItem, ISummerOfferItem, IHomeSettingsConfig };
export { DEFAULT_HOME_SETTINGS };

export interface IHomeSettings extends Document, IHomeSettingsConfig {}

const BrandItemSchema = new Schema(
  {
    id: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    logo: { type: String, required: true },
    tagline: { type: String, default: "" },
    width: { type: Number, default: 110 },
    height: { type: Number, default: 34 },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const UspItemSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const SummerOfferItemSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, default: "" },
    imageUrl: { type: String, required: true },
    link: { type: String, default: "/shop" },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const HomeSettingsSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, default: "default" },
    announcement: {
      enabled: { type: Boolean, default: true },
      text: { type: String, default: "*2% Discount On Prepaid Orders / Free Shipment & COD Available*" },
    },
    brandsSection: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: "SHOP BY BRANDS" },
      subtitle: { type: String, default: "OFFICIAL PARTNERS" },
      brands: { type: [BrandItemSchema], default: [] },
    },
    trustMarquee: {
      enabled: { type: Boolean, default: true },
      items: { type: [UspItemSchema], default: [] },
    },
    summerOffer: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: "PREMIUM SUMMER OFFER" },
      offers: { type: [SummerOfferItemSchema], default: [] },
    },
  },
  { timestamps: true }
);

// Exports
export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export const Banner: Model<IBanner> =
  mongoose.models.Banner || mongoose.model<IBanner>("Banner", BannerSchema);

export const Enquiry: Model<IEnquiry> =
  mongoose.models.Enquiry || mongoose.model<IEnquiry>("Enquiry", EnquirySchema);

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export const HomeSettings: Model<IHomeSettings> =
  mongoose.models.HomeSettings || mongoose.model<IHomeSettings>("HomeSettings", HomeSettingsSchema);

export { default as Order } from "@/models/Order";
export type { IOrder, IOrderItem, IShippingAddress } from "@/models/Order";

