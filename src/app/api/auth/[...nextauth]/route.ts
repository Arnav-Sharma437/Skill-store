import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";

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
    CredentialsProvider({
      id: "phone-or-email",
      name: "Mobile / Email Login",
      credentials: {
        identifier: { label: "Mobile or Email", type: "text" },
        name: { label: "Full Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier) {
          throw new Error("Please enter your Mobile Number or Email address.");
        }
        await dbConnect();
        const raw = credentials.identifier.trim();
        const isEmail = /^\S+@\S+\.\S+$/.test(raw);
        const cleanDigits = raw.replace(/\D/g, "");

        if (isEmail) {
          const email = raw.toLowerCase();
          let dbUser = await User.findOne({ email });
          if (!dbUser) {
            dbUser = await User.create({
              name: credentials.name || "Customer",
              email,
              role: "customer",
              addresses: [],
            });
          }
          return {
            id: dbUser._id.toString(),
            name: dbUser.name,
            email: dbUser.email,
          };
        } else if (cleanDigits.length >= 10) {
          const p10 = cleanDigits.slice(-10);
          const generatedEmail = `${p10}@customer.skillstore.in`;

          // Find if user already exists with this phone in address or email
          let dbUser = await User.findOne({
            $or: [
              { email: generatedEmail },
              { "addresses.phone": { $regex: p10 } },
            ],
          });

          // Also check recent order for customer name
          let foundName = credentials.name || "Customer";
          if (!dbUser) {
            const lastOrder = await Order.findOne({
              $or: [
                { userPhone: { $regex: p10 } },
                { "shippingAddress.phone": { $regex: p10 } },
              ],
            }).sort({ createdAt: -1 });

            if (lastOrder) {
              foundName = lastOrder.shippingAddress?.name || lastOrder.userName || foundName;
              if (lastOrder.userEmail && !lastOrder.userEmail.includes("@customer.skillstore.in")) {
                // If order had a real email, link to it
                const existingByEmail = await User.findOne({ email: lastOrder.userEmail.toLowerCase() });
                if (existingByEmail) {
                  dbUser = existingByEmail;
                }
              }
            }
          }

          if (!dbUser) {
            dbUser = await User.create({
              name: foundName,
              email: generatedEmail,
              role: "customer",
              addresses: [
                {
                  id: `addr_${Date.now()}`,
                  type: "Primary",
                  name: foundName,
                  phone: p10,
                  street: "Registered Mobile Account",
                  city: "India",
                  pincode: "000000",
                },
              ],
            });
          }

          return {
            id: dbUser._id.toString(),
            name: dbUser.name || foundName,
            email: dbUser.email,
          };
        } else {
          throw new Error("Please enter a valid 10-digit mobile number or email address.");
        }
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

