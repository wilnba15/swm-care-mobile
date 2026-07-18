import { CalendarClock, Fuel, Gauge, Wrench } from "lucide-react";
import type { HistoryItem } from "@/app/history/page";
import styles from "./HistoryRecordCard.module.css";

interface HistoryRecordCardProps {
  item: HistoryItem;
}

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

function formatKm(value: number): string {
  return new Intl.NumberFormat("es-EC").format(value);
}

export function HistoryRecordCard({ item }: HistoryRecordCardProps) {
  const Icon = item.type === "service" ? Wrench : Fuel;

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <span className={styles.icon}>
          <Icon size={20} />
        </span>

        <div className={styles.titleBlock}>
          <strong>{item.title}</strong>
          <span>{item.category}</span>
        </div>

        <strong className={styles.value}>{formatMoney(item.total)}</strong>
      </div>

      <div className={styles.meta}>
        <span>{formatDate(item.date)}</span>
        <span>
          <Gauge size={14} />
          {formatKm(item.mileage)} km
        </span>

        {item.type === "fuel" && (
          <span>{item.gallons.toFixed(2)} galones</span>
        )}
      </div>

      {item.type === "service" &&
        (item.nextServiceKm !== null || item.nextServiceDate !== null) && (
          <div className={styles.nextService}>
            <CalendarClock size={16} />

            <div>
              <small>Próximo servicio</small>

              <span>
                {item.nextServiceKm !== null &&
                  `${formatKm(item.nextServiceKm)} km`}

                {item.nextServiceKm !== null &&
                  item.nextServiceDate !== null &&
                  " · "}

                {item.nextServiceDate !== null &&
                  formatDate(item.nextServiceDate)}
              </span>
            </div>
          </div>
        )}
    </article>
  );
}
