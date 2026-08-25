'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: "Bonjour et bienvenue chez NAY Parfums. Je suis votre Conseiller virtuel. Quel type de parfum recherchez-vous aujourd'hui ?",
      }
    ],
    onFinish: () => {
      if (!isOpen) {
        setHasUnread(true);
      }
    }
  });

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 sm:right-6 w-[350px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1A1A1A] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#0ea5e9]" />
                <div className="font-semibold text-[14px]">Conseiller NAY</div>
              </div>
              <button onClick={toggleChat} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                      <Sparkles size={14} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-[13px] leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'bg-[#0ea5e9] text-white rounded-tr-sm'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 rounded-tl-sm flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2 bg-[#f8fafc] border border-gray-200 rounded-full pr-2 pl-4 py-1">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Posez votre question..."
                  className="flex-1 bg-transparent text-[13px] outline-none text-gray-700 py-2"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 flex items-center justify-center bg-[#1A1A1A] text-white rounded-full disabled:opacity-50 hover:bg-[#0ea5e9] transition-colors"
                >
                  <Send size={14} className="-ml-0.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-4 sm:right-6 w-14 h-14 bg-[#1A1A1A] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 hover:bg-[#0ea5e9] active:scale-95 transition-all z-50 border-2 border-white/10"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <div className="relative">
            <MessageSquare size={24} />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-[#1A1A1A] rounded-full" />
            )}
          </div>
        )}
      </button>
    </>
  );
}
