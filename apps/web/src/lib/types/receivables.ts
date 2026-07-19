export interface Invoice {
  customer: string;
  amount: number;
  dueDate: string;
  status: string;
}

export interface ReceivablesData {
  invoices: Invoice[];
  totalOutstanding: number;
  totalOverdue: number;
  collectedThisMonth: number;
}
