"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Wrench, X } from "lucide-react";
import { ApiError } from "@/lib/api/swmApi";
import { saveServiceCloud } from "@/lib/service/serviceService";
import { getPrimaryVehicle } from "@/lib/vehicle/vehicleService";
import type { ServiceCategory } from "@/lib/types/service";
import styles from "./ServiceForm.module.css";

interface ServiceFormProps {
  onClose: () => void;
  onSaved: () => void;
}

const categories: ServiceCategory[] = [
  "Mantenimiento",
  "Mecánico",
  "Eléctrico",
  "Carrocería",
  "Neumáticos",
  "Otro",
];

export function ServiceForm({ onClose, onSaved }: ServiceFormProps) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [date, setDate] = useState(today);
  const [mileage, setMileage] = useState("");
  const [total, setTotal] = useState("");
  const [category, setCategory] =
    useState<ServiceCategory>("Mantenimiento");
  const [notes, setNotes] = useState("");
  const [nextServiceKm, setNextServiceKm] = useState("");
  const [nextServiceDate, setNextServiceDate] = useState("");
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
            : "No se pudo cargar el kilometraje.",
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

    const mileageValue = Number(mileage.replace(/[.,\s]/g, ""));
    const totalValue = Number(total);
    const nextKmValue = nextServiceKm
      ? Number(nextServiceKm.replace(/[.,\s]/g, ""))
      : null;

    if (
      !date ||
      !Number.isInteger(mileageValue) ||
      mileageValue <= 0 ||
      !Number.isFinite(totalValue) ||
      totalValue <= 0 ||
      !notes.trim()
    ) {
      setError(
        "Completa la fecha, kilometraje, valor y servicio realizado.",
      );
      return;
    }

    if (
      nextKmValue !== null &&
      (!Number.isInteger(nextKmValue) || nextKmValue <= mileageValue)
    ) {
      setError("El próximo kilometraje debe ser mayor al kilometraje actual.");
      return;
    }

    try {
      setSaving(true);

      await saveServiceCloud({
        date,
        mileage: mileageValue,
        category,
        notes: notes.trim(),
        total: Number(totalValue.toFixed(2)),
        nextServiceKm: nextKmValue,
        nextServiceDate: nextServiceDate || null,
      });

      onSaved();
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.detail
          : reason instanceof Error
            ? reason.message
            : "No se pudo guardar el servicio.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.formShell}>
      <div className={styles.formHeader}>
        <div className={styles.title}>
          <span>
            <Wrench size={21} />
          </span>

          <div>
            <strong>Registrar servicio</strong>
            <small>Mantenimiento o reparación</small>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar formulario"
          disabled={saving}
        >
          <X size={21} />
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.threeColumns}>
          <label>
            <span>Fecha</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={saving}
            />
          </label>

          <label>
            <span>Kilometraje</span>
            <input
              type="number"
              min="1"
              value={mileage}
              onChange={(event) => setMileage(event.target.value)}
              placeholder="89500"
              disabled={saving || loadingVehicle}
            />
          </label>

          <label>
            <span>Valor</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={total}
              onChange={(event) => setTotal(event.target.value)}
              placeholder="75.00"
              disabled={saving}
            />
          </label>
        </div>

        <label>
          <span>Categoría</span>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as ServiceCategory)
            }
            disabled={saving}
          >
            {categories.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Observaciones o servicio realizado</span>
          <textarea
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Ej. Cambio de aceite 5W30 full sintético y filtro"
            disabled={saving}
          />
        </label>

        <div className={styles.nextServiceBox}>
          <div className={styles.nextServiceTitle}>
            <strong>Próximo servicio</strong>
            <span>Opcional</span>
          </div>

          <div className={styles.twoColumns}>
            <label>
              <span>Próximo km</span>
              <input
                type="number"
                min="1"
                value={nextServiceKm}
                onChange={(event) => setNextServiceKm(event.target.value)}
                placeholder="Ej. 100000"
                disabled={saving}
              />
            </label>

            <label>
              <span>Próxima fecha</span>
              <input
                type="date"
                value={nextServiceDate}
                onChange={(event) => setNextServiceDate(event.target.value)}
                disabled={saving}
              />
            </label>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancel}
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>

          <button type="submit" className={styles.save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
