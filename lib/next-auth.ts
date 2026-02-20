import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    // Add trustHost for Vercel deployment stability
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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

                // 1. Try User table first
                let user = await prisma.user.findUnique({
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

                // 2. Try AdminAccount table if user not found or password invalid in User table
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
                            role: "admin", // Explicitly set role to admin
                        };
                    }
                }

                return null;
            }
        }),
    ],
    // Add debug logging in development
    debug: process.env.NODE_ENV === "development",
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

                // Custom name parsing for the header
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
            // If we need to perform extra logic during first-time signup
            return true;
        },
    },
});
