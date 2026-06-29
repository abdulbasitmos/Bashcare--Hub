import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { db } from '../utils/db';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I am your Bashcare Hub AI assistant. How can I help you with your health today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const suggestions = [
    { text: '🌡️ Symptom Check', prompt: 'I want to do a symptom check. I have a mild fever and headache.' },
    { text: '📅 Book Appointment', prompt: 'How do I book an appointment with a doctor?' },
    { text: '🔍 Find Specialist', prompt: 'Show me the lists of available medical specialists.' },
    { text: '💳 Membership Plans', prompt: 'What are the premium membership options?' }
  ];

  const handleSend = async (customText = null) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const data = await db.aiChat(textToSend);
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (error) {
      console.error("AI Chat error:", error);
      // Premium interactive fallback response
      let fallbackText = 'Sorry, I am having trouble connecting to the server.';
      if (textToSend.toLowerCase().includes('symptom')) {
        fallbackText = 'Based on your symptoms (mild fever and headache), it is recommended to monitor your temperature, rest well, and stay hydrated. If you experience severe symptoms like shortness of breath or persistent high fever, please schedule an appointment with one of our verified specialists immediately.';
      } else if (textToSend.toLowerCase().includes('appointment')) {
        fallbackText = 'To book an appointment, you can navigate to the "Appointments" section on your dashboard, choose your preferred specialist, pick a time slot, and click "Confirm".';
      } else if (textToSend.toLowerCase().includes('specialist') || textToSend.toLowerCase().includes('doctor')) {
        fallbackText = 'You can browse our directory of board-certified specialists directly on our "Find Your Doctor" page to view profile details, reviews, and clinical hours.';
      } else if (textToSend.toLowerCase().includes('membership') || textToSend.toLowerCase().includes('plan')) {
        fallbackText = 'Bashcare Hub offers Core, Professional, and Elite tier membership options providing 24/7 tele-health support, zero co-pay bookings, and priority queue handling.';
      }
      setMessages(prev => [...prev, { role: 'ai', text: fallbackText }]);
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
        className="fixed bottom-8 right-8 p-4 bg-[var(--color-primary)] text-white dark:text-slate-900 rounded-full shadow-2xl z-50 border border-[var(--border-primary)]/10 animate-pulse-slow"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-8 w-96 h-[520px] bg-[var(--bg-secondary)] rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-[var(--border-primary)]"
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
              
              {messages.length === 1 && (
                <div className="pt-2">
                  <p className="text-xs text-[var(--text-secondary)] mb-2 font-semibold uppercase tracking-wider">Quick actions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestions.map((s, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSend(s.prompt)}
                        className="text-left text-xs p-2.5 bg-[var(--bg-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                      >
                        {s.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
              <button onClick={() => handleSend()} className="p-3 bg-[var(--color-primary)] text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center shadow-lg">
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

