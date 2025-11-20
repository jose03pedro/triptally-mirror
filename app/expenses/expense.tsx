import { JSX } from "react";
import IconText from "@/app/components/ui/icon-text";
import { ExpenseIcon } from "@/app/expenses/expenseIcon";
import { deleteExpense } from "../actions/deleteExpense";
import { CloseBtn } from "../components/ui/closeBtn";
import { ActionBtn } from "../components/ui/actionBtn";

interface ExpenseProps {
  id: string;
  description: string;
  amount: number;
  currency: any;
  category: any;
  onDeleted?: (id: string) => void;
}

export function formatMoney(amount: number) {
  console.log(amount);
  return amount.toFixed(2);
}

export function Expense({
  id,
  description,
  amount,
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

        {/* Right side: amount + delete button */}
        <div className="d-flex align-items-center gap-1">
          <p className="mb-0">
            {formatMoney(amount)} {currency?.symbol}
          </p>

          {/* Delete button – hidden until hover */}
          <span className="delete-expense-btn" onClick={onDelete}>
            <ActionBtn action="delete" />
          </span>
        </div>
      </div>
    </article>
  );
}
