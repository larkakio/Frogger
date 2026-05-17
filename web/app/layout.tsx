import type { Metadata } from "next";
import { IBM_Plex_Mono, Orbitron } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const baseAppId =
  process.env.NEXT_PUBLIC_BASE_APP_ID ?? "neon-frogger-placeholder";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Neon Frogger",
  description:
    "Cyberpunk Frogger on the Gridrunner Overpass — swipe to survive, check in on Base.",
  icons: { icon: "/app-icon.jpg", apple: "/app-icon.jpg" },
  openGraph: {
    title: "Neon Frogger",
    images: [{ url: "/app-thumbnail.jpg", width: 1200, height: 628 }],
  },
  other: {
    "base:app_id": baseAppId,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${plexMono.variable} h-full`}
    >
      <head>
        <meta name="base:app_id" content={baseAppId} />
      </head>
      <body className="flex h-dvh max-h-dvh flex-col overflow-x-hidden bg-[#050508] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
