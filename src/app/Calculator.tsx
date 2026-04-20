"use client";

import { useState, useMemo } from "react";
import { STATE_OPTIONS, StateCode } from "@/lib/states";
import { calculate } from "@/lib/calc";
import { CURRENT } from "@/data/current";
import {
  IconSparkles,
  IconHeart,
  IconShield,
  IconChat,
  IconHome,
  IconGift,
  IconBus,
  IconPeople,
} from "./Icons";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function Calculator({ fxRate }: { fxRate: number }) {
  const [state, setState] = useState<StateCode>("NY");
  const [incomeK, setIncomeK] = useState<number>(250);
  const [kids, setKids] = useState<number>(2);
  const [sendsToDaySchool, setSendsToDaySchool] = useState<boolean>(true);
  const [showRefine, setShowRefine] = useState(false);
  const [homeValueK, setHomeValueK] = useState<number>(0);

  const income = incomeK * 1000;
  const homeValue = homeValueK * 1000;

  const result = useMemo(
    () =>
      calculate(
        { state, householdIncome: income, kids, homeValue: homeValue || undefined, sendsToJewishDaySchool: sendsToDaySchool },
        fxRate
      ),
    [state, income, kids, homeValue, sendsToDaySchool, fxRate]
  );

  const betterOff = result.annualDelta >= 0;
  const bigNumber = Math.abs(result.annualDelta);
  const visibleRows = result.rows.filter((r) => {
    if (r.onlyIfKids && kids === 0) return false;
    if (r.onlyIfDaySchool && !sendsToDaySchool) return false;
    return true;
  });

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
              className="w-full h-12 border border-[#D4D4D4] rounded-lg px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCB05] text-[#1A1A1A] text-base appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22 fill=%22none%22 stroke=%22%2300274C%22 stroke-width=%222%22><path d=%22M1 1l5 5 5-5%22/></svg>')] bg-no-repeat bg-[right_0.75rem_center] pr-9"
            >
              {STATE_OPTIONS.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#00274C] mb-2">
              Household income <span className="text-[#5C5C5C] font-normal">(pre-tax, in thousands)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5C5C] pointer-events-none">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={incomeK || ""}
                onChange={(e) => {
                  let v = parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;
                  if (v >= 1000) v = Math.round(v / 1000);
                  setIncomeK(v);
                }}
                className="w-full h-12 border border-[#D4D4D4] rounded-lg pl-7 pr-12 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCB05] text-base"
                placeholder="250"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C5C5C] pointer-events-none text-sm">K/yr</span>
            </div>
            {incomeK > 0 && (
              <div className="mt-1 text-xs text-[#5C5C5C] tabular-nums">
                = ${(incomeK * 1000).toLocaleString()}/year
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#00274C] mb-2">Kids</label>
            <select
              value={kids}
              onChange={(e) => setKids(parseInt(e.target.value, 10))}
              className="w-full h-12 border border-[#D4D4D4] rounded-lg px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCB05] text-base appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22 fill=%22none%22 stroke=%22%2300274C%22 stroke-width=%222%22><path d=%22M1 1l5 5 5-5%22/></svg>')] bg-no-repeat bg-[right_0.75rem_center] pr-9"
            >
              {[0,1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}{n === 6 ? "+" : ""}</option>)}
            </select>
          </div>
        </div>

        {kids > 0 && (
          <label className="mt-4 flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sendsToDaySchool}
              onChange={(e) => setSendsToDaySchool(e.target.checked)}
              className="w-4 h-4 rounded border-[#D4D4D4] accent-[#FFCB05]"
            />
            <span className="text-[#1A1A1A]">
              <strong className="text-[#00274C]">We send our kids to Jewish day school (or we want to).</strong>
              <span className="text-[#5C5C5C]"> Adds tuition to the U.S. column. Uncheck if kids are in public or charter school.</span>
            </span>
          </label>
        )}

        <button
          onClick={() => setShowRefine((v) => !v)}
          className="mt-4 text-sm text-[#0B3E7E] hover:underline block"
        >
          {showRefine ? "− Hide" : "+ Add"} home value for a sharper estimate (optional)
        </button>

        {showRefine && (
          <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
            <LabeledMoneyK label="U.S. home value" value={homeValueK} onChange={setHomeValueK} placeholder="650" />
          </div>
        )}
      </div>

      {/* HERO RESULT — two boxes */}
      <div className="mt-6 sm:mt-8 grid lg:grid-cols-[3fr_2fr] gap-4 sm:gap-5">
        {/* Left: Annual difference */}
        <div className="rounded-2xl overflow-hidden bg-[#00274C] text-white p-6 sm:p-8 lg:p-10 flex flex-col">
          <div className="text-xs sm:text-sm font-bold text-[#FFCB05] tracking-widest uppercase">
            Every year, for life
          </div>
          <div className="my-5 sm:my-6 font-[family-name:var(--font-merriweather)] font-black leading-none text-[min(18vw,5.5rem)] md:text-[5.5rem] lg:text-[min(8vw,5.5rem)]">
            {betterOff ? "+" : "−"}{fmt(bigNumber)}
          </div>
          <div className="text-base sm:text-lg text-[#FFCB05]">
            {betterOff ? "more" : "less"} in your pocket, living in Israel
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
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
          <div className="text-xs sm:text-sm font-bold tracking-widest uppercase">
            On arrival, from the government
          </div>
          <div className="my-5 sm:my-6 font-[family-name:var(--font-merriweather)] font-black leading-none text-[min(16vw,4.5rem)] md:text-[4.5rem] lg:text-[min(7vw,4.5rem)]">
            {fmt(result.arrivalBonus.salKlitaUsd)}
          </div>
          <div className="text-sm sm:text-base font-medium">
            Sal Klita absorption basket, <span className="tabular-nums">₪{result.arrivalBonus.salKlitaNis.toLocaleString()}</span> paid across your first 6 months.
          </div>
          <div className="mt-4 text-xs sm:text-sm leading-snug">
            Computed from <strong>Misrad Haklita</strong> (Israeli Ministry of Aliyah &amp; Integration) published rates: {CURRENT.salKlita.coupleNis.toLocaleString()} NIS baseline for a married couple, plus child supplements by age bracket. Converted at today&apos;s USD/ILS of {fxRate.toFixed(3)}.{" "}
            <a href={result.arrivalBonus.calculatorUrl} target="_blank" rel="nofollow noopener" className="underline">Official calculator</a>.
          </div>
          <div className="mt-auto pt-5 border-t border-[#00274C]/20 text-[11px] sm:text-xs text-[#00274C]/80 leading-snug">
            <strong className="text-[#00274C]">Also included (not in this number):</strong> customs exemption on one household shipment, 500 hours of free Hebrew ulpan, year-one arnona (property tax) discount, reduced-rate mortgages, and the 10-year oleh tax benefit already baked into the annual calculation to your left.
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
                const ilIsCredit = r.il < 0;
                return (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}>
                    <td className="px-5 py-4 align-top">
                      <div className="text-[#1A1A1A] font-medium">{r.label}</div>
                      {r.note && <div className="text-xs text-[#5C5C5C] mt-1 leading-snug">{r.note}</div>}
                    </td>
                    <td className={`px-5 py-4 text-right align-top tabular-nums ${usCheaper ? "font-bold text-[#00274C]" : "text-[#5C5C5C]"}`}>
                      {r.us ? fmt(r.us) : "—"}
                    </td>
                    <td className={`px-5 py-4 text-right align-top tabular-nums ${ilIsCredit ? "font-bold text-[#00274C]" : ilCheaper ? "font-bold text-[#00274C]" : "text-[#5C5C5C]"}`}>
                      {ilIsCredit ? `+${fmt(Math.abs(r.il))}` : r.il ? fmt(r.il) : "—"}
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
              <tr className="bg-[#00274C] text-white font-bold">
                <td className="px-5 py-4">Total coming out of your paycheck / year</td>
                <td className="px-5 py-4 text-right tabular-nums">{fmt(result.totals.us)}</td>
                <td className="px-5 py-4 text-right tabular-nums">{fmt(result.totals.il)}</td>
                <td className="px-5 py-4 text-right tabular-nums">
                  {result.totals.delta > 0 ? (
                    <span className="inline-block bg-[#FFCB05] text-[#00274C] px-2 py-1 rounded">+{fmt(result.totals.delta)}</span>
                  ) : (
                    <span>−{fmt(Math.abs(result.totals.delta))}</span>
                  )}
                </td>
              </tr>
              <tr className="bg-[#FFCB05]/20 text-[#00274C]">
                <td className="px-5 py-3 text-sm italic">Net cash in your pocket, matching the big number at top</td>
                <td className="px-5 py-3 text-right tabular-nums font-semibold">{fmt(result.usNet)}</td>
                <td className="px-5 py-3 text-right tabular-nums font-semibold">{fmt(result.ilNet)}</td>
                <td className="px-5 py-3 text-right tabular-nums font-black">
                  {result.annualDelta >= 0 ? "+" : "−"}{fmt(Math.abs(result.annualDelta))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile card layout */}
        <div className="md:hidden space-y-3">
          {visibleRows.map((r, i) => {
            const usCheaper = r.delta < 0;
            const ilCheaper = r.delta > 0;
            const ilIsCredit = r.il < 0;
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
                    <div className={`tabular-nums text-base ${ilIsCredit || ilCheaper ? "font-bold text-[#00274C]" : "text-[#5C5C5C]"}`}>
                      {ilIsCredit ? `+${fmt(Math.abs(r.il))}` : r.il ? fmt(r.il) : "—"}
                    </div>
                  </div>
                </div>
                {r.delta !== 0 && (
                  <div className="mt-3">
                    {r.delta > 0 ? (
                      <span className="inline-block bg-[#FFCB05]/20 text-[#00274C] font-bold px-2 py-1 rounded text-sm">
                        {ilIsCredit ? `You receive ${fmt(Math.abs(r.il))}/yr in Israel` : `You save ${fmt(r.delta)}/yr in Israel`}
                      </span>
                    ) : (
                      <span className="text-sm text-[#5C5C5C]">You pay {fmt(Math.abs(r.delta))}/yr more in Israel</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div className="bg-[#00274C] text-white rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#FFCB05] mb-2 font-bold">Totals reconcile to the hero number</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-white/60 text-[10px] uppercase">Out / yr · U.S.</div>
                <div className="tabular-nums font-bold">{fmt(result.totals.us)}</div>
              </div>
              <div>
                <div className="text-white/60 text-[10px] uppercase">Out / yr · Israel</div>
                <div className="tabular-nums font-bold">{fmt(result.totals.il)}</div>
              </div>
              <div>
                <div className="text-white/60 text-[10px] uppercase">Net / yr · U.S.</div>
                <div className="tabular-nums font-semibold">{fmt(result.usNet)}</div>
              </div>
              <div>
                <div className="text-[#FFCB05] text-[10px] uppercase">Net / yr · Israel</div>
                <div className="tabular-nums font-semibold">{fmt(result.ilNet)}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 text-center">
              <span className="font-[family-name:var(--font-merriweather)] font-black text-2xl text-[#FFCB05]">
                {result.annualDelta >= 0 ? "+" : "−"}{fmt(Math.abs(result.annualDelta))}/yr
              </span>
            </div>
          </div>
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
            title="Happier, and it's measured"
            body="Israel ranks 8th on the 2026 World Happiness Index. The U.S. ranks 24th, its lowest ever. Among under-25s, Israel is 3rd. The U.S. is 60th."
            source="World Happiness Report 2026"
            sourceUrl="https://worldhappiness.report/"
          />
          <IntangibleCard
            icon={<IconHeart />}
            title="Healthcare without the leash"
            body="Universal Kupat Holim coverage begins when you register on arrival. Quit your job, start a company, take a sabbatical. Your family stays covered. The closest U.S. equivalent for a family costs about $25K/year."
          />
          <IntangibleCard
            icon={<IconShield />}
            title="Safer in daily life"
            body="U.S. homicide rate runs roughly 3–4× Israel's. Despite headlines, violent crime in everyday Israeli life is meaningfully lower than in most of the U.S."
            source="UNODC + FBI UCR"
            sourceUrl="https://dataunodc.un.org/dp-intentional-homicide-victims"
          />
          <IntangibleCard
            icon={<IconPeople />}
            title="Independent kids"
            body="Israeli kids walk to school, ride buses alone, and roam playgrounds without a parent shadowing them. The 'free-range' parenting that U.S. thinkpieces romanticize is just how childhood works here."
          />
          <IntangibleCard
            icon={<IconChat />}
            title="Bilingual kids, by osmosis"
            body="Kids raised in Israel grow up functionally bilingual in English and Hebrew with no intervention. A skill American parents pay thousands per year to simulate through after-school programs."
          />
          <IntangibleCard
            icon={<IconHome />}
            title="Being Jewish stops being a project"
            body="Your calendar, your kids' school, your neighbors, your mayor: all Jewish. You're not explaining Hanukkah to coworkers, scheduling around holidays that aren't on the office calendar, or paying $28K/year so your kids know what Shabbat is. It's the water you swim in."
          />
          <IntangibleCard
            icon={<IconBus />}
            title="Jewish community is the default"
            body="The social architecture that American Jewish families build deliberately (day school, shul, camp, trips to Israel) is just the environment here. Your kids' classmates, your neighbors, your kids' eventual dating pool are Jewish without you planning for it."
          />
          <IntangibleCard
            icon={<IconGift />}
            title="Stuff that shows up free"
            body="Customs exemption on one household shipment, 500 hours of subsidized Hebrew ulpan, year-one arnona discount, reduced mortgage rates, and the Sal Klita cash in the box above."
          />
          <IntangibleCard
            icon={<IconHeart />}
            title="Having a baby: free, plus they pay you"
            body="In the U.S., even with great employer insurance, a typical birth runs about $3,000 out of pocket after copays and deductibles. Uninsured, it's $13K to $40K. In Israel the hospital bill is zero, and Bituach Leumi sends a one-time birth grant of about 1,800 NIS (~$600) for your first kid, plus paid maternity leave at full salary for 15 weeks."
            source="KFF Peterson Health System Tracker"
            sourceUrl="https://www.healthsystemtracker.org/brief/health-costs-associated-with-pregnancy-childbirth-and-postpartum-care/"
          />
        </div>
      </div>

      <div className="mt-10 text-xs sm:text-sm text-[#5C5C5C] space-y-2">
        {result.notes.map((n, i) => <p key={i}>• {n}</p>)}
      </div>
    </div>
  );
}

function LabeledMoneyK({ label, value, onChange, placeholder }: { label: string; value: number; onChange: (n: number) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#00274C] mb-2">
        {label} <span className="text-[#5C5C5C] font-normal">(in thousands)</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5C5C] pointer-events-none">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={value || ""}
          onChange={(e) => {
            let v = parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;
            if (v >= 1000) v = Math.round(v / 1000);
            onChange(v);
          }}
          className="w-full h-12 border border-[#D4D4D4] rounded-lg pl-7 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCB05] text-base"
          placeholder={placeholder}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C5C5C] pointer-events-none text-sm">K</span>
      </div>
      {value > 0 && (
        <div className="mt-1 text-xs text-[#5C5C5C] tabular-nums">
          = ${(value * 1000).toLocaleString()}
        </div>
      )}
    </div>
  );
}

function IntangibleCard({ icon, title, body, source, sourceUrl }: { icon: React.ReactNode; title: string; body: string; source?: string; sourceUrl?: string }) {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 sm:p-6 flex gap-4 items-start">
      <div className="shrink-0 w-11 h-11 rounded-lg bg-[#FFCB05]/20 flex items-center justify-center text-[#00274C]">
        {icon}
      </div>
      <div>
        <div className="font-bold text-[#00274C] mb-1.5">{title}</div>
        <p className="text-sm text-[#1A1A1A] leading-relaxed">{body}</p>
        {source && (
          <div className="mt-2 text-[11px] text-[#5C5C5C]">
            Source:{" "}
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="nofollow noopener" className="text-[#0B3E7E] hover:underline">{source}</a>
            ) : (
              source
            )}
          </div>
        )}
      </div>
    </div>
  );
}
