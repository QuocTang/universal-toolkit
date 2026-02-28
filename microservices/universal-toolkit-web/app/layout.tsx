import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/core/providers/react-query.provider";
import { ToolInitializer } from "@/core/providers/tool-initializer";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Universal Toolkit",
  description:
    "Nền tảng web tích hợp nhiều tool (utilities) khác nhau, có khả năng mở rộng dễ dàng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <TooltipProvider>
            <ToolInitializer />
            {children}
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
