import { useState, useRef } from "react";
import { useBizSense } from "@/hooks/useBizSense";
import { toast } from "sonner";

const DataInput = ({ setActiveTab }: { setActiveTab?: (t: string) => void }) => {
  const { data, refetchData } = useBizSense();
  const [fileName, setFileName] = useState(localStorage.getItem('bizsense_last_file') || 'Active_Workspace_Dataset.csv');
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [revenueAmt, setRevenueAmt] = useState("");
  const [expenseAmt, setExpenseAmt] = useState("");
  const [category, setCategory] = useState("");
  const [month, setMonth] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mlFileInputRef = useRef<HTMLInputElement>(null);

  const handleMLFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
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
            toast.success("Daily ML Data successfully synced with Scikit-Learn Engine!", { id: 'ml-upload' });
            if (mlFileInputRef.current) mlFileInputRef.current.value = "";
            if (setActiveTab) setActiveTab('mlpredictor');
        } else {
            toast.error(json.message, { id: 'ml-upload' });
        }
    } catch(e) {
        toast.error("Upload failed.", { id: 'ml-upload' });
    }
  };

  const handleManualEntry = async () => {
    if ((!revenueAmt && !expenseAmt) || !month) return toast.error("Month and at least one amount are required");
    
    const payload = {
        month,
        revenue: parseFloat(revenueAmt || "0"),
        expenses: parseFloat(expenseAmt || "0"),
        category: category || "Manual Entry"
    };

    try {
        const res = await fetch('/api/entry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.status === 401) {
            localStorage.removeItem('bizsense_email');
            window.location.href = '/';
            return;
        }
        const json = await res.json();
        if (json.status === 'success') {
            toast.success("Entry added!");
            setRevenueAmt(""); setExpenseAmt(""); setMonth(""); setCategory("");
            refetchData();
            if (setActiveTab) setActiveTab('dashboard');
        } else {
            toast.error(json.message);
        }
    } catch(e) {
        toast.error("Failed to add entry");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    localStorage.setItem('bizsense_last_file', file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
        toast.info("Uploading...", { id: 'upload' });
        const res = await fetch('/api/upload', {
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
            toast.success("Data successfully replaced!", { id: 'upload' });
            refetchData();
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (setActiveTab) setActiveTab('dashboard');
        } else {
            toast.error(json.message, { id: 'upload' });
        }
    } catch(e) {
        toast.error("Upload failed.", { id: 'upload' });
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
        const res = await fetch(`/api/entry/${id}`, { method: 'DELETE' });
        if (res.status === 401) {
            localStorage.removeItem('bizsense_email');
            window.location.href = '/';
            return;
        }
        const json = await res.json();
        if (json.status === 'success') {
            toast.success("Entry removed!");
            refetchData();
        } else {
            toast.error(json.message);
        }
    } catch(e) {
        toast.error("Failed to delete entry");
    }
  };

  const handleReset = async () => {
    try {
        const res = await fetch('/api/reset', { method: 'POST' });
        if (res.ok) {
            toast.success('Workspace reset to defaults.');
            refetchData();
            if (setActiveTab) setActiveTab('dashboard');
        }
    } catch (e) {
        toast.error('Reset failed.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
      {/* Upload CSV */}
      <div className="glass rounded-xl p-5 hover-lift">
        <h3 className="text-sm font-semibold text-foreground mb-3">📁 Upload CSV</h3>
        <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
        />
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        >
          <p className="text-3xl mb-2">📄</p>
          <p className="text-sm text-muted-foreground">
            Click to upload your CSV file
          </p>
          <p className="text-xs text-muted-foreground mt-1">Requires month, revenue, expenses, category</p>
        </div>
      </div>

      {/* Upload ML Dataset */}
      <div className="glass rounded-xl p-5 hover-lift">
        <h3 className="text-sm font-semibold text-foreground mb-3">🤖 Upload ML Dataset</h3>
        <input 
            type="file" 
            accept=".csv" 
            ref={mlFileInputRef} 
            onChange={handleMLFileUpload} 
            className="hidden" 
        />
        <div 
            onClick={() => mlFileInputRef.current?.click()}
            className="border-2 border-dashed border-primary/40 bg-primary/5 rounded-lg p-8 text-center hover:border-primary/80 transition-colors cursor-pointer flex flex-col items-center justify-center flex-1 h-[148px]"
        >
          <p className="text-3xl mb-1">📈</p>
          <p className="text-sm text-foreground font-medium leading-none">
            Dense Daily Dataset
          </p>
          <p className="text-xs text-muted-foreground mt-1">Requires date, revenue, expenses</p>
        </div>
      </div>

      {/* Manual Entry */}
      <div className="glass rounded-xl p-5 hover-lift">
        <h3 className="text-sm font-semibold text-foreground mb-3">✍️ Add Entry</h3>
        <div className="space-y-3">
          <input
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="Month (e.g. Jul)"
            className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/50 outline-none input-glow transition-all"
          />
          <div className="flex gap-2">
              <input
                type="number"
                value={revenueAmt}
                onChange={(e) => setRevenueAmt(e.target.value)}
                placeholder="Revenue (₹)"
                className="w-1/2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/50 outline-none input-glow transition-all"
              />
              <input
                type="number"
                value={expenseAmt}
                onChange={(e) => setExpenseAmt(e.target.value)}
                placeholder="Expenses (₹)"
                className="w-1/2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/50 outline-none input-glow transition-all"
              />
          </div>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (e.g. 'Expense: SaaS')"
            className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/50 outline-none input-glow transition-all"
          />
          <button 
            onClick={handleManualEntry}
            className="w-full py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover-lift"
          >
            Add Entry
          </button>
        </div>
      </div>

      {/* Reset Workspace */}
      <div className="glass rounded-xl p-5 hover-lift flex flex-col">
        <h3 className="text-sm font-semibold text-foreground mb-3">🔄 Reset Workspace</h3>
        <p className="text-sm text-muted-foreground mb-4 flex-1">
          Clear all uploaded data and AI-generated insights. This action cannot be undone.
        </p>
        <button 
            onClick={handleReset}
            className="w-full py-2 rounded-lg border border-destructive/50 text-destructive text-sm font-semibold hover:bg-destructive/10 transition-all"
        >
          Reset All Data
        </button>
      </div>

      {/* Uploaded Data Preview */}
      <div className="glass rounded-xl p-6 lg:col-span-3 shadow-lg flex flex-col gap-4">
        <div className="flex items-center gap-5">
            <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                <span className="text-4xl">📊</span>
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{fileName}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {data && data.length > 0 
                      ? `Successfully holding ${data.length} financial records in memory. Your AI and charts are fully synced.` 
                      : "No data is currently uploaded to your workspace."}
                </p>
            </div>
            {data && data.length > 0 && (
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsTableOpen(!isTableOpen)}
                        className="px-4 py-2 border border-border hover:bg-muted/50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                        <span>{isTableOpen ? "🔼" : "📂"}</span>
                        <span>{isTableOpen ? "Close Preview" : "Open CSV"}</span>
                    </button>
                    <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-sm font-semibold flex items-center">
                        Online & Synced
                    </div>
                </div>
            )}
        </div>

        {/* Collapsible Table */}
        {isTableOpen && data && data.length > 0 && (
            <div className="overflow-x-auto mt-2 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-4 duration-300">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="pb-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Month</th>
                    <th className="pb-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Revenue</th>
                    <th className="pb-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Expenses</th>
                    <th className="pb-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                    <th className="pb-3 px-3 text-xs font-semibold text-muted-foreground uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data].reverse().slice(0, 10).map((row: any, i) => (
                    <tr key={i} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                      <td className="p-3 text-sm text-foreground font-medium">{row.month}</td>
                      <td className="p-3 text-sm text-emerald-400">₹{row.revenue.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-sm text-rose-400">₹{row.expenses.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-sm text-muted-foreground">{row.category}</td>
                      <td className="p-3 text-sm text-right">
                        <button 
                          onClick={() => handleDeleteEntry(row.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete Entry"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
    </div>
  );
};
export default DataInput;
