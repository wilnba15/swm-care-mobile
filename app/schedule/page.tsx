"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CircleAlert, CircleCheckBig, Clock3 } from "lucide-react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { BottomNavigation } from "@/components/mobile/BottomNavigation";
import { ServiceScheduleCard } from "@/components/schedule/ServiceScheduleCard";
import { getServiceRecords } from "@/lib/storage/serviceStorage";
import type { ServiceRecord } from "@/lib/types/service";
import styles from "./schedule.module.css";

const CURRENT_MILEAGE = 89500;

type ScheduleStatus = "upcoming" | "soon" | "overdue";

interface ScheduledService extends ServiceRecord {
  status: ScheduleStatus;
  remainingKm: number | null;
  remainingDays: number | null;
}

function getRemainingDays(date: string | null): number | null {
  if (!date) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(`${date}T12:00:00`);
  target.setHours(0, 0, 0, 0);

  const difference = target.getTime() - today.getTime();

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

function getStatus(
  remainingKm: number | null,
  remainingDays: number | null,
): ScheduleStatus {
  const overdueByKm = remainingKm !== null && remainingKm <= 0;
  const overdueByDate = remainingDays !== null && remainingDays < 0;

  if (overdueByKm || overdueByDate) {
    return "overdue";
  }

  const soonByKm = remainingKm !== null && remainingKm <= 1000;
  const soonByDate = remainingDays !== null && remainingDays <= 30;

  if (soonByKm || soonByDate) {
    return "soon";
  }

  return "upcoming";
}

export default function SchedulePage() {
  const [services, setServices] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    function refresh() {
      setServices(getServiceRecords());
    }

    refresh();
    window.addEventListener("swm:service-added", refresh);

    return () => {
      window.removeEventListener("swm:service-added", refresh);
    };
  }, []);

  const scheduledServices = useMemo<ScheduledService[]>(() => {
    return services
      .filter(
        (service) =>
          service.nextServiceKm !== null || service.nextServiceDate !== null,
      )
      .map((service) => {
        const remainingKm =
          service.nextServiceKm !== null
            ? service.nextServiceKm - CURRENT_MILEAGE
            : null;

        const remainingDays = getRemainingDays(service.nextServiceDate);

        return {
          ...service,
          remainingKm,
          remainingDays,
          status: getStatus(remainingKm, remainingDays),
        };
      })
      .sort((a, b) => {
        const statusOrder: Record<ScheduleStatus, number> = {
          overdue: 0,
          soon: 1,
          upcoming: 2,
        };

        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }

        const aValue =
          a.remainingKm ?? a.remainingDays ?? Number.MAX_SAFE_INTEGER;
        const bValue =
          b.remainingKm ?? b.remainingDays ?? Number.MAX_SAFE_INTEGER;

        return aValue - bValue;
      });
  }, [services]);

  const summary = useMemo(() => {
    return {
      upcoming: scheduledServices.filter((item) => item.status === "upcoming")
        .length,
      soon: scheduledServices.filter((item) => item.status === "soon").length,
      overdue: scheduledServices.filter((item) => item.status === "overdue")
        .length,
    };
  }, [scheduledServices]);

  return (
    <main className={styles.shell}>
      <MobileHeader />

      <section className={styles.content}>
        <div className={styles.heading}>
          <div>
            <p>Agenda</p>
            <h1>Próximos servicios</h1>
            <span>
              Consulta los mantenimientos programados por kilometraje o fecha.
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
            {scheduledServices.length === 0 ? (
              <div className={styles.emptyState}>
                <CalendarDays size={30} />
                <strong>No hay servicios programados</strong>
                <span>
                  Cuando registres un servicio con próximo km o próxima fecha,
                  aparecerá aquí.
                </span>
              </div>
            ) : (
              scheduledServices.map((service) => (
                <ServiceScheduleCard
                  service={service}
                  currentMileage={CURRENT_MILEAGE}
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
