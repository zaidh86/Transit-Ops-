import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  /** Stable identity for the column; also used as the React key. */
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Applied to both the header and body cells, e.g. "text-right". */
  className?: string;
  /** Hide below the `sm` breakpoint to keep narrow screens readable. */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  /** Rendered when there are no rows and we are not loading. */
  emptyMessage?: string;
  /** Number of skeleton rows to show while loading. */
  skeletonRows?: number;
}

/**
 * The one table in the app. Every module screen renders its roster through
 * this, so loading, empty and overflow behaviour stay identical everywhere.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  isLoading = false,
  emptyMessage = "Nothing to show yet.",
  skeletonRows = 4,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-muted-2">
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn(
                  "whitespace-nowrap py-2 pr-4 font-medium last:pr-0",
                  column.hideOnMobile && "hidden sm:table-cell",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            Array.from({ length: skeletonRows }, (_, rowIndex) => (
              <tr
                key={`skeleton-${rowIndex}`}
                className="border-b border-border/60 last:border-0"
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "py-3 pr-4 last:pr-0",
                      column.hideOnMobile && "hidden sm:table-cell"
                    )}
                  >
                    <div className="h-4 w-full max-w-24 animate-pulse rounded bg-surface-raised" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-sm text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={getRowId(row)}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-raised/40"
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "py-3 pr-4 align-middle last:pr-0",
                      column.hideOnMobile && "hidden sm:table-cell",
                      column.className
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
