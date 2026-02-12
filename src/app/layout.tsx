import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RentShield — Northampton Renters' Rights",
  description:
    "AI-powered guidance on your rights under the Renters' Rights Act 2025. Voice-enabled support for tenants and landlords in Northampton.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
