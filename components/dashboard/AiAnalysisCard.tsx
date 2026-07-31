import Link from "next/link";
import { Bot, ChevronRight } from "lucide-react";
import styles from "./AiAnalysisCard.module.css";

export function AiAnalysisCard() {
  return (
    <Link className={styles.card} href="/ai-analysis">
      <span className={styles.icon}>
        <Bot size={26} />
      </span>

      <span className={styles.copy}>
        <strong>Analizar con IA</strong>
        <small>Consulta un problema de tu vehículo.</small>
      </span>

      <ChevronRight className={styles.arrow} size={22} />
    </Link>
  );
}
