import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Order from "@/models/Order";
import { trackShiprocketShipment } from "@/lib/shiprocket";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber");
    const orderId = searchParams.get("orderId");
    const shipmentId = searchParams.get("shipmentId");
    const awbCode = searchParams.get("awbCode");

    await dbConnect();

    // Look up order in database if orderNumber or orderId is provided
    let dbOrder = null;
    if (orderNumber) {
      dbOrder = await Order.findOne({ orderNumber });
    } else if (orderId) {
      dbOrder = await Order.findOne({
        $or: [
          { orderNumber: orderId },
          ...(orderId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: orderId }] : []),
        ],
      });
    }

    const effectiveAwb = awbCode || dbOrder?.shiprocketAwbCode;
    const effectiveShipmentId = shipmentId || dbOrder?.shiprocketShipmentId;
    const effectiveOrderId = dbOrder?.shiprocketOrderId || dbOrder?.orderNumber;

    if (!effectiveAwb && !effectiveShipmentId && !effectiveOrderId) {
      return NextResponse.json(
        {
          success: false,
          error: "No tracking reference available for this order.",
        },
        { status: 400 }
      );
    }

    const trackResult = await trackShiprocketShipment({
      awbCode: effectiveAwb,
      shipmentId: effectiveShipmentId,
      orderId: effectiveOrderId,
    });

    // Update order in MongoDB if status changed
    if (dbOrder && trackResult.success && trackResult.currentStatus) {
      if (trackResult.currentStatus.toLowerCase().includes("deliver")) {
        dbOrder.orderStatus = "delivered";
        dbOrder.shiprocketStatus = "DELIVERED";
      } else if (trackResult.currentStatus.toLowerCase().includes("transit") || trackResult.currentStatus.toLowerCase().includes("picked")) {
        dbOrder.orderStatus = "shipped";
        dbOrder.shiprocketStatus = trackResult.currentStatus;
      }
      if (trackResult.trackingUrl) {
        dbOrder.shiprocketTrackingUrl = trackResult.trackingUrl;
      }
      if (trackResult.courierName) {
        dbOrder.shiprocketCourierName = trackResult.courierName;
      }
      await dbOrder.save();
    }

    return NextResponse.json({
      success: trackResult.success,
      currentStatus: trackResult.currentStatus || dbOrder?.shiprocketStatus || "Processing",
      location: trackResult.location || "",
      etd: trackResult.etd || "",
      courierName: trackResult.courierName || dbOrder?.shiprocketCourierName || "Shiprocket Express",
      trackingUrl: trackResult.trackingUrl || dbOrder?.shiprocketTrackingUrl || "",
      activities: trackResult.activities || [],
      error: trackResult.error,
    });
  } catch (error: unknown) {
    console.error("Error tracking order shipment:", error);
    const errMsg = error instanceof Error ? error.message : "Error tracking shipment";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
