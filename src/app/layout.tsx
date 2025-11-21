import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_TITLE = "Thesys Demo Studio";
const APP_DESCRIPTION =
  "Stream Thesys C1 artifacts with presets, live statuses, and Generative UI previews.";
const APP_URL = "https://thesys-demo.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: APP_TITLE,
  description: APP_DESCRIPTION,
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    url: APP_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
