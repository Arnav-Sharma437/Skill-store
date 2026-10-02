import fs from "fs";
import path from "path";
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

// Helper to ensure .env.production / .env.local are parsed if Next.js/PM2 runtime missed them
let envLoaded = false;
function ensureEnvLoaded() {
  if (envLoaded) return;
  envLoaded = true;

  const candidatePaths = [
    path.join(process.cwd(), ".env.production"),
    path.join(process.cwd(), ".env.production.local"),
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env"),
    "/var/www/skill-store/.env.production",
    "/var/www/skill-store/.env.production.local",
    "/var/www/skill-store/.env.local",
    "/var/www/skill-store/.env",
  ];

  for (const envPath of candidatePaths) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ envPath)) {
        const content = fs.readFileSync(/*turbopackIgnore: true*/ envPath, "utf-8");
        const lines = content.split(/\r?\n/);
        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line || line.startsWith("#")) continue;
          const eqIdx = line.indexOf("=");
          if (eqIdx > 0) {
            const key = line.substring(0, eqIdx).trim();
            let val = line.substring(eqIdx + 1).trim();
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            if (key && (!process.env[key] || process.env[key]?.trim() === "")) {
              process.env[key] = val;
            }
          }
        }
      }
    } catch {
      // Ignore file reading errors
    }
  }
}

// Helper to get trimmed env var across common alias names
function getEnv(keys: string[]): string | undefined {
  ensureEnvLoaded();
  for (const key of keys) {
    const val = process.env[key];
    if (val && typeof val === "string" && val.trim().length > 0) {
      return val.trim().replace(/^["']|["']$/g, "").trim();
    }
  }
  return undefined;
}

/**
 * Generates or retrieves cached Shiprocket JWT authentication token
 */
export async function getShiprocketToken(forceRefresh = false): Promise<string | null> {
  ensureEnvLoaded();

  // If a direct token is configured in environment, use it
  const directToken = getEnv([
    "SHIPROCKET_TOKEN",
    "SHIPROCKET_AUTH_TOKEN",
    "SHIPROCKET_BEARER_TOKEN",
    "SR_TOKEN",
  ]);
  if (directToken && !forceRefresh) {
    return directToken;
  }

  // Return cached token if still valid
  if (!forceRefresh && cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const email = getEnv([
    "SHIPROCKET_EMAIL",
    "SHIPROCKET_USER",
    "SHIPROCKET_USERNAME",
    "SHIPROCKET_AUTH_EMAIL",
    "SHIPROCKET_API_EMAIL",
    "SHIPROCKET_LOGIN",
    "SHIPROCKET_ID",
    "SHIP_ROCKET_EMAIL",
    "SR_EMAIL",
    "SHIPROCKET_USER_EMAIL",
  ]);

  const password = getEnv([
    "SHIPROCKET_PASSWORD",
    "SHIPROCKET_PASS",
    "SHIPROCKET_AUTH_PASSWORD",
    "SHIPROCKET_API_PASSWORD",
    "SHIPROCKET_SECRET",
    "SHIP_ROCKET_PASSWORD",
    "SR_PASSWORD",
    "SR_PASS",
  ]);

  if (!email || !password) {
    console.warn("[Shiprocket] Credentials (SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD) not configured in environment.");
    return null;
  }

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const resText = await res.text();
    let data: ShiprocketAuthResponse = {};
    try {
      data = JSON.parse(resText);
    } catch {
      // not json
    }

    if (!res.ok) {
      console.error(`[Shiprocket] Auth failed with HTTP ${res.status}`);
      return null;
    }

    if (data.token && typeof data.token === "string" && data.token.trim().length > 0) {
      cachedToken = data.token.trim();
      // Cache for 7 days (Shiprocket tokens expire in 10 days)
      tokenExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      return cachedToken;
    }

    console.error("[Shiprocket] Login response missing token");
    return null;
  } catch (error) {
    console.error("[Shiprocket] Network error during authentication:", error instanceof Error ? error.message : error);
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

  for (const item of items || []) {
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
 * Automatically create a Shiprocket order after successful payment confirmation or manual dispatch
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
  let token = await getShiprocketToken();
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

  const phone = (shipping.phone || order.userPhone || "9500694111").replace(/\D/g, "") || "9500694111";
  const email = order.userEmail || "support.skillstore@gmail.com";

  const street = (shipping.street || "Main Market / Commercial Address").trim();
  const city = (shipping.city || "New Delhi").trim();
  const state = (shipping.state || "Delhi").trim();
  const pincode = (shipping.pincode || "110001").trim();
  const country = (shipping.country || "India").trim();

  const specs = estimatePackageSpecs(order.items);
  const pickupLocation = getEnv([
    "SHIPROCKET_PICKUP_LOCATION",
    "SHIPROCKET_PICKUP",
    "SHIPROCKET_LOCATION",
    "SR_PICKUP_LOCATION",
  ]) || "Primary";

  const orderDate = new Date(order.createdAt || Date.now())
    .toISOString()
    .slice(0, 16)
    .replace("T", " ");

  const orderItems = (order.items || []).map((item, idx) => ({
    name: item.title || `Item ${idx + 1}`,
    sku: item.productId || `SKU-${idx + 1}`,
    units: Math.max(1, item.quantity || 1),
    selling_price: Math.max(1, Math.round(item.price || 1)),
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
    sub_total: Math.max(1, order.grandTotal || 1),
    length: specs.lengthCm,
    breadth: specs.breadthCm,
    height: specs.heightCm,
    weight: specs.weightKg,
  };

  const callOrderApi = async (authToken: string) => {
    return fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });
  };

  try {
    let res = await callOrderApi(token);

    // If 401 Unauthorized, token might have expired on Shiprocket server - force refresh and retry once
    if (res.status === 401) {
      console.warn("[Shiprocket] 401 Unauthorized on order create, refreshing token and retrying...");
      token = await getShiprocketToken(true);
      if (token) {
        res = await callOrderApi(token);
      }
    }

    const data: ShiprocketOrderResponse = await res.json();

    if (!res.ok) {
      console.error("[Shiprocket] Order creation error response:", data);
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
    console.error("[Shiprocket] Network or parsing error during order creation:", error);
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
  let token = await getShiprocketToken();
  if (!token) {
    return { success: false, error: "Shiprocket credentials missing or failed to authenticate." };
  }

  let endpoint = "";
  if (awbCode) {
    endpoint = `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${encodeURIComponent(awbCode.trim())}`;
  } else if (shipmentId) {
    endpoint = `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${encodeURIComponent(String(shipmentId).trim())}`;
  } else if (orderId) {
    endpoint = `https://apiv2.shiprocket.in/v1/external/courier/track?order_id=${encodeURIComponent(String(orderId).trim())}`;
  } else {
    return { success: false, error: "No tracking identifier provided (awb, shipmentId, or orderId)." };
  }

  const callTrackApi = async (authToken: string) => {
    return fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  };

  try {
    let res = await callTrackApi(token);

    if (res.status === 401) {
      token = await getShiprocketToken(true);
      if (token) {
        res = await callTrackApi(token);
      }
    }

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
    console.error("[Shiprocket] Error tracking shipment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to connect to Shiprocket tracking",
    };
  }
}
