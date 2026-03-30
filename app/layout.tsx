import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Ryann Apply -- HZL",
  description: "Job application automation for Ryann Lynn Murphy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream text-charcoal">
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
