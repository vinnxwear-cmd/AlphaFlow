import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../serviços/supabase';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
  systemName: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, users, systemName }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Tenta fazer login no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError('Erro ao entrar: ' + error.message);
      } else {
        // Se der certo, avisa o sistema que logou
        // O "data.user" contém os dados reais do Supabase agora
        if (data.user) {
             // Aqui adaptamos para o formato que seu app espera, ou recarregamos a página
             // Por enquanto, vamos apenas recarregar para ele pegar a sessão
             window.location.reload(); 
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 z-10 shadow-2xl">
        <div className="text-center mb-8">
           <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-4 flex items-center justify-center text-slate-900 text-xl font-bold">
             {systemName.charAt(0)}
           </div>
           <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo ao {systemName}</h1>
           <p className="text-slate-400">Entre para gerenciar seu negócio.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            Entrar no Sistema <ArrowRight size={18} />
          </button>

          <div className="text-center mt-4">
             <p className="text-xs text-slate-500">Credenciais Demo: admin@alphaflow.com / admin</p>
          </div>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-600">{systemName} © 2025</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
