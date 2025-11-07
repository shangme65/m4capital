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
    strategy: "database", // Using database sessions with Neon (persistent sessions)
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false, // Set to false for localhost, true for production
        domain: undefined, // Don't set domain for localhost
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("🔐 SignIn callback triggered:", {
        provider: account?.provider,
        userEmail: user.email,
      });

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
      console.log("✅ SignIn successful");
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // On initial sign in or when user object is available
      if (user) {
        console.log("🎫 Creating JWT token for user:", user.email);
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
        // Refresh user data from DB periodically (every 24 hours to reduce DB calls)
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
        const shouldRefresh =
          !token.lastUpdated ||
          Date.now() - (token.lastUpdated as number) > CACHE_DURATION;

        if (shouldRefresh || trigger === "update") {
          console.log("🔄 Refreshing JWT token from database");
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: {
                id: true,
                accountType: true,
                role: true,
                email: true,
                name: true,
                isEmailVerified: true,
              },
            });
            if (dbUser) {
              token.id = dbUser.id;
              token.email = dbUser.email;
              token.name = dbUser.name;
              token.accountType = dbUser.accountType;
              token.role = dbUser.role;
              token.isEmailVerified = dbUser.isEmailVerified;
              token.lastUpdated = Date.now();
            }
          } catch (error) {
            console.error("⚠️ Failed to refresh token from DB:", error);
            // Continue with cached token data if DB is unreachable
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log("📋 Creating session for token:", token.email);
      // Add user data from token to session
      if (session.user && token) {
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
