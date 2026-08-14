import type { Metadata } from "next";
import { GFS_Didot } from "next/font/google";
import "./globals.css";

const didot = GFS_Didot({
  weight: ['400'],
  subsets: ["latin"],
  variable: "--font-didot",
});

export const metadata: Metadata = {
  title: "Sash",
  description: "Sash - Empowering your journey",
};

import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleOAuthProvider } from '@react-oauth/google';
import GlobalPreloader from "@/components/GlobalPreloader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <html
      lang="en"
      className={`${didot.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden w-full">
        <GlobalPreloader />
          <GoogleOAuthProvider clientId={clientId}>
            <AuthProvider>{children}</AuthProvider>
          </GoogleOAuthProvider>
      </body>
    </html>
  );
}
