import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    // Add debug logging in development
    debug: process.env.NODE_ENV === "development",
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "database",
    },
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                // @ts-ignore
                session.user.id = user.id;

                // Custom name parsing for the header
                const fullName = user.name || "";
                const firstName = fullName.split(" ")[0] || "";
                // @ts-ignore
                session.user.firstName = firstName;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            // If we need to perform extra logic during first-time signup
            return true;
        },
    },
});
