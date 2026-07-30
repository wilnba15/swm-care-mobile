"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CarFront, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { ApiError, resetPassword } from "@/lib/api/swmApi";
import styles from "../login/login.module.css";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("El enlace de recuperación no es válido.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      const response = await resetPassword({ token, new_password: password });
      setMessage(response.message);
      setPassword("");
      setConfirmation("");
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.detail
          : "No se pudo actualizar la contraseña.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <header className={styles.brand}>
          <span><CarFront size={30} /></span>
          <div><strong>SWM Care</strong><small>Mobile</small></div>
        </header>

        <div style={{ margin: "28px 0 22px" }}>
          <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.1 }}>
            Nueva contraseña
          </h1>
          <p style={{ margin: "12px 0 0", color: "#6f7f9d", lineHeight: 1.55 }}>
            Escribe y confirma tu nueva contraseña.
          </p>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <label>
            <span>Nueva contraseña</span>
            <div>
              <LockKeyhole size={19} />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(event) => { setPassword(event.target.value); setError(""); }}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </label>

          <label>
            <span>Confirmar contraseña</span>
            <div>
              <LockKeyhole size={19} />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => { setConfirmation(event.target.value); setError(""); }}
                placeholder="Repite tu contraseña"
              />
            </div>
          </label>

          {error && <p className={styles.error}>{error}</p>}
          {message && (
            <p style={{ color: "#176b3a", fontSize: 14, lineHeight: 1.5 }}>
              {message} <Link href="/login">Ingresar ahora</Link>
            </p>
          )}

          <button className={styles.submit} type="submit" disabled={loading || Boolean(message)}>
            {loading ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>

        <p className={styles.link}>
          <Link href="/login">
            <ArrowLeft size={16} style={{ verticalAlign: "middle", marginRight: 5 }} />
            Volver al inicio de sesión
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100dvh", background: "#eef3f8" }} />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
