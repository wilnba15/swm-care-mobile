import { CalendarClock, Gauge, Wrench } from "lucide-react";
import type { ServiceRecord } from "@/lib/types/service";
import styles from "./ServiceScheduleCard.module.css";

interface ServiceScheduleCardProps {
  service: ServiceRecord & {
    status: "upcoming" | "soon" | "overdue";
    remainingKm: number | null;
    remainingDays: number | null;
  };
  currentMileage: number;
}

function formatDate(date: string | null): string {
  if (!date) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatKm(value: number): string {
  return new Intl.NumberFormat("es-EC").format(value);
}

function getStatusText(status: "upcoming" | "soon" | "overdue"): string {
  if (status === "overdue") {
    return "Vencido";
  }

  if (status === "soon") {
    return "Por vencer";
  }

  return "Próximo";
}

export function ServiceScheduleCard({
  service,
}: ServiceScheduleCardProps) {
  const title =
    service.notes || service.description || service.category;

  return (
    <article className={`${styles.card} ${styles[service.status]}`}>
      <div className={styles.top}>
        <span className={styles.serviceIcon}>
          <Wrench size={20} />
        </span>

        <div className={styles.titleBlock}>
          <strong>{title}</strong>
          <span>{service.category}</span>
        </div>

        <span className={styles.statusBadge}>
          {getStatusText(service.status)}
        </span>
      </div>

      <div className={styles.details}>
        {service.nextServiceKm !== null && (
          <div className={styles.detailBox}>
            <span className={styles.detailIcon}>
              <Gauge size={18} />
            </span>

            <div>
              <small>Próximo kilometraje</small>
              <strong>{formatKm(service.nextServiceKm)} km</strong>
              <span>
                {service.remainingKm !== null && service.remainingKm > 0
                  ? `Faltan ${formatKm(service.remainingKm)} km`
                  : service.remainingKm === 0
                    ? "Corresponde ahora"
                    : `Vencido por ${formatKm(
                        Math.abs(service.remainingKm ?? 0),
                      )} km`}
              </span>
            </div>
          </div>
        )}

        {service.nextServiceDate !== null && (
          <div className={styles.detailBox}>
            <span className={styles.detailIcon}>
              <CalendarClock size={18} />
            </span>

            <div>
              <small>Próxima fecha</small>
              <strong>{formatDate(service.nextServiceDate)}</strong>
              <span>
                {service.remainingDays !== null && service.remainingDays > 0
                  ? `Faltan ${service.remainingDays} días`
                  : service.remainingDays === 0
                    ? "Corresponde hoy"
                    : `Vencido por ${Math.abs(
                        service.remainingDays ?? 0,
                      )} días`}
              </span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
