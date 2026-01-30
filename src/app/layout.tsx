import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GET-INFO",
  description: "Basic information gathering tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bitcount+Prop+Single:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Code:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="embed-code font-sans-code antialiased">{children}</body>
    </html>
  );
}
