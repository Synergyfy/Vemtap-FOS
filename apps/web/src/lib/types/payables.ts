export interface PayablePayment {
  description: string;
  amount: number;
  dueDate: string;
  status: string;
  category: string;
}

export interface PayablesData {
  monthlySalary: number;
  totalBills: number;
  totalPayables: number;
  dueThisWeek: number;
  dueThisMonth: number;
  overdue: number;
  bills: PayablePayment[];
  paymentSchedule: PayablePayment[];
}
