"use client";

import { Camera, ImagePlus, Pencil, Trash2, X } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  getVehiclePhoto,
  removeVehiclePhoto,
  saveVehiclePhoto,
} from "@/lib/storage/vehiclePhotoStorage";
import styles from "./VehiclePhotoPicker.module.css";

interface VehiclePhotoPickerProps {
  alt: string;
  className?: string;
  defaultPhoto?: string;
  editable?: boolean;
}

const MAX_IMAGE_SIZE = 1200;
const JPEG_QUALITY = 0.82;

async function optimizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("La imagen seleccionada no es válida."));
      image.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("No se pudo procesar la imagen."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };

      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

export function VehiclePhotoPicker({
  alt,
  className = "",
  defaultPhoto = "/swm-g01.png",
  editable = true,
}: VehiclePhotoPickerProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setPhoto(getVehiclePhoto());

    function handlePhotoUpdated(event: Event) {
      const customEvent = event as CustomEvent<string>;
      setPhoto(customEvent.detail ?? "");
    }

    window.addEventListener("swm:vehicle-photo-updated", handlePhotoUpdated);
    return () => window.removeEventListener("swm:vehicle-photo-updated", handlePhotoUpdated);
  }, []);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecciona un archivo de imagen.");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");
      const optimizedPhoto = await optimizeImage(file);
      saveVehiclePhoto(optimizedPhoto);
      setPhoto(optimizedPhoto);
      setIsSheetOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar la fotografía.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleRemove() {
    removeVehiclePhoto();
    setPhoto("");
    setError("");
    setIsSheetOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.photoButton} ${className}`}
        onClick={() => editable && setIsSheetOpen(true)}
        aria-label={editable ? "Cambiar fotografía del vehículo" : alt}
        disabled={!editable}
      >
        <img src={photo || defaultPhoto} alt={alt} />
        {editable && (
          <span className={styles.editBadge} aria-hidden="true">
            <Pencil size={13} />
          </span>
        )}
      </button>

      <input
        ref={cameraInputRef}
        className={styles.hiddenInput}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        className={styles.hiddenInput}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {isSheetOpen && (
        <div className={styles.backdrop} onClick={() => setIsSheetOpen(false)}>
          <section
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vehicle-photo-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.handle} />
            <div className={styles.sheetHeader}>
              <div>
                <h3 id="vehicle-photo-title">Foto del vehículo</h3>
                <p>Personaliza la imagen que verás en la aplicación.</p>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsSheetOpen(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <button
              type="button"
              className={styles.option}
              onClick={() => cameraInputRef.current?.click()}
              disabled={isProcessing}
            >
              <span><Camera size={21} /></span>
              <div><strong>Tomar fotografía</strong><small>Usar la cámara del teléfono</small></div>
            </button>

            <button
              type="button"
              className={styles.option}
              onClick={() => galleryInputRef.current?.click()}
              disabled={isProcessing}
            >
              <span><ImagePlus size={21} /></span>
              <div><strong>Elegir de la galería</strong><small>Seleccionar una imagen guardada</small></div>
            </button>

            {photo && (
              <button
                type="button"
                className={`${styles.option} ${styles.deleteOption}`}
                onClick={handleRemove}
                disabled={isProcessing}
              >
                <span><Trash2 size={21} /></span>
                <div><strong>Eliminar fotografía</strong><small>Volver a la imagen predeterminada</small></div>
              </button>
            )}

            {isProcessing && <p className={styles.processing}>Procesando fotografía…</p>}
            {error && <p className={styles.error}>{error}</p>}

            <button type="button" className={styles.cancelButton} onClick={() => setIsSheetOpen(false)}>
              Cancelar
            </button>
          </section>
        </div>
      )}
    </>
  );
}
