export type ItemType = "revenue" | "expense";

export type Operator = "+" | "-" | "×" | "÷";

export interface ItemComponent {
  id: string;
  name: string;
  value: number;
  isPercent: boolean;
  operator: Operator;
}

export interface ScenarioItem {
  id: string;
  name: string;
  components: ItemComponent[];
  type: ItemType;
  itemPeriod: number | null;
  growthRate: number;
}

export interface SimpleScenario {
  id: string;
  name: string;
  period: number;
  items: ScenarioItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ItemBreakdown {
  month: number;
  amount: number;
}

export interface ItemResult {
  id: string;
  name: string;
  monthlyAmount: number;
  totalAmount: number;
  type: ItemType;
  breakdown: ItemBreakdown[];
}

export interface ScenarioResult {
  totalRevenue: number;
  totalExpenses: number;
  net: number;
  itemResults: ItemResult[];
}

export interface ScenarioTemplate {
  name: string;
  description: string;
  items: (Omit<ScenarioItem, "id" | "components"> & { components: Omit<ItemComponent, "id">[] })[];
}
