import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  MessageSquare,
  Wallet,
  Activity,
  QrCode,
  Award,
  AlertTriangle,
  Building2,
  PiggyBank,
  Mail
} from "lucide-react";

const row1Stats = [
  { label: "Total MRR", value: "₦45,231,000", change: "+12.5%", icon: DollarSign, color: "text-blue-500", positive: true },
  { label: "Total Active Businesses", value: "1,250", change: "+5.2%", icon: Building2, color: "text-indigo-500", positive: true },
  { label: "Net Profit", value: "₦18,450,000", change: "+8.1%", icon: TrendingUp, color: "text-green-500", positive: true },
  { label: "SMS Revenue", value: "₦3,240,000", change: "-2.4%", icon: MessageSquare, color: "text-purple-500", positive: false },
  { label: "Email Revenue", value: "₦1,850,000", change: "+15.2%", icon: Mail, color: "text-amber-500", positive: true },
];

const row2Stats = [
  { label: "Vemtap Revenue", value: "₦35,100,000", change: "+10.2%", icon: Activity, color: "text-blue-400", positive: true },
  { label: "QRThrive Revenue", value: "₦6,891,000", sub: "($4,500)", change: "+15.3%", icon: QrCode, color: "text-indigo-400", positive: true },
  { label: "Total Commissions Paid", value: "₦4,230,000", change: "+5.1%", icon: Wallet, color: "text-orange-500", positive: false }, 
  { label: "Cash Balance", value: "₦124,500,000", change: "+2.4%", icon: PiggyBank, color: "text-emerald-500", positive: true },
];

const row3Stats = [
  { label: "Best Performing Agent", value: "Sarah Jenkins", sub: "₦12M Revenue", icon: Award, color: "text-amber-500" },
  { label: "Worst Performing Agent", value: "Mike Ross", sub: "₦0 Revenue", icon: AlertTriangle, color: "text-red-500" },
  { label: "Conversion Rate (QRThrive → Vemtap)", value: "12.4%", sub: "+1.2% this month", icon: TrendingUp, color: "text-green-500" },
  { label: "Churn Rate", value: "2.1%", sub: "-0.5% this month", icon: Users, color: "text-zinc-500" },
];

function StatCard({ stat }: { stat: any }) {
  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <stat.icon className={stat.color} />
        {stat.change && (
          <span className={`text-xs font-medium ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
            {stat.change}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-zinc-500 mb-1">{stat.label}</p>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</h3>
        {stat.sub && (
          <p className="text-xs text-zinc-400 mt-1">{stat.sub}</p>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="text-zinc-500">Welcome back, here's what's happening today.</p>
        </div>
        <button className="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          Download Report
        </button>
      </div>

      <div className="space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {row1Stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {row2Stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {row3Stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </div>
  );
}
