export interface Expense {
  id: string;
  category: string;
  amount: number;
  frequency: string;
  date: string;
  createdAt: string;
}

export interface ExpensesResponse {
  expenses: Expense[];
  total: number;
}
