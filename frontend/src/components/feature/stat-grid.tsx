import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/states";

export interface Stat {
  label: string;
  value: string;
  hint?: string;
}

interface StatGridProps {
  stats: Stat[];
  isLoading?: boolean;
}

/** The four-across summary strip that sits under every module's header. */
export function StatGrid({ stats, isLoading = false }: StatGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-surface/80">
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="font-display text-2xl font-semibold text-foreground">
                {stat.value}
              </p>
            )}
            <p className="mt-1 text-xs text-muted">{stat.label}</p>
            {stat.hint && (
              <p className="mt-2 text-xs leading-5 text-muted-2">{stat.hint}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
