'use client'

import {Expense} from "@/app/expenses/expense";
import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import Link from "next/link";
import {Loading} from "@/app/components/ui/loading";
import {AddExpense} from "@/app/components/trip/addExpense";

export default function TripPage() {
    const params = useParams();
    const tripId = params?.tripId;

    const [trip, setTrip] = useState<any>(null);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!tripId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [tripRes, expensesRes] = await Promise.all([
                    fetch(`/api/trips/${tripId}`),
                    fetch(`/api/trips/${tripId}/expenses`)
                ]);
                const tripData = await tripRes.json();
                const expensesData = await expensesRes.json();

                setTrip(tripData);
                setExpenses(expensesData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tripId]);

    if (loading) {
        return (
            <Loading />
        );
    }

    if (!trip) {
        console.error("Trip not found.");
        return (
            <div className="container py-5">
                <p>Trip not found.</p>
                <Link href="/trips" className="btn btn-outline-secondary mt-3">Back to Trips</Link>
            </div>
        );
    }
    console.log(expenses);

    return (
        <div className="container py-5">
            <Link href="/trips" className="btn btn-link px-0 mb-3">← Back</Link>
            <h1 className="mb-3">{trip.title}</h1>

            <div className="mb-3">
                <strong>Dates:</strong>{" "}
                {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
            </div>

            <div className="mb-4">
                <strong>Destinations:</strong>{" "}
                {trip.cities?.map((c: {
                    name: string;
                    country?: string
                }) => `${c.name}, ${c.country}`).join(" · ") || "—"}
            </div>

            {/* Placeholders for future stories (expenses, itinerary, participants) */}
            <div className="alert alert-info">
                Trip details sections (Itinerary, Expenses, Participants) go here.
            </div>

            <section id="expensesContainer">
                <h2 className="fs-3">Expenses</h2>
                <AddExpense tripId={ tripId as string } />
                {expenses?.length === 0 ? (
                    <p>No expenses yet for this trip.</p>
                ) : (
                    expenses?.map((expense) => (
                        <Expense
                            key={expense._id} {...expense}
                            description={expense.description}
                            value={expense.value}
                            currency={expense?.currency}
                            category={expense?.category}
                        />
                    ))
                )}
            </section>


        </div>
    );
}

