"use client";

import { FormEvent, useEffect, useState } from "react";
import { Gauge, LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { VehiclePhotoPicker } from "@/components/profile/VehiclePhotoPicker";
import { ApiError, type SwmVehicle } from "@/lib/api/swmApi";
import {
  getPrimaryVehicle,
  updatePrimaryMileage,
  VEHICLE_UPDATED_EVENT,
} from "@/lib/vehicle/vehicleService";
import styles from "./VehicleSummaryCard.module.css";

function formatMileage(value: number): string {
  return new Intl.NumberFormat("es-EC").format(value);
}

function vehicleSubtitle(vehicle: SwmVehicle): string {
  return [
    vehicle.year,
    vehicle.engine || "Motor sin registrar",
    vehicle.transmission || "Transmisión sin registrar",
  ].join(" · ");
}

export function VehicleSummaryCard() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<SwmVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMileage, setNewMileage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadVehicle() {
      try {
        const currentVehicle = await getPrimaryVehicle();
        if (!active) return;

        if (!currentVehicle) {
          router.replace("/profile/vehicle/new");
          return;
        }

        setVehicle(currentVehicle);
      } catch (reason) {
        if (!active) return;
        setError(
          reason instanceof ApiError
            ? reason.detail
            : "No se pudo cargar el vehículo.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadVehicle();

    function handleVehicleUpdated(event: Event) {
      const customEvent = event as CustomEvent<SwmVehicle | null>;
      if (customEvent.detail) setVehicle(customEvent.detail);
    }

    window.addEventListener(VEHICLE_UPDATED_EVENT, handleVehicleUpdated);

    return () => {
      active = false;
      window.removeEventListener(VEHICLE_UPDATED_EVENT, handleVehicleUpdated);
    };
  }, [router]);

  function openModal() {
    if (!vehicle) return;
    setNewMileage(String(vehicle.current_mileage));
    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setIsModalOpen(false);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!vehicle) return;

    const parsedMileage = Number(newMileage.replace(/[.,\s]/g, ""));

    if (!Number.isInteger(parsedMileage) || parsedMileage < 0) {
      setError("Ingresa un kilometraje válido.");
      return;
    }

    if (parsedMileage < vehicle.current_mileage) {
      setError(
        `El kilometraje no puede ser menor a ${formatMileage(
          vehicle.current_mileage,
        )} km.`,
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      const updatedVehicle = await updatePrimaryMileage(
        vehicle.id,
        parsedMileage,
      );
      setVehicle(updatedVehicle);
      setIsModalOpen(false);
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.detail
          : "No se pudo actualizar el kilometraje.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <article className={styles.card}>
        <div style={{ minHeight: 150, display: "grid", placeItems: "center", color: "#9db7df" }}>
          <LoaderCircle size={30} className="swm-spinner" />
        </div>
      </article>
    );
  }

  if (!vehicle) return null;

  return (
    <>
      <article className={styles.card}>
        <div className={styles.top}>
          <div>
            <h2>SWM {vehicle.model}</h2>
            <p>{vehicleSubtitle(vehicle)}</p>
          </div>

          <VehiclePhotoPicker
            className={styles.vehiclePhoto}
            alt={`SWM ${vehicle.model}`}
            editable={false}
          />
        </div>

        <div className={styles.odometer}>
          <span className={styles.odometerIcon}>
            <Gauge size={22} />
          </span>

          <div>
            <p>Kilometraje actual</p>
            <strong>{formatMileage(vehicle.current_mileage)} km</strong>
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
                  <p>El cambio se guardará en la nube.</p>
                </div>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
                aria-label="Cerrar"
                disabled={saving}
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
                    disabled={saving}
                  />
                  <strong>km</strong>
                </div>
              </label>

              <p className={styles.currentMileage}>
                Kilometraje registrado:{" "}
                <strong>{formatMileage(vehicle.current_mileage)} km</strong>
              </p>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar kilometraje"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
