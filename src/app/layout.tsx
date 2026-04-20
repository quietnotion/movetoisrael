import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Moving to Israel: The Math | 2026 Tax Year Calculator",
  description:
    "A straight-dollars calculator for Americans weighing a move to Israel. Compare take-home income, healthcare, property tax, and Jewish day school cost against your current U.S. state. Includes Sal Klita absorption benefits and oleh (aliyah) tax credits for 2026.",
  keywords: [
    "moving to Israel calculator",
    "aliyah calculator",
    "Israel vs US cost of living",
    "aliyah financial planning",
    "Sal Klita calculator",
    "oleh tax benefits 2026",
    "Israel tax calculator for Americans",
    "cost of living Israel",
  ],
  authors: [{ name: "Quiet Notion" }],
  metadataBase: new URL("https://movetoisrael.fyi"),
  openGraph: {
    title: "Moving to Israel: The Math",
    description:
      "Plug in your state, income, and kids. See what your actual numbers would look like in Israel. 2026 tax year.",
    type: "website",
    url: "https://movetoisrael.fyi",
    siteName: "movetoisrael.fyi",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moving to Israel: The Math",
    description:
      "Plug in your state, income, and kids. See what your actual numbers would look like in Israel.",
    site: "@quietnotion",
    creator: "@quietnotion",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Moving to Israel: The Math",
              alternateName: ["Aliyah Calculator", "Israel Cost of Living Calculator"],
              url: "https://movetoisrael.fyi",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              description:
                "Calculator comparing take-home income in the U.S. vs. Israel for Americans considering aliyah. Includes state tax, property tax, healthcare, private school, and oleh benefits for the 2026 tax year.",
            }),
          }}
        />
      </head>
      <body className="antialiased bg-[#FAFAFA] text-[#1A1A1A] font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
