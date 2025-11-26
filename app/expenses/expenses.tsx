import { Currency } from "@/types/currency/types";
import { ExpenseType } from "../trips/[tripId]/page";
import { SingleExpense } from "./singleExpense";

interface ExpensesProps {
  tripCurrency: Currency | undefined;
  expenses: Array<ExpenseType>;
  currencies: Array<any>;
  categories: Array<any>;
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseType[]>>;
  onExpensesUpdated?: (expense: any) => void;
}

export function Expenses({
  tripCurrency,
  expenses,
  currencies,
  categories,
  setExpenses,
  onExpensesUpdated,
}: ExpensesProps) {
  return (
    <>
      {expenses.length === 0 ? (
        <p className="text-muted text-xs md:text-sm text-slate-500">
          No expenses added yet.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="row my-3">
            {expenses.map((expense) => (
              <div key={expense._id} className="col-12 col-sm-6 col-md-4 mb-3">
                <SingleExpense
                  {...expense}
                  id={expense._id}
                  tripCurrency={tripCurrency}
                  description={expense.description}
                  amount={expense.value}
                  currency={expense.currency}
                  category={expense.category}
                  currencies={currencies}
                  categories={categories}
                  onExpensesUpdated={onExpensesUpdated}
                  onDeleted={(id: string) =>
                    setExpenses((prev) => prev.filter((e) => e._id !== id))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
