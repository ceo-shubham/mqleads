import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "MQLeads — Lead generation & competitor intelligence",
    template: "%s · MQLeads",
  },
  description:
    "Connect your company's LinkedIn, Instagram, X, YouTube, Facebook, Reddit and domain. See who visits your site from social media, which pages they open, and what competitors are doing that you are not.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
