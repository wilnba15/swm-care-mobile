"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { CarFront, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { ApiError, login } from "@/lib/api/swmApi";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    try {
      setLoading(true);
      await login({
        email: email.trim().toLowerCase(),
        password,
      });
      router.replace("/dashboard");
    } catch (r) {
      setError(r instanceof ApiError ? r.detail : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <header className={styles.brand}>
          <span>
            <CarFront size={30} />
          </span>
          <div>
            <strong>SWM Care</strong>
            <small>Mobile</small>
          </div>
        </header>

        <form className={styles.form} onSubmit={submit}>
          <label>
            <span>Correo electrónico</span>
            <div>
              <Mail size={19} />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="nombre@correo.com"
              />
            </div>
          </label>

          <label>
            <span>Contraseña</span>
            <div>
              <LockKeyhole size={19} />
              <input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Tu contraseña"
              />
              <button
                type="button"
                aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShow((value) => !value)}
              >
                {show ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -6 }}>
            <Link
              href="/forgot-password"
              style={{
                color: "#1464e8",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className={styles.link}>
          ¿No tienes cuenta? <Link href="/register">Crear cuenta</Link>
        </p>
      </section>
    </main>
  );
}
