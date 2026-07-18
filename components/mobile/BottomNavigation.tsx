"use client";

import { CalendarDays, History, House, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./BottomNavigation.module.css";

const items = [
  { label: "Inicio", href: "/dashboard", icon: House },
  { label: "Agenda", href: "/schedule", icon: CalendarDays },
  { label: "Historial", href: "/history", icon: History },
  { label: "Perfil", href: "/profile", icon: UserRound },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.navigation} aria-label="Navegación principal">
      {items.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;

        return (
          <Link
            className={`${styles.item} ${active ? styles.active : ""}`}
            href={href}
            key={href}
          >
            <span className={styles.iconWrap}>
              <Icon size={21} strokeWidth={active ? 2.5 : 2} />
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
