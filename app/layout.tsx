import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pickle Juice",
  description: "Track the time you spend consuming vs. creating.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
