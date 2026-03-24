import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import AnomalyAlert from "@/components/dashboard/AnomalyAlert";
import KPIGrid from "@/components/dashboard/KPIGrid";
import ChartsGrid from "@/components/dashboard/ChartsGrid";
import AIStrategy from "@/components/dashboard/AIStrategy";
import DataInput from "@/components/dashboard/DataInput";
import ChatWidget from "@/components/dashboard/ChatWidget";
import LiveNews from "@/components/dashboard/LiveNews";
import Settings from "@/components/dashboard/Settings";
import HealthScore from "@/components/dashboard/HealthScore";
import MLPredictor from "@/components/dashboard/MLPredictor";
import { BizSenseProvider } from "@/hooks/useBizSense";

const DashboardContent = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  return (
    <main className="flex-1 p-8 overflow-y-auto">
      {activeTab === 'dashboard' && (
          <>
            <AnomalyAlert />
            <KPIGrid />
            <ChartsGrid />
            <AIStrategy />
            <div className="mt-8 mb-4 shadow-xl shadow-cyan-500/10 rounded-xl overflow-hidden">
              <button 
                onClick={() => setActiveTab('health')} 
                className="w-full py-5 text-lg rounded-xl bg-gradient-to-r from-primary to-secondary text-background font-extrabold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover-lift active:scale-[0.99] flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🩺</span>
                <span>Check Business Health Score</span>
              </button>
            </div>
          </>
      )}
      {activeTab === 'datasetup' && (
          <DataInput setActiveTab={setActiveTab} />
      )}
      {activeTab === 'health' && <HealthScore />}
      {activeTab === 'mlpredictor' && <MLPredictor />}
      {activeTab === 'livenews' && <LiveNews />}
      {activeTab === 'settings' && <Settings />}
    </main>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  let title = 'Financial Overview';
  if (activeTab === 'datasetup') title = 'Data Management';
  if (activeTab === 'health') title = 'Business Health Score';
  if (activeTab === 'mlpredictor') title = 'Linear Neural Revenue Predictor';
  if (activeTab === 'livenews') title = 'Live Business News';
  if (activeTab === 'settings') title = 'Account Settings';

  return (
    <BizSenseProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border flex items-center justify-between px-8 shrink-0">
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            <div className="flex items-center gap-3">
              <div className="glass rounded-lg px-4 py-2 text-sm text-muted-foreground flex items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors">
                <span>📅</span>
                <span>Jan 2024 — Jun 2024</span>
              </div>
            </div>
          </header>

          <DashboardContent activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <ChatWidget />
      </div>
    </BizSenseProvider>
  );
};

export default Dashboard;
