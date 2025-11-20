import { PieChart } from "@mui/x-charts/PieChart";
import { ExpenseType } from "../trips/[tripId]/page";
import { ExpenseIcon } from "./expenseIcon";
import { formatMoney } from "./singleExpense";

interface ExpensesDashboardProps {
  expenses: Array<ExpenseType>;
}

export function ExpensesDashboard({ expenses }: ExpensesDashboardProps) {
  const groupedData = Object.values(
    expenses.reduce((acc, expense) => {
      const categoryId = expense?.category?._id || "undefined";
      const categoryLabel = expense?.category?.name || "undefined";
      const categoryColor = expense?.category?.color || "#888888";
      const expenseCurrency = expense?.currency || { symbol: "" };

      if (!acc[categoryId] || acc[categoryId] === undefined) {
        acc[categoryId] = {
          id: categoryId,
          value: 0,
          label: categoryLabel,
          color: categoryColor,
          transactions: 0,
          currency: "",
        };
      }

      acc[categoryId].value += Number(expense.value);
      acc[categoryId].transactions += 1;
      acc[categoryId].currency = expenseCurrency.symbol;
      return acc;
    }, {} as Record<string, { id: string; value: number; label: string; color: string; transactions: number; currency: string }>)
  );

  const total = groupedData.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-2 gap-md-5">
      <div className="d-flex justify-content-center">
        <PieChart
          skipAnimation
          series={[
            {
              data: groupedData,
              innerRadius: 80,
              valueFormatter: (item) =>
                `${((item.value / total) * 100).toFixed(0)}%`,
            },
          ]}
          width={250}
          height={250}
        />
      </div>

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
              {formatMoney(category.value)} {category.currency}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
