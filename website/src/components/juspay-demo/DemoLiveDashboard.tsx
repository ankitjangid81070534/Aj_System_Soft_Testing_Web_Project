"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Boxes, IndianRupee, Receipt, type LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import styles from "./juspay-demo.module.css";
import dash from "./demo-live-dashboard.module.css";

/**
 * Illustrative sample data for the interactive dashboard preview. Every number
 * here is clearly labelled as sample data in the UI — nothing is presented as a
 * real client result. It exists so a visitor can *click through* the kind of
 * reporting screens we build instead of reading about them.
 */
type View = {
  id: "billing" | "inventory" | "payments";
  label: string;
  Icon: LucideIcon;
  kpis: { label: string; value: string; delta: string; up: boolean }[];
  chartTitle: string;
  unit: string;
  series: { label: string; value: number }[];
  tableHead: [string, string, string];
  rows: { a: string; b: string; c: string; tone?: "ok" | "warn" | "due" }[];
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const VIEWS: View[] = [
  {
    id: "billing",
    label: "Billing",
    Icon: Receipt,
    kpis: [
      { label: "Today's sales", value: "₹1,84,250", delta: "+12.4%", up: true },
      { label: "Invoices generated", value: "126", delta: "+18", up: true },
      { label: "Avg. billing time", value: "48 sec", delta: "-82%", up: true },
    ],
    chartTitle: "Daily sales this week",
    unit: "₹ thousand",
    series: [142, 168, 155, 191, 176, 224, 184].map((value, i) => ({ label: DAYS[i], value })),
    tableHead: ["Invoice", "Customer", "Amount"],
    rows: [
      { a: "INV-2041", b: "Shree Balaji Traders", c: "₹18,400", tone: "ok" },
      { a: "INV-2040", b: "Mehta Pharma", c: "₹7,250", tone: "ok" },
      { a: "INV-2039", b: "Hotel Sunrise Palace", c: "₹32,900", tone: "due" },
      { a: "INV-2038", b: "Rajasthan Agro Mills", c: "₹11,120", tone: "ok" },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    Icon: Boxes,
    kpis: [
      { label: "Items in stock", value: "3,482", delta: "+140", up: true },
      { label: "Low-stock alerts", value: "7", delta: "-5", up: true },
      { label: "Stock value", value: "₹42.6L", delta: "+3.1%", up: true },
    ],
    chartTitle: "Units dispatched this week",
    unit: "units",
    series: [310, 285, 342, 398, 371, 455, 262].map((value, i) => ({ label: DAYS[i], value })),
    tableHead: ["Item", "Godown", "Stock"],
    rows: [
      { a: "Basmati 25kg", b: "Godown A", c: "412 bags", tone: "ok" },
      { a: "Refined oil 15L", b: "Godown B", c: "18 tins", tone: "warn" },
      { a: "Sugar 50kg", b: "Godown A", c: "236 bags", tone: "ok" },
      { a: "Wheat flour 10kg", b: "Godown B", c: "9 bags", tone: "warn" },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    Icon: IndianRupee,
    kpis: [
      { label: "Collected this month", value: "₹28.4L", delta: "+9.8%", up: true },
      { label: "Pending receivables", value: "₹3.2L", delta: "-14%", up: true },
      { label: "Overdue accounts", value: "4", delta: "-3", up: true },
    ],
    chartTitle: "Collections this week",
    unit: "₹ thousand",
    series: [96, 132, 118, 164, 149, 201, 88].map((value, i) => ({ label: DAYS[i], value })),
    tableHead: ["Party", "Due date", "Amount"],
    rows: [
      { a: "Jangid Hospital", b: "Paid · today", c: "₹54,000", tone: "ok" },
      { a: "Hotel Sunrise Palace", b: "Due in 3 days", c: "₹32,900", tone: "due" },
      { a: "Mehta Pharma", b: "Paid · yesterday", c: "₹7,250", tone: "ok" },
      { a: "Rajasthan Agro Mills", b: "Overdue · 6 days", c: "₹11,120", tone: "warn" },
    ],
  },
];

/**
 * Interactive "see your data live" preview: three switchable views (billing,
 * inventory, payments) each with KPI cards, an animated bar chart and a recent
 * activity table. Pure CSS/React — no chart library, no network. Placed right
 * after the hero proof so a visitor sees a working product within seconds.
 */
/** Section copy, resolved by the server from `site_copy` (admin editable). */
export type DashboardText = { eyebrow: string; title: string; titleAccent: string; lead: string };

export function DemoLiveDashboard({ ctaHref, text }: { ctaHref: string; text: DashboardText }) {
  const [active, setActive] = useState<View["id"]>("billing");
  const view = VIEWS.find((v) => v.id === active) ?? VIEWS[0];
  const max = Math.max(...view.series.map((p) => p.value));
  const peak = view.series.reduce((best, p) => (p.value > best.value ? p : best), view.series[0]);

  return (
    <section className={styles.section} data-home-section="live-dashboard">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <Reveal>
            <span className={styles.eyebrowPlain}>{text.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className={styles.h2}>
              {text.title} <span className={styles.blue}>{text.titleAccent}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className={styles.lead}>{text.lead}</p>
          </Reveal>
        </div>

        <ScrollScene variant="rise" className={dash.stage}>
          <div className={dash.frame} data-tilt>
            <div className={dash.chrome}>
              <div className={dash.tabs} role="group" aria-label="Dashboard view">
                {VIEWS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={dash.tab}
                    aria-pressed={id === active}
                    onClick={() => setActive(id)}
                  >
                    <Icon size={15} aria-hidden />
                    {label}
                  </button>
                ))}
              </div>
              <span className={dash.live}>
                <i aria-hidden /> Live · sample data
              </span>
            </div>

            <div className={dash.kpis}>
              {view.kpis.map((kpi) => (
                <div key={`${view.id}-${kpi.label}`} className={dash.kpi}>
                  <span className={dash.kpiLabel}>{kpi.label}</span>
                  <b className={dash.kpiValue}>{kpi.value}</b>
                  <span className={`${dash.kpiDelta} ${kpi.up ? dash.up : dash.down}`}>
                    {kpi.up ? <ArrowUpRight size={14} aria-hidden /> : <ArrowDownRight size={14} aria-hidden />}
                    {kpi.delta} vs last week
                  </span>
                </div>
              ))}
            </div>

            <div className={dash.body}>
              <figure className={dash.chart}>
                <figcaption className={dash.chartHead}>
                  <span>{view.chartTitle}</span>
                  <span className={dash.unit}>{view.unit}</span>
                </figcaption>
                <div className={dash.bars} role="img" aria-label={`${view.chartTitle}: ${view.series.map((p) => `${p.label} ${p.value}`).join(", ")}`}>
                  {view.series.map((point) => (
                    <div key={`${view.id}-${point.label}`} className={dash.barCol}>
                      <span className={dash.barValue}>{point.value}</span>
                      <div
                        className={`${dash.bar} ${point === peak ? dash.barPeak : ""}`}
                        style={{ height: `${Math.round((point.value / max) * 100)}%` }}
                      />
                      <span className={dash.barLabel}>{point.label}</span>
                    </div>
                  ))}
                </div>
              </figure>

              <div className={dash.table}>
                <div className={`${dash.row} ${dash.rowHead}`}>
                  {view.tableHead.map((head) => (
                    <span key={head}>{head}</span>
                  ))}
                </div>
                {view.rows.map((row) => (
                  <div key={`${view.id}-${row.a}`} className={dash.row}>
                    <span className={dash.cellStrong}>{row.a}</span>
                    <span>{row.b}</span>
                    <span className={`${dash.cellEnd} ${row.tone ? dash[row.tone] : ""}`}>{row.c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollScene>

        <Reveal delay={0.1}>
          <p className={dash.note}>
            Figures shown are illustrative sample data. Your dashboard is built around <em>your</em> products, branches,
            GST rules and reports —{" "}
            <a href={ctaHref} className={dash.noteLink}>
              tell us what you need to see every morning
            </a>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
