import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Battery Analyzer",
  description: "Analizador de baterías",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
