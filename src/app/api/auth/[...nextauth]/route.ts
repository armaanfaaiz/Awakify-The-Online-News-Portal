import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import { User, IUser } from "@/models/User";
import bcrypt from "bcrypt";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectToDatabase();
        const existing = await User.findOne({ email: credentials.email });
        if (!existing) return null;
        const isValid = await bcrypt.compare(credentials.password, existing.password);
        if (!isValid) return null;
        return {
          id: existing._id.toString(),
          name: existing.name,
          email: existing.email,
          roles: existing.roles,
          subscription: existing.subscription,
          preferences: existing.preferences,
        } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {},
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, merge fields from user
      if (user) {
        token.id = (user as any).id;
        token.name = user.name;
        token.email = user.email;
        (token as any).roles = (user as any).roles || ["user"];
        (token as any).subscription = (user as any).subscription || { plan: "free", status: "active" };
        (token as any).preferences = (user as any).preferences || {};
      } else if (token?.id) {
        // Refresh token data from DB to keep roles/subscription up to date
        try {
          await connectToDatabase();
          const u = await User.findById((token as any).id).lean<IUser | null>();
          if (u) {
            (token as any).roles = u.roles || ["user"];
            (token as any).subscription = u.subscription || { plan: "free", status: "active" };
            (token as any).preferences = u.preferences || {};
          }
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string | undefined;
        session.user.name = token.name as string | null | undefined;
        session.user.email = token.email as string | null | undefined;
        (session as any).roles = (token as any).roles || ["user"];
        (session as any).subscription = (token as any).subscription || { plan: "free", status: "active" };
        (session as any).preferences = (token as any).preferences || {};
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

