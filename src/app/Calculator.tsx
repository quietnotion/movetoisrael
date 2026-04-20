"use client";

import { useState, useMemo } from "react";
import { STATE_OPTIONS, StateCode } from "@/lib/states";
import { calculate } from "@/lib/calc";
import {
  IconSparkles,
  IconHeart,
  IconShield,
  IconChat,
  IconHome,
  IconGift,
} from "./Icons";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

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
  const visibleRows = result.rows.filter((r) => !r.onlyIfKids || kids > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-5 py-6 sm:py-10">
      {/* FORM */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-sm p-5 sm:p-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#00274C] mb-2">Your U.S. state</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value as StateCode)}
              className="w-full border border-[#D4D4D4] rounded-lg px-3 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCB05] text-[#1A1A1A] text-base"
            >
              {STATE_OPTIONS.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
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
                inputMode="numeric"
                value={income || ""}
                onChange={(e) => setIncome(parseInt(e.target.value, 10) || 0)}
                className="w-full border border-[#D4D4D4] rounded-lg pl-7 pr-3 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCB05] text-base"
                placeholder="250,000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#00274C] mb-2">Kids</label>
            <select
              value={kids}
              onChange={(e) => setKids(parseInt(e.target.value, 10))}
              className="w-full border border-[#D4D4D4] rounded-lg px-3 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCB05] text-base"
            >
              {[0,1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}{n === 6 ? "+" : ""}</option>)}
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
            <LabeledMoney label="U.S. home value" value={homeValue} onChange={setHomeValue} placeholder="650,000" />
            <LabeledMoney label="Mortgage balance" value={mortgageBalance} onChange={setMortgageBalance} placeholder="380,000" />
          </div>
        )}
      </div>

      {/* HERO RESULT — two boxes */}
      <div className="mt-6 sm:mt-8 grid lg:grid-cols-[3fr_2fr] gap-4 sm:gap-5">
        {/* Left: Annual difference */}
        <div className="rounded-2xl overflow-hidden bg-[#00274C] text-white p-6 sm:p-8 lg:p-10">
          <div className="text-xs sm:text-sm font-bold text-[#FFCB05] tracking-widest uppercase mb-3">
            Every year, for life
          </div>
          <div className="font-[family-name:var(--font-merriweather)] font-black leading-none text-[min(18vw,5.5rem)] md:text-[6rem] lg:text-[min(9vw,6rem)]">
            {betterOff ? "+" : "−"}{fmt(bigNumber)}
          </div>
          <div className="mt-3 text-base sm:text-lg text-[#FFCB05]">
            {betterOff ? "more" : "less"} in your pocket — living in Israel
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-lg p-3 sm:p-4">
              <div className="text-white/60 uppercase tracking-wide text-[10px] sm:text-xs mb-1">Net in U.S.</div>
              <div className="text-lg sm:text-xl font-bold tabular-nums">{fmt(result.usNet)}<span className="text-sm font-normal text-white/60">/yr</span></div>
            </div>
            <div className="bg-[#FFCB05]/15 ring-1 ring-[#FFCB05]/40 rounded-lg p-3 sm:p-4">
              <div className="text-[#FFCB05] uppercase tracking-wide text-[10px] sm:text-xs mb-1 font-semibold">Net in Israel</div>
              <div className="text-lg sm:text-xl font-bold tabular-nums">{fmt(result.ilNet)}<span className="text-sm font-normal text-white/60">/yr</span></div>
            </div>
          </div>
        </div>

        {/* Right: What Israel hands you */}
        <div className="rounded-2xl overflow-hidden bg-[#FFCB05] text-[#00274C] p-6 sm:p-8 lg:p-10 flex flex-col">
          <div className="text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">
            On arrival, one-time cash
          </div>
          <div className="font-[family-name:var(--font-merriweather)] font-black leading-none text-[min(14vw,4rem)] md:text-5xl lg:text-[min(6.5vw,4.5rem)]">
            +{fmt(result.arrivalBonus.totalUsd)}
          </div>
          <div className="mt-3 text-sm sm:text-base font-medium">
            Israel hands you this when you land
          </div>
          <div className="mt-5 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-baseline border-b border-[#00274C]/15 pb-2">
              <span>Sal Klita (absorption basket)</span>
              <span className="font-bold tabular-nums">{fmt(result.arrivalBonus.salKlitaUsd)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span>Nefesh B&apos;Nefesh grant</span>
              <span className="font-bold tabular-nums">{fmt(result.arrivalBonus.nbnGrantUsd)}</span>
            </div>
          </div>
          <div className="mt-auto pt-4 text-[11px] sm:text-xs text-[#00274C]/70 leading-snug">
            Plus: customs exemption on one shipment, free Hebrew ulpan (500 hrs), year-one arnona discount.
          </div>
        </div>
      </div>

      {/* Forward framing for worse-off */}
      {result.forwardFraming && (
        <div className="mt-5 rounded-xl border-l-4 border-[#FFCB05] bg-[#FFFBE5] p-5 text-[#1A1A1A]">
          <div className="font-semibold text-[#00274C] mb-1">A note on your numbers</div>
          <p className="text-sm leading-relaxed">{result.forwardFraming}</p>
        </div>
      )}

      {/* LINE BY LINE */}
      <div className="mt-10 sm:mt-14">
        <h2 className="text-2xl sm:text-3xl font-black text-[#00274C] mb-1 font-[family-name:var(--font-merriweather)]">
          Line by line
        </h2>
        <p className="text-sm text-[#5C5C5C] mb-5">What comes out of your paycheck, both sides.</p>

        {/* Desktop table */}
        <div className="hidden md:block bg-white border border-[#E5E5E5] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] text-[#5C5C5C] uppercase text-xs tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-semibold w-1/2">Item</th>
                <th className="text-right px-5 py-3 font-semibold">U.S. / year</th>
                <th className="text-right px-5 py-3 font-semibold">Israel / year</th>
                <th className="text-right px-5 py-3 font-semibold">You save</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((r, i) => {
                const usCheaper = r.delta < 0;
                const ilCheaper = r.delta > 0;
                return (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}>
                    <td className="px-5 py-4 align-top">
                      <div className="text-[#1A1A1A] font-medium">{r.label}</div>
                      {r.note && <div className="text-xs text-[#5C5C5C] mt-1 leading-snug">{r.note}</div>}
                    </td>
                    <td className={`px-5 py-4 text-right align-top tabular-nums ${usCheaper ? "font-bold text-[#00274C]" : "text-[#5C5C5C]"}`}>
                      {r.us ? fmt(r.us) : "—"}
                    </td>
                    <td className={`px-5 py-4 text-right align-top tabular-nums ${ilCheaper ? "font-bold text-[#00274C]" : "text-[#5C5C5C]"}`}>
                      {r.il ? fmt(r.il) : "—"}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums">
                      {r.delta === 0 ? (
                        <span className="text-[#5C5C5C]">—</span>
                      ) : r.delta > 0 ? (
                        <span className="inline-block bg-[#FFCB05]/20 text-[#00274C] font-bold px-2 py-1 rounded">+{fmt(r.delta)}</span>
                      ) : (
                        <span className="text-[#5C5C5C]">−{fmt(Math.abs(r.delta))}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card layout */}
        <div className="md:hidden space-y-3">
          {visibleRows.map((r, i) => {
            const usCheaper = r.delta < 0;
            const ilCheaper = r.delta > 0;
            return (
              <div key={i} className="bg-white border border-[#E5E5E5] rounded-xl p-4">
                <div className="font-semibold text-[#1A1A1A]">{r.label}</div>
                {r.note && <div className="text-xs text-[#5C5C5C] mt-1 leading-snug">{r.note}</div>}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[#5C5C5C]">U.S. / yr</div>
                    <div className={`tabular-nums text-base ${usCheaper ? "font-bold text-[#00274C]" : "text-[#5C5C5C]"}`}>{r.us ? fmt(r.us) : "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[#5C5C5C]">Israel / yr</div>
                    <div className={`tabular-nums text-base ${ilCheaper ? "font-bold text-[#00274C]" : "text-[#5C5C5C]"}`}>{r.il ? fmt(r.il) : "—"}</div>
                  </div>
                </div>
                {r.delta !== 0 && (
                  <div className="mt-3">
                    {r.delta > 0 ? (
                      <span className="inline-block bg-[#FFCB05]/20 text-[#00274C] font-bold px-2 py-1 rounded text-sm">You save {fmt(r.delta)}/yr in Israel</span>
                    ) : (
                      <span className="text-sm text-[#5C5C5C]">You pay {fmt(Math.abs(r.delta))}/yr more in Israel</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* BEYOND THE PAYCHECK */}
      <div className="mt-12 sm:mt-16">
        <div className="rounded-2xl bg-gradient-to-br from-[#00274C] to-[#0B3E7E] text-white p-6 sm:p-10 overflow-hidden relative">
          <div className="relative z-10">
            <div className="inline-block bg-[#FFCB05] text-[#00274C] text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded mb-4">
              Beyond the paycheck
            </div>
            <h2 className="font-[family-name:var(--font-merriweather)] text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
              The paycheck is half the case.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">
              You&apos;re <strong className="text-[#FFCB05]">safer</strong>. You&apos;re <strong className="text-[#FFCB05]">healthier</strong>. You&apos;re <strong className="text-[#FFCB05]">happier</strong>. Your kids grow up <strong className="text-[#FFCB05]">bilingual</strong> and <strong className="text-[#FFCB05]">Jewish by default</strong>. And you stop explaining Hanukkah to your coworkers in December.
            </p>
          </div>
        </div>

        <div className="mt-5 grid md:grid-cols-2 gap-4">
          <IntangibleCard
            icon={<IconSparkles />}
            title="Happiness — measured"
            body="Israel ranks 8th on the 2026 World Happiness Index. The U.S. ranks 24th — its lowest ever. Among under-25s, Israel is 3rd; the U.S. is 60th."
          />
          <IntangibleCard
            icon={<IconHeart />}
            title="Healthcare without the leash"
            body="Universal Kupat Holim from day one. Quit your job, start a company, take a sabbatical — your family stays covered. The closest U.S. equivalent costs ~$25K/year."
          />
          <IntangibleCard
            icon={<IconShield />}
            title="Half the homicide risk"
            body="U.S. homicide rate is ~3.5× Israel's. Despite headlines, daily-life violence runs meaningfully lower."
          />
          <IntangibleCard
            icon={<IconChat />}
            title="Bilingual kids, by osmosis"
            body="Kids raised in Israel grow up functionally bilingual in English and Hebrew with no intervention. A life skill American parents pay thousands per year to simulate."
          />
          <IntangibleCard
            icon={<IconHome />}
            title="You&apos;re the default"
            body="First Jewish sovereignty in 2,000 years. Your kids don't grow up explaining Hanukkah or scanning a crowd at a family bar mitzvah. They grow up as the norm."
          />
          <IntangibleCard
            icon={<IconGift />}
            title="Stuff that shows up free"
            body="Customs exemption on one household shipment, 500 hours of subsidized Hebrew ulpan, year-one arnona discount, free health coverage, and the absorption cash in the box above."
          />
        </div>
      </div>

      <div className="mt-10 text-xs sm:text-sm text-[#5C5C5C] space-y-2">
        {result.notes.map((n, i) => <p key={i}>• {n}</p>)}
      </div>
    </div>
  );
}

function LabeledMoney({ label, value, onChange, placeholder }: { label: string; value: number; onChange: (n: number) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#00274C] mb-2">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5C5C]">$</span>
        <input
          type="number"
          inputMode="numeric"
          value={value || ""}
          onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
          className="w-full border border-[#D4D4D4] rounded-lg pl-7 pr-3 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCB05] text-base"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function IntangibleCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 sm:p-6 flex gap-4 items-start">
      <div className="shrink-0 w-11 h-11 rounded-lg bg-[#FFCB05]/20 flex items-center justify-center text-[#00274C]">
        {icon}
      </div>
      <div>
        <div className="font-bold text-[#00274C] mb-1.5">{title}</div>
        <p className="text-sm text-[#1A1A1A] leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
