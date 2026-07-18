import { MobileHeader } from "@/components/mobile/MobileHeader";
import { BottomNavigation } from "@/components/mobile/BottomNavigation";
import { FloatingActionButton } from "@/components/mobile/FloatingActionButton";
import { VehicleSummaryCard } from "@/components/dashboard/VehicleSummaryCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <main className={styles.shell}>
      <MobileHeader />

      <section className={styles.content}>
        <VehicleSummaryCard />
        <RecentActivity />
      </section>

      <FloatingActionButton />
      <BottomNavigation />
    </main>
  );
}
