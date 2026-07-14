"use client";

import { useMemo, useState } from "react";
import { Fuel, Pencil, Plus, Receipt, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/feature/page-header";
import { StatGrid } from "@/components/feature/stat-grid";
import { ExpenseFormDialog } from "@/components/feature/expenses/expense-form-dialog";
import { FuelLogFormDialog } from "@/components/feature/expenses/fuel-log-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/states";
import { useAuth } from "@/lib/auth-context";
import {
  useDeleteExpense,
  useDeleteFuelLog,
  useExpenseModule,
} from "@/lib/queries/expenses";
import { useVehicles } from "@/lib/queries/vehicles";
import { EXPENSE_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate, formatLitres } from "@/lib/format";
import type { Expense, FuelLog } from "@/lib/types";

export default function ExpensesPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole("FLEET_MANAGER");

  const [editingFuelLog, setEditingFuelLog] = useState<FuelLog | undefined>(
    undefined
  );
  const [isFuelFormOpen, setIsFuelFormOpen] = useState(false);
  const [pendingFuelDelete, setPendingFuelDelete] = useState<FuelLog | null>(
    null
  );

  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(
    undefined
  );
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [pendingExpenseDelete, setPendingExpenseDelete] =
    useState<Expense | null>(null);

  // One call returns both collections.
  const { data, isPending, isError, error, refetch } = useExpenseModule();
  const { data: vehicles = [] } = useVehicles();

  const deleteFuelLog = useDeleteFuelLog();
  const deleteExpense = useDeleteExpense();

  // Derived in one memo so the fallback arrays keep a stable identity — fresh
  // `[]` literals on every render would invalidate the memos below.
  const { fuelLogs, expenses } = useMemo(
    () => ({
      fuelLogs: data?.fuelLogs ?? [],
      expenses: data?.expenses ?? [],
    }),
    [data]
  );

  const vehicleLabels = useMemo(
    () =>
      new Map(
        vehicles.map((vehicle) => [vehicle.id, vehicle.registrationNumber])
      ),
    [vehicles]
  );

  const stats = useMemo(() => {
    const fuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
    const otherCost = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const litres = fuelLogs.reduce((sum, log) => sum + log.liters, 0);

    return [
      { label: "Fuel cost", value: formatCurrency(fuelCost) },
      { label: "Fuel purchased", value: formatLitres(litres) },
      {
        label: "Other expenses",
        value: formatCurrency(otherCost),
        hint: "Tolls, parking and fines.",
      },
      { label: "Total recorded", value: formatCurrency(fuelCost + otherCost) },
    ];
  }, [fuelLogs, expenses]);

  function vehicleLabel(vehicleId: string): string {
    return vehicleLabels.get(vehicleId) ?? vehicleId;
  }

  async function confirmFuelDelete(): Promise<void> {
    if (!pendingFuelDelete) return;
    try {
      await deleteFuelLog.mutateAsync(pendingFuelDelete.id);
      toast.success("Fuel log deleted");
      setPendingFuelDelete(null);
    } catch {
      // Surfaced on the dialog.
    }
  }

  async function confirmExpenseDelete(): Promise<void> {
    if (!pendingExpenseDelete) return;
    try {
      await deleteExpense.mutateAsync(pendingExpenseDelete.id);
      toast.success("Expense deleted");
      setPendingExpenseDelete(null);
    } catch {
      // Surfaced on the dialog.
    }
  }

  const fuelColumns: Column<FuelLog>[] = [
    {
      id: "vehicle",
      header: "Vehicle",
      cell: (log) => (
        <span className="font-mono text-xs text-foreground">
          {vehicleLabel(log.vehicleId)}
        </span>
      ),
    },
    {
      id: "liters",
      header: "Litres",
      cell: (log) => (
        <span className="text-muted">{formatLitres(log.liters)}</span>
      ),
    },
    {
      id: "cost",
      header: "Cost",
      cell: (log) => (
        <span className="text-foreground">{formatCurrency(log.cost)}</span>
      ),
    },
    {
      id: "date",
      header: "Date",
      hideOnMobile: true,
      cell: (log) => (
        <span className="text-muted">{formatDate(log.date)}</span>
      ),
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "",
            className: "text-right",
            cell: (log: FuelLog) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit fuel log"
                  onClick={() => {
                    setEditingFuelLog(log);
                    setIsFuelFormOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete fuel log"
                  onClick={() => setPendingFuelDelete(log)}
                >
                  <Trash2 className="h-4 w-4 text-status-suspended" />
                </Button>
              </div>
            ),
          } satisfies Column<FuelLog>,
        ]
      : []),
  ];

  const expenseColumns: Column<Expense>[] = [
    {
      id: "vehicle",
      header: "Vehicle",
      cell: (expense) => (
        <span className="font-mono text-xs text-foreground">
          {vehicleLabel(expense.vehicleId)}
        </span>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: (expense) => (
        <span className="text-muted">
          {EXPENSE_TYPE_LABELS[expense.category] ?? expense.category}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      cell: (expense) => (
        <span className="text-foreground">{formatCurrency(expense.amount)}</span>
      ),
    },
    {
      id: "date",
      header: "Date",
      hideOnMobile: true,
      cell: (expense) => (
        <span className="text-muted">{formatDate(expense.date)}</span>
      ),
    },
    {
      id: "notes",
      header: "Notes",
      hideOnMobile: true,
      cell: (expense) => (
        <span className="text-muted">{expense.notes ?? "—"}</span>
      ),
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "",
            className: "text-right",
            cell: (expense: Expense) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit expense"
                  onClick={() => {
                    setEditingExpense(expense);
                    setIsExpenseFormOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete expense"
                  onClick={() => setPendingExpenseDelete(expense)}
                >
                  <Trash2 className="h-4 w-4 text-status-suspended" />
                </Button>
              </div>
            ),
          } satisfies Column<Expense>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance / fuel & expenses"
        title="Fuel and expense tracking"
        description="Fuel and maintenance make up operational cost. Tolls, parking and fines are tracked separately and sit outside it."
        actions={
          canManage ? (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingFuelLog(undefined);
                  setIsFuelFormOpen(true);
                }}
              >
                <Fuel className="h-4 w-4" />
                Add fuel log
              </Button>
              <Button
                onClick={() => {
                  setEditingExpense(undefined);
                  setIsExpenseFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add expense
              </Button>
            </>
          ) : undefined
        }
      />

      <StatGrid stats={stats} isLoading={isPending} />

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card accentColor="var(--status-ontrip)">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-accent" aria-hidden />
                Fuel logs
              </CardTitle>
              <CardDescription>
                Fuel consumption drives efficiency and operational cost.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={fuelColumns}
                rows={fuelLogs}
                getRowId={(log) => log.id}
                isLoading={isPending}
                emptyMessage="No fuel logs recorded yet."
              />
            </CardContent>
          </Card>

          <Card accentColor="var(--status-shop)">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-accent" aria-hidden />
                Expense records
              </CardTitle>
              <CardDescription>
                Tolls, parking and fines, tracked per vehicle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={expenseColumns}
                rows={expenses}
                getRowId={(expense) => expense.id}
                isLoading={isPending}
                emptyMessage="No expenses recorded yet."
              />
            </CardContent>
          </Card>
        </div>
      )}

      <FuelLogFormDialog
        open={isFuelFormOpen}
        onOpenChange={setIsFuelFormOpen}
        fuelLog={editingFuelLog}
      />

      <ExpenseFormDialog
        open={isExpenseFormOpen}
        onOpenChange={setIsExpenseFormOpen}
        expense={editingExpense}
      />

      <ConfirmDialog
        open={pendingFuelDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingFuelDelete(null);
            deleteFuelLog.reset();
          }
        }}
        title="Delete fuel log"
        description="Permanently delete this fuel log. It will no longer count towards operational cost or fuel efficiency."
        confirmLabel="Delete"
        destructive
        isPending={deleteFuelLog.isPending}
        error={deleteFuelLog.error}
        onConfirm={() => void confirmFuelDelete()}
      />

      <ConfirmDialog
        open={pendingExpenseDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingExpenseDelete(null);
            deleteExpense.reset();
          }
        }}
        title="Delete expense"
        description="Permanently delete this expense record."
        confirmLabel="Delete"
        destructive
        isPending={deleteExpense.isPending}
        error={deleteExpense.error}
        onConfirm={() => void confirmExpenseDelete()}
      />
    </div>
  );
}
