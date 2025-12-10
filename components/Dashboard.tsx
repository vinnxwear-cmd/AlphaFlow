
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, CalendarCheck, Wallet, Clock, User as UserIcon, CheckCircle, XCircle, Percent } from 'lucide-react';
import { DashboardStats, FinancialRecord, Appointment, User, UserRole, Service } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  financialData: FinancialRecord[];
  appointments: Appointment[];
  users: User[];
  currentUser: User;
  services: Service[];
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, financialData, appointments, users, currentUser, services, onNavigate }) => {
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>(
    currentUser.role === UserRole.ADMIN ? 'all' : currentUser.id
  );

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isProfessional = currentUser.role === UserRole.PROFESSIONAL;
  const professionals = users.filter(u => u.role === UserRole.PROFESSIONAL || u.role === UserRole.ADMIN);

  // --- Filtering Logic ---
  
  // Filter Appointments
  const filteredAppointments = appointments.filter(appt => {
    if (selectedProfessionalId === 'all') return true;
    return appt.professionalId === selectedProfessionalId;
  });

  // Filter today's appointments for the list
  const todayAppointments = filteredAppointments
    .filter(a => new Date(a.startTime).toDateString() === new Date().toDateString())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // --- Calculation Logic ---

  const getCommission = (appointment: Appointment): number => {
    const service = services.find(s => s.id === appointment.serviceId);
    if (!service || service.commissionPercentage === undefined) return 0;
    return appointment.price * (service.commissionPercentage / 100);
  };

  const calculateTotal = (appts: Appointment[]) => {
    return appts.reduce((acc, curr) => {
      if (isProfessional) {
        return acc + getCommission(curr);
      }
      return acc + curr.price;
    }, 0);
  };

  const currentRevenueOrCommission = calculateTotal(
    filteredAppointments.filter(a => new Date(a.startTime).toDateString() === new Date().toDateString() && a.status === 'COMPLETED')
  );

  const currentCount = filteredAppointments.filter(a => new Date(a.startTime).toDateString() === new Date().toDateString()).length;

  // --- Dynamic Chart Data ---
  
  // Weekly Cash Flow / Commission Chart
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start on Sunday
  
  const chartData = daysOfWeek.map((day, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    const dateStr = date.toDateString();

    const dailyTotal = filteredAppointments
      .filter(a => new Date(a.startTime).toDateString() === dateStr && a.status === 'COMPLETED')
      .reduce((acc, curr) => {
         return acc + (isProfessional ? getCommission(curr) : curr.price);
      }, 0);

    return { name: day, valor: dailyTotal };
  });

  // Popular Services Chart
  const serviceCounts: Record<string, number> = {};
  filteredAppointments.forEach(a => {
    if (a.status === 'COMPLETED' || a.status === 'SCHEDULED') {
      serviceCounts[a.serviceName] = (serviceCounts[a.serviceName] || 0) + 1;
    }
  });
  
  const popularServicesData = Object.entries(serviceCounts)
    .map(([name, qtd]) => ({ name, qtd }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 5); // Top 5
    
  // If empty, provide placeholder for visual consistency (optional, or show empty state)
  const displayPopularServices = popularServicesData.length > 0 ? popularServicesData : [];

  const StatCard = ({ title, value, icon: Icon, trend, onClick }: any) => (
    <div 
      onClick={onClick}
      className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/50 transition-all ${onClick ? 'cursor-pointer hover:shadow-lg hover:shadow-green-900/10 hover:-translate-y-1' : ''}`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-green-500/10 transition-colors"></div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className="p-3 bg-slate-800 rounded-lg text-green-400 group-hover:text-green-300 group-hover:scale-110 transition-all">
          <Icon size={24} />
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-green-400 font-medium flex items-center gap-1">
          <TrendingUp size={12} /> {trend}
        </span>
        <span className="text-slate-500">vs ontem</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-slate-400">Visão geral do negócio hoje.</p>
        </div>
        
        {/* Professional Filter for Admin */}
        {isAdmin && (
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
             <span className="text-xs font-bold text-slate-500 px-2 uppercase">Ver Agenda de:</span>
             <select 
               value={selectedProfessionalId}
               onChange={(e) => setSelectedProfessionalId(e.target.value)}
               className="bg-slate-800 text-white text-sm rounded-md px-3 py-1.5 border border-slate-700 outline-none focus:border-green-500"
             >
               <option value="all">Todos os Profissionais</option>
               {professionals.map(p => (
                 <option key={p.id} value={p.id}>{p.name}</option>
               ))}
             </select>
          </div>
        )}
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title={isProfessional ? "Minhas Comissões Hoje" : "Faturamento Hoje"} 
          value={`R$ ${currentRevenueOrCommission.toFixed(2)}`} 
          icon={isProfessional ? Percent : Wallet} 
          trend="0%" 
          onClick={() => onNavigate('financial')}
        />
        <StatCard 
          title="Atendimentos" 
          value={currentCount} 
          icon={CalendarCheck} 
          trend="0%" 
          onClick={() => onNavigate('schedule')}
        />
        <StatCard 
          title="Novos Clientes" 
          value={stats.newClients} 
          icon={Users} 
          trend="0" 
          onClick={() => onNavigate('clients')}
        />
        <StatCard 
          title="Ocupação" 
          value={`${stats.occupancyRate}%`} 
          icon={TrendingUp} 
          trend="0%" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">
              {isProfessional ? 'Comissões Semanais' : 'Fluxo de Caixa Semanal'}
            </h3>
            <select className="bg-slate-800 border-none text-slate-300 text-sm rounded-lg px-3 py-1 outline-none">
              <option>Esta Semana</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isProfessional ? "#a855f7" : "#4ade80"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isProfessional ? "#a855f7" : "#4ade80"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: isProfessional ? '#a855f7' : '#4ade80' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke={isProfessional ? "#a855f7" : "#4ade80"} 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart/List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Serviços Populares</h3>
          <div className="h-[300px]">
             {displayPopularServices.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayPopularServices} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={60} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
                  <Bar dataKey="qtd" fill={isProfessional ? "#a855f7" : "#22c55e"} radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <p>Sem dados suficientes.</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Agenda/Schedule Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-800 rounded-lg text-green-500">
               <CalendarCheck size={20} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-white">Agenda de Hoje</h3>
                <p className="text-xs text-slate-500">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
             </div>
          </div>
          <button 
            onClick={() => onNavigate('schedule')}
            className="text-sm px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-green-400 rounded-lg font-medium transition-colors"
          >
            Ver agenda completa
          </button>
        </div>
        
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-400">
             <thead className="bg-slate-950 text-slate-200 uppercase font-medium text-xs">
              <tr>
                <th className="px-6 py-4">Horário</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Serviço</th>
                <th className="px-6 py-4">Profissional</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">
                  {isProfessional ? 'Comissão' : 'Valor'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/50">
               {todayAppointments.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                     <CalendarCheck size={32} className="opacity-20" />
                     <p>Nenhum agendamento encontrado para hoje.</p>
                   </td>
                 </tr>
               ) : (
                 todayAppointments.map(appt => {
                   const professional = users.find(u => u.id === appt.professionalId);
                   const commission = getCommission(appt);
                   const displayValue = isProfessional ? commission : appt.price;
                   
                   return (
                   <tr key={appt.id} className="hover:bg-slate-800/50 transition-colors group">
                     <td className="px-6 py-4 font-mono text-white flex items-center gap-2">
                        <Clock size={14} className="text-slate-500 group-hover:text-green-500 transition-colors" />
                        {new Date(appt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </td>
                     <td className="px-6 py-4 font-medium text-white">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                            {appt.clientName.charAt(0)}
                         </div>
                         {appt.clientName}
                       </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs border border-slate-700">
                          {appt.serviceName}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400">
                           <UserIcon size={12} />
                           {professional?.name || 'Profissional'}
                        </div>
                     </td> 
                     <td className="px-6 py-4">
                       <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border flex w-fit items-center gap-1
                         ${appt.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                           appt.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                           'bg-red-500/10 text-red-400 border-red-500/20'}
                       `}>
                         {appt.status === 'COMPLETED' && <CheckCircle size={10} />}
                         {appt.status === 'CANCELLED' && <XCircle size={10} />}
                         {appt.status === 'SCHEDULED' ? 'Agendado' : appt.status === 'COMPLETED' ? 'Concluído' : 'Cancelado'}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-right font-medium text-slate-300 font-mono">
                        R$ {displayValue.toFixed(2)}
                     </td>
                   </tr>
                 )
                 })
               )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
