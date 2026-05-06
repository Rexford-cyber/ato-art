import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/constants/enums";

/**
 * Lightweight auth config used by the Edge middleware.
 * Must NOT import anything that pulls in Node.js-only modules (e.g. Prisma).
 * The full auth config (with PrismaAdapter) lives in auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  session: { strategy: "jwt" as const },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.username = token.username as string;
        session.user.hasArtistProfile = token.hasArtistProfile as boolean;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
