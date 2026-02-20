import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Log env availability to Vercel logs on every cold start
console.log("[Auth.js] Env Check:", {
    hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
    // NOTE: PrismaAdapter intentionally removed.
    // The adapter caused Google callback to crash when DATABASE_URL is missing on Vercel.
    // Google users are instead persisted manually in the signIn callback below.
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "sam_auth_secret_2024_church_mgmt",
    trustHost: true,
    debug: true,
    providers: [
        // ─── GOOGLE (for website members) ────────────────────────────────────
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        // ─── CREDENTIALS (for admins & members with password) ────────────────
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const email = credentials.email as string;
                const password = credentials.password as string;

                try {
                    // 1. Check admin_accounts table first (admins login with credentials)
                    const admin = await prisma.adminAccount.findUnique({
                        where: { admin_email: email }
                    });

                    if (admin) {
                        const isValid = await bcrypt.compare(password, admin.admin_password);
                        if (isValid) {
                            return {
                                id: `admin-${admin.admin_id}`,
                                email: admin.admin_email,
                                name: admin.admin_name,
                                role: "admin",
                            };
                        }
                    }

                    // 2. Check users table (members with a manual password)
                    const user = await prisma.user.findUnique({
                        where: { email }
                    });

                    if (user && user.password) {
                        const isValid = await bcrypt.compare(password, user.password);
                        if (isValid) {
                            return {
                                id: String(user.id),
                                email: user.email,
                                name: user.name,
                                role: user.role || "user",
                            };
                        }
                    }
                } catch (err) {
                    console.error("[Auth.js] DB error in credentials authorize:", err);
                }

                return null; // Invalid credentials
            }
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/login", // Redirect errors back to login with ?error= param
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        // ─── signIn: runs right after OAuth callback ──────────────────────────
        async signIn({ user, account, profile }) {
            // For Google logins, manually upsert the user into the `users` table
            if (account?.provider === "google" && profile?.email) {
                try {
                    await prisma.user.upsert({
                        where: { email: profile.email },
                        update: {
                            name: profile.name || user.name,
                            image: (profile as any).picture || user.image || null,
                            emailVerified: new Date(),
                        },
                        create: {
                            email: profile.email,
                            name: profile.name || user.name || "",
                            image: (profile as any).picture || user.image || null,
                            emailVerified: new Date(),
                            role: "user", // All Google sign-ups are regular members
                        },
                    });
                    console.log("[Auth.js] Google user upserted:", profile.email);
                } catch (err) {
                    // Don't block login if DB write fails (e.g. DATABASE_URL not set)
                    console.error("[Auth.js] Failed to upsert Google user (DB not available):", err);
                }
            }
            return true;
        },

        // ─── JWT: fires on login and every token refresh ──────────────────────
        async jwt({ token, user, account }) {
            // On first login, attach role to the token
            if (user) {
                token.role = (user as any).role || "user";
            }

            // For Google logins, look up the user's current role from the DB
            if (account?.provider === "google" && token.email) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: token.email },
                        select: { id: true, role: true }
                    });
                    if (dbUser) {
                        token.role = dbUser.role || "user";
                        token.userId = dbUser.id;
                    }
                } catch {
                    token.role = "user"; // Fallback for Google if DB unreachable
                }
            }

            return token;
        },

        // ─── Session: shapes the client-side session object ──────────────────
        async session({ session, token }) {
            if (session.user && token) {
                (session.user as any).id = token.sub;
                (session.user as any).role = token.role;
                const fullName = session.user.name || "";
                (session.user as any).firstName = fullName.split(" ")[0] || "";
            }
            return session;
        },
    },
});
