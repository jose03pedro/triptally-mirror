import React from "react";
import { Expenses } from "./expenses";
import { ExpensesDashboard } from "./expensesDashboard";
import { ExpenseType } from "../trips/[tripId]/page";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

interface ExpenseTabsProps {
  expenses: Array<ExpenseType>;
  currencies: Array<any>;
  categories: Array<any>;
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseType[]>>;
  onExpensesUpdated?: (expense: any) => void;
}

export default function ExpenseTabs({
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
          expenses={expenses}
          setExpenses={setExpenses}
          currencies={currencies}
          categories={categories}
          onExpensesUpdated={onExpensesUpdated}
        />
      </TabPanel>
      <TabPanel value="2">
        <ExpensesDashboard expenses={expenses} />
      </TabPanel>
    </TabContext>
  );
}
