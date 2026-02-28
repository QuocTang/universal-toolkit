// config/site.ts

export const siteConfig = {
  name: "Universal Toolkit",
  description:
    "Nền tảng web tích hợp nhiều tool (utilities) khác nhau, có khả năng mở rộng dễ dàng.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;
