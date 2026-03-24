import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Message {
  role: string;
  content: string;
}

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-sm bg-muted/80 w-fit">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-primary"
        style={{ animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
      />
    ))}
  </div>
);

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
      { role: 'model', content: "Hello! I'm your BizSense AI assistant. How can I help you with your financials today?" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing, open]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setTyping(true);

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMsg, history: messages.slice(1) })
        });
        const json = await res.json();
        
        if (json.status === 'success') {
            setMessages(prev => [...prev, { role: 'model', content: json.message }]);
        } else {
            toast.error(json.message);
        }
    } catch(e) {
        toast.error("Network error");
    } finally {
        setTyping(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.4)] z-50 glow-cyan"
      >
        {open ? "×" : "💬"}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 w-[380px] h-[500px] glass-strong rounded-2xl flex flex-col z-50 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] glow-cyan"
          >
            <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-[rgba(30,41,59,0.5)] backdrop-blur-md">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-sm shadow-[0_0_10px_rgba(6,182,212,0.3)] text-white">🤖</div>
              <div>
                <p className="text-sm font-semibold text-foreground">BizSense Assistant</p>
                <p className="text-xs text-emerald-400">● Online</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 text-sm rounded-2xl ${
                      msg.role === 'user'
                        ? "gradient-primary text-white rounded-br-sm shadow-[0_4px_10px_rgba(6,182,212,0.2)] border-none"
                        : "bg-[rgba(30,41,59,0.8)] text-foreground border border-border rounded-bl-sm"
                    }`}
                  >
                    <div dangerouslySetInnerHTML={{__html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}} />
                  </div>
                </motion.div>
              ))}
              {typing && <TypingIndicator />}
            </div>

            <div className="p-3 border-t border-border flex gap-2 bg-[rgba(15,23,42,0.8)] backdrop-blur-md">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask anything..."
                className="flex-1 px-4 py-2 rounded-full bg-[rgba(30,41,59,0.6)] border border-border text-foreground text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-all duration-200 input-glow"
              />
              <button
                onClick={sendMessage}
                disabled={typing}
                className="min-w-[40px] h-[40px] rounded-full gradient-primary text-white flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_10px_rgba(6,182,212,0.2)] disabled:opacity-50 hover-lift"
              >
                ⮞
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default ChatWidget;
