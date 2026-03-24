import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useBizSense } from "@/hooks/useBizSense";

const customTooltipStyle = {
  backgroundColor: "hsl(217, 53%, 11%)",
  border: "1px solid hsl(215, 25%, 27%)",
  borderRadius: "8px",
  color: "hsl(213, 31%, 95%)",
  fontSize: "12px",
};

const ChartsGrid = () => {
  const { data, forecastResult } = useBizSense();

  if (!data || data.length === 0) return null;

  const barData = data.map((d: any) => ({ month: d.month, revenue: d.revenue, expenses: d.expenses }));
  const lineData = data.map((d: any) => ({ month: d.month, profit: d.revenue - d.expenses }));

  if (forecastResult && forecastResult.forecast) {
    forecastResult.forecast.forEach((f: any) => {
      barData.push({ month: `${f.month} (F)`, revenue: f.revenue, expenses: f.expenses });
      lineData.push({ month: `${f.month} (F)`, profit: f.revenue - f.expenses });
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <div className="glass rounded-xl p-5 h-[350px]">
        <h3 className="text-sm font-semibold text-foreground mb-4">Revenue vs Expenses</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 25%, 20%)" />
            <XAxis dataKey="month" stroke="hsl(215, 20%, 50%)" fontSize={12} />
            <YAxis stroke="hsl(215, 20%, 50%)" fontSize={12} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="revenue" fill="hsl(187, 86%, 43%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="hsl(258, 60%, 66%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass rounded-xl p-5 h-[350px]">
        <h3 className="text-sm font-semibold text-foreground mb-4">Net Profit Trend</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 25%, 20%)" />
            <XAxis dataKey="month" stroke="hsl(215, 20%, 50%)" fontSize={12} />
            <YAxis stroke="hsl(215, 20%, 50%)" fontSize={12} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Line type="monotone" dataKey="profit" stroke="hsl(160, 64%, 50%)" strokeWidth={2} dot={{ fill: "hsl(160, 64%, 50%)", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default ChartsGrid;
