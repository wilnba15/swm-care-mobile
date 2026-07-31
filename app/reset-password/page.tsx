"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CarFront, Eye, EyeOff, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { ApiError, directResetPassword } from "@/lib/api/swmApi";
import styles from "../login/login.module.css";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [authorizationCode, setAuthorizationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !authorizationCode.trim() || !password || !confirmPassword) {
      setError("Completa todos los campos.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      const response = await directResetPassword({
        email: email.trim().toLowerCase(),
        authorization_code: authorizationCode.trim(),
        new_password: password,
      });
      setSuccess(response.message);
      setPassword("");
      setConfirmPassword("");
      setAuthorizationCode("");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.detail : "No se pudo cambiar la contraseña.");
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

        <div style={{ margin: "26px 0 24px" }}>
          <h1 style={{ margin: 0, fontSize: "clamp(30px, 7vw, 40px)", lineHeight: 1.08 }}>
            Resetear contraseña
          </h1>
          <p style={{ margin: "14px 0 0", color: "#6b7b99", fontSize: 18, lineHeight: 1.55 }}>
            Ingresa tu correo, el código entregado por el administrador y tu nueva contraseña.
          </p>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <label>
            <span>Correo electrónico</span>
            <div>
              <Mail size={19} />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@correo.com" />
            </div>
          </label>

          <label>
            <span>Código de autorización</span>
            <div>
              <KeyRound size={19} />
              <input
                type="text"
                value={authorizationCode}
                onChange={(event) => setAuthorizationCode(event.target.value)}
                placeholder="Código entregado por el administrador"
                autoComplete="one-time-code"
              />
            </div>
          </label>

          <label>
            <span>Nueva contraseña</span>
            <div>
              <LockKeyhole size={19} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Mostrar u ocultar contraseña">
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
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
              />
            </div>
          </label>

          {error && <p className={styles.error}>{error}</p>}
          {success && (
            <p style={{ margin: 0, padding: 14, borderRadius: 14, background: "#ecfdf3", color: "#08783f", lineHeight: 1.45 }}>
              {success} Ya puedes volver al inicio de sesión.
            </p>
          )}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar nueva contraseña"}
          </button>
        </form>

        <p className={styles.link}>
          <Link href="/login"><ArrowLeft size={17} style={{ verticalAlign: "middle", marginRight: 6 }} />Volver al inicio de sesión</Link>
        </p>
      </section>
    </main>
  );
}
