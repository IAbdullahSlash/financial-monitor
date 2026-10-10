import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { inr, inrFull, monthYear } from "@/lib/format";
import { cn } from "@/lib/utils";

const axis = { stroke: "var(--ink)", fontSize: 11, fontFamily: "var(--font-body)" };
const tooltipStyle = {
  border: "2px solid var(--ink)",
  borderRadius: 12,
  background: "var(--card)",
};

/** Paid vs remaining, as a chunky sketch-style bar. */
export function PaidBar({
  progress,
  className,
  size = "md",
}: {
  progress: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const h = size === "lg" ? "h-6" : size === "sm" ? "h-2.5" : "h-4";
  return (
    <div
      className={cn("rounded-full border-2 border-ink overflow-hidden bg-card", h, className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${pct}% repaid`}
    >
      <div className="h-full bg-mint border-r-2 border-ink" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Principal vs interest paid each calendar year; years already paid are drawn solid. */
export function YearlyChart({
  data,
  currentYear,
}: {
  data: { year: number; principal: number; interest: number }[];
  currentYear: number;
}) {
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--ink)" opacity={0.15} />
          <XAxis dataKey="year" {...axis} />
          <YAxis {...axis} tickFormatter={(v: number) => inr(v)} width={60} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => inrFull(v)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="principal"
            name="Principal"
            stackId="a"
            fill="var(--mint)"
            stroke="var(--ink)"
            strokeWidth={1.5}
          >
            {data.map((d) => (
              <Cell key={d.year} fillOpacity={d.year <= currentYear ? 1 : 0.45} />
            ))}
          </Bar>
          <Bar
            dataKey="interest"
            name="Interest"
            stackId="a"
            fill="var(--coral)"
            stroke="var(--ink)"
            strokeWidth={1.5}
          >
            {data.map((d) => (
              <Cell key={d.year} fillOpacity={d.year <= currentYear ? 1 : 0.45} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Total debt over time: as scheduled vs with the plan. */
export function PayoffChart({
  baseline,
  plan,
}: {
  baseline: { date: string; balance: number }[];
  plan: { date: string; balance: number }[];
}) {
  const length = Math.max(baseline.length, plan.length);
  const data = Array.from({ length }, (_, i) => ({
    date: (baseline[i] ?? plan[i]).date,
    scheduled: baseline[i]?.balance ?? 0,
    plan: plan[i]?.balance ?? 0,
  }));
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--ink)" opacity={0.15} />
          <XAxis
            dataKey="date"
            {...axis}
            tickFormatter={(d: string) => d.slice(0, 4)}
            minTickGap={30}
          />
          <YAxis {...axis} tickFormatter={(v: number) => inr(v)} width={60} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(d: string) => monthYear(d)}
            formatter={(v: number) => inrFull(v)}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="scheduled"
            name="As scheduled"
            stroke="var(--coral)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="plan"
            name="With your plan"
            stroke="var(--ink)"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
