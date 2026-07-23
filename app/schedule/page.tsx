"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CircleAlert,
  CircleCheckBig,
  Clock3,
} from "lucide-react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { BottomNavigation } from "@/components/mobile/BottomNavigation";
import { ServiceScheduleCard } from "@/components/schedule/ServiceScheduleCard";
import {
  loadServiceCloud,
  SERVICE_CLOUD_UPDATED_EVENT,
} from "@/lib/service/serviceService";
import { getPrimaryVehicle } from "@/lib/vehicle/vehicleService";
import type { ServiceRecord } from "@/lib/types/service";
import styles from "./schedule.module.css";

type ScheduleStatus = "upcoming" | "soon" | "overdue";

interface ScheduledService extends ServiceRecord {
  status: ScheduleStatus;
  remainingKm: number | null;
  remainingDays: number | null;
}

function getRemainingDays(date: string | null): number | null {
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(`${date}T12:00:00`);
  target.setHours(0, 0, 0, 0);

  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function getStatus(
  remainingKm: number | null,
  remainingDays: number | null,
): ScheduleStatus {
  if (
    (remainingKm !== null && remainingKm <= 0) ||
    (remainingDays !== null && remainingDays < 0)
  ) {
    return "overdue";
  }

  if (
    (remainingKm !== null && remainingKm <= 1000) ||
    (remainingDays !== null && remainingDays <= 30)
  ) {
    return "soon";
  }

  return "upcoming";
}

export default function SchedulePage() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [currentMileage, setCurrentMileage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const [records, vehicle] = await Promise.all([
          loadServiceCloud(),
          getPrimaryVehicle(),
        ]);

        if (!active) return;

        setServices(records);
        setCurrentMileage(vehicle?.current_mileage || 0);
      } catch {
        if (!active) return;

        setServices([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    void refresh();

    const handleUpdated = () => void refresh();
    window.addEventListener(SERVICE_CLOUD_UPDATED_EVENT, handleUpdated);

    return () => {
      active = false;
      window.removeEventListener(
        SERVICE_CLOUD_UPDATED_EVENT,
        handleUpdated,
      );
    };
  }, []);

  const scheduledServices = useMemo<ScheduledService[]>(() => {
    return services
      .filter(
        (service) =>
          service.nextServiceKm !== null ||
          service.nextServiceDate !== null,
      )
      .map((service) => {
        const remainingKm =
          service.nextServiceKm !== null
            ? service.nextServiceKm - currentMileage
            : null;

        const remainingDays = getRemainingDays(
          service.nextServiceDate,
        );

        return {
          ...service,
          remainingKm,
          remainingDays,
          status: getStatus(remainingKm, remainingDays),
        };
      })
      .sort((a, b) => {
        const order: Record<ScheduleStatus, number> = {
          overdue: 0,
          soon: 1,
          upcoming: 2,
        };

        if (order[a.status] !== order[b.status]) {
          return order[a.status] - order[b.status];
        }

        return (
          (a.remainingKm ??
            a.remainingDays ??
            Number.MAX_SAFE_INTEGER) -
          (b.remainingKm ??
            b.remainingDays ??
            Number.MAX_SAFE_INTEGER)
        );
      });
  }, [services, currentMileage]);

  const summary = useMemo(
    () => ({
      upcoming: scheduledServices.filter(
        (item) => item.status === "upcoming",
      ).length,
      soon: scheduledServices.filter(
        (item) => item.status === "soon",
      ).length,
      overdue: scheduledServices.filter(
        (item) => item.status === "overdue",
      ).length,
    }),
    [scheduledServices],
  );

  return (
    <main className={styles.shell}>
      <MobileHeader />

      <section className={styles.content}>
        <div className={styles.heading}>
          <div>
            <p>Agenda</p>
            <h1>Próximos servicios</h1>
            <span>
              Consulta los mantenimientos programados por kilometraje o
              fecha.
            </span>
          </div>

          <div className={styles.headingIcon}>
            <CalendarDays size={25} />
          </div>
        </div>

        <div className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <span className={styles.summaryIcon}>
              <CircleCheckBig size={19} />
            </span>
            <div>
              <small>Próximos</small>
              <strong>{summary.upcoming}</strong>
            </div>
          </article>

          <article className={styles.summaryCard}>
            <span className={styles.summaryIcon}>
              <Clock3 size={19} />
            </span>
            <div>
              <small>Por vencer</small>
              <strong>{summary.soon}</strong>
            </div>
          </article>

          <article className={styles.summaryCard}>
            <span className={styles.summaryIcon}>
              <CircleAlert size={19} />
            </span>
            <div>
              <small>Vencidos</small>
              <strong>{summary.overdue}</strong>
            </div>
          </article>
        </div>

        <section className={styles.listSection}>
          <div className={styles.listHeader}>
            <h2>Servicios programados</h2>
            <span>{scheduledServices.length}</span>
          </div>

          <div className={styles.list}>
            {loading ? (
              <div className={styles.emptyState}>
                <CalendarDays size={30} />
                <strong>Cargando agenda...</strong>
                <span>Consultando los servicios en la nube.</span>
              </div>
            ) : scheduledServices.length === 0 ? (
              <div className={styles.emptyState}>
                <CalendarDays size={30} />
                <strong>No hay servicios programados</strong>
                <span>
                  Cuando registres un servicio con próximo km o próxima
                  fecha, aparecerá aquí.
                </span>
              </div>
            ) : (
              scheduledServices.map((service) => (
                <ServiceScheduleCard
                  service={service}
                  currentMileage={currentMileage}
                  key={service.id}
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
