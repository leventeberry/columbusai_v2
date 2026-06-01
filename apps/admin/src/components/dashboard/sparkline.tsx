import { Area, AreaChart, ResponsiveContainer } from "recharts";

export function Sparkline({
  data,
  positive = true,
}: {
  data: { x: number; y: number }[];
  positive?: boolean;
}) {
  const id = `spark-${positive ? "p" : "n"}`;
  const color = positive ? "var(--color-success)" : "var(--color-destructive)";
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="y"
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#${id})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
