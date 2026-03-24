import { useState, useEffect } from "react";
import { toast } from "sonner";

const Settings = () => {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(d => {
      if (d.status === 'success') {
        setProfile(d.user);
      }
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name })
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success("Settings saved successfully!");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Profile Settings */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Profile Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email Address (Read Only)</label>
            <input
              value={profile.email}
              readOnly
              className="w-full px-4 py-2.5 rounded-lg bg-muted/30 border border-border text-muted-foreground text-sm cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Preferences & API</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Groq API Key (Overrides Default)</label>
            <input
              type="password"
              placeholder="gsk_..."
              className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-all"
            />
            <p className="text-xs text-muted-foreground mt-1.5">Leave blank to use the default environment key from .env</p>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border mt-4">
             <div>
               <p className="text-sm font-medium text-foreground">Dark Mode</p>
               <p className="text-xs text-muted-foreground">Always enable deep dark UI</p>
             </div>
             <div className="w-10 h-5 rounded-full bg-primary relative cursor-pointer">
                <div className="absolute right-1 top-1 w-3 h-3 rounded-full bg-white"></div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button className="px-5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover-lift"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

    </div>
  );
};
export default Settings;
