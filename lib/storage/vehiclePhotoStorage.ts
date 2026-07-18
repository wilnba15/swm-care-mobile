const STORAGE_KEY = "swm-care:vehicle-photo";

export function getVehiclePhoto(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveVehiclePhoto(photo: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, photo);
  window.dispatchEvent(new CustomEvent("swm:vehicle-photo-updated", { detail: photo }));
}

export function removeVehiclePhoto(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("swm:vehicle-photo-updated", { detail: "" }));
}
