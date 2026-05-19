import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";

import { getDb, hasDatabaseUrl } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";

const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : "helm-local-development-secret"),
  adapter: hasDatabaseUrl()
    ? DrizzleAdapter(getDb(), {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      })
    : undefined,
  session: {
    strategy: hasDatabaseUrl() ? "database" : "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: hasGoogle
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : [],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user?.id) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id || !hasDatabaseUrl()) {
        return;
      }

      await getDb()
        .update(users)
        .set({ lastSignedInAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, user.id));
    },
  },
});
