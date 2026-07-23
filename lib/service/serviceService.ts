import {
  createServiceOrder,
  getVehicleServiceOrders,
  type SwmServiceOrder,
} from "@/lib/api/swmApi";
import {
  getPrimaryVehicle,
  updatePrimaryMileage,
} from "@/lib/vehicle/vehicleService";
import type {
  ServiceCategory,
  ServiceRecord,
} from "@/lib/types/service";

export const SERVICE_CLOUD_UPDATED_EVENT = "swm:service-cloud-updated";

interface SaveServiceCloudPayload {
  date: string;
  mileage: number;
  category: ServiceCategory;
  notes: string;
  total: number;
  nextServiceKm: number | null;
  nextServiceDate: string | null;
}

const CATEGORY_TO_ORDER_TYPE: Record<ServiceCategory, string> = {
  Mantenimiento: "maintenance",
  Mecánico: "repair",
  Eléctrico: "repair",
  Carrocería: "bodywork",
  Neumáticos: "repair",
  Otro: "other",
};

const ORDER_TYPE_TO_CATEGORY: Record<string, ServiceCategory> = {
  maintenance: "Mantenimiento",
  repair: "Mecánico",
  bodywork: "Carrocería",
  accident: "Carrocería",
  diagnostic: "Mecánico",
  other: "Otro",
};

function emitServiceUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SERVICE_CLOUD_UPDATED_EVENT));
}

function encodeMetadata(payload: SaveServiceCloudPayload): string {
  return [
    `Categoría: ${payload.category}`,
    payload.nextServiceKm !== null
      ? `Próximo km: ${payload.nextServiceKm}`
      : "",
    payload.nextServiceDate
      ? `Próxima fecha: ${payload.nextServiceDate}`
      : "",
    `Observaciones: ${payload.notes.trim()}`,
  ]
    .filter(Boolean)
    .join(" | ");
}

function extractText(notes: string | null | undefined, label: string): string {
  const text = notes || "";
  const expression = new RegExp(`${label}:\\s*([^|]+)`, "i");
  return expression.exec(text)?.[1]?.trim() || "";
}

function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapServiceOrderToRecord(
  order: SwmServiceOrder,
): ServiceRecord {
  const encodedCategory = extractText(order.notes, "Categoría");
  const category =
    (encodedCategory as ServiceCategory) ||
    ORDER_TYPE_TO_CATEGORY[order.order_type] ||
    "Otro";

  const nextKmText = extractText(order.notes, "Próximo km");
  const nextDateText = extractText(order.notes, "Próxima fecha");
  const observations = extractText(order.notes, "Observaciones");

  return {
    id: String(order.id),
    date: order.service_date,
    mileage: order.service_mileage,
    category,
    notes:
      observations ||
      order.description ||
      order.title ||
      "Servicio registrado",
    total: toNumber(order.total_cost),
    nextServiceKm: nextKmText ? Number(nextKmText) : null,
    nextServiceDate: nextDateText || null,
    createdAt: order.created_at,
    description: order.description || undefined,
  };
}

export async function saveServiceCloud(
  payload: SaveServiceCloudPayload,
): Promise<ServiceRecord> {
  const vehicle = await getPrimaryVehicle();

  if (!vehicle) {
    throw new Error("Primero debes registrar tu vehículo.");
  }

  const order = await createServiceOrder({
    vehicle_id: vehicle.id,
    order_type: CATEGORY_TO_ORDER_TYPE[payload.category],
    title: payload.notes.trim(),
    description: payload.notes.trim(),
    service_mileage: payload.mileage,
    service_date: payload.date,
    labor_cost: 0,
    parts_cost: 0,
    total_cost: payload.total,
    status: "realizado",
    notes: encodeMetadata(payload),
  });

  if (payload.mileage > vehicle.current_mileage) {
    await updatePrimaryMileage(vehicle.id, payload.mileage);
  }

  emitServiceUpdated();
  return mapServiceOrderToRecord(order);
}

export async function loadServiceCloud(): Promise<ServiceRecord[]> {
  const vehicle = await getPrimaryVehicle();

  if (!vehicle) return [];

  const orders = await getVehicleServiceOrders(vehicle.id);
  return orders.map(mapServiceOrderToRecord);
}
