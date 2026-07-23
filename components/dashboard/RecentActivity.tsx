"use client";

import { useEffect, useMemo, useState } from "react";
import { Fuel, ReceiptText, Wrench } from "lucide-react";
import { loadFuelCloud } from "@/lib/fuel/fuelService";
import {
  loadServiceCloud,
  SERVICE_CLOUD_UPDATED_EVENT,
} from "@/lib/service/serviceService";
import type { SwmFuelRecord } from "@/lib/api/swmApi";
import type { ServiceRecord } from "@/lib/types/service";
import styles from "./RecentActivity.module.css";

type ActivityItem = {
  id: string;
  kind: "fuel" | "service";
  title: string;
  detail: string;
  date: string;
  value: number;
  createdAt: string;
};

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function parseFuelNotes(notes?: string | null) {
  const text = notes || "";
  const type =
    text.match(/Combustible:\s*([^|]+)/i)?.[1]?.trim() || "Combustible";
  const gallonsText = text.match(/Galones:\s*([\d.,]+)/i)?.[1];
  const gallons = gallonsText
    ? Number(gallonsText.replace(",", "."))
    : null;

  return {
    type,
    gallons: Number.isFinite(gallons) ? gallons : null,
  };
}

function serviceTitle(record: ServiceRecord): string {
  const text = record.notes || record.description || record.category;
  return text.length > 36 ? `${text.slice(0, 36)}…` : text;
}

export function RecentActivity() {
  const [fuelRecords, setFuelRecords] = useState<SwmFuelRecord[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function refreshAll() {
      try {
        const [fuel, services] = await Promise.all([
          loadFuelCloud(),
          loadServiceCloud(),
        ]);

        if (!active) return;

        setFuelRecords(fuel);
        setServiceRecords(services);
      } catch {
        if (!active) return;

        setFuelRecords([]);
        setServiceRecords([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    void refreshAll();

    const refresh = () => void refreshAll();

    window.addEventListener("swm:fuel-cloud-updated", refresh);
    window.addEventListener(SERVICE_CLOUD_UPDATED_EVENT, refresh);

    return () => {
      active = false;
      window.removeEventListener("swm:fuel-cloud-updated", refresh);
      window.removeEventListener(SERVICE_CLOUD_UPDATED_EVENT, refresh);
    };
  }, []);

  const activities = useMemo<ActivityItem[]>(() => {
    const fuels = fuelRecords.map((record) => {
      const parsed = parseFuelNotes(record.notes);

      return {
        id: `fuel-${record.id}`,
        kind: "fuel" as const,
        title: "Carga de combustible",
        detail:
          parsed.gallons !== null
            ? `${parsed.type} · ${parsed.gallons.toFixed(2)} galones`
            : parsed.type,
        date: record.fuel_date,
        value: Number(record.amount),
        createdAt: record.created_at,
      };
    });

    const services = serviceRecords.map((record) => ({
      id: `service-${record.id}`,
      kind: "service" as const,
      title: serviceTitle(record),
      detail: record.category,
      date: record.date,
      value: record.total,
      createdAt: record.createdAt,
    }));

    return [...fuels, ...services]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )
      .slice(0, 3);
  }, [fuelRecords, serviceRecords]);

  const monthlyTotal = useMemo(() => {
    const now = new Date();

    const currentMonth = (date: string) => {
      const value = new Date(`${date}T12:00:00`);

      return (
        value.getMonth() === now.getMonth() &&
        value.getFullYear() === now.getFullYear()
      );
    };

    const fuel = fuelRecords
      .filter((record) => currentMonth(record.fuel_date))
      .reduce((sum, record) => sum + Number(record.amount), 0);

    const services = serviceRecords
      .filter((record) => currentMonth(record.date))
      .reduce((sum, record) => sum + record.total, 0);

    return fuel + services;
  }, [fuelRecords, serviceRecords]);

  return (
    <section>
      <div className={styles.titleRow}>
        <h2>Actividad reciente</h2>
        <button type="button">Ver todo</button>
      </div>

      <div className={styles.list}>
        {loading && activities.length === 0 && (
          <article className={styles.item}>
            <span className={styles.icon}>
              <ReceiptText size={19} />
            </span>
            <div className={styles.copy}>
              <strong>Cargando actividad...</strong>
              <span>Consultando la nube</span>
            </div>
          </article>
        )}

        {!loading && activities.length === 0 && (
          <article className={styles.item}>
            <span className={styles.icon}>
              <Wrench size={19} />
            </span>
            <div className={styles.copy}>
              <strong>Sin registros todavía</strong>
              <span>Usa el botón azul para comenzar</span>
            </div>
          </article>
        )}

        {activities.map((activity) => {
          const Icon = activity.kind === "fuel" ? Fuel : Wrench;

          return (
            <article className={styles.item} key={activity.id}>
              <span className={styles.icon}>
                <Icon size={19} />
              </span>

              <div className={styles.copy}>
                <strong>{activity.title}</strong>
                <span>{activity.detail}</span>
                <small>{formatDate(activity.date)}</small>
              </div>

              <strong className={styles.value}>
                {formatMoney(activity.value)}
              </strong>
            </article>
          );
        })}

        <div className={styles.summary}>
          <ReceiptText size={19} />
          <span>Gastos del mes</span>
          <strong>{formatMoney(monthlyTotal)}</strong>
        </div>
      </div>
    </section>
  );
}
