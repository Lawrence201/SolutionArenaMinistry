"use client";

import { SessionProvider, useSession } from "next-auth/react";
import React, { useEffect } from "react";

const SessionTracker = () => {
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user?.name) {
            localStorage.setItem("last_used_name", session.user.name);
            localStorage.setItem("last_used_email", session.user.email || "");
        }
    }, [session]);

    return null;
};

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SessionTracker />
            {children}
        </SessionProvider>
    );
}
