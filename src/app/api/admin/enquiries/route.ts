import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Enquiry } from "@/lib/schemas";

export async function GET() {
  try {
    await connectToDatabase();
    const list = await Enquiry.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: list });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields: name, email, message" }, { status: 400 });
    }

    const newEnquiry = await Enquiry.create({ name, email, message });
    return NextResponse.json({ success: true, data: newEnquiry });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
