import FormModal from "@/app/components/ui/formModal";
import { useActionState, useEffect, useMemo, useState } from "react";
import { createExpense } from "@/app/actions/createExpense";
import { Loading } from "@/app/components/ui/loading";
import FieldErrors from "@/app/components/ui/fieldErrors";

declare const bootstrap: any;

interface CreateExpenseModalProps {
  tripId: string;
  categories: any[];
  currencies: any[];
  onExpenseCreated?: (expense: any) => void; // new prop
}

export function CreateExpenseModal({
  tripId,
  categories,
  currencies,
  onExpenseCreated,
}: CreateExpenseModalProps) {
  const initialState = {
    success: false,
    expense: null,
    errors: {
      category: [],
      currency: [],
      date: [],
      description: [],
      value: [],
      form: [],
    },
  };
  const initialFormValues = useMemo(
    () => ({
      category: "",
      description: "",
      value: "",
      date: "",
      currency: "",
    }),
    []
  );

  const [state, action, isPending] = useActionState(
    createExpense,
    initialState
  );
  const [formValues, setFormValues] = useState(initialFormValues);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const formId = "createExpense";

  useEffect(() => {
    if (state.success) {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById(formId + "Modal")
      );
      modal?.hide();

      setFormValues(initialFormValues);

      if (state.expense && onExpenseCreated) {
        onExpenseCreated(state.expense); // Add the new expense to UI
      }
    }
  }, [
    state.success,
    initialFormValues,
    formId,
    state.expense,
    onExpenseCreated,
  ]);

  return (
    <FormModal
      id={formId}
      title="Add new expense"
      action={action}
      isPending={isPending}
    >
      <input
        type="hidden"
        name="tripId"
        value={tripId}
        className={`${state?.errors?.form?.length ? "is-invalid" : ""}`}
      />

      <div className="mb-2">
        <label htmlFor="category" className="form-label text-secondary mb-0">
          Category
        </label>

        <select
          id="category"
          name="category"
          className={`form-select fs-6 ${
            state?.errors?.category?.length ? "is-invalid" : ""
          }`}
          onChange={handleChange}
          value={formValues.category}
        >
          <option value="">Select a category...</option>
          {categories.map((category: any) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <FieldErrors errors={state?.errors?.category} />
      </div>

      <div className="mb-2">
        <label htmlFor="description" className="form-label text-secondary mb-0">
          Write a description...
        </label>
        <input
          id="description"
          name="description"
          type="text"
          className={`form-control fs-6 ${
            state?.errors?.description?.length ? "is-invalid" : ""
          }`}
          onChange={handleChange}
          value={formValues.description}
        />
        <FieldErrors errors={state?.errors?.description} />
      </div>

      <div className="mb-2">
        <label htmlFor="value" className="form-label text-secondary mb-0">
          Value
        </label>
        <input
          id="value"
          name="value"
          type="value"
          className={`form-control fs-6 ${
            state?.errors?.value?.length ? "is-invalid" : ""
          }`}
          onChange={handleChange}
          value={formValues.value}
        />
        <FieldErrors errors={state?.errors?.value} />
      </div>

      <div className="mb-2">
        <label htmlFor="currency" className="form-label text-secondary mb-0">
          Currency
        </label>

        <select
          id="currency"
          name="currency"
          className={`form-control fs-6 ${
            state?.errors?.currency?.length ? "is-invalid" : ""
          }`}
          onChange={handleChange}
          value={formValues.currency}
        >
          <option value="">Select a currency...</option>
          {currencies.map((currency: any) => (
            <option key={currency._id} value={currency._id}>
              {currency.symbol}
            </option>
          ))}
        </select>
        <FieldErrors errors={state?.errors?.currency} />
      </div>

      <div className="mb-2">
        <label htmlFor="date" className="form-label text-secondary mb-0">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          className={`form-control fs-6 ${
            state?.errors?.date?.length ? "is-invalid" : ""
          }`}
          onChange={handleChange}
          value={formValues.date}
        />
        <FieldErrors errors={state?.errors?.date} />
      </div>

      <FieldErrors errors={state?.errors?.form} />
    </FormModal>
  );
}
