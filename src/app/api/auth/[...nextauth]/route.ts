import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/db/mongodb";
import User from "@/models/User";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
