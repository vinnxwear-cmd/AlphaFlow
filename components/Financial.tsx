
import React, { useState } from 'react';
import { FinancialRecord, User, UserRole, Appointment, Service } from '../types';
import { getFinancialAnalysis } from '../services/geminiService';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, PieChart, Calendar, Filter, User as UserIcon } from 'lucide-react';

interface FinancialProps {
  records: FinancialRecord[];
  currentUser: User;
  users: User[];
  appointments: Appointment[];
  services: Service[];
}

type FilterPeriod = 'day' | 'week' | 'month';

const Financial: React.FC<FinancialProps> = ({ records, currentUser, users, appointments, services }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('month');
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>(
    currentUser.role === UserRole.PROFESSIONAL ? currentUser.id : 'all'
  );

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isProfessional = currentUser.role === UserRole.PROFESSIONAL;

  // --- Helper: Date Filtering ---
  const isDateInPeriod = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    
    // Normalize to start of day for accurate comparison
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (filterPeriod === 'day') {
      return d.getTime() === t.getTime();
    }
    
    if (filterPeriod === 'week') {
      // Assuming week starts on Sunday
      const startOfWeek = new Date(t);
      startOfWeek.setDate(t.getDate() - t.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return d >= startOfWeek && d <= endOfWeek;
    }

    if (filterPeriod === 'month') {
      return d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
    }

    return true;
  };

  // --- Filter Records ---
  const visibleRecords = records.filter(r => {
    // 1. Role Check
    if (isProfessional && r.type === 'EXPENSE') return false; // Pros don't see expenses
    
    // 2. Period Check
    if (!isDateInPeriod(r.date)) return false;

    // 3. Professional Check
    if (selectedProfessionalId !== 'all') {
      // Only show records linked to this professional OR general records if configured (here we enforce link)
      // Note: Expenses usually don't have professionalId, so hiding them if a pro is selected is common behavior,
      // OR we show shared expenses. For simplicity, we filter strictly by ID if present.
      if (r.professionalId && r.professionalId !== selectedProfessionalId) return false;
      
      // If record has NO professionalId (like a general bill), do we show it when filtered by a specific barber?
      // Usually NO, unless we are looking at 'General'. 
      // Let's assume if I filter by "Marcos", I only want to see what Marcos generated.
      if (!r.professionalId && r.type === 'INCOME') return false; 
    }

    return true;
  });

  const totalIncome = visibleRecords.filter(r => r.type === 'INCOME').reduce((acc, r) => acc + r.amount, 0);
  const totalExpense = visibleRecords.filter(r => r.type === 'EXPENSE').reduce((acc, r) => acc + r.amount, 0);
  const balance = totalIncome - totalExpense;

  // --- Commission Logic ---
  const getCommission = (appointment: Appointment): number => {
    const service = services.find(s => s.id === appointment.serviceId);
    if (!service || service.commissionPercentage === undefined) return 0;
    return appointment.price * (service.commissionPercentage / 100);
  };

  const calculateProCommission = (proId: string) => {
    const proAppts = appointments.filter(a => 
      a.professionalId === proId && 
      a.status === 'COMPLETED' &&
      isDateInPeriod(a.startTime)
    );
    
    const totalCommission = proAppts.reduce((acc, curr) => acc + getCommission(curr), 0);
    const totalServices = proAppts.length;
    
    return { totalCommission, totalServices };
  };

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await getFinancialAnalysis(visibleRecords);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Financeiro</h2>
          <p className="text-slate-400">Controle de caixa e comissões.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Period Filter */}
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-1 flex">
            {(['day', 'week', 'month'] as const).map(p => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${filterPeriod === p ? 'bg-slate-800 text-green-400 shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                {p === 'day' ? 'Dia' : p === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>

          {/* Professional Filter (Admin Only) */}
          {isAdmin && (
            <div className="relative">
              <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={selectedProfessionalId}
                onChange={(e) => setSelectedProfessionalId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:border-green-500 appearance-none h-full"
              >
                <option value="all">Geral (Todos)</option>
                {users.filter(u => u.role === UserRole.PROFESSIONAL).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}

          <button 
            onClick={handleAnalyze}
            className="px-4 py-2 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-lg font-bold flex items-center gap-2 transition-all hover:bg-purple-600/30"
          >
            {loading ? '...' : <><PieChart size={18} /> IA Report</>}
          </button>
        </div>
      </div>

      {analysis && (
        <div className="bg-slate-800 border border-purple-500/30 p-6 rounded-xl animate-fade-in shadow-2xl shadow-purple-900/10">
          <h3 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
            Análise Inteligente
          </h3>
          <div className="prose prose-invert prose-sm max-w-none">
            {analysis.split('\n').map((line, i) => (
              <p key={i} className="mb-1 text-slate-300">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className={`grid grid-cols-1 ${isProfessional ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm">
              {isProfessional ? 'Minhas Comissões' : 'Entradas (Faturamento)'}
            </span>
            <ArrowUpCircle className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-green-400">+ R$ {totalIncome.toFixed(2)}</p>
        </div>
        
        {!isProfessional && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm">Saídas</span>
              <ArrowDownCircle className="text-red-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-red-400">- R$ {totalExpense.toFixed(2)}</p>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
           <div className={`absolute right-0 top-0 h-full w-1 ${balance >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm">Saldo Líquido</span>
            <DollarSign className="text-slate-200" size={20} />
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>
             R$ {balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white">Transações Recentes</h3>
          <span className="text-xs text-slate-500 uppercase font-bold bg-slate-800 px-2 py-1 rounded">
            {filterPeriod === 'day' ? 'Hoje' : filterPeriod === 'week' ? 'Esta Semana' : 'Este Mês'}
          </span>
        </div>
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium text-xs sticky top-0">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Descrição</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {visibleRecords.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                     Nenhum registro encontrado para este período/filtro.
                   </td>
                 </tr>
              ) : (
                visibleRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">{new Date(rec.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-white font-medium">{rec.description}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-slate-800 text-xs border border-slate-700">
                        {rec.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold ${rec.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                      {rec.type === 'INCOME' ? '+' : '-'} R$ {rec.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commissions Report Section (Admin Only or Self View) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-800 bg-slate-950/30">
          <h3 className="font-bold text-white flex items-center gap-2">
             Relatório de Comissões (Estimado)
             <span className="text-xs font-normal text-slate-500 ml-2">(Baseado em agendamentos concluídos no período)</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium text-xs">
              <tr>
                <th className="px-6 py-3">Profissional</th>
                <th className="px-6 py-3 text-center">Serviços Realizados</th>
                <th className="px-6 py-3 text-right">Comissão Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users
                .filter(u => u.role === UserRole.PROFESSIONAL || u.role === UserRole.ADMIN)
                .filter(u => selectedProfessionalId === 'all' || u.id === selectedProfessionalId)
                .map(pro => {
                  const { totalCommission, totalServices } = calculateProCommission(pro.id);
                  // Don't show rows with 0 if filtering specific
                  if (totalServices === 0 && selectedProfessionalId === 'all') return null;

                  return (
                    <tr key={pro.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                           <img src={pro.avatarUrl || `https://ui-avatars.com/api/?name=${pro.name}`} alt={pro.name} className="w-full h-full object-cover" />
                         </div>
                         <span className="text-white font-medium">{pro.name}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono text-xs border border-slate-700">
                           {totalServices}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-purple-400">
                         R$ {totalCommission.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
               {users.filter(u => (u.role === UserRole.PROFESSIONAL || u.role === UserRole.ADMIN) && (selectedProfessionalId === 'all' || u.id === selectedProfessionalId)).every(u => calculateProCommission(u.id).totalServices === 0) && (
                 <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      Nenhuma comissão gerada neste período.
                    </td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Financial;
