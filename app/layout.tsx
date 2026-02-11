import type { Metadata } from "next";
import { DemoModeWrapper } from "@/components/demo/DemoModeWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "COTERI — Membership Infrastructure",
  description: "Payments and verification infrastructure for physical venues.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <DemoModeWrapper>{children}</DemoModeWrapper>
      </body>
    </html>
  );
}
