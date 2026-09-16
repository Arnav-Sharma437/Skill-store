import { NextResponse } from "next/server";
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
    return NextResponse.json({ success: true, data: DEFAULT_HOME_SETTINGS, fallback: true, error: errMessage });
  }
}
