import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Inline SVGs to guarantee zero missing dependency errors
const UserIcon = ({ size }: { size: number }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const LockIcon = ({ size }: { size: number }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const KeyIcon = ({ size }: { size: number }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>);
const SlidersIcon = ({ size }: { size: number }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="21" y2="14"/><line x1="4" x2="20" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="8" x2="16" y1="14" y2="14"/><line x1="8" x2="16" y1="8" y2="8"/></svg>);
const EyeIcon = ({ size }: { size: number }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>);
const EyeOffIcon = ({ size }: { size: number }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>);
const CopyIcon = ({ size }: { size: number }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>);
const CheckIcon = ({ size, className }: { size: number, className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>);

const tabs = [
  { id: 'general', label: 'General', icon: UserIcon, color: 'bg-blue-100 text-blue-600', activeColor: 'bg-blue-50 text-blue-700' },
  { id: 'security', label: 'Security', icon: LockIcon, color: 'bg-rose-100 text-rose-600', activeColor: 'bg-rose-50 text-rose-700' },
  { id: 'api', label: 'API Keys', icon: KeyIcon, color: 'bg-orange-100 text-orange-600', activeColor: 'bg-orange-50 text-orange-700' },
  { id: 'preferences', label: 'Preferences', icon: SlidersIcon, color: 'bg-teal-100 text-teal-600', activeColor: 'bg-teal-50 text-teal-700' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const Settings = () => {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [groqKey, setGroqKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState('INR');

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(d => {
      if (d.status === 'success') {
        setProfile(d.user);
      }
    }).catch(err => console.error("Error fetching user data", err));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, groqKey, currency, darkMode })
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success("Settings saved successfully!");
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(groqKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get Initials
  const initials = profile.name ? profile.name.substring(0, 2).toUpperCase() : 'VS';

  return (
    <div className="relative min-h-[calc(100vh-100px)] w-full font-sans text-slate-800 overflow-hidden bg-white rounded-[32px] p-6 lg:p-12 shadow-sm border border-slate-100">
      {/* Absolute Blurred Background Blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#E0E7FF] blur-3xl opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[#FCE7F3] blur-3xl opacity-40 pointer-events-none"></div>
      <div className="absolute top-[20%] right-[5%] w-[400px] h-[400px] rounded-full bg-[#D1FAE5] blur-3xl opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-[#FFEDD5] blur-3xl opacity-40 pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row gap-10">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-2 mt-4">
          <h2 className="text-[28px] font-bold text-slate-800 mb-8 pl-2 tracking-tight">Settings</h2>
          <div className="flex flex-col gap-2">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl text-[15px] font-semibold transition-all duration-300 ${isActive ? tab.activeColor : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-800'}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-white/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-white/80 rounded-2xl"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 p-2 rounded-xl ${isActive ? 'bg-white shadow-sm' : tab.color} transition-colors`}>
                    <Icon size={18} />
                  </span>
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl"
            >
              
              {activeTab === 'general' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white/70 backdrop-blur-md rounded-3xl p-8 lg:p-10 shadow-[0_20px_40px_-15px_rgba(165,180,252,0.15)] border border-indigo-50/50">
                  <motion.h3 variants={itemVariants} className="text-2xl font-extrabold text-slate-800 mb-8">General Profile</motion.h3>
                  
                  <motion.div variants={itemVariants} className="flex items-center gap-6 mb-10">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#A5B4FC] to-[#F9A8D4] p-[3px]">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center border-2 border-transparent">
                           <span className="text-3xl font-extrabold bg-gradient-to-tr from-[#A5B4FC] to-[#F9A8D4] bg-clip-text text-transparent">{initials}</span>
                        </div>
                      </div>
                      <button className="absolute bottom-0 right-0 bg-white rounded-full p-2.5 shadow-md border border-slate-100 text-slate-500 hover:text-indigo-500 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                      </button>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-[17px]">Profile Picture</h4>
                      <p className="text-[14px] font-medium text-slate-500 mt-1">Upload a new photo for your copilot identity</p>
                    </div>
                  </motion.div>

                  <div className="space-y-6">
                    <motion.div variants={itemVariants}>
                      <label className="block text-[14px] font-bold text-slate-700 tracking-wide mb-2">Full Name</label>
                      <input
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-5 py-4 rounded-[14px] bg-slate-50 border-0 text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#A5B4FC] transition-all font-bold shadow-sm"
                        placeholder="Enter your name"
                      />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <label className="block text-[14px] font-bold text-slate-700 tracking-wide mb-2">Email Address</label>
                      <input
                        value={profile.email || "hello@vyapaarsetu.com"}
                        readOnly
                        className="w-full px-5 py-4 rounded-[14px] bg-slate-50/70 border-0 text-slate-500 outline-none cursor-not-allowed font-bold shadow-sm"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white/70 backdrop-blur-md rounded-3xl p-8 lg:p-10 shadow-[0_20px_40px_-15px_rgba(244,63,94,0.1)] border border-rose-50/50">
                  <motion.h3 variants={itemVariants} className="text-2xl font-extrabold text-slate-800 mb-8">Security Settings</motion.h3>
                  <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100">
                     <p className="text-[15px] leading-relaxed text-rose-800 font-semibold">Security options including password resets and two-factor authentication are currently managed via your Organization's SSO provider infrastructure.</p>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'api' && (
                 <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white/70 backdrop-blur-md rounded-3xl p-8 lg:p-10 shadow-[0_20px_40px_-15px_rgba(249,115,22,0.1)] border border-orange-50/80">
                  <motion.h3 variants={itemVariants} className="text-2xl font-extrabold text-slate-800 mb-8">API Configuration</motion.h3>
                  <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-orange-50 mb-8 border border-orange-100">
                    <p className="text-[14px] leading-relaxed text-orange-900 font-semibold">Connecting your own exclusive Groq API Key grants your organization higher rate limits and priority processing for deep AI Insights workloads.</p>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                      <label className="block text-[14px] font-bold text-slate-700 tracking-wide mb-2">Groq Inference API Key</label>
                      <div className="relative">
                        <input
                          type={showKey ? "text" : "password"}
                          value={groqKey}
                          onChange={(e) => setGroqKey(e.target.value)}
                          className="w-full px-5 pr-28 py-4 rounded-[14px] bg-slate-50 border-0 text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-300 transition-all font-bold shadow-sm"
                          placeholder="gsk_............................................"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                           <button onClick={() => setShowKey(!showKey)} className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100">
                             {showKey ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                           </button>
                           <button onClick={handleCopy} className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100 relative">
                             {copied ? <CheckIcon size={18} className="text-green-500" /> : <CopyIcon size={18} />}
                             <AnimatePresence>
                               {copied && (
                                 <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -30 }} exit={{ opacity: 0 }} className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] px-2.5 py-1.5 rounded-md shadow-xl pointer-events-none font-bold">
                                   Copied!
                                 </motion.span>
                               )}
                             </AnimatePresence>
                           </button>
                        </div>
                      </div>
                      <p className="text-[13px] text-slate-400 font-semibold mt-3 ml-1">Your key is kept securely encrypted strictly on your local instance.</p>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                 <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white/70 backdrop-blur-md rounded-3xl p-8 lg:p-10 shadow-[0_20px_40px_-15px_rgba(20,184,166,0.1)] border border-teal-50/80">
                  <motion.h3 variants={itemVariants} className="text-2xl font-extrabold text-slate-800 mb-8">User Preferences</motion.h3>
                  
                  <div className="space-y-8">
                    <motion.div variants={itemVariants} className="flex items-center justify-between p-5 rounded-[16px] bg-slate-50 border border-slate-100 shadow-sm">
                      <div>
                        <p className="text-[16px] font-extrabold text-slate-800 mb-0.5">Dark Mode</p>
                        <p className="text-[13px] text-slate-500 font-semibold">Enjoy a beautifully crafted night theme.</p>
                      </div>
                      <button 
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-14 h-7 rounded-full p-1.5 transition-colors duration-300 ease-in-out flex ${darkMode ? 'bg-indigo-500 justify-end' : 'bg-slate-200 justify-start'}`}
                      >
                        <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-sm" />
                      </button>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="block text-[14px] font-bold text-slate-700 tracking-wide mb-2">Primary Currency</label>
                      <div className="relative">
                        <select 
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full px-5 py-4 rounded-[14px] bg-slate-50 border-0 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#A5B4FC] transition-all font-bold shadow-sm appearance-none cursor-pointer"
                        >
                           <option value="INR">₹ Indian Rupee (INR)</option>
                           <option value="USD">$ US Dollar (USD)</option>
                           <option value="EUR">€ Euro (EUR)</option>
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="w-full max-w-2xl flex justify-end gap-4 mt-10">
            <button className="px-8 py-3.5 rounded-xl border-2 border-gray-100 text-[15px] font-bold text-slate-600 hover:bg-gray-50 transition-colors shadow-sm">
              Cancel
            </button>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#A5B4FC] to-[#F9A8D4] text-white text-[15px] font-bold shadow-lg shadow-indigo-200 hover:shadow-xl disabled:opacity-70 transition-shadow"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </motion.button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
