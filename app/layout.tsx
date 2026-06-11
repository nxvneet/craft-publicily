import type { Metadata } from "next";
import { Space_Grotesk, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Cursor } from "@/components/Cursor";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Voxel — One prompt. A living 3D website.",
  description:
    "Voxel turns a single sentence into a real-time, scroll-driven 3D website — then publishes it in one click. No frames, no WebGL headaches, no code.",
  openGraph: {
    title: "Voxel — One prompt. A living 3D website.",
    description:
      "Type a sentence. Get a cinematic, real-time 3D site. Publish in one click.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${grotesk.variable} ${instrument.variable}`}>
      <body>
        <div className="grain" aria-hidden />
        <Cursor />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
