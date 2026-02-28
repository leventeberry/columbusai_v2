import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SectionCardProps = {
  title: string;
  id?: string;
  children: ReactNode;
};

export function SectionCard({ title, id, children }: SectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle id={id} className="text-2xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
}
