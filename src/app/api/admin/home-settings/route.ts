import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { HomeSettings, DEFAULT_HOME_SETTINGS } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await HomeSettings.findOne({ id: "default" }).lean();
    if (!settings) {
      settings = await HomeSettings.create(DEFAULT_HOME_SETTINGS);
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const updateDoc: Record<string, unknown> = {};

    if (body.announcement !== undefined) {
      updateDoc.announcement = {
        enabled: Boolean(body.announcement.enabled),
        text: typeof body.announcement.text === "string" ? body.announcement.text : DEFAULT_HOME_SETTINGS.announcement.text,
      };
    }

    if (body.brandsSection !== undefined) {
      updateDoc.brandsSection = {
        enabled: Boolean(body.brandsSection.enabled),
        title: typeof body.brandsSection.title === "string" ? body.brandsSection.title : DEFAULT_HOME_SETTINGS.brandsSection.title,
        subtitle: typeof body.brandsSection.subtitle === "string" ? body.brandsSection.subtitle : DEFAULT_HOME_SETTINGS.brandsSection.subtitle,
        brands: Array.isArray(body.brandsSection.brands) ? body.brandsSection.brands : [],
      };
    }

    if (body.trustMarquee !== undefined) {
      updateDoc.trustMarquee = {
        enabled: Boolean(body.trustMarquee.enabled),
        items: Array.isArray(body.trustMarquee.items) ? body.trustMarquee.items : [],
      };
    }

    if (body.summerOffer !== undefined) {
      updateDoc.summerOffer = {
        enabled: Boolean(body.summerOffer.enabled),
        title: typeof body.summerOffer.title === "string" ? body.summerOffer.title : DEFAULT_HOME_SETTINGS.summerOffer.title,
        offers: Array.isArray(body.summerOffer.offers) ? body.summerOffer.offers : [],
      };
    }

    const updated = await HomeSettings.findOneAndUpdate(
      { id: "default" },
      { $set: updateDoc },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({ success: true, data: updated, message: "Homepage settings updated successfully!" });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
