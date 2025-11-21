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

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
  icons: {
    icon: "/thesys-mark.svg",
    shortcut: "/thesys-mark.svg",
    apple: "/thesys-mark.svg",
  },
  openGraph: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    url: "https://thesys-demo.vercel.app",
    type: "website",
    images: [
      {
        url: "/thesys-mark.svg",
        width: 512,
        height: 512,
        alt: "Thesys demo mark",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    images: ["/thesys-mark.svg"],
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
