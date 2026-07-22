import {
  clearSession,
  getAccessToken,
  saveSession,
  type SwmSession,
  type SwmUser,
} from "@/lib/auth/authStorage";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://taller-pro-backend-staging.onrender.com"
).replace(/\/+$/, "");

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  country?: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: SwmUser;
}

export interface SwmVehicle {
  id: number;
  user_id?: number | null;
  owner_name?: string | null;
  model: string;
  year: number;
  engine?: string | null;
  transmission?: string | null;
  city?: string | null;
  usage_type?: string | null;
  current_mileage: number;
  plate?: string | null;
  vin?: string | null;
  color?: string | null;
  fuel_type?: string | null;
  purchase_date?: string | null;
  nickname?: string | null;
  photo_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SwmVehicleCreatePayload {
  owner_name?: string | null;
  model: string;
  year: number;
  engine?: string | null;
  transmission?: string | null;
  city?: string | null;
  usage_type?: string | null;
  current_mileage: number;
  plate?: string | null;
  vin?: string | null;
  color?: string | null;
  fuel_type?: string | null;
  purchase_date?: string | null;
  nickname?: string | null;
  photo_url?: string | null;
}

export type SwmVehicleUpdatePayload = Partial<SwmVehicleCreatePayload>;

export interface SwmDashboard {
  vehicle: SwmVehicle;
  next_maintenance_mileage?: number | null;
  kilometers_remaining?: number | null;
  pending_items: number;
  completed_items: number;
  total_items: number;
  general_status: string;
}

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as {
      detail?: string | Array<{ msg?: string }>;
      message?: string;
    };

    if (typeof payload.detail === "string") return payload.detail;

    if (Array.isArray(payload.detail)) {
      const messages = payload.detail
        .map((item) => item.msg)
        .filter((value): value is string => Boolean(value));
      if (messages.length > 0) return messages.join(" ");
    }

    return payload.message || "No se pudo completar la solicitud.";
  } catch {
    return "No se pudo completar la solicitud.";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const token = getAccessToken();
    if (!token) {
      clearSession();
      throw new ApiError(401, "Tu sesión no está disponible. Ingresa nuevamente.");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      0,
      "No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente.",
    );
  }

  if (!response.ok) {
    const detail = await parseError(response);
    if (response.status === 401 && authenticated) clearSession();
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function normalizeSession(response: TokenResponse): SwmSession {
  return {
    accessToken: response.access_token,
    tokenType: response.token_type,
    user: response.user,
  };
}

export async function login(payload: LoginPayload): Promise<SwmSession> {
  const response = await request<TokenResponse>("/swm-auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const session = normalizeSession(response);
  saveSession(session);
  return session;
}

export async function register(payload: RegisterPayload): Promise<SwmSession> {
  const response = await request<TokenResponse>("/swm-auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const session = normalizeSession(response);
  saveSession(session);
  return session;
}

export async function getMe(): Promise<SwmUser> {
  return request<SwmUser>("/swm-auth/me", {}, true);
}

export async function getVehicles(): Promise<SwmVehicle[]> {
  return request<SwmVehicle[]>("/swm/vehicles", {}, true);
}

export async function getVehicle(vehicleId: number): Promise<SwmVehicle> {
  return request<SwmVehicle>(`/swm/vehicles/${vehicleId}`, {}, true);
}

export async function createVehicle(
  payload: SwmVehicleCreatePayload,
): Promise<SwmVehicle> {
  return request<SwmVehicle>(
    "/swm/vehicles",
    { method: "POST", body: JSON.stringify(payload) },
    true,
  );
}

export async function updateVehicle(
  vehicleId: number,
  payload: SwmVehicleUpdatePayload,
): Promise<SwmVehicle> {
  return request<SwmVehicle>(
    `/swm/vehicles/${vehicleId}`,
    { method: "PUT", body: JSON.stringify(payload) },
    true,
  );
}

export async function getVehicleDashboard(
  vehicleId: number,
): Promise<SwmDashboard> {
  return request<SwmDashboard>(
    `/swm/vehicles/${vehicleId}/dashboard`,
    {},
    true,
  );
}

export function getApiUrl(): string {
  return API_URL;
}
