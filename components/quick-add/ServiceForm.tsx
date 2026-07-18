"use client";

import { FormEvent, useMemo, useState } from "react";
import { Wrench, X } from "lucide-react";
import { saveServiceRecord } from "@/lib/storage/serviceStorage";
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
  const [mileage, setMileage] = useState("89500");
  const [total, setTotal] = useState("");
  const [category, setCategory] =
    useState<ServiceCategory>("Mantenimiento");
  const [notes, setNotes] = useState("");
  const [nextServiceKm, setNextServiceKm] = useState("");
  const [nextServiceDate, setNextServiceDate] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const mileageValue = Number(mileage);
    const totalValue = Number(total);
    const nextKmValue = nextServiceKm ? Number(nextServiceKm) : null;

    if (!date || mileageValue <= 0 || totalValue <= 0 || !notes.trim()) {
      setError(
        "Completa la fecha, kilometraje, valor y servicio realizado.",
      );
      return;
    }

    if (nextKmValue !== null && nextKmValue <= mileageValue) {
      setError("El próximo kilometraje debe ser mayor al kilometraje actual.");
      return;
    }

    saveServiceRecord({
      id: crypto.randomUUID(),
      date,
      mileage: mileageValue,
      category,
      notes: notes.trim(),
      total: Number(totalValue.toFixed(2)),
      nextServiceKm: nextKmValue,
      nextServiceDate: nextServiceDate || null,
      createdAt: new Date().toISOString(),
    });

    onSaved();
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

        <button type="button" onClick={onClose} aria-label="Cerrar formulario">
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
              />
            </label>

            <label>
              <span>Próxima fecha</span>
              <input
                type="date"
                value={nextServiceDate}
                onChange={(event) => setNextServiceDate(event.target.value)}
              />
            </label>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Cancelar
          </button>

          <button type="submit" className={styles.save}>
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
