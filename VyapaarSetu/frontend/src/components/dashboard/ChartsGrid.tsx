import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Brush } from 'recharts';
import { useBizSense } from "@/hooks/useBizSense";

const customTooltipStyle = {
  backgroundColor: "hsl(0, 0%, 100%)",
  border: "1px solid hsl(214, 32%, 91%)",
  borderRadius: "12px",
  color: "hsl(222, 47%, 11%)",
  fontSize: "12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
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
          <ComposedChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
            <XAxis dataKey="month" stroke="hsl(215, 16%, 47%)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(215, 16%, 47%)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={customTooltipStyle} cursor={{fill: 'hsl(210, 20%, 98%)'}} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="revenue" fill="hsl(230, 70%, 65%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="hsl(350, 80%, 75%)" radius={[4, 4, 0, 0]} />
              <Brush dataKey="month" height={25} stroke="hsl(230, 70%, 65%)" fill="hsl(214, 32%, 98%)" tickFormatter={() => ''} />
            </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="glass rounded-xl p-5 h-[350px]">
        <h3 className="text-sm font-semibold text-foreground mb-4">Net Profit Trend</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
            <XAxis dataKey="month" stroke="hsl(215, 16%, 47%)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(215, 16%, 47%)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={customTooltipStyle} />
              <Line type="monotone" dataKey="profit" stroke="hsl(150, 60%, 55%)" strokeWidth={3} dot={{ r: 4, fill: "hsl(150, 60%, 55%)" }} activeDot={{ r: 6 }} />
              <Brush dataKey="month" height={25} stroke="hsl(150, 60%, 55%)" fill="hsl(214, 32%, 98%)" tickFormatter={() => ''} />
            </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default ChartsGrid;
