import type { Metadata } from "next";
import "./globals.css";
import { Site } from '@/components/Site';
import { catalog } from '@/lib/server';

export const metadata: Metadata = {
  title: {default:'Hippo World Tour · Go meet your internet hippo',template:'%s · Hippo World Tour'},
  description: "Meet famous hippos, explore their extraordinary world, and plan a trip with verified visitor notes and honest travel information.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const dynamic='force-dynamic';
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data=await catalog();return (
    <html lang="en">
      <body><Site venues={data.venues}>{children}</Site></body>
    </html>
  );
}
