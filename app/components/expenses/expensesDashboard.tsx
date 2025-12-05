import { PieChart } from "@mui/x-charts/PieChart";
import { ExpenseIcon } from "./expenseIcon";
import { formatMoney } from "@/lib/utils/helperFunctions";
import { ExpenseWithConverted } from "@/types/expense/types";
import { Currency } from "@/types/currency/types";

interface ExpensesDashboardProps {
  tripCurrency: Currency | undefined;
  expenses: Array<ExpenseWithConverted>;
}

interface CategorySummary {
  id: string;
  value: number;
  label: string;
  color: string;
  transactions: number;
}

export function ExpensesDashboard({
  tripCurrency,
  expenses,
}: ExpensesDashboardProps) {
  // Group expenses by category
  const groupedData: CategorySummary[] = Object.values(
    expenses.reduce((acc, expense) => {
      const categoryId = expense?.category?._id ?? "undefined";
      const categoryLabel = expense?.category?.name ?? "Undefined";
      const categoryColor = expense?.category?.color ?? "#888888";

      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          value: 0,
          label: categoryLabel,
          color: categoryColor,
          transactions: 0,
        };
      }

      acc[categoryId].value += Number(expense.convertedValue ?? 0);
      acc[categoryId].transactions += 1;

      return acc;
    }, {} as Record<string, CategorySummary>)
  );

  const total = groupedData.reduce((sum, cat) => sum + cat.value, 0);

  if (groupedData.length === 0) {
    return (
      <div className="text-muted">
        Start adding your expenses to see your spending overview.
      </div>
    );
  }

  return (
    <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-2 gap-md-5">
      {/* Pie Chart */}
      <div className="d-flex justify-content-center">
        <PieChart
          series={[
            {
              data: groupedData,
              innerRadius: 80,
              valueFormatter: (item) =>
                `${((item.value / total) * 100)?.toFixed(0)}%`,
            },
          ]}
          width={250}
          height={250}
        />
      </div>

      {/* Category list */}
      <section
        className="d-flex flex-column gap-3 justify-content-between w-100"
        style={{ maxWidth: "500px" }}
      >
        {groupedData.map((category) => (
          <article
            key={category.id}
            className="d-flex align-items-center justify-content-between gap-4"
          >
            <div className="d-flex gap-2 align-items-center">
              <ExpenseIcon color={category.color} size="35px" />
              <div>
                <h3 className="font-semibold fs-6 mb-0">{category.label}</h3>
                <p className="mb-0 text-muted small">
                  {category.transactions}{" "}
                  {category.transactions > 1 ? "transactions" : "transaction"}
                </p>
              </div>
            </div>
            <p className="fs-6 mb-0">
              {formatMoney(category.value)} {tripCurrency?.symbol}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
