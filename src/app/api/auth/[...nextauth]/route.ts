import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/db/mongodb";
import User from "@/models/User";

// Dynamically configure and guarantee canonical environment URL
const configureEnvironment = (req?: Request) => {
  const host = req?.headers.get("x-forwarded-host") || req?.headers.get("host") || "";
  const isLocal =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    (process.env.NODE_ENV === "development" && !host.includes("skillstore.in"));

  if (isLocal) {
    const proto = req?.headers.get("x-forwarded-proto") || "http";
    const localUrl = `${proto}://${host || "localhost:3000"}`;
    process.env.NEXTAUTH_URL = localUrl;
    process.env.AUTH_URL = localUrl;
  } else {
    // Production / Vercel: strictly enforce canonical domain
    process.env.NEXTAUTH_URL = "https://skillstore.in";
    process.env.AUTH_URL = "https://skillstore.in";
    process.env.NEXT_PUBLIC_APP_URL = "https://skillstore.in";
  }
};

// Initial setup on module load
if (process.env.NODE_ENV === "production" || !process.env.NEXTAUTH_URL) {
  configureEnvironment();
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin or skillstore.in
      try {
        const parsedUrl = new URL(url);
        const parsedBase = new URL(baseUrl);
        if (
          parsedUrl.origin === parsedBase.origin ||
          parsedUrl.hostname === "skillstore.in" ||
          parsedUrl.hostname.includes("localhost")
        ) {
          return url;
        }
      } catch {
        // invalid URL format, fallback to baseUrl
      }
      return baseUrl;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();
          const emailAddress = (user.email || "").toLowerCase().trim();
          if (emailAddress) {
            const existingUser = await User.findOne({ email: emailAddress });
            if (!existingUser) {
              await User.create({
                name: user.name || "Customer",
                email: emailAddress,
                role: "customer",
                addresses: [],
              });
            }
          }
        } catch (error) {
          console.error("Error saving user to MongoDB on sign in:", error);
          // Return true so user login is not blocked by DB hiccups
          return true;
        }
      }
      return true;
    },
    async session({ session }) {
      try {
        if (session.user?.email) {
          await dbConnect();
          const dbUser = await User.findOne({ email: session.user.email.toLowerCase().trim() });
          if (dbUser) {
            session.user.id = dbUser._id.toString();
            session.user.role = dbUser.role || "customer";
          }
        }
      } catch (error) {
        console.error("Error loading user session from MongoDB:", error);
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "skill-store-auth-fallback-secret-2026",
  pages: {
    signIn: "/account",
    error: "/account",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = async (req: Request, context: unknown) => {
  configureEnvironment(req);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextAuth(authOptions)(req, context as any);
};

export { handler as GET, handler as POST };

