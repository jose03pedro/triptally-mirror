import { JSX, useEffect, useState } from "react";
import IconText from "@/app/components/ui/icon-text";
import { ExpenseIcon } from "@/app/expenses/expenseIcon";
import { deleteExpense } from "../actions/expense/deleteExpense";
import { ActionBtn } from "../components/ui/actionBtn";
import { Portal } from "../components/ui/portal";
import { CreateExpenseModal } from "../components/trip/createExpenseModal";
import { Currency } from "@/types/currency/types";
import { formatMoney } from "@/lib/utils/helperFunctions";
import { ExpenseWithConverted } from "@/types/expense/types";

interface ExpenseProps {
  expense: ExpenseWithConverted;
  tripCurrency: Currency | undefined;
  categories: any[];
  currencies: Currency[];
  onDeleted?: (id: string) => void;
  onExpensesUpdated?: (expense: any) => void;
}

export function SingleExpense({
  expense,
  tripCurrency,
  currencies,
  categories,
  onDeleted,
  onExpensesUpdated,
}: ExpenseProps): JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null);

  const onDelete = async () => {
    const response = await deleteExpense(expense._id);
    response.success && onDeleted && onDeleted(expense._id);
  };

  const displayAmount = () => {
    if (tripCurrency?.code !== expense.currency?.code) {
      return (
        <>
          <p className="mb-0 text-end">
            {formatMoney(expense.convertedValue) ?? "…"} {tripCurrency?.symbol}
          </p>
          <p
            className="mb-0 text-muted"
            style={{ fontSize: "0.8rem", textAlign: "right" }}
          >
            {formatMoney(expense.value)} {expense.currency?.symbol}
          </p>
        </>
      );
    }

    return (
      <p className="mb-0 text-end">
        {formatMoney(expense.value)} {expense.currency?.symbol}
      </p>
    );
  };

  return (
    <>
      {
        <Portal>
          <CreateExpenseModal
            currencies={currencies}
            categories={categories}
            expenseId={expense._id}
            onExpensesUpdated={onExpensesUpdated}
          />
        </Portal>
      }

      <article className="expense w-100 position-relative">
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div className="d-flex gap-2 align-items-center flex-grow-1 min-width-0">
            <ExpenseIcon color={expense.category?.color} size="40px" />
            <div className="text-truncate" style={{ minWidth: 0 }}>
              <p className="fw-bolder mb-0">{expense.description}</p>
              <IconText
                icon={"sell"}
                text={expense.category?.name as string}
                size={18}
                color={"#909090"}
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-1 mt-2 mt-md-0">
            <div>{displayAmount()}</div>
            <div className="expense-actions d-flex gap-0">
              <span
                className="expense-btn"
                data-bs-toggle="modal"
                data-bs-target={`#createExpense-${expense._id}Modal`}
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
