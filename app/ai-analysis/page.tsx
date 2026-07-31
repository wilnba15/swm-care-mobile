"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, CarFront, Sparkles } from "lucide-react";
import { ApiError, analyzeVehicleProblem } from "@/lib/api/swmApi";
import { BottomNavigation } from "@/components/mobile/BottomNavigation";
import styles from "./ai-analysis.module.css";

export default function AiAnalysisPage() {
  const [problem, setProblem] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAnalysis("");

    const cleanProblem = problem.trim();
    if (cleanProblem.length < 5) {
      setError("Describe el problema con un poco más de detalle.");
      return;
    }

    try {
      setLoading(true);
      const response = await analyzeVehicleProblem({ problem: cleanProblem });
      setAnalysis(response.analysis);
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.detail
          : "No se pudo analizar el problema en este momento.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <header className={styles.header}>
          <Link className={styles.back} href="/dashboard" aria-label="Volver al inicio">
            <ArrowLeft size={22} />
          </Link>

          <span className={styles.logo}>
            <CarFront size={28} />
          </span>

          <div>
            <strong>SWM Care</strong>
            <small>Analizar con IA</small>
          </div>
        </header>

        <div className={styles.titleBlock}>
          <span className={styles.aiIcon}>
            <Bot size={26} />
          </span>
          <div>
            <h1>Analizar con IA</h1>
            <p>Describe el problema y recibe una orientación breve.</p>
          </div>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <label htmlFor="vehicle-problem">¿Qué problema presenta tu vehículo?</label>
          <textarea
            id="vehicle-problem"
            maxLength={1200}
            onChange={(event) => {
              setProblem(event.target.value);
              setError("");
            }}
            placeholder="Ejemplo: pierde fuerza al acelerar y se enciende la luz del motor."
            rows={6}
            value={problem}
          />
          <div className={styles.counter}>{problem.length}/1200</div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} disabled={loading} type="submit">
            <Sparkles size={19} />
            {loading ? "Analizando..." : "Analizar problema"}
          </button>
        </form>

        {analysis && (
          <section className={styles.result} aria-live="polite">
            <h2>Orientación de SWM Care IA</h2>
            <p>{analysis}</p>
          </section>
        )}
      </section>

      <BottomNavigation />
    </main>
  );
}
