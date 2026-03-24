import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const getColor = (val: number, isText=false) => {
    if (val >= 70) return isText ? 'text-emerald-500' : 'bg-emerald-500';
    if (val >= 40) return isText ? 'text-orange-500' : 'bg-orange-500';
    return isText ? 'text-rose-500' : 'bg-rose-500';
};

const getStatusIcon = (status: string) => {
    if (status === 'good') return '✅';
    if (status === 'warning') return '⚠️';
    return '❌';
}

const CircularGauge = ({ score, grade }: { score: number, grade: string }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-48 h-48 transform -rotate-90">
        <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/30" />
        <motion.circle 
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" 
          strokeDasharray={circumference}
          className={`${getColor(score, true)} stroke-current`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-extrabold text-foreground">{score}</span>
        <span className={`text-xl font-bold ${getColor(score, true)}`}>{grade}</span>
      </div>
    </div>
  );
};

const HealthScore = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/health-score', { method: 'POST' });
            if (res.status === 401) {
                localStorage.removeItem('bizsense_email');
                window.location.href = '/';
                return;
            }
            const json = await res.json();
            if (json.status === 'success') {
                setData(json.data);
            } else {
                toast.error(json.message);
            }
        } catch(e) {
            toast.error("Failed to generate health score.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHealth(); }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="relative flex items-center justify-center w-24 h-24">
                   <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30 animate-ping"></div>
                   <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
                   <span className="text-4xl absolute">🩺</span>
                </div>
                <h2 className="text-xl font-bold text-foreground animate-pulse mt-4">Diagnosing your business...</h2>
                <p className="text-muted-foreground text-sm">Our AI is securely crunching your financial trajectory.</p>
            </div>
        );
    }

    if (!data) return <div className="text-center py-20 text-muted-foreground font-medium">No valid health data generated. Please upload data first.</div>

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-foreground">Financial Health Report</h2>
                <button onClick={fetchHealth} className="px-4 py-2 border border-border hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <span>🔄</span> Regenerate Report
                </button>
            </div>

            <div className="glass rounded-xl p-8 flex flex-col items-center shadow-lg border-t border-primary/20">
                <CircularGauge score={data.overall_score} grade={data.grade} />
                <h3 className="mt-4 text-2xl font-bold text-foreground">Overall Business Health: {data.overall_score}/100</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.categories?.map((cat: any, i: number) => (
                    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.1 }} key={i} className="glass rounded-xl p-5 hover-lift">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-foreground">{cat.name}</span>
                            <span className="text-lg drop-shadow-md">{getStatusIcon(cat.status)}</span>
                        </div>
                        <div className="w-full bg-muted/50 rounded-full h-2.5 mb-2 overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${cat.score}%` }}
                                transition={{ duration: 1, delay: i*0.1 }}
                                className={`h-2.5 rounded-full ${getColor(cat.score, false)}`}
                            ></motion.div>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-semibold text-muted-foreground">Category Score</span>
                            <span className={`text-sm font-bold ${getColor(cat.score, true)}`}>{cat.score}</span>
                        </div>
                        <p className="text-xs text-foreground bg-muted/30 p-2 rounded-lg border border-border/50 italic leading-relaxed">
                            "{cat.insight}"
                        </p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass rounded-xl p-6 border border-destructive/20 bg-destructive/5 shadow-sm">
                    <h3 className="text-lg font-bold text-destructive mb-4 flex items-center gap-2">⚠️ Top Identified Risks</h3>
                    <ul className="space-y-3">
                        {data.top_risks?.map((r: string, i: number) => (
                            <li key={i} className="text-sm text-foreground flex items-start gap-3">
                                <span className="text-rose-500 font-bold bg-rose-500/10 p-1 px-1.5 rounded text-xs leading-none">R{i+1}</span>
                                <span>{r}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="glass rounded-xl p-6 border border-success/30 bg-success/5 shadow-sm">
                    <h3 className="text-lg font-bold text-success mb-4 flex items-center gap-2">🚀 Leverage Opportunities</h3>
                    <ul className="space-y-3">
                        {data.top_opportunities?.map((o: string, i: number) => (
                            <li key={i} className="text-sm text-foreground flex items-start gap-3">
                                <span className="text-emerald-500 font-bold bg-emerald-500/10 p-1 px-1.5 rounded text-xs leading-none">O{i+1}</span>
                                <span>{o}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-primary/20 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-primary mb-2 uppercase tracking-wider flex items-center gap-2">
                    <span>🧠</span> Executive AI Summary
                </h3>
                <p className="text-foreground leading-relaxed">{data.summary}</p>
            </div>
        </div>
    );
};
export default HealthScore;
