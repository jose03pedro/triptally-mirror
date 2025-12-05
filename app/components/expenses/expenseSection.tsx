import { AddExpense } from "@/app/components/trip/addExpense";
import ExpenseTabs from "@/app/components/expenses/expenseTabs";
import {Trip} from "@/types/trip/types";
import {TripSection} from "@/app/components/trip/tripSection";
import {ExpenseWithConverted} from "@/types/expense/types";
import {Currency} from "@/types/currency/types";
import {ExpenseCategory} from "@/types/expensecategory/types";
import React from "react";

interface ExpenseSectionProps {
    trip: Trip,
    expenses: Array<ExpenseWithConverted>;
    setExpenses: React.Dispatch<React.SetStateAction<ExpenseWithConverted[]>>;
    currencies: Currency[],
    categories: ExpenseCategory[]
}

export function ExpenseSection({ trip, expenses, setExpenses, currencies, categories }: ExpenseSectionProps) {
    return (
        <TripSection
            title="Expenses"
            count={expenses.length}
            action={
                <AddExpense
                    tripId={trip._id as string}
                    userId={trip.owner._id as string}
                    onExpenseCreated={(newExpense) => {
                        setExpenses((prev) =>
                            prev.some((e) => e._id === newExpense._id)
                                ? prev
                                : [...prev, newExpense]
                        );
                    }}
                />
            }
        >
            <ExpenseTabs
                tripCurrency={trip.currency}
                expenses={expenses}
                setExpenses={setExpenses}
                currencies={currencies}
                categories={categories}
                onExpensesUpdated={(updated) => {
                    setExpenses((prev) =>
                        prev.some((e) => e._id === updated._id)
                            ? prev.map((e) => (e._id === updated._id ? updated : e))
                            : [...prev, updated]
                    );
                }}
            />
        </TripSection>
    );
}
