import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, BarChart, Bar } from "recharts";
import { cashflow, netWorth, goals, inr } from "@/lib/fintwin-data";

const axis = { stroke: "var(--ink)", fontSize: 11, fontFamily: "var(--font-body)" };

export function CashflowChart() {
  return (
    <div className="h-56">
      <ResponsiveContainer>
        <AreaChart data={cashflow} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--mint)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="var(--mint)" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--coral)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="var(--coral)" stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--ink)" opacity={0.15} />
          <XAxis dataKey="month" {...axis} />
          <YAxis {...axis} tickFormatter={(v) => `${v / 1000}k`} />
          <Tooltip contentStyle={{ border: "2px solid var(--ink)", borderRadius: 12, background: "var(--card)" }} formatter={(v: number) => inr(v)} />
          <Area type="monotone" dataKey="income" stroke="var(--ink)" strokeWidth={2} fill="url(#inc)" />
          <Area type="monotone" dataKey="expenses" stroke="var(--ink)" strokeWidth={2} fill="url(#exp)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function NetWorthPie() {
  const total = netWorth.reduce((a, b) => a + b.value, 0);
  return (
    <div className="h-56 relative">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={netWorth} dataKey="value" innerRadius={55} outerRadius={85} stroke="var(--ink)" strokeWidth={2}>
            {netWorth.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ border: "2px solid var(--ink)", borderRadius: 12 }} formatter={(v: number) => inr(v)} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="text-center">
          <div className="mini-label">Net Worth</div>
          <div className="font-headline text-2xl">{inr(total)}</div>
        </div>
      </div>
    </div>
  );
}

export function GoalTimelineChart() {
  const data = goals.map((g) => ({ name: g.name, progress: Math.round((g.saved / g.target) * 100) }));
  return (
    <div className="h-56">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--ink)" opacity={0.15} />
          <XAxis dataKey="name" {...axis} />
          <YAxis {...axis} tickFormatter={(v) => `${v}%`} />
          <Tooltip contentStyle={{ border: "2px solid var(--ink)", borderRadius: 12 }} />
          <Bar dataKey="progress" fill="var(--sky)" stroke="var(--ink)" strokeWidth={2} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProjectionChart() {
  const data = Array.from({ length: 12 }, (_, i) => ({
    m: `M${i + 1}`,
    saved: 210000 + i * 15000 + Math.round(Math.random() * 2000),
    target: 210000 + i * 20000,
  }));
  return (
    <div className="h-56">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--ink)" opacity={0.15} />
          <XAxis dataKey="m" {...axis} />
          <YAxis {...axis} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={{ border: "2px solid var(--ink)", borderRadius: 12 }} formatter={(v: number) => inr(v)} />
          <Line type="monotone" dataKey="target" stroke="var(--coral)" strokeWidth={2} strokeDasharray="6 4" dot={false} />
          <Line type="monotone" dataKey="saved" stroke="var(--ink)" strokeWidth={3} dot={{ stroke: "var(--ink)", strokeWidth: 2, fill: "var(--mint)", r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
