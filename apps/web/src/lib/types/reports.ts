export interface ReportSection {
  label: string;
  value: string;
  change: string;
}

export interface InvestorMetric {
  label: string;
  value: string;
}

export interface ReportsData {
  reportSections: ReportSection[];
  investorMetrics: InvestorMetric[];
}
