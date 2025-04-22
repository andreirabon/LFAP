import NavigationBar from "@/app/components/NavigationBar";
import type { Metadata } from "next";
import "./globals.css";

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
      <body className={`antialiased`}>
        <NavigationBar />
        {children}
      </body>
    </html>
  );
}
