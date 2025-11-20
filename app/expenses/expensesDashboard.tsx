import { PieChart } from "@mui/x-charts/PieChart";
import { ExpenseType } from "../trips/[tripId]/page";

interface ExpensesDashboardProps {
  expenses: Array<ExpenseType>;
}

export function ExpensesDashboard({ expenses }: ExpensesDashboardProps) {
  const groupedData = Object.values(
    expenses.reduce((acc, expense) => {
      const categoryId = expense?.category?._id || "undefined";
      const categoryLabel = expense?.category?.name || "undefined";
      const categoryColor = expense?.category?.color || "#888888";

      if (!acc[categoryId] || acc[categoryId] === undefined) {
        acc[categoryId] = {
          id: categoryId,
          value: 0,
          label: categoryLabel,
          color: categoryColor,
        };
      }

      acc[categoryId].value += Number(expense.value);
      return acc;
    }, {} as Record<string, { id: string; value: number; label: string; color: string }>)
  );

  return (
    <PieChart
      skipAnimation
      series={[{ data: groupedData, innerRadius: 80 }]}
      width={300}
      height={300}
    />
  );
}
