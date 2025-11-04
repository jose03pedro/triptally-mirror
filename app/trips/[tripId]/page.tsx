'use client'

import {Expense} from "@/app/expenses/expense";
import {useParams} from "next/navigation";
import {useEffect, useState} from "react";

export default function TripPage() {
    const params = useParams<{ tripId: string }>();
    const tripId = params.tripId;

    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!tripId) return;

        const fetchExpenses = async () => {
            try {
                const response = await fetch(`/api/trips/${tripId}/expenses`);
                if (!response.ok) throw new Error(response.statusText);
                const data = await response.json();
                setExpenses(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchExpenses();
    })

    return (
        <>
            <section id="expensesContainer">
                {expenses?.length === 0 ? (
                    <p>No expenses yet for this trip.</p>
                ) : (
                    expenses?.map((expense) => (
                        <Expense
                            key={ expense._id } {...expense}
                            description={ expense.description }
                            value={ expense.value }
                            currency={ expense.currency }
                            category={ expense?.category }
                        />
                    ))
                )}
            </section>
        </>
    )
}
