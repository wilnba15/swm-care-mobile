import type { ServiceRecord } from "@/lib/types/service";

const STORAGE_KEY = "swm-care:service-records";

export function getServiceRecords(): ServiceRecord[] {
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

export function saveServiceRecord(record: ServiceRecord): void {
  const records = getServiceRecords();
  const updated = [record, ...records];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(
    new CustomEvent("swm:service-added", { detail: record }),
  );
}
