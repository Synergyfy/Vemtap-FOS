import type { SimpleScenario, ScenarioResult, ItemResult, ItemComponent } from "./types";

export function computeComponents(components: ItemComponent[]): number {
  if (components.length === 0) return 0;
  
  let total = components[0].isPercent ? components[0].value / 100 : components[0].value;
  
  for (let i = 1; i < components.length; i++) {
    const c = components[i];
    let v = c.value;
    
    if (c.isPercent) {
      if (c.operator === "+" || c.operator === "-") {
        v = total * (c.value / 100);
      } else {
        v = c.value / 100;
      }
    }
    
    switch (c.operator) {
      case "+": total += v; break;
      case "-": total -= v; break;
      case "×": total *= v; break;
      case "÷": total = v !== 0 ? total / v : 0; break;
    }
  }
  
  return total;
}

export function projectScenario(scenario: SimpleScenario): ScenarioResult {
  const itemResults: ItemResult[] = [];
  let totalRevenue = 0;
  let totalExpenses = 0;

  for (const item of scenario.items) {
    const period = item.itemPeriod ?? scenario.period;
    const baseMonthly = computeComponents(item.components);

    let itemTotal = 0;
    const breakdown: { month: number; amount: number }[] = [];

    if (item.growthRate !== 0) {
      for (let m = 1; m <= period; m++) {
        const amount = baseMonthly * Math.pow(1 + item.growthRate / 100, m - 1);
        const rounded = Math.round(amount);
        itemTotal += rounded;
        breakdown.push({ month: m, amount: rounded });
      }
    } else {
      const rounded = Math.round(baseMonthly);
      itemTotal = rounded * period;
    }

    itemResults.push({
      id: item.id,
      name: item.name,
      monthlyAmount: Math.round(baseMonthly),
      totalAmount: Math.round(itemTotal),
      type: item.type,
      breakdown,
    });

    if (item.type === "revenue") totalRevenue += itemTotal;
    else totalExpenses += itemTotal;
  }

  totalRevenue = Math.round(totalRevenue);
  totalExpenses = Math.round(totalExpenses);

  return { totalRevenue, totalExpenses, net: totalRevenue - totalExpenses, itemResults };
}
