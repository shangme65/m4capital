import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { User } from "@prisma/client";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Normalize email to avoid case/whitespace mismatches
        const normalizedEmail = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Check if email is verified (skip for admin users)
        if ((user as any).role !== "ADMIN" && !(user as any).isEmailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 60 * 60, // Update session every hour (reduced from 24h)
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? `__Secure-next-auth.session-token`
          : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // PrismaAdapter handles creating users automatically for OAuth providers
      // We just need to set default values when the user is first created
      if (account?.provider === "facebook" || account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // Only update if user was just created by PrismaAdapter (no role/accountType set)
        if (existingUser && !existingUser.role) {
          await prisma.user.update({
            where: { email: user.email! },
            data: {
              role: "USER",
              accountType: "INVESTOR",
              isEmailVerified: true, // Auto-verify OAuth users
            } as any,
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      // On initial sign in or when user object is available
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as User).role;
        token.accountType = (
          user as User & { accountType?: string }
        ).accountType;
        token.isEmailVerified = (user as any).isEmailVerified;
        // Add timestamp for cache tracking
        token.lastUpdated = Date.now();
      } else if (token.id) {
        // Refresh user data from DB periodically (every 5 minutes)
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        const shouldRefresh =
          !token.lastUpdated ||
          Date.now() - (token.lastUpdated as number) > CACHE_DURATION;

        if (shouldRefresh || trigger === "update") {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              accountType: true,
              role: true,
              email: true,
              name: true,
              isEmailVerified: true,
            },
          });
          if (dbUser) {
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.accountType = dbUser.accountType;
            token.role = dbUser.role;
            token.isEmailVerified = dbUser.isEmailVerified;
            token.lastUpdated = Date.now();
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.accountType = token.accountType as string | undefined;
        session.user.isEmailVerified = token.isEmailVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
