import {
  Area,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { inr, inrFull, monthYear } from "@/lib/format";
import type { Point } from "@/lib/twin";

const axis = { stroke: "var(--border)", fontSize: 11, fontFamily: "var(--font-sans)" };
const tooltipStyle = {
  border: "2px solid var(--border)",
  borderRadius: 5,
  boxShadow: "var(--shadow)",
  background: "var(--secondary-background)",
};

/** Projected net worth over `years`, optionally against a what-if version. */
export function NetWorthChart({
  base,
  alt,
  years = 10,
}: {
  base: Point[];
  alt?: Point[];
  years?: number;
}) {
  const data = base.slice(0, years * 12).map((p, i) => ({
    date: p.date,
    twin: Math.round(p.netWorth),
    whatIf: alt ? Math.round(alt[i].netWorth) : undefined,
  }));
  return (
    <div className="h-72">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
          <defs>
            <linearGradient id="twinFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--main)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="var(--main)" stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.15} />
          <XAxis
            dataKey="date"
            {...axis}
            ticks={data.filter((d) => d.date.slice(5, 7) === "01").map((d) => d.date)}
            tickFormatter={(d: string) => d.slice(0, 4)}
            interval={0}
          />
          <YAxis {...axis} tickFormatter={(v: number) => inr(v)} width={64} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(d: string) => monthYear(d)}
            formatter={(v: number) => inrFull(v)}
          />
          {alt && <Legend wrapperStyle={{ fontSize: 12 }} />}
          <Area
            type="monotone"
            dataKey="twin"
            name={alt ? "Your twin today" : "Net worth"}
            stroke="var(--border)"
            strokeWidth={2.5}
            fill="url(#twinFill)"
          />
          {alt && (
            <Line
              type="monotone"
              dataKey="whatIf"
              name="With this change"
              stroke="var(--chart-3)"
              strokeWidth={3}
              strokeDasharray="6 4"
              dot={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
