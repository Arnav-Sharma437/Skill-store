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
  status_code?: number;
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
  errors?: Record<string, string[] | string>;
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
 * Robust filesystem environment variable loader
 * Checks multiple candidates and handles BOM, 'export ' prefixes, comments, and quotes
 */
function parseEnvFile(filePath: string) {
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ filePath)) return;
    let content = fs.readFileSync(/*turbopackIgnore: true*/ filePath, "utf-8");
    // Remove BOM if present
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }
    const lines = content.split(/\r?\n/);
    for (const rawLine of lines) {
      let line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      // Strip leading 'export '
      if (line.startsWith("export ")) {
        line = line.substring(7).trim();
      }
      const eqIdx = line.indexOf("=");
      if (eqIdx > 0) {
        const key = line.substring(0, eqIdx).trim();
        let val = line.substring(eqIdx + 1).trim();

        // Strip inline comments if not inside quotes
        if (!val.startsWith('"') && !val.startsWith("'")) {
          const hashIdx = val.indexOf("#");
          if (hashIdx >= 0) {
            val = val.substring(0, hashIdx).trim();
          }
        }

        // Strip quotes
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }

        if (key) {
          process.env[key] = val;
        }
      }
    }
  } catch {
    // Ignore file read error
  }
}

function loadAllPossibleEnvFiles() {
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

  for (const p of candidatePaths) {
    parseEnvFile(p);
  }
}

/**
 * Retrieve environment variable by checking exact names, aliases, and fuzzy match
 */
function getEnvValue(primaryKeys: string[], fallbackSubstring: string[]): string | undefined {
  loadAllPossibleEnvFiles();

  // 1. Direct match on primary alias keys
  for (const k of primaryKeys) {
    const v = process.env[k];
    if (v && typeof v === "string" && v.trim().length > 0) {
      return v.trim().replace(/^["']|["']$/g, "").trim();
    }
  }

  // 2. Case-insensitive / fuzzy scan over all process.env keys
  const allKeys = Object.keys(process.env);
  for (const k of allKeys) {
    const upper = k.toUpperCase().replace(/[^A-Z0-9]/g, "");
    for (const sub of fallbackSubstring) {
      if (upper.includes(sub)) {
        const v = process.env[k];
        if (v && typeof v === "string" && v.trim().length > 0) {
          return v.trim().replace(/^["']|["']$/g, "").trim();
        }
      }
    }
  }

  return undefined;
}

export async function getShiprocketAuth(forceRefresh = false): Promise<{ token: string | null; error?: string }> {
  // If direct token is provided, use it
  const directToken = getEnvValue(
    ["SHIPROCKET_TOKEN", "SHIPROCKET_AUTH_TOKEN", "SHIPROCKET_BEARER_TOKEN", "SR_TOKEN"],
    ["SHIPROCKETTOKEN", "SRTOKEN"]
  );
  if (directToken && !forceRefresh) {
    return { token: directToken };
  }

  // Return cached token if valid
  if (!forceRefresh && cachedToken && Date.now() < tokenExpiresAt) {
    return { token: cachedToken };
  }

  const email = getEnvValue(
    [
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
    ],
    ["SHIPROCKETEMAIL", "SHIPROCKETUSER", "SREMAIL", "SHIPROCKETLOGIN"]
  );

  const password = getEnvValue(
    [
      "SHIPROCKET_PASSWORD",
      "SHIPROCKET_PASS",
      "SHIPROCKET_AUTH_PASSWORD",
      "SHIPROCKET_API_PASSWORD",
      "SHIPROCKET_SECRET",
      "SHIP_ROCKET_PASSWORD",
      "SR_PASSWORD",
      "SR_PASS",
    ],
    ["SHIPROCKETPASSWORD", "SHIPROCKETPASS", "SRPASSWORD", "SRPASS", "SHIPROCKETSECRET"]
  );

  if (!email || !password) {
    const missing = [];
    if (!email) missing.push("SHIPROCKET_EMAIL");
    if (!password) missing.push("SHIPROCKET_PASSWORD");
    const errMsg = `Shiprocket credentials missing: ${missing.join(", ")} not found in environment or .env.production.`;
    console.warn(`[Shiprocket] ${errMsg}`);
    return { token: null, error: errMsg };
  }

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "SkillStore/1.0",
      },
      body: JSON.stringify({ email, password }),
    });

    const resText = await res.text();
    let data: ShiprocketAuthResponse = {};
    try {
      data = JSON.parse(resText);
    } catch {
      // ignore
    }

    if (!res.ok) {
      const errMsg = data.message || `Shiprocket auth failed (HTTP ${res.status}): ${resText.slice(0, 150)}`;
      console.error(`[Shiprocket] Auth failed:`, errMsg);
      return { token: null, error: errMsg };
    }

    if (data.token && typeof data.token === "string" && data.token.trim().length > 0) {
      cachedToken = data.token.trim();
      tokenExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      return { token: cachedToken };
    }

    const errMsg = data.message || "Shiprocket login succeeded but token was not returned.";
    return { token: null, error: errMsg };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Network error during Shiprocket login";
    console.error("[Shiprocket] Network error:", errMsg);
    return { token: null, error: errMsg };
  }
}

/**
 * Generates or retrieves cached Shiprocket JWT authentication token
 */
export async function getShiprocketToken(forceRefresh = false): Promise<string | null> {
  const result = await getShiprocketAuth(forceRefresh);
  return result.token;
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

    let unitWeight = 1.5;
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

// Map Shiprocket numeric or raw status codes to clean human-readable statuses
function normalizeShiprocketStatus(status: unknown): string {
  if (status === undefined || status === null) return "NEW";
  const s = String(status).trim();
  switch (s) {
    case "1":
      return "AWB_ASSIGNED";
    case "2":
      return "CONFIRMED";
    case "3":
      return "PICKUP_SCHEDULED";
    case "4":
      return "PICKED_UP";
    case "5":
      return "IN_TRANSIT";
    case "6":
      return "IN_TRANSIT";
    case "7":
      return "OUT_FOR_DELIVERY";
    case "8":
      return "DELIVERED";
    case "9":
      return "CANCELLED";
    case "10":
      return "RTO_INITIATED";
    case "11":
      return "RTO_DELIVERED";
    default:
      return s || "NEW";
  }
}

// Helper to extract order, shipment, and awb data from any Shiprocket payload
function parseShiprocketOrderData(rawData: any, targetOrderNumber?: string): {
  orderId?: string;
  shipmentId?: string;
  awbCode?: string;
  courierName?: string;
  status?: string;
} {
  if (!rawData || typeof rawData !== "object") return {};

  let target = rawData;

  const searchList = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData.data)
    ? rawData.data
    : Array.isArray(rawData.data?.data)
    ? rawData.data.data
    : null;

  if (searchList && searchList.length > 0) {
    if (targetOrderNumber) {
      const match = searchList.find((o: any) =>
        String(o.channel_order_id || o.order_id || o.id || "").toLowerCase() === targetOrderNumber.toLowerCase()
      );
      target = match || searchList[0];
    } else {
      target = searchList[0];
    }
  } else if (rawData.response?.data) {
    target = Array.isArray(rawData.response.data) ? rawData.response.data[0] : rawData.response.data;
  } else if (rawData.data && typeof rawData.data === "object" && !Array.isArray(rawData.data)) {
    target = rawData.data;
  } else if (rawData.response && typeof rawData.response === "object") {
    target = rawData.response;
  }

  const rawOrderId = target.order_id ?? target.id ?? rawData.order_id ?? rawData.id ?? "";
  const orderId = rawOrderId !== "" && rawOrderId !== null && rawOrderId !== undefined ? String(rawOrderId).trim() : undefined;

  const shipmentsList = Array.isArray(target.shipments)
    ? target.shipments
    : Array.isArray(rawData.shipments)
    ? rawData.shipments
    : [];
  const firstShipment = shipmentsList[0] || {};

  const rawShipmentId =
    target.shipment_id ??
    firstShipment.id ??
    firstShipment.shipment_id ??
    rawData.shipment_id ??
    (shipmentsList.length > 0 ? String(firstShipment.id || "") : "");
  const shipmentId = rawShipmentId !== "" && rawShipmentId !== null && rawShipmentId !== undefined ? String(rawShipmentId).trim() : undefined;

  const rawAwb =
    target.awb_code ??
    target.awb ??
    firstShipment.awb_code ??
    firstShipment.awb ??
    rawData.awb_code ??
    rawData.awb ??
    "";
  const awbCode = rawAwb !== "" && rawAwb !== null && rawAwb !== undefined ? String(rawAwb).trim() : undefined;

  const courierName =
    target.courier_name ??
    target.courier ??
    firstShipment.courier_name ??
    firstShipment.courier ??
    rawData.courier_name ??
    undefined;

  const rawStatus = target.status ?? firstShipment.status ?? rawData.status ?? target.status_code ?? rawData.status_code;
  const status = normalizeShiprocketStatus(rawStatus);

  return {
    orderId,
    shipmentId: shipmentId || orderId, // If shipment_id is not isolated, Shiprocket order_id is the primary dispatch reference
    awbCode,
    courierName,
    status,
  };
}

async function searchExistingShiprocketOrder(
  orderNumber: string,
  token: string
): Promise<{ orderId?: string; shipmentId?: string; awbCode?: string; courierName?: string; status?: string } | null> {
  const queryUrls = [
    `https://apiv2.shiprocket.in/v1/external/orders?search=${encodeURIComponent(orderNumber)}`,
    `https://apiv2.shiprocket.in/v1/external/orders/show/by/order_id?order_id=${encodeURIComponent(orderNumber)}`,
  ];

  for (const url of queryUrls) {
    try {
      const resp = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (resp.ok) {
        const json = await resp.json().catch(() => null);
        if (json) {
          const parsed = parseShiprocketOrderData(json, orderNumber);
          if (parsed.orderId || parsed.shipmentId) {
            return parsed;
          }
        }
      }
    } catch {
      // try next search format
    }
  }
  return null;
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
  let authResult = await getShiprocketAuth();
  if (!authResult.token) {
    return {
      success: false,
      error: authResult.error || "Shiprocket credentials missing or failed to authenticate with Shiprocket API.",
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
  const pickupLocation = getEnvValue(
    ["SHIPROCKET_PICKUP_LOCATION", "SHIPROCKET_PICKUP", "SHIPROCKET_LOCATION", "SR_PICKUP_LOCATION"],
    ["PICKUPLOCATION", "SHIPROCKETPICKUP"]
  ) || "Primary";

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
    let res = await callOrderApi(authResult.token);

    if (res.status === 401) {
      console.warn("[Shiprocket] 401 Unauthorized on order create, refreshing token...");
      authResult = await getShiprocketAuth(true);
      if (authResult.token) {
        res = await callOrderApi(authResult.token);
      }
    }

    let data = await res.json().catch(() => ({}));
    let parsed = parseShiprocketOrderData(data);

    // If order already exists in Shiprocket or creation returned 422/error, look up existing order details
    if (!res.ok || (!parsed.orderId && !parsed.shipmentId)) {
      const errMsg = (data.message || (data.errors ? (typeof data.errors === "string" ? data.errors : JSON.stringify(data.errors)) : "")).toLowerCase();
      if (errMsg.includes("already exist") || errMsg.includes("duplicate") || res.status === 422 || !res.ok) {
        const found = await searchExistingShiprocketOrder(order.orderNumber, authResult.token!);
        if (found && (found.orderId || found.shipmentId)) {
          parsed = { ...parsed, ...found };
          res = { ok: true, status: 200 } as Response;
        }
      }
    }

    if (!res.ok && !parsed.orderId && !parsed.shipmentId) {
      console.error("[Shiprocket] Order creation error response:", data);
      const errMsg =
        data.message ||
        (data.errors ? (typeof data.errors === "string" ? data.errors : JSON.stringify(data.errors)) : `HTTP ${res.status} error from Shiprocket`);
      return {
        success: false,
        error: errMsg,
      };
    }

    let shiprocketOrderId = parsed.orderId;
    let shipmentId = parsed.shipmentId;
    let awbCode = parsed.awbCode;
    let courierName = parsed.courierName;
    let status = parsed.status || "NEW";

    // If shipmentId is present but AWB is not yet assigned, attempt automatic AWB assignment
    if (shipmentId && !awbCode && authResult.token) {
      try {
        const awbRes = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authResult.token}`,
          },
          body: JSON.stringify({ shipment_id: Number(shipmentId) || shipmentId }),
        });
        if (awbRes.ok) {
          const awbData = await awbRes.json().catch(() => ({}));
          const awbParsed = parseShiprocketOrderData(awbData);
          if (awbParsed.awbCode) {
            awbCode = awbParsed.awbCode;
            courierName = awbParsed.courierName || courierName;
            status = "AWB_ASSIGNED";
          }
        }
      } catch {
        // AWB assignment can be completed later by admin in Shiprocket dashboard
      }
    }

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
      trackingUrl: trackingUrl || undefined,
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
  let authResult = await getShiprocketAuth();
  if (!authResult.token) {
    return { success: false, error: authResult.error || "Shiprocket credentials missing or failed to authenticate." };
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
    let res = await callTrackApi(authResult.token);

    if (res.status === 401) {
      authResult = await getShiprocketAuth(true);
      if (authResult.token) {
        res = await callTrackApi(authResult.token);
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
