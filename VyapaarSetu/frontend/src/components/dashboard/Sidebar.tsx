import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'Loading...', email: '' });

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(d => {
        if (d.status === 'success') {
            setUser(d.user);
        } else {
            navigate('/');
        }
    }).catch(() => navigate('/'));
  }, [navigate]);

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "datasetup", icon: "📁", label: "Data Setup" },
    { id: "health", icon: "🩺", label: "Health Score" },
    { id: "mlpredictor", icon: "🤖", label: "ML Predictor" },
    { id: "livenews", icon: "📰", label: "Live News" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <aside className="w-[260px] min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold gradient-primary-text">VyapaarSetu</h1>
        <p className="text-xs text-muted-foreground mt-0.5">SME Financial CoPilot</p>
      </div>

      <div className="px-6 py-4 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-sm font-semibold text-primary-foreground shrink-0 uppercase">
          {user.name.substring(0,2)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === item.id
                ? "bg-primary/10 text-primary border-l-2 border-primary glow-cyan"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => {
              localStorage.removeItem('bizsense_email');
              navigate("/");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <span>🚪</span> Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
