"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, CarFront, Check, Pencil, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { VehiclePhotoPicker } from "@/components/profile/VehiclePhotoPicker";
import {
  getVehicleProfile,
  saveVehicleProfile,
  type VehicleProfile,
} from "@/lib/storage/vehicleProfileStorage";
import { getVehicleMileage } from "@/lib/storage/vehicleStorage";
import styles from "./vehicle.module.css";

function formatMileage(value: number): string {
  return new Intl.NumberFormat("es-EC").format(value);
}

export default function VehiclePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<VehicleProfile>({
    brand: "SWM",
    model: "G01",
    year: "2022",
    version: "Turbo",
    transmission: "Manual",
    plate: "",
    color: "Blanco",
    fuel: "Gasolina",
    vin: "",
  });
  const [draft, setDraft] = useState(profile);
  const [mileage, setMileage] = useState(89500);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedProfile = getVehicleProfile();
    setProfile(storedProfile);
    setDraft(storedProfile);
    setMileage(getVehicleMileage().mileage);
  }, []);

  function startEditing() {
    setDraft(profile);
    setSaved(false);
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraft(profile);
    setIsEditing(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanProfile: VehicleProfile = {
      ...draft,
      brand: draft.brand.trim() || "SWM",
      model: draft.model.trim() || "G01",
      year: draft.year.trim(),
      version: draft.version.trim(),
      transmission: draft.transmission.trim(),
      plate: draft.plate.trim().toUpperCase(),
      color: draft.color.trim(),
      fuel: draft.fuel.trim(),
      vin: draft.vin.trim().toUpperCase(),
    };

    const updated = saveVehicleProfile(cleanProfile);
    setProfile(updated);
    setDraft(updated);
    setIsEditing(false);
    setSaved(true);

    window.setTimeout(() => setSaved(false), 2200);
  }

  function updateField(field: keyof VehicleProfile, value: string) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
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
              <h2>
                {profile.brand} {profile.model}
              </h2>
              <p>
                {profile.year || "Año"} · {profile.version || "Versión"} ·{" "}
                {profile.transmission || "Transmisión"}
              </p>
            </div>

            <VehiclePhotoPicker
              className={styles.vehiclePhoto}
              alt={`${profile.brand} ${profile.model}`}
            />
          </div>

          <div className={styles.mileage}>
            <CarFront size={20} />
            <span>
              <small>Kilometraje actual</small>
              <strong>{formatMileage(mileage)} km</strong>
            </span>
          </div>
        </article>

        {saved && (
          <div className={styles.savedMessage}>
            <Check size={17} />
            Información actualizada
          </div>
        )}

        {!isEditing ? (
          <section className={styles.details}>
            <Detail label="Placa" value={profile.plate || "Sin registrar"} />
            <Detail label="Color" value={profile.color || "Sin registrar"} />
            <Detail
              label="Combustible"
              value={profile.fuel || "Sin registrar"}
            />
            <Detail label="VIN" value={profile.vin || "Sin registrar"} />
          </section>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.grid}>
              <Field
                label="Marca"
                value={draft.brand}
                onChange={(value) => updateField("brand", value)}
              />
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
                label="Versión"
                value={draft.version}
                onChange={(value) => updateField("version", value)}
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
                value={draft.fuel}
                onChange={(value) => updateField("fuel", value)}
              />
            </div>

            <Field
              label="VIN"
              value={draft.vin}
              onChange={(value) => updateField("vin", value)}
            />

            <button className={styles.saveButton} type="submit">
              <Save size={18} />
              Guardar cambios
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
