"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth/authStorage";
export function LogoutButton({className="",label="Cerrar sesión"}:{className?:string;label?:string}){ const router=useRouter(); return <button className={className} type="button" onClick={()=>{clearSession();router.replace("/login")}}><LogOut size={18}/>{label}</button>; }
