import { ExpenseType } from "../trips/[tripId]/page";
import { SingleExpense } from "./singleExpense";

interface ExpensesProps {
  expenses: Array<ExpenseType>;
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseType[]>>;
}

export function Expenses({ expenses, setExpenses }: ExpensesProps) {
  return (
    <>
      {expenses.length === 0 ? (
        <p className="text-xs md:text-sm text-slate-500">
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
                  description={expense.description}
                  amount={expense.value}
                  currency={expense.currency}
                  category={expense.category}
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
