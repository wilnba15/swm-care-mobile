"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasSession } from "@/lib/auth/authStorage";
export default function HomePage(){const router=useRouter();useEffect(()=>{router.replace(hasSession()?"/dashboard":"/login")},[router]);return <main style={{minHeight:"100dvh",display:"grid",placeItems:"center",background:"#eef3f8"}}><p>Abriendo SWM Care…</p></main>}
