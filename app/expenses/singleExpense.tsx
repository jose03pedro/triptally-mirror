import { JSX, useEffect, useState } from "react";
import IconText from "@/app/components/ui/icon-text";
import { ExpenseIcon } from "@/app/expenses/expenseIcon";
import { deleteExpense } from "../actions/expense/deleteExpense";
import { ActionBtn } from "../components/ui/actionBtn";
import { Portal } from "../components/ui/portal";
import { CreateExpenseModal } from "../components/trip/createExpenseModal";
import Expense from "../models/Expense";
import { Currency } from "@/types/currency/types";

interface ExpenseProps {
  id: string;
  tripCurrency: Currency | undefined;
  description: string;
  amount: number;
  currency: any;
  category: any;
  categories: any[];
  currencies: Currency[];
  onDeleted?: (id: string) => void;
  onExpensesUpdated?: (expense: any) => void;
}

export function formatMoney(amount: number) {
  return amount.toFixed(2);
}

export async function convertMoney(
  amount: number,
  fromCurrency: string,
  toCurrency: string | undefined
) {
  if (!toCurrency) return null;

  try {
    const res = await fetch(
      `/api/currencies/exchange-rates?toCurrency=${toCurrency}&fromCurrency=${fromCurrency}`
    );
    const data = await res.json();
    const rate = data.data[toCurrency];
    if (!rate) return null;

    const converted = amount * rate;
    return formatMoney(converted);
  } catch (err) {
    console.error("Error getting conversion:", err);
    return null;
  }

  return formatMoney(amount);
}

export function SingleExpense({
  id,
  tripCurrency,
  description,
  amount,
  currency,
  category,
  categories,
  currencies,
  onDeleted,
  onExpensesUpdated,
}: ExpenseProps): JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversion() {
      if (
        tripCurrency?.code &&
        currency.code &&
        tripCurrency.code !== currency.code
      ) {
        const converted = await convertMoney(
          amount,
          currency.code,
          tripCurrency.code
        );
        setConvertedAmount(converted);
      } else {
        setConvertedAmount(null);
      }
    }
    fetchConversion();
  }, [amount, currency.code, tripCurrency?.code]);

  const onDelete = async () => {
    const response = await deleteExpense(id);
    response.success && onDeleted && onDeleted(id);
  };

  const displayAmount = () => {
    if (tripCurrency?.code !== currency?.code) {
      return (
        <>
          <p className="mb-0 text-end">
            {convertedAmount ?? "…"} {tripCurrency?.symbol}
          </p>
          <p
            className="mb-0 text-muted"
            style={{ fontSize: "0.8rem", textAlign: "right" }}
          >
            {formatMoney(amount)} {currency?.symbol}
          </p>
        </>
      );
    }

    return (
      <p className="mb-0 text-end">
        {formatMoney(amount)} {currency?.symbol}
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
            expenseId={id}
            onExpensesUpdated={onExpensesUpdated}
          />
        </Portal>
      }

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
            <div>{displayAmount()}</div>
            <div className="expense-actions d-flex gap-0">
              <span
                className="expense-btn"
                data-bs-toggle="modal"
                data-bs-target={`#createExpense-${id}Modal`}
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
