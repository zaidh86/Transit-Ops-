import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Stat = {
  label: string;
  value: string;
  hint?: string;
};

type Panel = {
  title: string;
  description?: string;
  accentColor?: string;
  children: ReactNode;
};

type ModulePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  stats: Stat[];
  panels: Panel[];
  footer?: ReactNode;
};

export function ModulePage({ eyebrow, title, description, actions, stats, panels, footer }: ModulePageProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-2">{eyebrow}</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted">{description}</p>
        </div>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-surface/80">
            <CardContent className="p-4">
              <div className="font-display text-2xl font-semibold text-foreground">{stat.value}</div>
              <p className="mt-1 text-xs text-muted">{stat.label}</p>
              {stat.hint ? <p className="mt-2 text-xs leading-5 text-muted-2">{stat.hint}</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {panels.map((panel) => (
          <Card key={panel.title} accentColor={panel.accentColor} className="bg-surface/80">
            <CardHeader>
              <CardTitle>{panel.title}</CardTitle>
              {panel.description ? <CardDescription>{panel.description}</CardDescription> : null}
            </CardHeader>
            <CardContent>{panel.children}</CardContent>
          </Card>
        ))}
      </div>

      {footer ? <div>{footer}</div> : null}
    </div>
  );
}