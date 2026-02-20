import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Always log env check to Vercel (values are boolean, not the actual secrets)
console.log("[Auth.js] Env Check:", {
    hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
    // The PrismaAdapter handles user/account creation for OAuth (Google) flows.
    // DATABASE_URL must be set in Vercel for this to work.
    adapter: PrismaAdapter(prisma),
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "sam_auth_secret_2024_church_mgmt",
    trustHost: true,
    // Enable debug in ALL environments to capture errors in Vercel logs
    debug: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                try {
                    // 1. Try User table first
                    const user = await prisma.user.findUnique({
                        where: { email }
                    });

                    if (user && user.password) {
                        const isPasswordValid = await bcrypt.compare(password, user.password);
                        if (isPasswordValid) {
                            return {
                                id: String(user.id),
                                email: user.email,
                                name: user.name,
                                role: user.role,
                            };
                        }
                    }

                    // 2. Try AdminAccount table
                    const admin = await prisma.adminAccount.findUnique({
                        where: { admin_email: email }
                    });

                    if (admin) {
                        const isPasswordValid = await bcrypt.compare(password, admin.admin_password);
                        if (isPasswordValid) {
                            return {
                                id: `admin-${admin.admin_id}`,
                                email: admin.admin_email,
                                name: admin.admin_name,
                                role: "admin",
                            };
                        }
                    }
                } catch (err) {
                    console.error("[Auth.js] DB error during credentials authorize:", err);
                    return null;
                }

                return null;
            }
        }),
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user && token) {
                // @ts-ignore
                session.user.id = token.sub;
                const fullName = session.user.name || "";
                const firstName = fullName.split(" ")[0] || "";
                // @ts-ignore
                session.user.firstName = firstName;
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        },
        async signIn({ user, account, profile }) {
            return true;
        },
    },
});
