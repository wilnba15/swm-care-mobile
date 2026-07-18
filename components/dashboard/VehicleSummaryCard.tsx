"use client";

import { FormEvent, useEffect, useState } from "react";
import { Gauge, X } from "lucide-react";
import { VehiclePhotoPicker } from "@/components/profile/VehiclePhotoPicker";
import {
  getVehicleMileage,
  saveVehicleMileage,
} from "@/lib/storage/vehicleStorage";
import styles from "./VehicleSummaryCard.module.css";

function formatMileage(value: number): string {
  return new Intl.NumberFormat("es-EC").format(value);
}

export function VehicleSummaryCard() {
  const [mileage, setMileage] = useState(89500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMileage, setNewMileage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMileage(getVehicleMileage().mileage);
  }, []);

  function openModal() {
    setNewMileage(String(mileage));
    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedMileage = Number(newMileage.replace(/[.,\s]/g, ""));

    if (!Number.isInteger(parsedMileage) || parsedMileage < 0) {
      setError("Ingresa un kilometraje válido.");
      return;
    }

    if (parsedMileage < mileage) {
      setError(
        `El kilometraje no puede ser menor a ${formatMileage(mileage)} km.`,
      );
      return;
    }

    const saved = saveVehicleMileage(parsedMileage);
    setMileage(saved.mileage);
    closeModal();
  }

  return (
    <>
      <article className={styles.card}>
        <div className={styles.top}>
          <div>
            <h2>SWM G01</h2>
            <p>2022 · Turbo · Manual</p>
          </div>

          <VehiclePhotoPicker
            className={styles.vehiclePhoto}
            alt="SWM G01"
            editable={false}
          />
        </div>

        <div className={styles.odometer}>
          <span className={styles.odometerIcon}>
            <Gauge size={22} />
          </span>

          <div>
            <p>Kilometraje actual</p>
            <strong>{formatMileage(mileage)} km</strong>
          </div>

          <button type="button" onClick={openModal}>
            Actualizar
          </button>
        </div>
      </article>

      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="update-mileage-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalIcon}>
                  <Gauge size={22} />
                </span>
                <div>
                  <h3 id="update-mileage-title">Actualizar kilometraje</h3>
                  <p>Registra el kilometraje actual de tu vehículo.</p>
                </div>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span>Nuevo kilometraje</span>
                <div className={styles.inputWrapper}>
                  <input
                    autoFocus
                    type="text"
                    inputMode="numeric"
                    value={newMileage}
                    onChange={(event) => {
                      setNewMileage(event.target.value);
                      setError("");
                    }}
                    placeholder="Ej. 90000"
                    aria-invalid={Boolean(error)}
                  />
                  <strong>km</strong>
                </div>
              </label>

              <p className={styles.currentMileage}>
                Kilometraje registrado: <strong>{formatMileage(mileage)} km</strong>
              </p>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.saveButton}>
                  Guardar kilometraje
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
