import "server-only";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { User } from "@prisma/client";

export const authOptions: AuthOptions = {
  // Remove adapter when using JWT strategy
  // adapter: PrismaAdapter(prisma),
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

        // Check if email is verified (skip for admin users and users created before verification was implemented)
        // Only enforce for users created after email verification feature was added
        const userCreatedAt = (user as any).createdAt;
        const emailVerificationStartDate = new Date("2025-11-01"); // Adjust this date as needed

        if (
          (user as any).role !== "ADMIN" &&
          !(user as any).isEmailVerified &&
          userCreatedAt >= emailVerificationStartDate
        ) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt", // Using JWT for reliable session management
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 7 * 24 * 60 * 60, // Update session every 7 days (reduced from 24 hours)
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production", // Secure in production
        domain: undefined,
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers (Google, Facebook), ensure user exists in database
      if (account?.provider === "facebook" || account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create new user for OAuth login
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "User",
                role: "USER",
                accountType: "INVESTOR",
                isEmailVerified: true, // Auto-verify OAuth users
                image: user.image,
              } as any,
            });
          } else if (!existingUser.role) {
            // Update existing user without role
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                role: "USER",
                accountType: "INVESTOR",
                isEmailVerified: true,
              } as any,
            });
          }
        } catch (error) {
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // On initial sign in (when user object is available from authorize)
      if (user) {
        // Fetch full user data from database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            accountType: true,
            isEmailVerified: true,
            image: true,
            preferredCurrency: true,
            country: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.role = dbUser.role;
          token.accountType = dbUser.accountType;
          token.isEmailVerified = dbUser.isEmailVerified;
          token.image = dbUser.image;
          token.preferredCurrency = dbUser.preferredCurrency;
          token.country = dbUser.country;
          token.lastUpdated = Date.now();
        }
      } else if (token.id) {
        // Refresh user data from DB periodically (every 7 days to reduce DB calls)
        const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
        const shouldRefresh =
          !token.lastUpdated ||
          Date.now() - (token.lastUpdated as number) > CACHE_DURATION;

        if (shouldRefresh || trigger === "update") {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: {
                preferredCurrency: true,
                country: true,
                id: true,
                accountType: true,
                role: true,
                email: true,
                name: true,
                isEmailVerified: true,
                image: true,
              },
            });
            if (dbUser) {
              token.id = dbUser.id;
              token.email = dbUser.email;
              token.name = dbUser.name;
              token.accountType = dbUser.accountType;
              token.role = dbUser.role;
              token.isEmailVerified = dbUser.isEmailVerified;
              token.image = dbUser.image;
              token.preferredCurrency = dbUser.preferredCurrency;
              token.country = dbUser.country;
              token.lastUpdated = Date.now();
            }
          } catch (error) {
            // Continue with cached token data if DB is unreachable
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Don't create session if token is invalid or missing required data
      if (!token || !token.id || !token.email) {
        return session;
      }

      // Add user data from token to session
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.accountType = token.accountType as string | undefined;
        session.user.isEmailVerified = token.isEmailVerified as boolean;
        session.user.preferredCurrency = token.preferredCurrency as
          | string
          | undefined;
        session.user.country = token.country as string | undefined;
      }
      return session;
    },
  },
  events: {
    async signOut({ token, session }) {
      // User signed out
    },
  },
  pages: {
    signIn: "/",
    signOut: "/", // Redirect directly to homepage on signout, no confirmation page
  },
  debug: false, // Disable debug logging to prevent _log endpoint spam
  logger: {
    error: () => {}, // Suppress error logs
    warn: () => {}, // Suppress warning logs
    debug: () => {}, // Suppress debug logs
  },
  secret: process.env.NEXTAUTH_SECRET,
};
