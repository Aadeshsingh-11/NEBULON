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
    { id: "dashboard", icon: "📊", label: "Dashboard", color: "#7C3AED" },
    { id: "datasetup", icon: "📁", label: "Data Setup", color: "#F59E0B" },
    { id: "health", icon: "🩺", label: "Health Score", color: "#10B981" },
    { id: "mlpredictor", icon: "🤖", label: "ML Predictor", color: "#3B82F6" },
    { id: "reports", icon: "📄", label: "Business Report", color: "#EC4899" },
    { id: "livenews", icon: "📰", label: "Live News", color: "#F97316" },
    { id: "settings", icon: "⚙️", label: "Settings", color: "#6B7280" },
  ];

  return (
    <aside 
      className="w-[260px] min-h-screen border-r border-slate-200 flex flex-col shrink-0"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #F5F3FF 100%)" }}
    >
      <div className="py-5 px-4 border-b border-gray-100 flex items-center justify-center">
        <img src="/logo.png" alt="VyapaarSetu" className="w-[180px] h-auto object-contain" />
      </div>

      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-md flex items-center justify-center text-sm font-bold text-white shrink-0 uppercase">
          {user.name.substring(0,2)}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-slate-800 truncate leading-tight">{user.name}</p>
          <p className="text-[12px] font-medium text-slate-500 truncate mt-0.5">{user.email}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto hidden-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-bold transition-all duration-200 border-l-[3px]"
              style={
                isActive 
                  ? { 
                      background: `linear-gradient(90deg, ${item.color}26 0%, transparent 100%)`,
                      borderLeftColor: item.color,
                      color: item.color,
                      boxShadow: `0 2px 8px ${item.color}26`
                    }
                  : {
                      borderLeftColor: 'transparent',
                      color: '#64748B',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = `${item.color}14`;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span className="text-lg w-6 flex items-center justify-center filter drop-shadow-sm transition-transform duration-200" style={isActive ? { transform: 'scale(1.1)' } : { filter: 'grayscale(100%) opacity(80%)' }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 bg-white/40">
        <button
          onClick={() => {
              localStorage.removeItem('bizsense_email');
              navigate("/");
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-bold text-[#EF4444] hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all duration-200 group"
        >
          <span className="text-lg group-hover:-translate-x-1 transition-transform">🚪</span> Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
