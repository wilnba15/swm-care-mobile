"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CarFront, Eye, EyeOff, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { ApiError, directResetPassword } from "@/lib/api/swmApi";
import styles from "../login/login.module.css";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!email.trim() || !resetCode.trim()) { setError("Ingresa tu correo y el código de autorización."); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (password !== confirmation) { setError("Las contraseñas no coinciden."); return; }

    try {
      setLoading(true);
      const response = await directResetPassword({
        email: email.trim().toLowerCase(),
        reset_code: resetCode.trim(),
        new_password: password,
      });
      setMessage(response.message);
      setPassword("");
      setConfirmation("");
      setResetCode("");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.detail : "No se pudo resetear la contraseña.");
    } finally { setLoading(false); }
  }

  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <header className={styles.brand}>
          <span><CarFront size={30} /></span>
          <div><strong>SWM Care</strong><small>Mobile</small></div>
        </header>

        <div style={{ margin: "28px 0 22px" }}>
          <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.1 }}>Resetear contraseña</h1>
          <p style={{ margin: "12px 0 0", color: "#6f7f9d", lineHeight: 1.55 }}>
            Solicita al administrador el código de autorización y registra tu nueva contraseña.
          </p>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <label><span>Correo electrónico</span><div><Mail size={19} /><input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="nombre@correo.com" /></div></label>
          <label><span>Código de autorización</span><div><KeyRound size={19} /><input type="password" value={resetCode} onChange={(e) => { setResetCode(e.target.value); setError(""); }} placeholder="Código entregado por el administrador" /></div></label>
          <label><span>Nueva contraseña</span><div><LockKeyhole size={19} /><input type={show ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="Mínimo 6 caracteres" /><button type="button" onClick={() => setShow((value) => !value)}>{show ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label>
          <label><span>Confirmar contraseña</span><div><LockKeyhole size={19} /><input type={show ? "text" : "password"} value={confirmation} onChange={(e) => { setConfirmation(e.target.value); setError(""); }} placeholder="Repite la contraseña" /></div></label>

          {error && <p className={styles.error}>{error}</p>}
          {message && <p style={{ color: "#176b3a", fontSize: 14, lineHeight: 1.5 }}>{message} <Link href="/login">Ingresar ahora</Link></p>}
          <button className={styles.submit} type="submit" disabled={loading || Boolean(message)}>{loading ? "Guardando..." : "Guardar nueva contraseña"}</button>
        </form>

        <p className={styles.link}><Link href="/login"><ArrowLeft size={16} style={{ verticalAlign: "middle", marginRight: 5 }} />Volver al inicio de sesión</Link></p>
      </section>
    </main>
  );
}
