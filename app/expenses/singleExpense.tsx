import { JSX } from "react";
import IconText from "@/app/components/ui/icon-text";
import { ExpenseIcon } from "@/app/expenses/expenseIcon";
import { deleteExpense } from "../actions/deleteExpense";
import { ActionBtn } from "../components/ui/actionBtn";
import { Portal } from "../components/ui/portal";
import { CreateExpenseModal } from "../components/trip/createExpenseModal";
import Expense from "../models/Expense";

interface ExpenseProps {
  id: string;
  description: string;
  amount: number;
  currency: any;
  category: any;
  onDeleted?: (id: string) => void;
}

export function formatMoney(amount: number) {
  return amount.toFixed(2);
}

export function SingleExpense({
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
    <>
      <article className="expense w-100 position-relative">
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div className="d-flex gap-2 align-items-center flex-grow-1 min-width-0">
            <ExpenseIcon color={category.color} size="40px" />
            <div className="text-truncate" style={{ minWidth: 0 }}>
              <p className="fw-bolder mb-0">{description}</p>
              <IconText
                icon={"sell"}
                text={category.name}
                size={18}
                color={"#909090"}
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-1 mt-2 mt-md-0">
            <p className="mb-0">
              {formatMoney(amount)} {currency?.symbol}
            </p>
            <div className="expense-actions d-flex gap-0">
              <span
                className="expense-btn"
                data-bs-toggle="modal"
                data-bs-target="#createExpenseModal"
              >
                <ActionBtn action="edit" size={15} color="#909090" />
              </span>
              <span className="expense-btn" onClick={onDelete}>
                <ActionBtn action="delete" size={15} color="#909090" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
