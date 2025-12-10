import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import { AppMode } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIProps {
  mode: AppMode;
}

const AIAssistant: React.FC<AIProps> = ({ mode }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: `Olá! Sou a Neon AI. Como posso ajudar a gerenciar sua ${mode === AppMode.BARBER ? 'barbearia' : 'clínica'} hoje?` }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const context = `Modo atual: ${mode}. O usuário é um administrador.`;
    const responseText = await chatWithAI(input, context);

    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText || "Erro ao conectar." };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/10 via-slate-900 to-slate-900 pointer-events-none"></div>

      <header className="p-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur flex items-center gap-3 z-10">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 animate-pulse">
          <Bot size={24} />
        </div>
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            Neon AI <Sparkles size={14} className="text-yellow-400" />
          </h3>
          <p className="text-xs text-slate-400">Assistente Inteligente Conectado</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[80%] rounded-2xl px-4 py-3 text-sm
              ${msg.role === 'user' 
                ? 'bg-green-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}
            `}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700 flex gap-2">
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-800 z-10">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte sobre agenda, financeiro ou marketing..."
            className="flex-1 bg-slate-800 border-slate-700 text-white rounded-xl px-4 focus:outline-none focus:border-green-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="p-3 bg-green-500 hover:bg-green-400 text-slate-900 rounded-xl transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
