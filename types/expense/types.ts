export type ExpenseType = {
  _id: string;
  description: string;
  value: number;
  currency?: {
    _id: string;
    code: string;
    name: string;
    symbol: string;
  };
  category?: {
    _id: string;
    name: string;
    color: string;
  };
};

export type ExpenseWithConverted = ExpenseType & {
  convertedValue: number;
};
