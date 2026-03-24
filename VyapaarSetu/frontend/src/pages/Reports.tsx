import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const formatINR = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const generateReport = async () => {
    setLoading(true);
    toast.info("Analyzing financials with Groq LPUs...");
    try {
      const res = await fetch("/api/generate-report");
      const json = await res.json();
      if (json.status === "success") {
        setReportData(json.data);
        toast.success("CA Report Generated Successfully");
      } else {
        toast.error(json.message || "Failed to generate report");
      }
    } catch (err) {
      toast.error("Network error while communicating with VyapaarSetu backend");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  const gstData = [
    { period: "Mar 2026", type: "GSTR-3B", status: "Pending", due: "20-Apr-2026", filed: "-" },
    { period: "Feb 2026", type: "GSTR-3B", status: "Filed", due: "20-Mar-2026", filed: "18-Mar-2026" },
    { period: "Feb 2026", type: "GSTR-1", status: "Filed", due: "11-Mar-2026", filed: "10-Mar-2026" },
    { period: "Jan 2026", type: "GSTR-3B", status: "Filed", due: "20-Feb-2026", filed: "19-Feb-2026" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Playful background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-400/20 rounded-full blur-3xl mix-blend-multiply" />
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-3xl mix-blend-multiply" />
      </div>

      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Business Report Generator</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">AI-powered financial summary in CA-style language</p>
        </div>

        <div className="flex items-center gap-4">
          <select className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-100 outline-none font-medium">
            <option>Last 6 Months</option>
            <option>Q1 2026</option>
            <option>FY 2025-26</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateReport}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-pink-500/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
            )}
            {loading ? "Analyzing..." : "Generate Report"}
          </motion.button>
        </div>
      </div>

      {/* Main Report Area */}
      {reportData && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* 1. Executive Summary */}
          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Executive Summary
            </h2>
            <p className="text-slate-800 text-lg leading-relaxed font-serif">
              "{reportData.executive_summary}"
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 2. Revenue vs Expense */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white flex flex-col">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Financial Overview</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div>
                  <p className="text-xs text-slate-500 mb-1 font-medium">Total Revenue</p>
                  <p className="text-xl font-bold text-slate-800 flex items-center gap-1">
                     {formatINR(reportData.total_revenue || 0)} <span className="text-emerald-500 text-sm">↑</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 font-medium">Total Expense</p>
                  <p className="text-xl font-bold text-slate-800 flex items-center gap-1">
                    {formatINR(reportData.total_expenses || 0)} <span className="text-rose-500 text-sm">↓</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 font-medium">Net Profit</p>
                  <p className={`text-xl font-bold ${reportData.net_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatINR(reportData.net_profit || 0)}
                  </p>
                </div>
              </div>

              <div className="flex-1 min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.chart_data || []}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <RechartsTooltip cursor={{fill: 'rgba(236, 72, 153, 0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="revenue" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* 3. Top Categories */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Top Spending Categories</h2>
              <div className="space-y-5">
                {(reportData.top_categories || []).map((cat: any, idx: number) => {
                  const colors = ["bg-rose-500", "bg-orange-400", "bg-yellow-400", "bg-blue-400", "bg-emerald-400"];
                  const color = colors[Math.min(idx, colors.length - 1)];
                  
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-semibold text-slate-700">{cat.name || 'Unknown'}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-800 block">{formatINR(cat.amount || 0)}</span>
                          <span className="text-xs text-slate-400 font-medium">{cat.percentage || 0}% of total</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <motion.div 
                          className={`h-2 rounded-full ${color}`} 
                          initial={{ width: 0 }} 
                          animate={{ width: `${cat.percentage || 0}%` }} 
                          transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 4. Cash Flow Health */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white col-span-1">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex justify-between">
                Cash Flow Health
                <span className="text-indigo-500">Ai Graded</span>
              </h2>
              
              <div className="flex flex-col items-center justify-center py-4">
                <div className={`w-28 h-28 rounded-full border-[6px] flex items-center justify-center mb-4 ${
                  (reportData.health_score || 0) > 70 ? 'border-emerald-400 bg-emerald-50 text-emerald-600' :
                  (reportData.health_score || 0) > 40 ? 'border-amber-400 bg-amber-50 text-amber-600' :
                  'border-rose-400 bg-rose-50 text-rose-600'
                }`}>
                  <span className="text-4xl font-extrabold">{reportData.health_score || 0}</span>
                </div>
                <p className="text-center text-sm text-slate-600 italic px-2">
                  "{reportData.cash_flow_verdict || 'Processing cash flow metrics...'}"
                </p>
              </div>

              <div className="mt-4 space-y-3 pt-4 border-t border-slate-100">
                {Object.entries(reportData.cash_flow_metrics || {}).map(([k, v]: [string, any]) => (
                  <div key={k} className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">{k} CFO</span>
                    <span className={`font-semibold ${v >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{v >= 0 ? '+' : ''}{formatINR(v)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 5. GST Status */}
            <motion.div variants={itemVariants} className="bg-amber-50/50 backdrop-blur-md rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.1)] p-8 border border-amber-100 lg:col-span-2">
              <h2 className="text-sm font-bold text-amber-600/70 uppercase tracking-widest mb-6">GST Compliance Status</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-amber-200/50">
                      <th className="pb-3 font-medium">Period</th>
                      <th className="pb-3 font-medium">Return Type</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Filed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gstData.map((row, i) => (
                      <tr key={i} className="border-b border-amber-100/50 last:border-0 text-slate-700">
                        <td className="py-4 font-semibold">{row.period}</td>
                        <td className="py-4">
                          <span className="bg-white px-2.5 py-1 rounded-md border border-amber-200 text-xs font-bold text-amber-700">{row.type}</span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            row.status === 'Filed' ? 'bg-emerald-100 text-emerald-700' : 
                            row.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-4 text-right text-slate-500">{row.filed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Bottom Export */}
          <motion.div variants={itemVariants} className="flex gap-4 justify-end pt-4">
            <button className="px-6 py-2.5 rounded-full bg-white text-slate-600 font-semibold shadow-sm hover:shadow-md border border-slate-200 transition-all flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
               Download PDF
            </button>
            <button className="px-6 py-2.5 rounded-full bg-slate-800 text-white font-semibold shadow-sm hover:bg-slate-700 transition-all flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
               Share Report
            </button>
          </motion.div>

        </motion.div>
      )}
    </div>
  );
}
