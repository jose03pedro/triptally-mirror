import {Currency} from "@/types/currency/types";
import {ExpenseCategory} from "@/types/expensecategory/types";

export type ExpenseType = {
  _id: string;
  description: string;
  value: number;
  currency?: Currency;
  category?: ExpenseCategory;
};

export type ExpenseWithConverted = ExpenseType & {
  convertedValue: number;
};
