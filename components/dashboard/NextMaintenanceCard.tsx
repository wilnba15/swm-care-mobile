import { CalendarClock, Wrench } from "lucide-react";
import styles from "./NextMaintenanceCard.module.css";

export function NextMaintenanceCard() {
  return (
    <article className={styles.card}>
      <div className={styles.heading}>
        <div>
          <span>Próximo mantenimiento</span>
          <h2>Servicio de 90.000 km</h2>
        </div>

        <span className={styles.icon}>
          <Wrench size={21} />
        </span>
      </div>

      <div className={styles.track}>
        <span />
      </div>

      <div className={styles.stats}>
        <div>
          <small>Faltan</small>
          <strong>500 km</strong>
        </div>

        <div>
          <small>Fecha estimada</small>
          <strong>
            <CalendarClock size={16} />
            28 jul. 2026
          </strong>
        </div>
      </div>
    </article>
  );
}
