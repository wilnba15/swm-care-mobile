"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth/authStorage";
export default function LogoutPage(){const router=useRouter();useEffect(()=>{clearSession();router.replace("/login")},[router]);return <main style={{minHeight:"100dvh",display:"grid",placeItems:"center",background:"#eef3f8"}}><p>Cerrando sesión…</p></main>}
