import { JSX } from "react";
import IconText from "@/app/components/ui/icon-text";
import { ExpenseIcon } from "@/app/expenses/expenseIcon";
import { deleteExpense } from "../actions/deleteExpense";
import { CloseBtn } from "../components/ui/closeBtn";
import { ActionBtn } from "../components/ui/actionBtn";

interface ExpenseProps {
    // backward-compatible: either pass a single `expense` object
    expense?: {
        name: string;
        amount: number;
        currency: string;
        category?: any;
    };
    // or pass explicit fields
    description?: string;
    value?: string;
    currency?: string;
    category?: any;
}

export function Expense(props: ExpenseProps): JSX.Element {
    const { expense } = props;
    const description = expense ? expense.name : props.description || "";
    const value = expense ? String(expense.amount) : props.value || "";
    const currency = expense ? expense.currency : props.currency || "";
    const category = expense ? expense.category : props.category || { name: "Misc", color: "#909090" };
    return (
        <article className="expense">
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex gap-2 align-items-center">
                    <ExpenseIcon color={category.color} size="40px"/>
                    <div>
                        <p className="fw-bolder">{description}</p>
                        <IconText icon={"sell"} text={category.name} size={ 18 } color={ "#909090" }/>
                    </div>
                </div>
                    <p>{value} {currency}</p>
            </div>
        </article>
    )
}
