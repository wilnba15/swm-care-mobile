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
import { getFuelRecords } from "@/lib/storage/fuelStorage";
import { getServiceRecords } from "@/lib/storage/serviceStorage";
import type { FuelRecord } from "@/lib/types/fuel";
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

export default function HistoryPage() {
  const [filter, setFilter] = useState<HistoryFilter>("all");
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

  const historyItems = useMemo<HistoryItem[]>(() => {
    const services: HistoryItem[] = serviceRecords.map((record) => ({
      id: record.id,
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

    const fuel: HistoryItem[] = fuelRecords.map((record) => ({
      id: record.id,
      type: "fuel",
      date: record.date,
      title: "Carga de combustible",
      category: record.fuelType,
      mileage: record.mileage,
      total: record.total,
      gallons: record.gallons,
      createdAt: record.createdAt,
    }));

    return [...services, ...fuel].sort((a, b) => {
      const dateDifference =
        new Date(`${b.date}T12:00:00`).getTime() -
        new Date(`${a.date}T12:00:00`).getTime();

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [fuelRecords, serviceRecords]);

  const filteredItems = useMemo(() => {
    if (filter === "all") {
      return historyItems;
    }

    return historyItems.filter((item) => item.type === filter);
  }, [filter, historyItems]);

  const totals = useMemo(() => {
    const serviceTotal = serviceRecords.reduce(
      (sum, record) => sum + record.total,
      0,
    );

    const fuelTotal = fuelRecords.reduce(
      (sum, record) => sum + record.total,
      0,
    );

    return {
      serviceTotal,
      fuelTotal,
      grandTotal: serviceTotal + fuelTotal,
    };
  }, [fuelRecords, serviceRecords]);

  function generatePdf() {
    window.print();
  }

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
            <strong>SWM G01</strong>
            <span>2022 · Turbo · Manual</span>
          </div>

          <button type="button" onClick={generatePdf}>
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
            {filteredItems.length === 0 ? (
              <div className={styles.emptyState}>
                <HistoryIcon size={30} />
                <strong>No hay registros</strong>
                <span>
                  Los servicios y cargas guardados aparecerán aquí.
                </span>
              </div>
            ) : (
              filteredItems.map((item) => (
                <HistoryRecordCard item={item} key={`${item.type}-${item.id}`} />
              ))
            )}
          </div>
        </section>
      </section>

      <BottomNavigation />
    </main>
  );
}
