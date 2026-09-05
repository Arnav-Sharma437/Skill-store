import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  subtotal: number;
}

export interface IShippingAddress {
  name?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface IDimensions {
  length: number;
  breadth: number;
  height: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  items: IOrderItem[];
  subtotal: number;
  gst: number;
  shipping: number;
  grandTotal: number;
  currency: string;
  paymentStatus: "paid" | "failed" | "pending";
  orderStatus: "processing" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  shippingAddress?: IShippingAddress;
  receipt?: string;

  // Shiprocket Logistics Details
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  shiprocketAwbCode?: string;
  shiprocketCourierName?: string;
  shiprocketStatus?: string;
  shiprocketTrackingUrl?: string;
  shipmentError?: string;
  weight?: number; // In kg
  dimensions?: IDimensions;

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    imageUrl: { type: String, default: "" },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const DimensionsSchema = new Schema<IDimensions>(
  {
    length: { type: Number, default: 20 },
    breadth: { type: Number, default: 15 },
    height: { type: Number, default: 10 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
      default: null,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userPhone: {
      type: String,
      default: "",
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(val: IOrderItem[]) => val.length > 0, "Order must contain at least 1 item"],
    },
    subtotal: {
      type: Number,
      required: true,
    },
    gst: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "failed", "pending"],
      default: "pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ["processing", "confirmed", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    paymentMethod: {
      type: String,
      default: "Razorpay",
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    razorpaySignature: {
      type: String,
      default: "",
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      default: {},
    },
    receipt: {
      type: String,
      default: "",
    },

    // Shiprocket Logistics Integration Fields
    shiprocketOrderId: {
      type: String,
      default: "",
      index: true,
    },
    shiprocketShipmentId: {
      type: String,
      default: "",
      index: true,
    },
    shiprocketAwbCode: {
      type: String,
      default: "",
      index: true,
    },
    shiprocketCourierName: {
      type: String,
      default: "",
    },
    shiprocketStatus: {
      type: String,
      default: "pending_shipment",
    },
    shiprocketTrackingUrl: {
      type: String,
      default: "",
    },
    shipmentError: {
      type: String,
      default: "",
    },
    weight: {
      type: Number,
      default: 1.5,
    },
    dimensions: {
      type: DimensionsSchema,
      default: () => ({ length: 20, breadth: 15, height: 10 }),
    },
  },
  {
    timestamps: true,
  }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
