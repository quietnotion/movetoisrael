import Calculator from "./Calculator";
import { FlipCounter } from "./FlipCounter";
import { getUsdIlsRate } from "@/lib/fx";
import { getTotalCount } from "@/lib/counter";
import { CURRENT } from "@/data/current";

export const revalidate = 60;

export default async function Home() {
  const [fxRate, totalCount] = await Promise.all([
    getUsdIlsRate(),
    getTotalCount(),
  ]);

  return (
    <main className="min-h-screen">
      <header className="bg-[#00274C] text-white">
        <div className="max-w-4xl mx-auto px-5 py-10 md:py-16">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 bg-[#FFCB05] text-[#00274C] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
              <span>U.S. &amp; Israel {CURRENT.year} tax year</span>
              <span className="opacity-60">•</span>
              <span className="font-normal lowercase tracking-normal">updated {CURRENT.lastReviewed}</span>
            </div>
            <FlipCounter initialTotal={totalCount} />
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-merriweather)] text-3xl md:text-5xl font-black leading-tight">
            What would moving to Israel actually mean for your money?
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/80 max-w-2xl">
            Plug in your state, your income, and your kids. Get a straight-dollars answer. Not a pitch, not a guilt trip, not a vibe.
          </p>
          <p className="mt-3 text-sm text-white/60">
            A plain-English aliyah calculator built by Americans for Americans. USD→ILS rate live at {fxRate.toFixed(2)}.
          </p>
        </div>
      </header>

      <Calculator fxRate={fxRate} />

      <section className="max-w-4xl mx-auto px-5 py-12">
        <h2 className="text-2xl font-bold text-[#00274C] mb-5 font-[family-name:var(--font-merriweather)]">
          Questions people ask
        </h2>
        <div className="space-y-4">
          <FAQ
            q="Is this an aliyah calculator?"
            a="Yes. We call it 'moving to Israel' because it's simpler."
          />
          <FAQ
            q="Do I still pay U.S. taxes after moving?"
            a={`Yes. If you're a U.S. citizen you file a U.S. tax return every year regardless of where you live. Same as if you moved to France, Japan, or anywhere else. But you typically don't end up owing U.S. tax: the Foreign Earned Income Exclusion lets you exclude roughly $${CURRENT.usFederal.feieLimit.toLocaleString()} of wages per person (so around $${(CURRENT.usFederal.feieLimit * 2).toLocaleString()} for a married couple), and the Foreign Tax Credit takes care of most of the rest by crediting taxes you already paid to Israel. For example, a couple earning $250K with both earning roughly equal wages in Israel will usually owe $0 in U.S. federal tax after FEIE and FTC. A cross-border CPA can confirm your specific situation.`}
          />
          <FAQ
            q="What about healthcare?"
            a="Kupat Holim (Israel's public health system) covers you as soon as you register on arrival. You pick one of four funds: Clalit, Maccabi, Meuhedet, or Leumit. Israel ranks ahead of the U.S. on most global health metrics, including life expectancy, infant mortality, and preventive care."
          />
          <FAQ
            q="Are Israeli public schools any good for my kids?"
            a={`Depends on neighborhood, like anywhere. Public schools are Jewish by default, with calendar, Hebrew, and Torah built in. Religious families use 'mamlachti dati' (state religious) or haredi-track schools, all free. Jewish day school tuition, about $${CURRENT.costs.jewishDaySchoolPerKidUsAvg.toLocaleString()} per kid per year in the U.S., simply isn't a line item in Israel.`}
          />
          <FAQ
            q="How is this calculator kept up to date?"
            a={`We refresh the tax tables, Sal Klita amounts, and healthcare cost averages every January once published sources release the new year's numbers. The current data is for ${CURRENT.year}, last reviewed ${CURRENT.lastReviewed}. Next scheduled refresh: ${CURRENT.nextScheduledRefresh}. The methodology section below links to every source. All data is open source; propose a refresh at any time via a GitHub PR.`}
          />
          <FAQ
            q="Who built this?"
            a="Quiet Notion LTD, a small software company based in Israel. We built it because existing tools didn't do the job. Either they were one-variable calculators or marketing funnels for a consulting pitch. This is just here for information."
          />
        </div>
      </section>

      <footer className="bg-[#F5F5F5] border-t border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto px-5 py-8 text-xs text-[#5C5C5C] space-y-3">
          <div>
            <strong className="text-[#00274C]">Methodology for {CURRENT.year}:</strong> U.S. federal tax brackets from the{" "}
            <a href={CURRENT.usFederal.source} target="_blank" rel="nofollow noopener" className="text-[#0B3E7E] underline decoration-[#0B3E7E]/40 underline-offset-2 hover:decoration-[#0B3E7E]">Internal Revenue Service</a>. State income tax and property tax averages from the Tax Foundation ({CURRENT.year} State Tax Competitiveness Index). Employer-sponsored health insurance premiums from{" "}
            <a href="https://kff.org/report-section/ehbs-2025-summary-of-findings/" target="_blank" rel="nofollow noopener" className="text-[#0B3E7E] underline decoration-[#0B3E7E]/40 underline-offset-2 hover:decoration-[#0B3E7E]">KFF&apos;s Employer Health Benefits Survey</a>. Israeli income tax and Bituach Leumi rates from the{" "}
            <a href={CURRENT.israel.source} target="_blank" rel="nofollow noopener" className="text-[#0B3E7E] underline decoration-[#0B3E7E]/40 underline-offset-2 hover:decoration-[#0B3E7E]">Israel Tax Authority</a>. Sal Klita computed from{" "}
            <a href={CURRENT.salKlita.source} target="_blank" rel="nofollow noopener" className="text-[#0B3E7E] underline decoration-[#0B3E7E]/40 underline-offset-2 hover:decoration-[#0B3E7E]">Misrad Haklita</a> (Israeli Ministry of Aliyah &amp; Integration) published rates. USD→ILS from{" "}
            <a href="https://stooq.com/q/?s=usdils" target="_blank" rel="nofollow noopener" className="text-[#0B3E7E] underline decoration-[#0B3E7E]/40 underline-offset-2 hover:decoration-[#0B3E7E]">Stooq</a>, refreshed hourly. Jewish day school tuition averaged across Modern Orthodox, Conservative, and community schools (annual Prizmah / Avi Chai tuition surveys). Happiness rankings from the{" "}
            <a href="https://worldhappiness.report/" target="_blank" rel="nofollow noopener" className="text-[#0B3E7E] underline decoration-[#0B3E7E]/40 underline-offset-2 hover:decoration-[#0B3E7E]">World Happiness Report {CURRENT.year}</a>. Homicide rates from{" "}
            <a href="https://dataunodc.un.org/dp-intentional-homicide-victims" target="_blank" rel="nofollow noopener" className="text-[#0B3E7E] underline decoration-[#0B3E7E]/40 underline-offset-2 hover:decoration-[#0B3E7E]">UNODC</a> and FBI UCR data.
          </div>
          <div>
            <strong className="text-[#00274C]">Refresh schedule:</strong> Tax tables reviewed annually each January. Current snapshot: {CURRENT.year}, reviewed {CURRENT.lastReviewed}. Next scheduled refresh: {CURRENT.nextScheduledRefresh}.
          </div>
          <div>
            <strong className="text-[#00274C]">Disclaimer.</strong> This calculator is provided for informational and educational purposes only. It is not a substitute for, and does not constitute, tax, legal, financial, or immigration advice. No attorney-client, accountant-client, or advisor-client relationship is created by your use of this site. Individual situations vary, and the numbers shown are estimates based on simplified assumptions and publicly published rates that change over time. We make no warranty, express or implied, as to the accuracy, completeness, or currency of the information. Before making any financial, relocation, or tax decision, consult a qualified professional licensed in the relevant jurisdictions: a cross-border CPA for U.S. and Israel tax questions, an immigration attorney for aliyah eligibility, a financial advisor for planning. Quiet Notion LTD and contributors accept no liability for decisions made or actions taken in reliance on this tool.
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
            <span>Open source:{" "}
              <a href="https://github.com/quietnotion/movetoisrael" target="_blank" rel="noopener" className="text-[#0B3E7E] underline decoration-[#0B3E7E]/40 underline-offset-2 hover:decoration-[#0B3E7E]">github.com/quietnotion/movetoisrael</a>
            </span>
            <span>•</span>
            <span>Built by{" "}
              <a href="https://quietnotion.com" target="_blank" rel="noopener" className="text-[#0B3E7E] underline decoration-[#0B3E7E]/40 underline-offset-2 hover:decoration-[#0B3E7E]">Quiet Notion</a>
            </span>
            <span>•</span>
            <span>
              Say hi:{" "}
              <a href="https://x.com/quietnotion" target="_blank" rel="noopener" className="text-[#0B3E7E] underline decoration-[#0B3E7E]/40 underline-offset-2 hover:decoration-[#0B3E7E]">@quietnotion on X</a>
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="bg-white border border-[#E5E5E5] rounded-xl p-5 group">
      <summary className="cursor-pointer font-semibold text-[#00274C] list-none flex items-center justify-between">
        <span>{q}</span>
        <span className="text-[#FFCB05] text-xl group-open:rotate-45 transition-transform">+</span>
      </summary>
      <p className="mt-3 text-[#1A1A1A] leading-relaxed">{a}</p>
    </details>
  );
}
