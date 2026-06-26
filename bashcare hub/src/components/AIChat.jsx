import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { db } from '../utils/db';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I am your Bashcare Hub assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await db.aiChat(input);
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (error) {
      console.error("AI Chat error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 p-4 bg-[var(--color-primary)] text-white dark:text-slate-900 rounded-full shadow-2xl z-50 border border-[var(--border-primary)]/10"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-8 w-96 h-[500px] bg-[var(--bg-secondary)] rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-[var(--border-primary)]"
          >
            <div className="p-6 bg-[var(--color-primary)] text-white dark:text-slate-900 flex items-center gap-3 shadow-md">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">AI Care Companion</h3>
                <span className="text-xs opacity-75">Online • Powered by Gemini</span>
              </div>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[var(--bg-primary)] custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-[var(--color-primary)] text-white dark:text-slate-900 shadow-md rounded-br-none' 
                      : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] shadow-sm rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-1.5 items-center p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl rounded-bl-none w-16 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce [animation-duration:1s]"></span>
                  <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]"></span>
                </div>
              )}
            </div>

            <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 p-3 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] placeholder-[var(--text-secondary)]/50"
              />
              <button onClick={handleSend} className="p-3 bg-[var(--color-primary)] text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center shadow-lg">
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChat;

