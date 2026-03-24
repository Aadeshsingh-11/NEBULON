import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Message {
  role: string;
  content: string;
}

const TypingIndicator = () => (
  <div className="flex items-center justify-start">
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm mb-2 bg-white border border-gray-200 shadow-sm w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gray-400"
          style={{ animation: `typing-dot 1.4s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
      <style>{`@keyframes typing-dot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-3px); opacity: 1; } }`}</style>
    </div>
  </div>
);

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
      { role: 'model', content: "Hello! I'm your VyapaarSetu assistant. How can I help you with your financials today?" }
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#6366F1] to-[#EC4899] flex items-center justify-center text-white shadow-xl z-50 transition-shadow hover:shadow-2xl"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[360px] h-[520px] bg-gray-50 rounded-2xl flex flex-col z-50 overflow-hidden shadow-2xl border border-gray-200 font-sans"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3 bg-white shrink-0">
              <div className="relative">
                 <img src="/logo.png" alt="Bot" className="w-9 h-9 rounded-full object-cover shadow-sm bg-white p-0.5 border border-gray-100" />
                 <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] border-2 border-white rounded-full"></div>
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#1F2937] leading-tight flex items-center gap-1.5">
                  VyapaarSetu Assistant
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </p>
                <p className="text-[12px] text-[#22C55E] font-medium mt-0.5 tracking-wide">● Online</p>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? "bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-[#FFFFFF] rounded-2xl rounded-tr-sm border-none"
                        : "bg-[#FFFFFF] text-[#1F2937] border border-[#E5E7EB] rounded-2xl rounded-tl-sm"
                    }`}
                  >
                    <div dangerouslySetInnerHTML={{__html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}} />
                  </div>
                </motion.div>
              ))}
              {typing && <TypingIndicator />}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#E5E7EB] flex gap-2 bg-[#FFFFFF] shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Reply to assistant..."
                className="flex-1 px-5 py-2.5 rounded-full bg-gray-100 text-[#1F2937] text-[14px] placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-100 transition-all duration-200 border-none"
              />
              <button
                onClick={sendMessage}
                disabled={typing || !input.trim()}
                className="w-[44px] h-[44px] rounded-full bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md disabled:opacity-50 shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default ChatWidget;
