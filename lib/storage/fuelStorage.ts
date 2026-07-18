import type { FuelRecord } from "@/lib/types/fuel";

const STORAGE_KEY = "swm-care:fuel-records";

export function getFuelRecords(): FuelRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFuelRecord(record: FuelRecord): void {
  const records = getFuelRecords();
  const updated = [record, ...records];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("swm:fuel-added", { detail: record }));
}
