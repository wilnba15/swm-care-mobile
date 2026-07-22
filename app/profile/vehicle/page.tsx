"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  CarFront,
  Check,
  LoaderCircle,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { VehiclePhotoPicker } from "@/components/profile/VehiclePhotoPicker";
import { ApiError, type SwmVehicle } from "@/lib/api/swmApi";
import {
  getPrimaryVehicle,
  updatePrimaryVehicle,
} from "@/lib/vehicle/vehicleService";
import styles from "./vehicle.module.css";

interface VehicleDraft {
  model: string;
  year: string;
  engine: string;
  transmission: string;
  plate: string;
  color: string;
  fuelType: string;
  vin: string;
}

function formatMileage(value: number): string {
  return new Intl.NumberFormat("es-EC").format(value);
}

function toDraft(vehicle: SwmVehicle): VehicleDraft {
  return {
    model: vehicle.model,
    year: String(vehicle.year),
    engine: vehicle.engine || "",
    transmission: vehicle.transmission || "",
    plate: vehicle.plate || "",
    color: vehicle.color || "",
    fuelType: vehicle.fuel_type || "Gasolina",
    vin: vehicle.vin || "",
  };
}

export default function VehiclePage() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<SwmVehicle | null>(null);
  const [draft, setDraft] = useState<VehicleDraft>({
    model: "G01",
    year: "2022",
    engine: "1.5 Turbo",
    transmission: "Manual",
    plate: "",
    color: "Blanco",
    fuelType: "Gasolina",
    vin: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
        setDraft(toDraft(currentVehicle));
      } catch (reason) {
        if (!active) return;

        setError(
          reason instanceof ApiError
            ? reason.detail
            : "No se pudo cargar el vehículo.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadVehicle();

    return () => {
      active = false;
    };
  }, [router]);

  function startEditing() {
    if (!vehicle) return;

    setDraft(toDraft(vehicle));
    setSaved(false);
    setError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    if (vehicle) {
      setDraft(toDraft(vehicle));
    }

    setError("");
    setIsEditing(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!vehicle) return;

    const parsedYear = Number(draft.year);

    if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      setError("Ingresa un año válido.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedVehicle = await updatePrimaryVehicle(vehicle.id, {
        model: draft.model.trim().toUpperCase() || "G01",
        year: parsedYear,
        engine: draft.engine.trim() || null,
        transmission: draft.transmission.trim() || null,
        plate: draft.plate.trim().toUpperCase() || null,
        color: draft.color.trim() || null,
        fuel_type: draft.fuelType.trim() || "Gasolina",
        vin: draft.vin.trim().toUpperCase() || null,
      });

      setVehicle(updatedVehicle);
      setDraft(toDraft(updatedVehicle));
      setIsEditing(false);
      setSaved(true);

      window.setTimeout(() => setSaved(false), 2200);
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.detail
          : "No se pudo actualizar la información.",
      );
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof VehicleDraft, value: string) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  }

  if (loading) {
    return (
      <main className={styles.shell}>
        <section
          style={{
            minHeight: "100dvh",
            display: "grid",
            placeItems: "center",
            color: "#1263e5",
          }}
        >
          <LoaderCircle size={34} className="swm-spinner" />
        </section>
      </main>
    );
  }

  if (!vehicle) {
    return null;
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="Volver"
        >
          <ArrowLeft size={21} />
        </button>

        <div>
          <p>Perfil</p>
          <h1>Mi vehículo</h1>
        </div>

        {!isEditing ? (
          <button
            type="button"
            className={styles.editButton}
            onClick={startEditing}
          >
            <Pencil size={17} />
            Editar
          </button>
        ) : (
          <button
            type="button"
            className={styles.closeButton}
            onClick={cancelEditing}
            aria-label="Cancelar edición"
            disabled={saving}
          >
            <X size={20} />
          </button>
        )}
      </header>

      <section className={styles.content}>
        <article className={styles.heroCard}>
          <div className={styles.vehicleTop}>
            <div>
              <span>Vehículo principal</span>
              <h2>SWM {vehicle.model}</h2>
              <p>
                {vehicle.year} · {vehicle.engine || "Motor sin registrar"} ·{" "}
                {vehicle.transmission || "Transmisión sin registrar"}
              </p>
            </div>

            <VehiclePhotoPicker
              className={styles.vehiclePhoto}
              alt={`SWM ${vehicle.model}`}
            />
          </div>

          <div className={styles.mileage}>
            <CarFront size={20} />
            <span>
              <small>Kilometraje actual</small>
              <strong>{formatMileage(vehicle.current_mileage)} km</strong>
            </span>
          </div>
        </article>

        {saved && (
          <div className={styles.savedMessage}>
            <Check size={17} />
            Información actualizada en la nube
          </div>
        )}

        {error && (
          <div className={styles.savedMessage}>
            <X size={17} />
            {error}
          </div>
        )}

        {!isEditing ? (
          <section className={styles.details}>
            <Detail label="Placa" value={vehicle.plate || "Sin registrar"} />
            <Detail label="Color" value={vehicle.color || "Sin registrar"} />
            <Detail
              label="Combustible"
              value={vehicle.fuel_type || "Sin registrar"}
            />
            <Detail label="VIN" value={vehicle.vin || "Sin registrar"} />
          </section>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.grid}>
              <Field
                label="Modelo"
                value={draft.model}
                onChange={(value) => updateField("model", value)}
              />
              <Field
                label="Año"
                inputMode="numeric"
                value={draft.year}
                onChange={(value) => updateField("year", value)}
              />
              <Field
                label="Motor / versión"
                value={draft.engine}
                onChange={(value) => updateField("engine", value)}
              />
              <Field
                label="Transmisión"
                value={draft.transmission}
                onChange={(value) => updateField("transmission", value)}
              />
              <Field
                label="Placa"
                value={draft.plate}
                onChange={(value) => updateField("plate", value)}
              />
              <Field
                label="Color"
                value={draft.color}
                onChange={(value) => updateField("color", value)}
              />
              <Field
                label="Combustible"
                value={draft.fuelType}
                onChange={(value) => updateField("fuelType", value)}
              />
            </div>

            <Field
              label="VIN"
              value={draft.vin}
              onChange={(value) => updateField("vin", value)}
            />

            <button
              className={styles.saveButton}
              type="submit"
              disabled={saving}
            >
              <Save size={18} />
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detail}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
      />
    </label>
  );
}
