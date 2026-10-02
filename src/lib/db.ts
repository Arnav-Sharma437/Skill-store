import mongoose from "mongoose";
import dns from "node:dns";

// Configure DNS resolvers for reliable MongoDB Atlas SRV resolution across environments (Linux VPS & local)
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (dnsErr) {
  console.warn("DNS custom servers set failed (continuing with default):", dnsErr);
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("⚠️ MONGODB_URI environment variable is missing!");
}

declare global {
  var mongoose: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI && !process.env.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env or .env.local");
  }

  const uri = process.env.MONGODB_URI || MONGODB_URI!;

  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log("✅ MongoDB connected successfully to database:", m.connection.name);
      return m;
    }).catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
