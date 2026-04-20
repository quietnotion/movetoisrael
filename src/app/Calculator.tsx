"use client";

import { useState, useMemo } from "react";
import { STATE_OPTIONS, StateCode } from "@/lib/states";
import { calculate } from "@/lib/calc";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtIls = (n: number, fx: number) =>
  `₪${Math.round(n * fx).toLocaleString("en-US")}`;

export default function Calculator({ fxRate }: { fxRate: number }) {
  const [state, setState] = useState<StateCode>("NY");
  const [income, setIncome] = useState<number>(250000);
  const [kids, setKids] = useState<number>(2);
  const [showRefine, setShowRefine] = useState(false);
  const [homeValue, setHomeValue] = useState<number>(0);
  const [mortgageBalance, setMortgageBalance] = useState<number>(0);

  const result = useMemo(
    () =>
      calculate(
        { state, householdIncome: income, kids, homeValue: homeValue || undefined, mortgageBalance: mortgageBalance || undefined },
        fxRate
      ),
    [state, income, kids, homeValue, mortgageBalance, fxRate]
  );

  const betterOff = result.annualDelta >= 0;
  const bigNumber = Math.abs(result.annualDelta);

  return (
    <div className="max-w-4xl mx-auto px-5 py-8 md:py-12">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-sm p-6 md:p-10">
        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          <div>
            <label className="block text-sm font-medium text-[#00274C] mb-2">Your U.S. state</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value as StateCode)}
              className="w-full border border-[#D4D4D4] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCB05] text-[#1A1A1A]"
            >
              {STATE_OPTIONS.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#00274C] mb-2">
              Household income <span className="text-[#5C5C5C] font-normal">(pre-tax)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5C5C]">$</span>
              <input
                type="number"
                value={income || ""}
                onChange={(e) => setIncome(parseInt(e.target.value, 10) || 0)}
                className="w-full border border-[#D4D4D4] rounded-lg pl-7 pr-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCB05]"
                placeholder="250,000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#00274C] mb-2">Kids</label>
            <select
              value={kids}
              onChange={(e) => setKids(parseInt(e.target.value, 10))}
              className="w-full border border-[#D4D4D4] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCB05]"
            >
              {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n}{n === 6 ? "+" : ""}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowRefine((v) => !v)}
          className="mt-4 text-sm text-[#0B3E7E] hover:underline"
        >
          {showRefine ? "− Hide" : "+ Add"} home value for a sharper estimate (optional)
        </button>

        {showRefine && (
          <div className="mt-4 grid md:grid-cols-2 gap-4 pt-4 border-t border-[#E5E5E5]">
            <div>
              <label className="block text-sm font-medium text-[#00274C] mb-2">U.S. home value</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5C5C]">$</span>
                <input
                  type="number"
                  value={homeValue || ""}
                  onChange={(e) => setHomeValue(parseInt(e.target.value, 10) || 0)}
                  className="w-full border border-[#D4D4D4] rounded-lg pl-7 pr-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCB05]"
                  placeholder="650,000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#00274C] mb-2">Mortgage balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5C5C]">$</span>
                <input
                  type="number"
                  value={mortgageBalance || ""}
                  onChange={(e) => setMortgageBalance(parseInt(e.target.value, 10) || 0)}
                  className="w-full border border-[#D4D4D4] rounded-lg pl-7 pr-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCB05]"
                  placeholder="380,000"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-2xl overflow-hidden" style={{ background: "#00274C" }}>
        <div className="p-6 md:p-10 text-white">
          <div className="text-sm font-medium text-[#FFCB05] mb-3 tracking-wide uppercase">
            Your annual difference
          </div>
          <div className="font-[family-name:var(--font-merriweather)] text-5xl md:text-7xl font-black leading-none">
            {betterOff ? "+" : "−"}{fmt(bigNumber)}
            <span className="text-2xl md:text-3xl font-normal text-[#FFCB05] ml-3">per year</span>
          </div>
          <div className="mt-3 text-lg text-white/80">
            {fmtIls(bigNumber, fxRate)} — {betterOff ? "more" : "less"} in your pocket living in Israel*
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-white/60 uppercase tracking-wide text-xs mb-1">Net in U.S.</div>
              <div className="text-xl font-semibold">{fmt(result.usNet)}/yr</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-white/60 uppercase tracking-wide text-xs mb-1">Net in Israel*</div>
              <div className="text-xl font-semibold">{fmt(result.ilNet)}/yr</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-white/60">
            *Includes Israeli oleh (immigrant) tax credits for the first 3.5 years. U.S. citizens still file with the IRS; the Foreign Earned Income Exclusion and Foreign Tax Credit usually eliminate double taxation.
          </div>
        </div>
      </div>

      {result.forwardFraming && (
        <div className="mt-6 rounded-xl border-l-4 border-[#FFCB05] bg-[#FFFBE5] p-5 text-[#1A1A1A]">
          <div className="font-semibold text-[#00274C] mb-1">A note on your numbers</div>
          <p className="text-sm leading-relaxed">{result.forwardFraming}</p>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-[#00274C] mb-4 font-[family-name:var(--font-merriweather)]">
          Line by line
        </h2>
        <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] text-[#5C5C5C] uppercase text-xs tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Item</th>
                <th className="text-right px-4 py-3 font-medium">U.S.</th>
                <th className="text-right px-4 py-3 font-medium">Israel*</th>
              </tr>
            </thead>
            <tbody>
              {result.breakdown.map((b, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}>
                  <td className="px-4 py-3 align-top">
                    <div className="text-[#1A1A1A]">{b.label}</div>
                    {b.note && <div className="text-xs text-[#5C5C5C] mt-1 leading-snug">{b.note}</div>}
                  </td>
                  <td className="px-4 py-3 text-right align-top tabular-nums">{b.us ? fmt(b.us) : "—"}</td>
                  <td className="px-4 py-3 text-right align-top tabular-nums">{b.il ? fmt(b.il) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-[#00274C] mb-4 font-[family-name:var(--font-merriweather)]">
          What the numbers don&apos;t capture
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <IntangibleCard
            title="Happiness rankings"
            body="Israel ranks 8th on the 2026 World Happiness Index. The U.S. ranks 24th — its lowest ever. Among under-25s, Israel is 3rd; the U.S. is 60th."
          />
          <IntangibleCard
            title="Universal healthcare, day one"
            body="No employer dependence. Quit your job, start a business, take a sabbatical — your family stays covered. The closest U.S. equivalent costs roughly $25K/year."
          />
          <IntangibleCard
            title="Half the homicide risk"
            body="U.S. homicide rate is ~3.5× Israel's. Despite headlines, daily life violence runs meaningfully lower."
          />
          <IntangibleCard
            title="Bilingual kids, by osmosis"
            body="Kids raised in Israel become functionally bilingual in English and Hebrew without intervention. A life skill American parents pay thousands per year to simulate."
          />
          <IntangibleCard
            title="You're a majority"
            body="First Jewish sovereignty in 2,000 years. Your kids don't grow up explaining Hanukkah or scanning a crowd at a family bar mitzvah. They grow up as the default."
          />
          <IntangibleCard
            title="Sal Klita absorption basket"
            body="New olim receive a cash absorption basket (sal klita) across the first 6 months — roughly $7,000–$15,000 per family depending on size. Plus customs exemption on one household shipment, subsidized ulpan (Hebrew), and arnona (property tax) discount year one."
          />
        </div>
      </div>

      <div className="mt-10 text-sm text-[#5C5C5C] space-y-2">
        {result.notes.map((n, i) => (
          <p key={i}>• {n}</p>
        ))}
      </div>
    </div>
  );
}

function IntangibleCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-5">
      <div className="font-semibold text-[#00274C] mb-2">{title}</div>
      <p className="text-sm text-[#1A1A1A] leading-relaxed">{body}</p>
    </div>
  );
}
