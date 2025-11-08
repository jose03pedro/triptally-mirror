import {JSX} from "react";
import IconText from "@/app/components/ui/icon-text";
import {ExpenseIcon} from "@/app/expenses/expenseIcon";

interface ExpenseProps {
    description: string;
    value: string;
    currency: string;
    category: any;
}

export function Expense({ description, value, currency, category } : ExpenseProps): JSX.Element {
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