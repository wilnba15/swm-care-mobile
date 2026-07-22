"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  CarFront,
  Gauge,
  LoaderCircle,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/authStorage";
import { ApiError } from "@/lib/api/swmApi";
import {
  createPrimaryVehicle,
  getPrimaryVehicle,
} from "@/lib/vehicle/vehicleService";
import styles from "./newVehicle.module.css";

interface VehicleForm {
  model: string;
  year: string;
  engine: string;
  transmission: string;
  currentMileage: string;
  plate: string;
  color: string;
  fuelType: string;
  vin: string;
}

export default function NewVehiclePage() {
  const router = useRouter();
  const [form, setForm] = useState<VehicleForm>({
    model: "G01",
    year: "2022",
    engine: "1.5 Turbo",
    transmission: "Manual",
    currentMileage: "",
    plate: "",
    color: "Blanco",
    fuelType: "Gasolina",
    vin: "",
  });
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkExistingVehicle() {
      try {
        const vehicle = await getPrimaryVehicle(true);

        if (!active) return;

        if (vehicle) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // El formulario seguirá disponible y mostrará errores al guardar.
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    void checkExistingVehicle();

    return () => {
      active = false;
    };
  }, [router]);

  function updateField(field: keyof VehicleForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const year = Number(form.year);
    const currentMileage = Number(
      form.currentMileage.replace(/[.,\s]/g, ""),
    );

    if (!form.model.trim()) {
      setError("Ingresa el modelo del vehículo.");
      return;
    }

    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      setError("Ingresa un año válido.");
      return;
    }

    if (!Number.isInteger(currentMileage) || currentMileage < 0) {
      setError("Ingresa un kilometraje válido.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const currentUser = getCurrentUser();

      await createPrimaryVehicle({
        owner_name: currentUser?.full_name || null,
        model: form.model.trim().toUpperCase(),
        year,
        engine: form.engine.trim() || null,
        transmission: form.transmission.trim() || null,
        current_mileage: currentMileage,
        plate: form.plate.trim().toUpperCase() || null,
        color: form.color.trim() || null,
        fuel_type: form.fuelType.trim() || "Gasolina",
        vin: form.vin.trim().toUpperCase() || null,
        city: currentUser?.city || null,
        usage_type: "Personal",
      });

      router.replace("/dashboard");
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.detail
          : "No se pudo registrar el vehículo.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <main className={styles.shell}>
        <div className={styles.loading}>
          <LoaderCircle size={34} className="swm-spinner" />
          <span>Verificando tu vehículo…</span>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <header className={styles.header}>
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Volver"
          >
            <ArrowLeft size={21} />
          </button>

          <div className={styles.brand}>
            <span>
              <CarFront size={25} />
            </span>
            <strong>SWM Care</strong>
          </div>
        </header>

        <div className={styles.titleBlock}>
          <span>Primer paso</span>
          <h1>Registrar mi vehículo</h1>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <Field
              label="Modelo"
              value={form.model}
              onChange={(value) => updateField("model", value)}
              placeholder="G01"
            />
            <Field
              label="Año"
              value={form.year}
              onChange={(value) => updateField("year", value)}
              inputMode="numeric"
              placeholder="2022"
            />
            <Field
              label="Motor / versión"
              value={form.engine}
              onChange={(value) => updateField("engine", value)}
              placeholder="1.5 Turbo"
            />
            <Field
              label="Transmisión"
              value={form.transmission}
              onChange={(value) => updateField("transmission", value)}
              placeholder="Manual"
            />
          </div>

          <label className={styles.field}>
            <span>Kilometraje actual</span>
            <div className={styles.mileageInput}>
              <Gauge size={19} />
              <input
                type="text"
                inputMode="numeric"
                value={form.currentMileage}
                onChange={(event) =>
                  updateField("currentMileage", event.target.value)
                }
                placeholder="Ej. 90125"
              />
              <strong>km</strong>
            </div>
          </label>

          <div className={styles.grid}>
            <Field
              label="Placa"
              value={form.plate}
              onChange={(value) => updateField("plate", value)}
              placeholder="ABC-1234"
            />
            <Field
              label="Color"
              value={form.color}
              onChange={(value) => updateField("color", value)}
              placeholder="Blanco"
            />
            <Field
              label="Combustible"
              value={form.fuelType}
              onChange={(value) => updateField("fuelType", value)}
              placeholder="Gasolina"
            />
            <Field
              label="VIN"
              value={form.vin}
              onChange={(value) => updateField("vin", value)}
              placeholder="Opcional"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={saving}
          >
            <Save size={19} />
            {saving ? "Registrando..." : "Registrar mi vehículo"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "text" | "numeric";
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
