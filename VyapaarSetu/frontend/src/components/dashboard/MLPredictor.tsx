import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Brush } from "recharts";
import { toast } from "sonner";
import { motion } from "framer-motion";

const MLPredictor = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            setUploading(true);
            toast.info("Uploading Daily ML Data...", { id: 'ml-upload' });
            const res = await fetch('/api/upload-daily', {
                method: 'POST',
                body: formData
            });
            if (res.status === 401) {
                localStorage.removeItem('bizsense_email');
                window.location.href = '/';
                return;
            }
            const json = await res.json();
            if (json.status === 'success') {
                toast.success("Daily ML Data completely synced with Scikit-Learn Engine!", { id: 'ml-upload' });
                if (fileInputRef.current) fileInputRef.current.value = "";
                await fetchData();
            } else {
                toast.error(json.message, { id: 'ml-upload' });
            }
        } catch(e) {
            toast.error("Upload failed.", { id: 'ml-upload' });
        } finally {
            setUploading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ml-predict');
            if (res.status === 401) {
                localStorage.removeItem('bizsense_email');
                window.location.href = '/';
                return;
            }
            const json = await res.json();
            if (json.status === 'success') {
                setData([...json.historical, ...json.predictions]);
            } else {
                toast.error(json.message);
            }
        } catch (e) {
            toast.error("Failed to execute ML models.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="relative flex items-center justify-center w-24 h-24">
                   <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-pulse"></div>
                   <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                   <span className="text-4xl absolute">🤖</span>
                </div>
                <h2 className="text-xl font-bold text-foreground animate-pulse mt-4">Training Local Scikit-Learn Models...</h2>
                <p className="text-muted-foreground text-sm">Crunching dense transactional datasets via Ridge Regression.</p>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="max-w-2xl mx-auto py-20">
                <div className="glass rounded-xl p-10 text-center shadow-sm">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🤖</div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">Initialize Machine Learning Engine</h2>
                    <p className="text-muted-foreground mb-8">
                        The Neural Forecaster requires a dense, daily transactional dataset. Upload a CSV containing at least 7 days of history to activate the Ridge Regression mathematical models.
                    </p>
                    
                    <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full py-4 border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 rounded-xl text-primary font-bold transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <span className="text-xl">📈</span>
                        {uploading ? "Training Model..." : "Upload Daily CSV (date, revenue, expenses)"}
                    </button>
                    
                    <p className="text-xs text-muted-foreground mt-4">Required columns exactly: date, revenue, expenses</p>
                </div>
            </div>
        );
    }

    const futureStart = data.find(d => d.isFuture)?.date;
    const finalProjection = data[data.length - 1];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-foreground">Scikit-Learn Machine Learning Forecaster</h2>
                <div className="flex gap-3">
                    <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <span>📁</span> Replace Dataset
                    </button>
                    <button onClick={fetchData} className="px-4 py-2 border border-border hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <span>🔄</span> Run Model Engine
                    </button>
                </div>
            </div>

            <div className="glass rounded-xl p-8 shadow-sm">
                <h3 className="text-sm font-bold text-muted-foreground mb-6 uppercase tracking-wider flex items-center gap-2">
                    <span>📈</span> 30-Day Algorithmic Trajectory
                </h3>
                <div className="h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                            <XAxis dataKey="date" stroke="hsl(215, 16%, 47%)" fontSize={12} minTickGap={40} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(215, 16%, 47%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                            <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid hsl(214, 32%, 91%)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }} />
                            <Legend wrapperStyle={{ paddingTop: "20px" }} />
                            
                            {futureStart && (
                                <ReferenceLine x={futureStart} stroke="hsl(215, 16%, 47%)" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'AI Prediction Horizon', fill: 'hsl(215, 16%, 47%)', fontSize: 12, fontWeight: 'bold' }} />
                            )}
                            
                            <Line type="monotone" dataKey="revenue" stroke="hsl(230, 70%, 65%)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Revenue" />
                            <Line type="monotone" dataKey="expenses" stroke="hsl(350, 80%, 75%)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Expenses" />
                            <Brush dataKey="date" height={30} stroke="hsl(230, 70%, 65%)" fill="hsl(214, 32%, 98%)" tickFormatter={() => ''} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6 border-l-4 border-primary shadow-sm hover-lift">
                    <p className="text-sm text-primary font-bold mb-1 uppercase tracking-wider">Day 30 Revenue Projection</p>
                    <p className="text-3xl font-extrabold text-foreground ml-1">₹{finalProjection?.revenue?.toLocaleString('en-IN')}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6 border-l-4 border-destructive shadow-sm hover-lift">
                    <p className="text-sm text-destructive font-bold mb-1 uppercase tracking-wider">Day 30 Expense Projection</p>
                    <p className="text-3xl font-extrabold text-foreground ml-1">₹{finalProjection?.expenses?.toLocaleString('en-IN')}</p>
                </motion.div>
            </div>
            
            <div className="glass rounded-xl p-6 shadow-sm border border-success/20 bg-success/5">
                <h3 className="font-bold text-success mb-2 flex items-center gap-2"><span>🛡️</span> Model Information</h3>
                <p className="text-sm text-foreground/80 leading-relaxed">
                    This projection is generated strictly mathematically using <strong>Python Scikit-Learn (Ridge Regression)</strong> across your dense historical datasets. Unlike conversational LLMs which guess context, this model explicitly penalizes large numerical tracking coefficients on past multidimensional transactional trajectories to output highly stabilized 30-day chronological limits.
                </p>
            </div>
        </div>
    );
};

export default MLPredictor;
