import type { Metadata, Viewport } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoMaricá",
  description: "Programa de incentivo à coleta seletiva de Maricá — RJ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2e7d32",
};

const fontStack =
  "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased" style={{ fontFamily: fontStack }}>
      <body className="min-h-full flex flex-col bg-gov-bg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
