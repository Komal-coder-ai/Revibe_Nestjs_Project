import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NewRevibe - Admin & Customer Platform",
  description: "A modern platform with MongoDB integration for admin and customer management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
