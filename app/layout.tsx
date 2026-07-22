import type { Metadata,Viewport } from "next";
import { AppAuthGate } from "@/components/auth/AppAuthGate";
import "./globals.css";
export const metadata:Metadata={title:"SWM Care Mobile",description:"Control y cuidado inteligente de tu vehículo SWM"};
export const viewport:Viewport={width:"device-width",initialScale:1,maximumScale:1,themeColor:"#0b1220"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="es"><body><AppAuthGate>{children}</AppAuthGate></body></html>}
