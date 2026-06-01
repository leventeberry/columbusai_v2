import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DateRangeToggle({
  value,
  onChange,
  options = ["24h", "7d", "30d", "90d"],
}: {
  value: string;
  onChange: (v: string) => void;
  options?: string[];
}) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList className="bg-surface border border-border">
        {options.map((o) => (
          <TabsTrigger key={o} value={o} className="text-xs data-[state=active]:bg-surface-elevated">
            {o}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
