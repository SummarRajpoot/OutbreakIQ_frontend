import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OutbreakIQ",
  description: "Intelligent Epidemiological Surveillance Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isLoggedIn = !!session;

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#f8fafa]`}>
        <SessionProviderWrapper>
          <div className="flex min-h-screen">
            {isLoggedIn && <Sidebar />}
            <main className={cn("flex-1 flex flex-col", isLoggedIn && "ml-[220px]")}>
              <div className="flex-1">
                {children}
              </div>
              <Footer />
            </main>
          </div>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}

import { cn } from "@/lib/utils";
