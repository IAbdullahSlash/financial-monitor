import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { inr, inrFull } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const axis = { stroke: "var(--border)", fontSize: 11, fontFamily: "var(--font-sans)" };
const tooltipStyle = {
  border: "2px solid var(--border)",
  borderRadius: 5,
  boxShadow: "var(--shadow)",
  background: "var(--secondary-background)",
};

/** Paid vs remaining for a loan. */
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
  return (
    <Progress
      value={pct}
      aria-label={`${pct}% repaid`}
      className={cn(
        size === "lg" && "[&_[data-slot=progress-track]]:h-6",
        size === "sm" && "[&_[data-slot=progress-track]]:h-2.5",
        className,
      )}
    />
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
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.15} />
          <XAxis dataKey="year" {...axis} />
          <YAxis {...axis} tickFormatter={(v: number) => inr(v)} width={60} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => inrFull(v)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="principal"
            name="Principal"
            stackId="a"
            fill="var(--chart-4)"
            stroke="var(--border)"
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
            fill="var(--chart-3)"
            stroke="var(--border)"
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
