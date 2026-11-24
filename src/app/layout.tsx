import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "50cincuenta catálogo · Catálogo Inmobiliario",
  description:
    "Catálogo inmobiliario mobile-first simulado con buscador de IA, memoria de calidades, galería fotográfica y envío curado por WhatsApp.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "50cincuenta catálogo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-white text-[#0B2545] font-sans selection:bg-[#1658B8]/15 selection:text-[#0B2545]">
        {children}
      </body>
    </html>
  );
}
