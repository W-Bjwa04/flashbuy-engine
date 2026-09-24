import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { SocketProvider } from "@/context/SocketContext";
import { Toaster } from "sonner";
import { auth } from "@/auth";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlashBuy",
  description: "FlashBuy E-commerce Platform - Buy Products at Flash Prices",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Read access token from the encrypted JWT (server-only — never exposed to client)
  const headersList = await headers();
  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

  const token = await getToken({
    req: {
      headers: Object.fromEntries(headersList.entries()),
      cookies: Object.fromEntries(
        (headersList.get("cookie") ?? "")
          .split(";")
          .map((c) => c.trim().split("="))
          .filter((parts) => parts.length >= 2)
          .map(([k, ...rest]) => [k.trim(), rest.join("=").trim()])
      ),
    } as any,
    secret: process.env.AUTH_SECRET!,
    cookieName,
  });

  const accessToken = (token?.accessToken as string) ?? null;

  return (
    <html
      lang="en"
      data-theme="light"
      style={{ colorScheme: "light" }}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        <SocketProvider accessToken={accessToken}>
          <Navbar />
          {children}
          <Toaster richColors position="top-right" />
        </SocketProvider>
      </body>
    </html>
  );
}
