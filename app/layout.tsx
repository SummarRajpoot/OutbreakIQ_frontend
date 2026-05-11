import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { auth } from "@/auth";
import { cn } from "@/lib/utils";

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
            {/* Always render sidebar if logged in, or if on specific routes? 
                The user wants it for the dashboard. */}
            {isLoggedIn && <Sidebar />}
            
            <div className={cn(
              "flex-1 flex flex-col min-w-0",
              isLoggedIn && "ml-[220px]"
            )}>
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
