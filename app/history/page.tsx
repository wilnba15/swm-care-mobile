"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileDown,
  Fuel,
  History as HistoryIcon,
  ReceiptText,
  Wrench,
} from "lucide-react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { BottomNavigation } from "@/components/mobile/BottomNavigation";
import { HistoryRecordCard } from "@/components/history/HistoryRecordCard";
import { loadFuelCloud } from "@/lib/fuel/fuelService";
import {
  loadServiceCloud,
  SERVICE_CLOUD_UPDATED_EVENT,
} from "@/lib/service/serviceService";
import { getPrimaryVehicle } from "@/lib/vehicle/vehicleService";
import type { SwmFuelRecord, SwmVehicle } from "@/lib/api/swmApi";
import type { ServiceRecord } from "@/lib/types/service";
import styles from "./history.module.css";

type HistoryFilter = "all" | "service" | "fuel";

export type HistoryItem =
  | {
      id: string;
      type: "service";
      date: string;
      title: string;
      category: string;
      mileage: number;
      total: number;
      notes: string;
      nextServiceKm: number | null;
      nextServiceDate: string | null;
      createdAt: string;
    }
  | {
      id: string;
      type: "fuel";
      date: string;
      title: string;
      category: string;
      mileage: number;
      total: number;
      gallons: number;
      createdAt: string;
    };

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function parseFuelNotes(notes?: string | null) {
  const text = notes || "";
  const type = text.match(/Combustible:\s*([^|]+)/i)?.[1]?.trim() || "Combustible";
  const gallonsText = text.match(/Galones:\s*([\d.,]+)/i)?.[1];
  const gallons = gallonsText ? Number(gallonsText.replace(",", ".")) : 0;

  return {
    type,
    gallons: Number.isFinite(gallons) ? gallons : 0,
  };
}

function vehicleSubtitle(vehicle: SwmVehicle | null): string {
  if (!vehicle) return "Vehículo registrado";

  return [
    vehicle.year,
    vehicle.engine || "Motor sin registrar",
    vehicle.transmission || "Transmisión sin registrar",
  ].join(" · ");
}

export default function HistoryPage() {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [fuelRecords, setFuelRecords] = useState<SwmFuelRecord[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [vehicle, setVehicle] = useState<SwmVehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function refreshFuel() {
      try {
        const records = await loadFuelCloud();
        if (active) setFuelRecords(records);
      } catch {
        if (active) setFuelRecords([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    async function refreshVehicle() {
      try {
        const current = await getPrimaryVehicle();
        if (active) setVehicle(current);
      } catch {
        if (active) setVehicle(null);
      }
    }

    async function refreshServices() {
      try {
        const records = await loadServiceCloud();
        if (active) setServiceRecords(records);
      } catch {
        if (active) setServiceRecords([]);
      }
    }

    void refreshFuel();
    void refreshVehicle();
    void refreshServices();

    const handleFuelUpdated = () => void refreshFuel();
    const handleServiceUpdated = () => void refreshServices();

    window.addEventListener("swm:fuel-cloud-updated", handleFuelUpdated);
    window.addEventListener(
      SERVICE_CLOUD_UPDATED_EVENT,
      handleServiceUpdated,
    );

    return () => {
      active = false;
      window.removeEventListener("swm:fuel-cloud-updated", handleFuelUpdated);
      window.removeEventListener(
        SERVICE_CLOUD_UPDATED_EVENT,
        handleServiceUpdated,
      );
    };
  }, []);

  const historyItems = useMemo<HistoryItem[]>(() => {
    const services: HistoryItem[] = serviceRecords.map((record) => ({
      id: String(record.id),
      type: "service",
      date: record.date,
      title: record.notes || record.description || record.category,
      category: record.category,
      mileage: record.mileage,
      total: record.total,
      notes: record.notes || record.description || "",
      nextServiceKm: record.nextServiceKm ?? null,
      nextServiceDate: record.nextServiceDate ?? null,
      createdAt: record.createdAt,
    }));

    const fuels: HistoryItem[] = fuelRecords.map((record) => {
      const parsed = parseFuelNotes(record.notes);

      return {
        id: String(record.id),
        type: "fuel",
        date: record.fuel_date,
        title: "Carga de combustible",
        category: parsed.type,
        mileage: record.mileage,
        total: Number(record.amount),
        gallons: parsed.gallons,
        createdAt: record.created_at,
      };
    });

    return [...services, ...fuels].sort((a, b) => {
      const byDate =
        new Date(`${b.date}T12:00:00`).getTime() -
        new Date(`${a.date}T12:00:00`).getTime();

      if (byDate !== 0) return byDate;

      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [fuelRecords, serviceRecords]);

  const filteredItems = useMemo(() => {
    if (filter === "all") return historyItems;
    return historyItems.filter((item) => item.type === filter);
  }, [filter, historyItems]);

  const totals = useMemo(() => {
    const serviceTotal = serviceRecords.reduce(
      (sum, record) => sum + record.total,
      0,
    );

    const fuelTotal = fuelRecords.reduce(
      (sum, record) => sum + Number(record.amount),
      0,
    );

    return {
      serviceTotal,
      fuelTotal,
      grandTotal: serviceTotal + fuelTotal,
    };
  }, [fuelRecords, serviceRecords]);

  return (
    <main className={styles.shell}>
      <MobileHeader />

      <section className={styles.content}>
        <div className={styles.heading}>
          <div>
            <p>Historial</p>
            <h1>Vida del vehículo</h1>
            <span>
              Consulta servicios y cargas de combustible ordenados por fecha.
            </span>
          </div>

          <div className={styles.headingIcon}>
            <HistoryIcon size={25} />
          </div>
        </div>

        <section className={styles.reportHeader}>
          <div>
            <strong>SWM {vehicle?.model || "G01"}</strong>
            <span>{vehicleSubtitle(vehicle)}</span>
          </div>

          <button type="button" onClick={() => window.print()}>
            <FileDown size={18} />
            Generar PDF
          </button>
        </section>

        <div className={styles.filters} aria-label="Filtrar historial">
          <button
            type="button"
            className={filter === "all" ? styles.activeFilter : ""}
            onClick={() => setFilter("all")}
          >
            Todos
          </button>

          <button
            type="button"
            className={filter === "service" ? styles.activeFilter : ""}
            onClick={() => setFilter("service")}
          >
            <Wrench size={16} />
            Servicios
          </button>

          <button
            type="button"
            className={filter === "fuel" ? styles.activeFilter : ""}
            onClick={() => setFilter("fuel")}
          >
            <Fuel size={16} />
            Combustible
          </button>
        </div>

        <section className={styles.summary}>
          <article>
            <Wrench size={18} />
            <span>Servicios</span>
            <strong>{formatMoney(totals.serviceTotal)}</strong>
          </article>

          <article>
            <Fuel size={18} />
            <span>Combustible</span>
            <strong>{formatMoney(totals.fuelTotal)}</strong>
          </article>

          <article>
            <ReceiptText size={18} />
            <span>Total</span>
            <strong>{formatMoney(totals.grandTotal)}</strong>
          </article>
        </section>

        <section className={styles.listSection}>
          <div className={styles.listHeader}>
            <h2>Registros</h2>
            <span>{filteredItems.length}</span>
          </div>

          <div className={styles.list}>
            {loading && filteredItems.length === 0 ? (
              <div className={styles.emptyState}>
                <HistoryIcon size={30} />
                <strong>Cargando registros...</strong>
                <span>Consultando la información guardada en la nube.</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className={styles.emptyState}>
                <HistoryIcon size={30} />
                <strong>No hay registros</strong>
                <span>Los servicios y cargas guardados aparecerán aquí.</span>
              </div>
            ) : (
              filteredItems.map((item) => (
                <HistoryRecordCard
                  item={item}
                  key={`${item.type}-${item.id}`}
                />
              ))
            )}
          </div>
        </section>
      </section>

      <BottomNavigation />
    </main>
  );
}
