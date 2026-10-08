import Razorpay from "razorpay";
import crypto from "crypto";
import dbConnect from "@/lib/db/mongodb";
import { Product } from "@/lib/schemas";
import { getProductById, getAllCatalogProducts } from "@/data/categories";

interface ResolvedProductDoc {
  title?: string;
  price?: number;
  imageUrl?: string;
  inStock?: boolean;
  stockQuantity?: number;
  variants?: Array<{
    id?: string;
    sku?: string;
    name?: string;
    inStock?: boolean;
    stockQuantity?: number;
  }>;
}

export interface CheckoutItemInput {
  id: string;
  quantity: number;
}

export interface VerifiedItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  subtotal: number;
}

export interface VerifiedOrderCalculation {
  items: VerifiedItem[];
  subtotal: number;
  gst: number;
  shipping: number;
  couponCode?: string;
  couponDiscount: number;
  couponAppliedProductId?: string;
  grandTotal: number;
  amountInPaise: number;
}

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials missing. Please define RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables."
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Validates and recalculates product prices strictly on the server-side.
 * Accurately applies SKU-locked coupon discounts to matching products.
 */
export async function calculateVerifiedOrder(
  cartItems: CheckoutItemInput[],
  couponCode?: string
): Promise<VerifiedOrderCalculation> {
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("Cart is empty or invalid items provided.");
  }

  await dbConnect();

  const allCatalog = getAllCatalogProducts();
  const catalogMap = new Map<string, { title: string; price: number; imageUrl: string }>();

  // Populate static catalog map
  allCatalog.forEach((p) => {
    catalogMap.set(p.id, {
      title: p.title,
      price: p.price,
      imageUrl: p.imageUrl,
    });
  });

  const verifiedItems: VerifiedItem[] = [];
  let subtotal = 0;

  for (const rawItem of cartItems) {
    const productId = String(rawItem.id).trim();
    const quantity = Math.max(1, Math.floor(Number(rawItem.quantity) || 1));

    let productTitle = "";
    let productPrice = 0;
    let productImageUrl = "";

    let resolvedDbProduct: ResolvedProductDoc | null = null;

    // 1. Try finding in MongoDB Product collection
    try {
      const dbProduct = (await Product.findOne({
        $or: [{ id: productId }, ...(productId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: productId }] : [])],
      }).lean()) as unknown as ResolvedProductDoc | null;

      if (dbProduct && typeof dbProduct.price === "number" && dbProduct.price > 0) {
        resolvedDbProduct = dbProduct;
        productTitle = dbProduct.title || `Product ${productId}`;
        productPrice = dbProduct.price;
        productImageUrl = dbProduct.imageUrl || "";
      }
    } catch {
      // Fallback to static catalog if DB query errors
    }

    // 2. Fallback to static category dataset
    if (!productPrice) {
      const catProduct = getProductById(productId) || catalogMap.get(productId);
      if (catProduct && typeof catProduct.price === "number" && catProduct.price > 0) {
        productTitle = catProduct.title;
        productPrice = catProduct.price;
        productImageUrl = catProduct.imageUrl;
      }
    }

    // 3. If item cannot be resolved, reject order for security
    if (!productPrice || productPrice <= 0) {
      throw new Error(`Invalid or unavailable product in cart: ID ${productId}`);
    }

    // 4. Strict Stock Quantity & Out-of-Stock Server Validation
    if (resolvedDbProduct) {
      const isOutOfStock = resolvedDbProduct.inStock === false || (typeof resolvedDbProduct.stockQuantity === "number" && resolvedDbProduct.stockQuantity <= 0);
      if (isOutOfStock) {
        throw new Error(`Product "${productTitle}" is currently out of stock.`);
      }

      const availableStock = typeof resolvedDbProduct.stockQuantity === "number" ? resolvedDbProduct.stockQuantity : 10;
      if (quantity > availableStock) {
        throw new Error(`Only ${availableStock} piece(s) available in stock for "${productTitle}". Please reduce your cart quantity to ${availableStock}.`);
      }

      // Check variant stock if applicable
      if (resolvedDbProduct.variants && Array.isArray(resolvedDbProduct.variants)) {
        const matchingVar = resolvedDbProduct.variants.find((v) => {
          const vSku = (v.sku || "").toLowerCase().trim();
          const vId = (v.id || "").toLowerCase().trim();
          const rawIdLower = productId.toLowerCase().trim();
          return (vSku && vSku === rawIdLower) || (vId && vId === rawIdLower);
        });

        if (matchingVar) {
          const isVarOutOfStock = matchingVar.inStock === false || (typeof matchingVar.stockQuantity === "number" && matchingVar.stockQuantity <= 0);
          if (isVarOutOfStock) {
            throw new Error(`Variant "${matchingVar.name || matchingVar.sku || productTitle}" is currently out of stock.`);
          }
          const varAvailableStock = typeof matchingVar.stockQuantity === "number" ? matchingVar.stockQuantity : 10;
          if (quantity > varAvailableStock) {
            throw new Error(`Only ${varAvailableStock} piece(s) available for "${matchingVar.name || productTitle}". Please adjust your cart quantity to ${varAvailableStock}.`);
          }
        }
      }
    }

    const itemSubtotal = productPrice * quantity;
    subtotal += itemSubtotal;

    verifiedItems.push({
      productId,
      title: productTitle || `Product ${productId}`,
      price: productPrice,
      quantity,
      imageUrl: productImageUrl || "/images/products/hw2000.jpg",
      subtotal: itemSubtotal,
    });
  }

  // 4. Validate and calculate SKU-locked Coupon Discount
  let couponDiscount = 0;
  let cleanCouponCode = "";
  let couponAppliedProductId = "";

  if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
    cleanCouponCode = couponCode.trim().toUpperCase();
    try {
      const dbCouponProduct = (await Product.findOne({
        couponCode: { $regex: new RegExp(`^${cleanCouponCode}$`, "i") },
        couponIsActive: { $ne: false },
      }).lean()) as {
        id?: string;
        title?: string;
        couponDiscountType?: "percentage" | "flat";
        couponDiscountValue?: number;
      } | null;

      if (dbCouponProduct && dbCouponProduct.id) {
        // Find matching item in cart
        const matchingItem = verifiedItems.find(
          (it) => it.productId.toLowerCase() === dbCouponProduct.id?.toLowerCase()
        );

        if (matchingItem) {
          couponAppliedProductId = dbCouponProduct.id;
          const discVal = Number(dbCouponProduct.couponDiscountValue) || 0;
          if (dbCouponProduct.couponDiscountType === "percentage") {
            couponDiscount = Math.round((matchingItem.price * matchingItem.quantity) * (discVal / 100));
          } else {
            couponDiscount = Math.min(discVal, matchingItem.price * matchingItem.quantity);
          }
        }
      }
    } catch (couponErr) {
      console.warn("Coupon verification error:", couponErr);
    }
  }

  // Consistent tax & grand total calculation
  // All product prices are already inclusive of GST/taxes and shipping is Free
  const gst = 0;
  const shipping = 0;
  const grandTotal = Math.max(1, subtotal - couponDiscount + shipping);
  const amountInPaise = Math.round(grandTotal * 100);

  return {
    items: verifiedItems,
    subtotal,
    gst,
    shipping,
    couponCode: couponDiscount > 0 ? cleanCouponCode : undefined,
    couponDiscount,
    couponAppliedProductId: couponDiscount > 0 ? couponAppliedProductId : undefined,
    grandTotal,
    amountInPaise,
  };
}

/**
 * Server-side payment signature verification using HMAC SHA256.
 */
export function verifyPaymentSignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("RAZORPAY_KEY_SECRET environment variable is not defined.");
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return generatedSignature === razorpaySignature;
}
