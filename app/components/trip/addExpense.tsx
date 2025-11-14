import IconText from "@/app/components/ui/icon-text";
import { CreateExpenseModal } from "@/app/components/trip/createExpenseModal";
import { useEffect, useState } from "react";

interface AddExpenseProps {
  tripId: string;
  onExpenseCreated?: (expense: any) => void;
}

export function AddExpense({ tripId, onExpenseCreated }: AddExpenseProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoriesRes = await fetch(`/api/expensecategories`);
        const currenciesRes = await fetch("/api/currencies");
        const categoriesData = await categoriesRes.json();
        const currenciesData = await currenciesRes.json();
        setCategories(categoriesData);
        setCurrencies(currenciesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <button
        className="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#createExpenseModal"
      >
        <IconText icon="add" text="New expense" color="#fff" />
      </button>
      <CreateExpenseModal
        tripId={tripId}
        categories={categories}
        currencies={currencies}
        onExpenseCreated={onExpenseCreated}
      />
    </>
  );
}
