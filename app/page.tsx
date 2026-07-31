"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, getMe } from "@/lib/api/swmApi";
import { clearSession, hasSession } from "@/lib/auth/authStorage";

export default function HomePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  const validateSession = useCallback(async () => {
    setChecking(true);
    setError("");

    if (!hasSession()) {
      router.replace("/login");
      return;
    }

    try {
      await getMe();
      router.replace("/dashboard");
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }

      setChecking(false);
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

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#eef3f8",
        textAlign: "center",
      }}
    >
      <section>
        <p>{checking ? "Validando sesión…" : error}</p>

        {!checking && error && (
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
