export interface VehicleMileage {
  mileage: number;
  updatedAt: string;
}

const STORAGE_KEY = "swm-care:vehicle-mileage";
const DEFAULT_MILEAGE = 89500;

export function getVehicleMileage(): VehicleMileage {
  if (typeof window === "undefined") {
    return {
      mileage: DEFAULT_MILEAGE,
      updatedAt: "",
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        mileage: DEFAULT_MILEAGE,
        updatedAt: "",
      };
    }

    const parsed = JSON.parse(raw) as Partial<VehicleMileage>;
    const mileage = Number(parsed.mileage);

    if (!Number.isFinite(mileage) || mileage < 0) {
      return {
        mileage: DEFAULT_MILEAGE,
        updatedAt: "",
      };
    }

    return {
      mileage,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return {
      mileage: DEFAULT_MILEAGE,
      updatedAt: "",
    };
  }
}

export function saveVehicleMileage(mileage: number): VehicleMileage {
  const record: VehicleMileage = {
    mileage,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  window.dispatchEvent(
    new CustomEvent("swm:vehicle-mileage-updated", { detail: record }),
  );

  return record;
}
