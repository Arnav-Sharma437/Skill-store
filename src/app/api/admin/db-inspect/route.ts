import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    const currentDbName = conn.connection.name;

    // List all databases on the MongoDB cluster
    let dbsList: Array<{ name: string; sizeOnDisk?: number; empty?: boolean }> = [];
    try {
      const adminDb = conn.connection.db?.admin();
      if (adminDb) {
        const result = await adminDb.listDatabases();
        dbsList = result.databases || [];
      }
    } catch (adminErr) {
      console.warn("Could not list all databases via admin:", adminErr);
    }

    // Inspect collections and counts in the current database
    const currentDbCollections: Record<string, number> = {};
    if (conn.connection.db) {
      const collections = await conn.connection.db.listCollections().toArray();
      for (const col of collections) {
        const count = await conn.connection.db.collection(col.name).countDocuments();
        currentDbCollections[col.name] = count;
      }
    }

    // Also inspect other databases on the same cluster if accessible
    const clusterDatabasesSummary: Record<string, Record<string, number>> = {};
    for (const dbInfo of dbsList) {
      if (["admin", "local", "config"].includes(dbInfo.name)) continue;
      try {
        const otherDb = conn.connection.client.db(dbInfo.name);
        const cols = await otherDb.listCollections().toArray();
        clusterDatabasesSummary[dbInfo.name] = {};
        for (const col of cols) {
          const count = await otherDb.collection(col.name).countDocuments();
          clusterDatabasesSummary[dbInfo.name][col.name] = count;
        }
      } catch {
        // Skip inaccessible
      }
    }

    return NextResponse.json({
      success: true,
      currentDbName,
      currentDbCollections,
      allDatabasesOnCluster: dbsList.map((d) => d.name),
      clusterDatabasesSummary,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown DB inspection error";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
