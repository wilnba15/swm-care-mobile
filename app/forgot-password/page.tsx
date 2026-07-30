"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CarFront, Mail } from "lucide-react";
import { ApiError, forgotPassword } from "@/lib/api/swmApi";
import styles from "../login/login.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword({ email: normalizedEmail });
      setMessage(response.message);
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.detail
          : "No se pudo solicitar la recuperación de contraseña.",
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
            Recuperar contraseña
          </h1>
          <p style={{ margin: "12px 0 0", color: "#6f7f9d", lineHeight: 1.55 }}>
            Ingresa el correo con el que registraste tu cuenta. Te enviaremos un
            enlace válido durante 30 minutos.
          </p>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <label>
            <span>Correo electrónico</span>
            <div>
              <Mail size={19} />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                  setMessage("");
                }}
                placeholder="nombre@correo.com"
              />
            </div>
          </label>

          {error && <p className={styles.error}>{error}</p>}
          {message && (
            <p style={{ color: "#176b3a", fontSize: 14, lineHeight: 1.5 }}>
              {message}
            </p>
          )}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar enlace"}
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
