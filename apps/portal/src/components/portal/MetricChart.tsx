import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { label: string; value: number };

export function AreaTrend({ data, color = "var(--accent)" }: { data: Point[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
        <XAxis dataKey="label" stroke="oklch(1 0 0 / 0.4)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="oklch(1 0 0 / 0.4)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ stroke: "oklch(1 0 0 / 0.15)" }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            fontSize: 12,
          }}
        />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarTrend({ data, color = "var(--chart-2)" }: { data: Point[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
        <XAxis dataKey="label" stroke="oklch(1 0 0 / 0.4)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="oklch(1 0 0 / 0.4)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: "oklch(1 0 0 / 0.05)" }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
