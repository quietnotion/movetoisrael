import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                { "@type": "Question", name: "Is this an aliyah calculator?", acceptedAnswer: { "@type": "Answer", text: "Yes. We call it 'moving to Israel' because it's simpler." } },
                { "@type": "Question", name: "Do I still pay U.S. taxes after moving to Israel?", acceptedAnswer: { "@type": "Answer", text: "Yes. If you're a U.S. citizen you file a U.S. tax return every year regardless of where you live. The Foreign Earned Income Exclusion and Foreign Tax Credit usually eliminate U.S. tax owed. A cross-border CPA can confirm your specific situation." } },
                { "@type": "Question", name: "What about healthcare in Israel?", acceptedAnswer: { "@type": "Answer", text: "Kupat Holim covers you as soon as you register on arrival. You pick one of four funds: Clalit, Maccabi, Meuhedet, or Leumit. Israel ranks ahead of the U.S. on life expectancy, infant mortality, and preventive care." } },
                { "@type": "Question", name: "Are Israeli public schools any good for my kids?", acceptedAnswer: { "@type": "Answer", text: "Public schools are Jewish by default, with calendar, Hebrew, and Torah built in. Jewish day school tuition, about $28,000 per kid per year in the U.S., isn't a line item in Israel." } },
                { "@type": "Question", name: "How is this calculator kept up to date?", acceptedAnswer: { "@type": "Answer", text: "Tax tables, Sal Klita amounts, and healthcare cost averages refresh every January once published sources release the new year's numbers. Open source; propose a refresh via GitHub PR." } },
                { "@type": "Question", name: "Who built movetoisrael.fyi?", acceptedAnswer: { "@type": "Answer", text: "Quiet Notion LTD, a small software company based in Israel." } },
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased bg-[#FAFAFA] text-[#1A1A1A] font-[family-name:var(--font-inter)]">
        {children}
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
