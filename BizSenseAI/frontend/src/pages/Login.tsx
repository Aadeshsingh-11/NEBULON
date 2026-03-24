import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ParticleField = () => {
//... leaving same Particle field string match requires skipping it

  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
    color: Math.random() > 0.5 ? "rgb(6, 182, 212)" : "rgb(139, 92, 246)",
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgb(6, 182, 212), transparent)" }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-15 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgb(139, 92, 246), transparent)" }} />
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: 0.4,
          }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('bizsense_email');
    if (saved) {
      handleLoginDirect(saved);
    }
  }, []);

  const handleLoginDirect = async (emailToUse: string) => {
    setLoading(true);
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: emailToUse, name: emailToUse.split('@')[0] })
        });
        const json = await res.json();
        if (json.status === 'success') {
            localStorage.setItem('bizsense_email', emailToUse);
            navigate("/dashboard");
        } else {
            alert(json.message);
        }
    } catch(err) {
        alert("Failed to login");
    } finally {
        setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("Email required!");
    handleLoginDirect(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-background">
      <ParticleField />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-strong rounded-2xl p-10 w-full max-w-md relative z-10 glow-cyan"
      >
        <div className="text-center mb-8">
          <motion.div animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 3, repeat: Infinity }}>
            <h1 className="text-3xl font-bold gradient-primary-text mb-1">BizSense AI</h1>
          </motion.div>
          <p className="text-muted-foreground text-sm">SME Financial CoPilot</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 outline-none input-glow transition-all duration-200"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 outline-none input-glow transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm hover-lift disabled:opacity-50">
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
export default Login;
