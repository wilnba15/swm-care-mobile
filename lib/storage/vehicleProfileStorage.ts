export interface VehicleProfile {
  brand: string;
  model: string;
  year: string;
  version: string;
  transmission: string;
  plate: string;
  color: string;
  fuel: string;
  vin: string;
}

const STORAGE_KEY = "swm-care:vehicle-profile";

const DEFAULT_PROFILE: VehicleProfile = {
  brand: "SWM",
  model: "G01",
  year: "2022",
  version: "Turbo",
  transmission: "Manual",
  plate: "",
  color: "Blanco",
  fuel: "Gasolina",
  vin: "",
};

export function getVehicleProfile(): VehicleProfile {
  if (typeof window === "undefined") {
    return DEFAULT_PROFILE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_PROFILE;
    }

    const parsed = JSON.parse(raw) as Partial<VehicleProfile>;

    return {
      ...DEFAULT_PROFILE,
      ...parsed,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveVehicleProfile(
  profile: VehicleProfile,
): VehicleProfile {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(
    new CustomEvent("swm:vehicle-profile-updated", { detail: profile }),
  );

  return profile;
}
