import type { Metadata } from "next";
import { Public_Sans, Fira_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Skill Store - Premium Hardware & Power Tools",
  description: "Find the best professional machinery, high-pressure washers, air compressors, and power tool accessories from TUQO and COSTEC.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${publicSans.variable} ${firaSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
