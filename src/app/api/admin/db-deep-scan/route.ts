import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    const uri = process.env.MONGODB_URI || "";

    const candidateDbs = [
      "test",
      "skill-store",
      "skillstore",
      "SkillStore",
      "Skillstore",
      "skill_store",
      "Skill_Store",
      "production",
      "Production",
      "main",
      "admin",
      "sample_mflix"
    ];

    const client = conn.connection.getClient();
    const results: Record<string, { collections: Record<string, { count: number; sample?: unknown[] }> }> = {};

    for (const dbName of candidateDbs) {
      try {
        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();
        if (collections.length > 0) {
          results[dbName] = { collections: {} };
          for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            let sample: unknown[] = [];
            if (count > 0) {
              sample = await db.collection(col.name).find({}).limit(3).toArray();
            }
            results[dbName].collections[col.name] = { count, sample };
          }
        }
      } catch (e: unknown) {
        const err = e instanceof Error ? e.message : String(e);
        results[dbName] = { collections: { error: { count: -1, sample: [err] } } };
      }
    }

    // Also extract raw URI database segment if specified
    let uriParsedDb = "NONE_FOUND_IN_URI";
    try {
      const parts = uri.split("?")[0].split("/");
      if (parts.length > 3 && parts[3]) {
        uriParsedDb = parts[3];
      }
    } catch {
      // Ignore
    }

    return NextResponse.json({
      success: true,
      uriParsedDb,
      currentMongooseDb: conn.connection.name,
      results,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Deep scan failed";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
