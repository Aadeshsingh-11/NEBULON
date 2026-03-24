import { motion } from "framer-motion";
import { useBizSense } from "@/hooks/useBizSense";

const KPIGrid = () => {
  const { data } = useBizSense();

  if (!data || data.length === 0) return null;

  let totalRev = 0;
  let totalExp = 0;
  data.forEach((d: any) => { totalRev += d.revenue; totalExp += d.expenses; });
  const netProfit = totalRev - totalExp;

  const firstRev = data[0].revenue || 1;
  const lastRev = data[data.length - 1].revenue || 1;
  const growth = ((lastRev - firstRev) / firstRev) * 100;

  const kpis = [
    { title: "Total Revenue", value: `₹${totalRev.toLocaleString()}`, trend: "", positive: true, color: "hsl(187 86% 43%)" },
    { title: "Total Expenses", value: `₹${totalExp.toLocaleString()}`, trend: "", positive: false, color: "hsl(0 84% 60%)" },
    { title: "Net Profit", value: `₹${netProfit.toLocaleString()}`, trend: "", positive: true, color: "hsl(160 64% 40%)" },
    { title: "Growth", value: `${growth.toFixed(1)}%`, trend: growth >= 0 ? `↑ ${growth.toFixed(1)}%` : `↓ ${Math.abs(growth).toFixed(1)}%`, positive: growth >= 0, color: "hsl(258 60% 66%)" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="glass rounded-xl p-5 hover-lift cursor-default relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: kpi.color }} />
          <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
          <p className="text-2xl font-bold text-foreground mb-2">{kpi.value}</p>
          {kpi.trend && (
            <span className={kpi.positive ? "trend-pill-positive" : "trend-pill-negative"}>
              {kpi.trend}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
};
export default KPIGrid;
