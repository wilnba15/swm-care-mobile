"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  CarFront,
  ChevronRight,
  FileText,
  Info,
  LoaderCircle,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/mobile/BottomNavigation";
import { VehiclePhotoPicker } from "@/components/profile/VehiclePhotoPicker";
import { getCurrentUser } from "@/lib/auth/authStorage";
import { ApiError, type SwmVehicle } from "@/lib/api/swmApi";
import {
  getPrimaryVehicle,
  VEHICLE_UPDATED_EVENT,
} from "@/lib/vehicle/vehicleService";
import styles from "./profile.module.css";

function formatMileage(value: number): string {
  return new Intl.NumberFormat("es-EC").format(value);
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sin actualizaciones";
  }

  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(): string {
  const user = getCurrentUser();

  if (!user?.full_name) {
    return "SW";
  }

  return user.full_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

const menuItems = [
  {
    label: "Mi vehículo",
    description: "Datos principales del vehículo",
    icon: CarFront,
    href: "/profile/vehicle",
  },
  {
    label: "Documentos",
    description: "Matrícula, seguro y manual",
    icon: FileText,
  },
  {
    label: "Notificaciones",
    description: "Recordatorios y alertas",
    icon: Bell,
  },
  {
    label: "Configuración",
    description: "Preferencias de la aplicación",
    icon: Settings,
  },
  {
    label: "Acerca de SWM Care",
    description: "Información y versión",
    icon: Info,
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<SwmVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initials, setInitials] = useState("SW");

  useEffect(() => {
    let active = true;
    setInitials(getInitials());

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
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadVehicle();

    function handleVehicleUpdated(event: Event) {
      const customEvent = event as CustomEvent<SwmVehicle | null>;
      if (customEvent.detail) {
        setVehicle(customEvent.detail);
      }
    }

    window.addEventListener(VEHICLE_UPDATED_EVENT, handleVehicleUpdated);

    return () => {
      active = false;
      window.removeEventListener(VEHICLE_UPDATED_EVENT, handleVehicleUpdated);
    };
  }, [router]);

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p>SWM Care Mobile</p>
          <h1>Perfil</h1>
        </div>

        <div className={styles.avatar} aria-label="Iniciales del usuario">
          {initials}
        </div>
      </header>

      <section className={styles.content}>
        {loading ? (
          <article className={styles.vehicleCard}>
            <div
              style={{
                minHeight: 210,
                display: "grid",
                placeItems: "center",
                color: "#8fb2e9",
              }}
            >
              <LoaderCircle size={30} className="swm-spinner" />
            </div>
          </article>
        ) : vehicle ? (
          <article className={styles.vehicleCard}>
            <div className={styles.vehicleTop}>
              <div>
                <span className={styles.vehicleLabel}>Mi vehículo</span>
                <h2>SWM {vehicle.model}</h2>
                <p>
                  {vehicle.year} · {vehicle.engine || "Motor sin registrar"} ·{" "}
                  {vehicle.transmission || "Transmisión sin registrar"}
                </p>
              </div>

              <VehiclePhotoPicker
                className={styles.vehiclePhoto}
                alt={`SWM ${vehicle.model}`}
                editable={false}
              />
            </div>

            <div className={styles.vehicleStats}>
              <div>
                <span>Kilometraje</span>
                <strong>{formatMileage(vehicle.current_mileage)} km</strong>
              </div>

              <div>
                <span>Actualizado</span>
                <strong>{formatUpdatedAt(vehicle.updated_at)}</strong>
              </div>
            </div>

            <div className={styles.status}>
              <span />
              Vehículo registrado en la nube
            </div>
          </article>
        ) : (
          <article className={styles.vehicleCard}>
            <p>{error || "No se encontró un vehículo registrado."}</p>
          </article>
        )}

        <section className={styles.menu} aria-label="Opciones del perfil">
          {menuItems.map(({ label, description, icon: Icon, href }) => {
            const content = (
              <>
                <span className={styles.menuIcon}>
                  <Icon size={21} />
                </span>

                <span className={styles.menuText}>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>

                <ChevronRight className={styles.chevron} size={20} />
              </>
            );

            return href ? (
              <Link className={styles.menuItem} href={href} key={label}>
                {content}
              </Link>
            ) : (
              <button className={styles.menuItem} type="button" key={label}>
                {content}
              </button>
            );
          })}
        </section>

        <p className={styles.version}>SWM Care Mobile · Versión 2.0</p>
      </section>

      <BottomNavigation />
    </main>
  );
}
