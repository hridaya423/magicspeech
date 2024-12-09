
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Magic Speech",
  description: "Everything you need to do with speech.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
