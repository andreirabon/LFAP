import NavigationBar from "@/app/components/NavigationBar";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const interFont = localFont({
  src: "../../public/inter.ttf",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leave Filing and Approval Process",
  description: "Leave Filing and Approval Process",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${interFont.className} antialiased`}>
        <NavigationBar />
        {children}
      </body>
    </html>
  );
}
