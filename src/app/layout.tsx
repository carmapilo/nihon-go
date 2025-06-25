import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import MainHeader from "./components/MainHeader";
const primaryFont = Zen_Maru_Gothic({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  preload: false,
  display: "swap",
});

const monoFont = Zen_Maru_Gothic({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nihon-Go - Japanese Learning App",
  description: "Learn Japanese with Nihon-Go",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [{ url: "/logo.png", type: "image/png" }],
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
        className={`${primaryFont.className} ${primaryFont.variable} ${monoFont.variable} antialiased`}
      >
        <MainHeader />
        {children}
      </body>
    </html>
  );
}
