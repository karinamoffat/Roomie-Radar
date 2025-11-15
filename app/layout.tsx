import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Houseboard",
  description: "Simple household coordination app for housemates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
