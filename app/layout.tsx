import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import ChatBot from "@/components/ChatBot";
import { auth } from "@/auth";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EpiSphere — Global Health Intelligence",
  description: "A global disease intelligence platform powered by data and AI. Detect. Understand. Protect.",
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
      <body className={`${inter.className} min-h-screen bg-[#F8FAFC] text-[#0F172A]`}>
        <SessionProviderWrapper>
          <div className="flex min-h-screen">
            {/* Render sidebar when logged in */}
            {isLoggedIn && <Sidebar />}
            
            <div className={cn(
              "flex-1 flex flex-col min-w-0 transition-[margin] duration-200",
              isLoggedIn ? "md:ml-[240px] ml-0" : "ml-0"
            )}>
              <Navbar />
              <main className="flex-1 w-full">
                {children}
              </main>
              <Footer />
            </div>
          </div>
          <ChatBot />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
