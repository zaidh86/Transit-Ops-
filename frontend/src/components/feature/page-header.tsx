import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  /** Primary actions, right-aligned on wide screens. */
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-1.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-2">
          {eyebrow}
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted">{description}</p>
      </div>

      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
