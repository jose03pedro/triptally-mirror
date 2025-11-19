import IconText from "@/app/components/ui/icon-text";
import { CreateExpenseModal } from "@/app/components/trip/createExpenseModal";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hook/useAuth";
import { set } from "mongoose";

interface AddExpenseProps {
  tripId: string;
  userId: string;
  onExpenseCreated?: (expense: any) => void;
}

export function AddExpense({
  tripId,
  userId,
  onExpenseCreated,
}: AddExpenseProps) {
  const session = useAuth();
  const loggedUser = session?.user;

  const [categories, setCategories] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedUser) {
      setLoading(false);
      return;
    }

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

  console.log({ loggedUser, userId, loading });

  if (!loggedUser || loggedUser.id !== userId || loading) {
    return null;
  }

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
