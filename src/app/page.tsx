import Calculator from "./Calculator";
import { getUsdIlsRate } from "@/lib/fx";
import { CURRENT } from "@/data/current";

export default async function Home() {
  const fxRate = await getUsdIlsRate();

  return (
    <main className="min-h-screen">
      <header className="bg-[#00274C] text-white">
        <div className="max-w-4xl mx-auto px-5 py-10 md:py-16">
          <div className="inline-flex items-center gap-2 bg-[#FFCB05] text-[#00274C] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
            <span>U.S. &amp; Israel {CURRENT.year} tax year</span>
            <span className="opacity-60">•</span>
            <span className="font-normal lowercase tracking-normal">updated {CURRENT.lastReviewed}</span>
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-merriweather)] text-3xl md:text-5xl font-black leading-tight">
            What would moving to Israel actually mean for your money?
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/80 max-w-2xl">
            Plug in your state, your income, and your kids. Get a straight-dollars answer — not a pitch, not a guilt trip, not a vibe.
          </p>
          <p className="mt-3 text-sm text-white/60">
            A plain-English aliyah calculator built by Americans for Americans. USD→ILS rate live at {fxRate.toFixed(3)}.
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
            a="Yes. 'Aliyah' is the Hebrew word for a Jewish immigrant's move to Israel. We call it 'moving to Israel' because the word aliyah carries weight that tends to skip past the money math — and the money math is what most Americans need to see first."
          />
          <FAQ
            q={`What's Sal Klita and is it in the numbers above?`}
            a={`Sal Klita is the Israeli government's absorption basket for new olim. For your family size the first-year cash component is roughly $${calculatorSalKlitaExample()} on top of everything else, plus a customs exemption on one household shipment, a year-one arnona (property tax) discount, and subsidized Hebrew ulpan. The Israel income tax column above already folds in the 10-year oleh tax discount; the one-time cash absorption payment is separate.`}
          />
          <FAQ
            q="Do I still pay U.S. taxes after moving?"
            a={`The U.S. taxes citizens on worldwide income, so yes — you still file. The Foreign Earned Income Exclusion (~$${CURRENT.usFederal.feieLimit.toLocaleString()}/person for ${CURRENT.year}) plus the Foreign Tax Credit for taxes already paid in Israel usually eliminates U.S. tax owed. High earners and business owners should consult a cross-border CPA.`}
          />
          <FAQ
            q="What about universal healthcare — is it actually good?"
            a="Israel's Kupat Holim covers every citizen from day one of aliyah. Ranked ahead of the U.S. on most global health metrics (life expectancy, infant mortality, preventive care). Wait times for specialists can be longer; most olim supplement with a shaban (supplemental) plan for ~$30–60/month."
          />
          <FAQ
            q="Are Israeli public schools any good for my kids?"
            a={`Depends on neighborhood, like anywhere. Public schools are Jewish by default (calendar, Hebrew, Torah). Religious families use 'mamlachti dati' (state religious) or haredi-track schools, all free. Jewish day school tuition — about $${CURRENT.costs.jewishDaySchoolPerKidUsAvg.toLocaleString()} per kid per year in the U.S. — simply isn't a line item in Israel.`}
          />
          <FAQ
            q="How is this calculator kept up to date?"
            a={`We refresh the tax tables, Sal Klita amounts, and healthcare cost averages every January once published sources release the new year's numbers. The current data is for ${CURRENT.year}, last reviewed ${CURRENT.lastReviewed}. Next scheduled refresh: ${CURRENT.nextScheduledRefresh}. The methodology section below links to every source. All data is in a single open-source module; propose an earlier refresh by opening a PR.`}
          />
          <FAQ
            q="Who built this?"
            a="Quiet Notion LTD, a small Israel-based software company. We built it because existing tools are either one-variable calculators (just taxes, just housing) or 6,000-word articles trying to sell you a consulting engagement. We wanted the one number. Open source on GitHub — suggestions welcome."
          />
        </div>
      </section>

      <footer className="bg-[#F5F5F5] border-t border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto px-5 py-8 text-xs text-[#5C5C5C] space-y-3">
          <div>
            <strong className="text-[#00274C]">Methodology — {CURRENT.year}:</strong> U.S. federal brackets from{" "}
            <a href={CURRENT.usFederal.source} className="text-[#0B3E7E] hover:underline">IRS</a>. State income tax and property tax averages from Tax Foundation {CURRENT.year}. Health insurance premiums from KFF Employer Health Benefits Survey. Israel income tax from{" "}
            <a href={CURRENT.israel.source} className="text-[#0B3E7E] hover:underline">Israel Tax Authority</a>. Sal Klita and oleh benefits from{" "}
            <a href={CURRENT.salKlita.source} className="text-[#0B3E7E] hover:underline">Nefesh B&apos;Nefesh / Misrad Haklita</a>. USD→ILS from Stooq, updated hourly. Jewish day school tuition averaged across Modern Orthodox, Conservative, and community schools.
          </div>
          <div>
            <strong className="text-[#00274C]">Refresh schedule:</strong> Tax tables reviewed annually each January. Current snapshot: {CURRENT.year}, reviewed {CURRENT.lastReviewed}. Next scheduled refresh: {CURRENT.nextScheduledRefresh}.
          </div>
          <div>
            <strong className="text-[#00274C]">Disclaimer:</strong> Estimates only. Not tax advice. Individual situations vary. Consult a cross-border CPA (Philip Stein, Dray &amp; Dray, Israel US Tax) before making financial decisions.
          </div>
          <div>
            Open source: <a href="https://github.com/quietnotion/movetoisrael" className="text-[#0B3E7E] hover:underline">github.com/quietnotion/movetoisrael</a> • Built by <a href="https://quietnotion.com" className="text-[#0B3E7E] hover:underline">Quiet Notion</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function calculatorSalKlitaExample(): string {
  const s = CURRENT.salKlita;
  return (s.perCoupleUsd + s.perChildUsd * 2).toLocaleString();
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
