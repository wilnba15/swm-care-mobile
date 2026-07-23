"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Fuel, X } from "lucide-react";
import { ApiError } from "@/lib/api/swmApi";
import { saveFuelCloud } from "@/lib/fuel/fuelService";
import { getPrimaryVehicle } from "@/lib/vehicle/vehicleService";
import type { FuelType } from "@/lib/types/fuel";
import styles from "./FuelForm.module.css";

interface FuelFormProps {
  onClose: () => void;
  onSaved: () => void;
}

export function FuelForm({ onClose, onSaved }: FuelFormProps) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [date, setDate] = useState(today);
  const [mileage, setMileage] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("Extra");
  const [gallons, setGallons] = useState("");
  const [total, setTotal] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loadingVehicle, setLoadingVehicle] = useState(true);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    let active = true;

    async function loadMileage() {
      try {
        const vehicle = await getPrimaryVehicle();

        if (!active) return;

        if (!vehicle) {
          setError("Primero debes registrar tu vehículo.");
          return;
        }

        setMileage(String(vehicle.current_mileage));
      } catch (reason) {
        if (!active) return;

        setError(
          reason instanceof ApiError
            ? reason.detail
            : "No se pudo cargar el kilometraje del vehículo.",
        );
      } finally {
        if (active) setLoadingVehicle(false);
      }
    }

    void loadMileage();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const mileageValue = Number(mileage);
    const gallonsValue = Number(gallons);
    const totalValue = Number(total);

    if (!date || mileageValue <= 0 || gallonsValue <= 0 || totalValue <= 0) {
      setError("Completa la fecha, kilometraje, galones y valor.");
      return;
    }

    try {
      setSaving(true);

      const fuelNotes = [
        `Combustible: ${fuelType}`,
        `Galones: ${gallonsValue.toFixed(2)}`,
        `Precio por galón: $${(totalValue / gallonsValue).toFixed(4)}`,
        notes.trim() ? `Observaciones: ${notes.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      await saveFuelCloud({
        date,
        mileage: mileageValue,
        total: Number(totalValue.toFixed(2)),
        notes: fuelNotes,
      });

      window.dispatchEvent(new CustomEvent("swm:fuel-cloud-updated"));
      onSaved();
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.detail
          : reason instanceof Error
            ? reason.message
            : "No se pudo guardar la carga de combustible.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.formShell}>
      <div className={styles.formHeader}>
        <div className={styles.title}>
          <span><Fuel size={21} /></span>
          <div>
            <strong>Registrar combustible</strong>
            <small>Nueva carga del vehículo</small>
          </div>
        </div>

        <button type="button" onClick={onClose} aria-label="Cerrar formulario">
          <X size={21} />
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.twoColumns}>
          <label>
            <span>Fecha</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <label>
            <span>Kilometraje</span>
            <input
              type="number"
              min="1"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="Ej. 89500"
              disabled={saving || loadingVehicle}
            />
          </label>
        </div>

        <label>
          <span>Tipo de combustible</span>
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value as FuelType)}
          >
            <option value="Extra">Extra</option>
            <option value="Súper">Súper</option>
            <option value="Diésel">Diésel</option>
          </select>
        </label>

        <div className={styles.twoColumns}>
          <label>
            <span>Galones</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={gallons}
              onChange={(e) => setGallons(e.target.value)}
              placeholder="Ej. 10.2"
            />
          </label>

          <label>
            <span>Valor</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="Ej. 32.00"
            />
          </label>
        </div>

        <label>
          <span>Observaciones</span>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Información adicional opcional"
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar carga"}
          </button>
        </div>
      </form>
    </div>
  );
}
