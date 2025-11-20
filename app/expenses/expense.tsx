import { JSX } from "react";
import IconText from "@/app/components/ui/icon-text";
import { ExpenseIcon } from "@/app/expenses/expenseIcon";
import { deleteExpense } from "../actions/deleteExpense";

interface ExpenseProps {
  id: string;
  description: string;
  value: string;
  currency: any;
  category: any;
  onDeleted?: (id: string) => void;
}

export function Expense({
  id,
  description,
  value,
  currency,
  category,
  onDeleted,
}: ExpenseProps): JSX.Element {
  const onDelete = async () => {
    const response = await deleteExpense(id);
    response.success && onDeleted && onDeleted(id);
  };

  return (
    <article className="expense w-100 position-relative">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex gap-2 align-items-center">
          <ExpenseIcon color={category.color} size="40px" />
          <div>
            <p className="fw-bolder mb-0">{description}</p>
            <IconText
              icon={"sell"}
              text={category.name}
              size={18}
              color={"#909090"}
            />
          </div>
        </div>

        {/* Right side: value + delete button */}
        <div className="d-flex align-items-center gap-2">
          <p className="mb-0">
            {value} {currency.symbol}
          </p>

          {/* Delete button – hidden until hover */}
          <button className="delete-expense-btn btn btn-sm" onClick={onDelete}>
            🗑️
          </button>
        </div>
      </div>
    </article>
  );
}
