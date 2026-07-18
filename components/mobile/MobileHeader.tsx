import { Bell, CarFront } from "lucide-react";
import styles from "./MobileHeader.module.css";

export function MobileHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}><CarFront size={21} strokeWidth={2.2} /></span>
        <div><strong>SWM Care</strong><span>Mobile</span></div>
      </div>
      <button className={styles.iconButton} type="button" aria-label="Notificaciones">
        <Bell size={21} /><span className={styles.dot} />
      </button>
    </header>
  );
}
