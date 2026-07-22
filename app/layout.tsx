import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shimi's Birthday Album",
  description: "An AI-powered family scrapbook to celebrate Shimi!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
