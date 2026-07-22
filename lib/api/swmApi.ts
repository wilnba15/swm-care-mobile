import { clearSession, getAccessToken, saveSession, type SwmSession, type SwmUser } from "@/lib/auth/authStorage";

const API_URL=(process.env.NEXT_PUBLIC_API_URL || "https://taller-pro-backend-staging.onrender.com").replace(/\/+$/, "");

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { full_name: string; email: string; password: string; phone?: string; city?: string; country?: string; }
interface TokenResponse { access_token: string; token_type: string; user: SwmUser; }

export class ApiError extends Error {
  status: number; detail: string;
  constructor(status:number, detail:string){ super(detail); this.name="ApiError"; this.status=status; this.detail=detail; }
}

async function parseError(response:Response):Promise<string>{
  try {
    const payload=await response.json() as {detail?:string|Array<{msg?:string}>;message?:string};
    if(typeof payload.detail==="string") return payload.detail;
    if(Array.isArray(payload.detail)){ const m=payload.detail.map(x=>x.msg).filter(Boolean); if(m.length) return m.join(" "); }
    return payload.message || "No se pudo completar la solicitud.";
  } catch { return "No se pudo completar la solicitud."; }
}

async function request<T>(path:string, options:RequestInit={}, authenticated=false):Promise<T>{
  const headers=new Headers(options.headers); headers.set("Accept","application/json");
  if(options.body && !headers.has("Content-Type")) headers.set("Content-Type","application/json");
  if(authenticated){ const token=getAccessToken(); if(!token){ clearSession(); throw new ApiError(401,"Tu sesión no está disponible."); } headers.set("Authorization",`Bearer ${token}`); }
  let response:Response;
  try { response=await fetch(`${API_URL}${path}`,{...options,headers,cache:"no-store"}); }
  catch { throw new ApiError(0,"No se pudo conectar con el servidor. Revisa tu conexión."); }
  if(!response.ok){ const detail=await parseError(response); if(response.status===401 && authenticated) clearSession(); throw new ApiError(response.status,detail); }
  if(response.status===204) return undefined as T;
  return await response.json() as T;
}

function normalize(r:TokenResponse):SwmSession { return {accessToken:r.access_token, tokenType:r.token_type, user:r.user}; }
export async function login(payload:LoginPayload):Promise<SwmSession>{ const r=await request<TokenResponse>("/swm-auth/login",{method:"POST",body:JSON.stringify(payload)}); const s=normalize(r); saveSession(s); return s; }
export async function register(payload:RegisterPayload):Promise<SwmSession>{ const r=await request<TokenResponse>("/swm-auth/register",{method:"POST",body:JSON.stringify(payload)}); const s=normalize(r); saveSession(s); return s; }
export async function getMe():Promise<SwmUser>{ return request<SwmUser>("/swm-auth/me",{},true); }
export function getApiUrl():string{return API_URL;}
