"use client";

import { useEffect, useMemo, useState } from "react";
import { Fuel, ReceiptText, Wrench } from "lucide-react";
import { getFuelRecords } from "@/lib/storage/fuelStorage";
import { getServiceRecords } from "@/lib/storage/serviceStorage";
import type { FuelRecord } from "@/lib/types/fuel";
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

function serviceTitle(record: ServiceRecord): string {
  const text = record.notes || record.description || record.category;

  return text.length > 36 ? `${text.slice(0, 36)}…` : text;
}

export function RecentActivity() {
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    function refresh() {
      setFuelRecords(getFuelRecords());
      setServiceRecords(getServiceRecords());
    }

    refresh();
    window.addEventListener("swm:fuel-added", refresh);
    window.addEventListener("swm:service-added", refresh);

    return () => {
      window.removeEventListener("swm:fuel-added", refresh);
      window.removeEventListener("swm:service-added", refresh);
    };
  }, []);

  const activities = useMemo<ActivityItem[]>(() => {
    const fuelActivities: ActivityItem[] = fuelRecords.map((record) => ({
      id: record.id,
      kind: "fuel",
      title: "Carga de combustible",
      detail: `${record.fuelType} · ${record.gallons.toFixed(2)} galones`,
      date: record.date,
      value: record.total,
      createdAt: record.createdAt,
    }));

    const serviceActivities: ActivityItem[] = serviceRecords.map((record) => ({
      id: record.id,
      kind: "service",
      title: serviceTitle(record),
      detail: record.category,
      date: record.date,
      value: record.total,
      createdAt: record.createdAt,
    }));

    return [...fuelActivities, ...serviceActivities]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3);
  }, [fuelRecords, serviceRecords]);

  const monthlyTotal = useMemo(() => {
    const now = new Date();

    const isCurrentMonth = (date: string) => {
      const recordDate = new Date(`${date}T12:00:00`);

      return (
        recordDate.getMonth() === now.getMonth() &&
        recordDate.getFullYear() === now.getFullYear()
      );
    };

    const fuelTotal = fuelRecords
      .filter((record) => isCurrentMonth(record.date))
      .reduce((total, record) => total + record.total, 0);

    const serviceTotal = serviceRecords
      .filter((record) => isCurrentMonth(record.date))
      .reduce((total, record) => total + record.total, 0);

    return fuelTotal + serviceTotal;
  }, [fuelRecords, serviceRecords]);

  return (
    <section>
      <div className={styles.titleRow}>
        <h2>Actividad reciente</h2>
        <button type="button">Ver todo</button>
      </div>

      <div className={styles.list}>
        {activities.length === 0 && (
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
