"use client";

import { Fuel, Wrench, X } from "lucide-react";
import { useState } from "react";
import { FuelForm } from "./FuelForm";
import { ServiceForm } from "./ServiceForm";
import styles from "./QuickAddSheet.module.css";

interface QuickAddSheetProps {
  open: boolean;
  onClose: () => void;
}

type ViewMode = "menu" | "fuel" | "service";

const options = [
  {
    label: "Servicio",
    description: "Registrar mantenimiento",
    icon: Wrench,
    key: "service",
  },
  {
    label: "Combustible",
    description: "Registrar una carga",
    icon: Fuel,
    key: "fuel",
  },
];

export function QuickAddSheet({ open, onClose }: QuickAddSheetProps) {
  const [view, setView] = useState<ViewMode>("menu");

  if (!open) {
    return null;
  }

  function closeSheet() {
    setView("menu");
    onClose();
  }

  if (view === "fuel") {
    return (
      <div className={styles.overlay} role="dialog" aria-modal="true">
        <button
          className={styles.backdrop}
          type="button"
          aria-label="Cerrar"
          onClick={closeSheet}
        />

        <div className={styles.formContainer}>
          <FuelForm onClose={closeSheet} onSaved={closeSheet} />
        </div>
      </div>
    );
  }

  if (view === "service") {
    return (
      <div className={styles.overlay} role="dialog" aria-modal="true">
        <button
          className={styles.backdrop}
          type="button"
          aria-label="Cerrar"
          onClick={closeSheet}
        />

        <div className={styles.formContainer}>
          <ServiceForm onClose={closeSheet} onSaved={closeSheet} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Cerrar"
        onClick={closeSheet}
      />

      <section className={styles.menuCard}>
        <div className={styles.header}>
          <div>
            <strong>Registro rápido</strong>
            <span>Selecciona una opción</span>
          </div>

          <button type="button" onClick={closeSheet} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <div className={styles.list}>
          {options.map(({ label, description, icon: Icon, key }, index) => (
            <button
              type="button"
              className={styles.option}
              key={key}
              onClick={() => setView(key as ViewMode)}
            >
              <span
                className={`${styles.optionIcon} ${
                  styles[`tone${index + 1}`]
                }`}
              >
                <Icon size={22} />
              </span>

              <span className={styles.optionText}>
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
