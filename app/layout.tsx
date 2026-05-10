import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OutbreakIQ",
  description: "Intelligent Epidemiological Surveillance Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen bg-[#f8fafa]`}>
        <Sidebar />
        <main className="flex-1 ml-[220px]">
          {children}
        </main>
      </body>
    </html>
  );
}
