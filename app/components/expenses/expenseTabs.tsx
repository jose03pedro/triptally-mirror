import React from "react";
import { Expenses } from "./expenses";
import { ExpensesDashboard } from "./expensesDashboard";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Currency } from "@/types/currency/types";
import { ExpenseType, ExpenseWithConverted } from "@/types/expense/types";
import {ExpenseCategory} from "@/types/expensecategory/types";
import {User} from "@/types/user/types";

interface ExpenseTabsProps {
  tripCurrency: Currency | undefined;
  tripOwner: User | undefined;
  expenses: Array<ExpenseWithConverted>;
  currencies: Currency[];
  categories: ExpenseCategory[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseWithConverted[]>>;
  onExpensesUpdated?: (expense: ExpenseWithConverted) => void;
}

export default function ExpenseTabs({
  tripCurrency,
  tripOwner,
  expenses,
  currencies,
  categories,
  setExpenses,
  onExpensesUpdated,
}: ExpenseTabsProps) {
  const [value, setValue] = React.useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <TabContext value={value}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <TabList onChange={handleChange} aria-label="expense navigation tabs">
          <Tab label="Expenses" value="1" />
          <Tab label="Spending Overview" value="2" />
        </TabList>
      </Box>
      <TabPanel value="1">
        <Expenses
          tripCurrency={tripCurrency}
          tripOwner={tripOwner}
          expenses={expenses}
          setExpenses={setExpenses}
          currencies={currencies}
          categories={categories}
          onExpensesUpdated={onExpensesUpdated}
        />
      </TabPanel>
      <TabPanel value="2">
        <ExpensesDashboard tripCurrency={tripCurrency} expenses={expenses} />
      </TabPanel>
    </TabContext>
  );
}
