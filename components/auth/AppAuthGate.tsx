"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_UPDATED_EVENT, clearSession, getAccessToken } from "@/lib/auth/authStorage";
import { ApiError, getMe } from "@/lib/api/swmApi";

const PUBLIC_ROUTES = new Set([
  "/login",
  "/register",
  "/reset-password",
]);

export function AppAuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const publicPath = PUBLIC_ROUTES.has(pathname);
      const token = getAccessToken();

      if (!token) {
        if (!publicPath) router.replace("/login");
        if (!cancelled) setChecking(false);
        return;
      }

      try {
        await getMe();
        if (publicPath) router.replace("/dashboard");
      } catch (reason) {
        if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) {
          clearSession();
          if (!publicPath) router.replace("/login");
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    setChecking(true);
    void verify();
    const handleAuthUpdate = () => void verify();
    window.addEventListener(AUTH_UPDATED_EVENT, handleAuthUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_UPDATED_EVENT, handleAuthUpdate);
    };
  }, [pathname, router]);

  if (checking) {
    return (
      <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#eef3f8" }}>
        <div style={{ width: 42, height: 42, border: "4px solid #dbe7f5", borderTopColor: "#1263e5", borderRadius: 999, animation: "swm-spin .8s linear infinite" }} />
      </main>
    );
  }

  return <>{children}</>;
}
