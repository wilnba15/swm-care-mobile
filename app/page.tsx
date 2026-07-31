"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { BottomNavigation } from "@/components/mobile/BottomNavigation";
import { FloatingActionButton } from "@/components/mobile/FloatingActionButton";
import { VehicleSummaryCard } from "@/components/dashboard/VehicleSummaryCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AiAnalysisCard } from "@/components/dashboard/AiAnalysisCard";
import { ApiError, getMe } from "@/lib/api/swmApi";
import { clearSession, hasSession } from "@/lib/auth/authStorage";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  const validateSession = useCallback(async () => {
    setAuthorized(false);
    setError("");

    if (!hasSession()) {
      router.replace("/login");
      return;
    }

    try {
      await getMe();
      setAuthorized(true);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }

      setError(
        reason instanceof ApiError
          ? reason.detail
          : "No se pudo validar tu sesión. Revisa tu conexión e intenta nuevamente.",
      );
    }
  }, [router]);

  useEffect(() => {
    void validateSession();
  }, [validateSession]);

  if (!authorized) {
    return (
      <main
        className={styles.shell}
        style={{ display: "grid", placeItems: "center", padding: 24 }}
      >
        <section style={{ textAlign: "center" }}>
          <p>{error || "Validando sesión…"}</p>

          {error && (
            <button
              type="button"
              onClick={() => void validateSession()}
              style={{
                marginTop: 14,
                border: 0,
                borderRadius: 12,
                padding: "11px 18px",
                background: "#1263e5",
                color: "#ffffff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <MobileHeader />

      <section className={styles.content}>
        <VehicleSummaryCard />
        <AiAnalysisCard />
        <RecentActivity />
      </section>

      <FloatingActionButton />
      <BottomNavigation />
    </main>
  );
}
