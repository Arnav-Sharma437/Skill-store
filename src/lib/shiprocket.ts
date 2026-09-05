import { IOrder, IOrderItem } from "@/models/Order";

interface ShiprocketAuthResponse {
  token?: string;
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  message?: string;
}

interface ShiprocketOrderResponse {
  order_id?: number | string;
  shipment_id?: number | string;
  status?: string;
  status_code?: number;
  awb_code?: string;
  courier_name?: string;
  courier_company_id?: number;
  message?: string;
  errors?: Record<string, string[]>;
}

interface ShiprocketTrackResponse {
  tracking_data?: {
    track_status?: number;
    shipment_status?: number;
    shipment_track?: Array<{
      id?: number;
      current_status?: string;
      origin?: string;
      destination?: string;
      courier_name?: string;
      location?: string;
      delivered_to?: string;
      etd?: string;
    }>;
    shipment_track_activities?: Array<{
      date?: string;
      status?: string;
      activity?: string;
      location?: string;
      "sr-status"?: string;
    }>;
    track_url?: string;
  };
  message?: string;
}

// In-memory token cache with expiration
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Generates or retrieves cached Shiprocket JWT authentication token
 */
export async function getShiprocketToken(): Promise<string | null> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    console.warn("Shiprocket credentials (SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD) are not configured.");
    return null;
  }

  // Return cached token if valid (valid for 8 days)
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`Shiprocket authentication failed (${res.status}):`, errBody);
      return null;
    }

    const data: ShiprocketAuthResponse = await res.json();
    if (data.token) {
      cachedToken = data.token;
      // Cache token for 7 days (Shiprocket tokens expire in 10 days)
      tokenExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      return cachedToken;
    }

    console.error("Shiprocket login response missing token:", data);
    return null;
  } catch (error) {
    console.error("Error authenticating with Shiprocket API:", error);
    return null;
  }
}

/**
 * Intelligent package weight & dimensions estimation for industrial/machinery products
 */
export function estimatePackageSpecs(items: IOrderItem[]) {
  let totalWeightKg = 0;
  let maxDimLength = 20;
  let maxDimBreadth = 15;
  let maxDimHeight = 10;

  for (const item of items) {
    const title = (item.title || "").toLowerCase();
    const qty = Math.max(1, item.quantity || 1);

    let unitWeight = 1.5; // Default baseline kg
    let uLength = 25;
    let uBreadth = 20;
    let uHeight = 15;

    if (title.includes("compressor")) {
      unitWeight = 18.0;
      uLength = 60;
      uBreadth = 35;
      uHeight = 55;
    } else if (title.includes("high pressure washer") || title.includes("washer")) {
      unitWeight = 9.5;
      uLength = 40;
      uBreadth = 30;
      uHeight = 35;
    } else if (title.includes("vaccum") || title.includes("vacuum")) {
      unitWeight = 6.0;
      uLength = 45;
      uBreadth = 35;
      uHeight = 40;
    } else if (title.includes("cordless") || title.includes("drill") || title.includes("tool")) {
      unitWeight = 3.0;
      uLength = 30;
      uBreadth = 20;
      uHeight = 15;
    } else if (title.includes("nozzle") || title.includes("gun") || title.includes("foam") || title.includes("pipe") || title.includes("hose")) {
      unitWeight = 0.8;
      uLength = 20;
      uBreadth = 15;
      uHeight = 10;
    }

    totalWeightKg += unitWeight * qty;
    maxDimLength = Math.max(maxDimLength, uLength);
    maxDimBreadth = Math.max(maxDimBreadth, uBreadth);
    maxDimHeight = Math.max(maxDimHeight, uHeight + (qty > 1 ? (qty - 1) * 4 : 0));
  }

  return {
    weightKg: Math.max(0.5, Math.round(totalWeightKg * 10) / 10),
    lengthCm: Math.min(150, Math.round(maxDimLength)),
    breadthCm: Math.min(150, Math.round(maxDimBreadth)),
    heightCm: Math.min(150, Math.round(maxDimHeight)),
  };
}

/**
 * Automatically create a Shiprocket order after successful payment confirmation
 */
export async function createShiprocketOrder(order: IOrder): Promise<{
  success: boolean;
  shiprocketOrderId?: string;
  shipmentId?: string;
  awbCode?: string;
  courierName?: string;
  status?: string;
  trackingUrl?: string;
  error?: string;
}> {
  const token = await getShiprocketToken();
  if (!token) {
    return {
      success: false,
      error: "Shiprocket credentials missing or failed to authenticate with Shiprocket API.",
    };
  }

  const shipping = order.shippingAddress || {};
  const fullName = (shipping.name || order.userName || "Customer").trim();
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0] || "Valued";
  const lastName = nameParts.slice(1).join(" ") || "Customer";

  const phone = (shipping.phone || order.userPhone || "9999999999").replace(/\D/g, "") || "9999999999";
  const email = order.userEmail || "customer@skillstore.in";

  const street = (shipping.street || "Main Market / Commercial Address").trim();
  const city = (shipping.city || "New Delhi").trim();
  const state = (shipping.state || "Delhi").trim();
  const pincode = (shipping.pincode || "110001").trim();
  const country = (shipping.country || "India").trim();

  const specs = estimatePackageSpecs(order.items);
  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || "Primary";

  const orderDate = new Date(order.createdAt || Date.now())
    .toISOString()
    .slice(0, 16)
    .replace("T", " ");

  const orderItems = order.items.map((item) => ({
    name: item.title,
    sku: item.productId || `SKU-${item.productId}`,
    units: Math.max(1, item.quantity),
    selling_price: Math.round(item.price),
    discount: 0,
    tax: 18,
    hsn: 8424,
  }));

  const paymentMethod = order.paymentMethod?.toLowerCase().includes("cod")
    ? "COD"
    : "Prepaid";

  const payload = {
    order_id: order.orderNumber,
    order_date: orderDate,
    pickup_location: pickupLocation,
    channel_id: "",
    comment: "Skill Store Tools & Machinery Order",
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: street,
    billing_address_2: "",
    billing_city: city,
    billing_pincode: pincode,
    billing_state: state,
    billing_country: country,
    billing_email: email,
    billing_phone: phone,
    shipping_is_billing: true,
    shipping_customer_name: firstName,
    shipping_last_name: lastName,
    shipping_address: street,
    shipping_address_2: "",
    shipping_city: city,
    shipping_pincode: pincode,
    shipping_state: state,
    shipping_country: country,
    shipping_email: email,
    shipping_phone: phone,
    order_items: orderItems,
    payment_method: paymentMethod,
    shipping_charges: order.shipping || 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: order.grandTotal,
    length: specs.lengthCm,
    breadth: specs.breadthCm,
    height: specs.heightCm,
    weight: specs.weightKg,
  };

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data: ShiprocketOrderResponse = await res.json();

    if (!res.ok) {
      console.error("Shiprocket order creation error response:", data);
      const errMsg =
        data.message ||
        (data.errors ? JSON.stringify(data.errors) : `HTTP ${res.status} error from Shiprocket`);
      return {
        success: false,
        error: errMsg,
      };
    }

    const shiprocketOrderId = data.order_id ? String(data.order_id) : undefined;
    const shipmentId = data.shipment_id ? String(data.shipment_id) : undefined;
    const awbCode = data.awb_code ? String(data.awb_code) : undefined;
    const courierName = data.courier_name || undefined;
    const status = data.status || "NEW";
    const trackingUrl = awbCode
      ? `https://shiprocket.co/tracking/${awbCode}`
      : shipmentId
      ? `https://shiprocket.co/tracking/shipment/${shipmentId}`
      : "";

    return {
      success: true,
      shiprocketOrderId,
      shipmentId,
      awbCode,
      courierName,
      status,
      trackingUrl,
    };
  } catch (error) {
    console.error("Network or parsing error calling Shiprocket order creation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error calling Shiprocket",
    };
  }
}

/**
 * Track live shipment status and scan activities via Shiprocket
 */
export async function trackShiprocketShipment({
  awbCode,
  shipmentId,
  orderId,
}: {
  awbCode?: string;
  shipmentId?: string;
  orderId?: string;
}): Promise<{
  success: boolean;
  currentStatus?: string;
  location?: string;
  etd?: string;
  courierName?: string;
  trackingUrl?: string;
  activities?: Array<{ date?: string; status?: string; activity?: string; location?: string }>;
  error?: string;
}> {
  const token = await getShiprocketToken();
  if (!token) {
    return { success: false, error: "Shiprocket credentials missing." };
  }

  let endpoint = "";
  if (awbCode) {
    endpoint = `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`;
  } else if (shipmentId) {
    endpoint = `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`;
  } else if (orderId) {
    endpoint = `https://apiv2.shiprocket.in/v1/external/courier/track?order_id=${orderId}`;
  } else {
    return { success: false, error: "No tracking identifier provided (awb, shipmentId, or orderId)." };
  }

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data: ShiprocketTrackResponse = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || `Failed to track shipment (${res.status})` };
    }

    const trackData = data.tracking_data;
    const trackInfo = trackData?.shipment_track?.[0];
    const activities = trackData?.shipment_track_activities || [];
    const trackingUrl = trackData?.track_url || (awbCode ? `https://shiprocket.co/tracking/${awbCode}` : "");

    return {
      success: true,
      currentStatus: trackInfo?.current_status || (trackData?.track_status === 1 ? "In Transit" : "Processing"),
      location: trackInfo?.location || "",
      etd: trackInfo?.etd || "",
      courierName: trackInfo?.courier_name || "",
      trackingUrl,
      activities,
    };
  } catch (error) {
    console.error("Error tracking Shiprocket shipment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to connect to Shiprocket tracking",
    };
  }
}
