
import React, { useState } from 'react';
import { Appointment, AppMode, User, UserRole, Client, Service } from '../types';
import { Clock, Plus, CheckCircle, ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Trash2, Lock, User as UserIcon } from 'lucide-react';

interface ScheduleProps {
  appointments: Appointment[];
  mode: AppMode;
  users: User[];
  currentUser: User;
  clients: Client[];
  services: Service[];
  onAdd: (appt: Appointment) => void;
  onUpdate: (appt: Appointment) => void;
  onDelete: (id: string) => void;
}

type ViewMode = 'day' | 'week' | 'month';

const Schedule: React.FC<ScheduleProps> = ({ 
  appointments, 
  mode, 
  users, 
  currentUser, 
  clients, 
  services,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Filter state
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>(
    currentUser.role === UserRole.ADMIN ? 'all' : currentUser.id
  );

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  
  const initialFormState = {
    clientId: '',
    serviceId: '',
    professionalId: currentUser.role === UserRole.ADMIN ? (users.find(u => u.role === UserRole.PROFESSIONAL)?.id || '') : currentUser.id,
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    duration: 30,
    notes: '',
    status: 'SCHEDULED' as Appointment['status']
  };

  const [formData, setFormData] = useState(initialFormState);

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const professionals = users.filter(u => u.role === UserRole.PROFESSIONAL || u.role === UserRole.ADMIN);
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 to 20:00

  // --- Modal Handlers ---

  const handleOpenModal = (appt?: Appointment, slotTime?: string, slotDate?: Date) => {
    if (appt) {
      // Edit mode
      const startDate = new Date(appt.startTime);
      setEditingId(appt.id);
      setIsBlocking(appt.status === 'BLOCKED');
      setFormData({
        clientId: appt.clientId || '',
        serviceId: appt.serviceId || '',
        professionalId: appt.professionalId,
        date: startDate.toISOString().split('T')[0],
        startTime: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: (new Date(appt.endTime).getTime() - startDate.getTime()) / 60000,
        notes: appt.notes || '',
        status: appt.status
      });
    } else {
      // Create mode
      setEditingId(null);
      setIsBlocking(false);
      
      // If clicked on a slot
      const initialDate = slotDate ? slotDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const initialTime = slotTime || '09:00';

      setFormData({
        ...initialFormState,
        professionalId: selectedProfessionalId !== 'all' ? selectedProfessionalId : (professionals[0]?.id || ''),
        date: initialDate,
        startTime: initialTime
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60000);

    let newAppt: Appointment;

    if (isBlocking) {
      newAppt = {
        id: editingId || Date.now().toString(),
        clientName: 'Bloqueio de Agenda',
        professionalId: formData.professionalId,
        serviceName: 'Indisponível',
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        status: 'BLOCKED',
        price: 0,
        notes: formData.notes
      };
    } else {
      const client = clients.find(c => c.id === formData.clientId);
      const service = services.find(s => s.id === formData.serviceId);
      
      newAppt = {
        id: editingId || Date.now().toString(),
        clientId: client?.id || '',
        clientName: client?.name || 'Cliente Avulso',
        professionalId: formData.professionalId,
        serviceId: service?.id || '',
        serviceName: service?.name || 'Serviço Personalizado',
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        status: formData.status === 'BLOCKED' ? 'SCHEDULED' : formData.status, // Prevent blocked status if not blocking mode
        price: service?.price || 0,
        notes: formData.notes
      };
    }

    if (editingId) {
      onUpdate(newAppt);
    } else {
      onAdd(newAppt);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (editingId && confirm('Tem certeza que deseja excluir?')) {
      onDelete(editingId);
      setIsModalOpen(false);
    }
  };

  // --- Filtering ---
  const filteredAppointments = appointments.filter(appt => {
    if (selectedProfessionalId === 'all') return true;
    return appt.professionalId === selectedProfessionalId;
  });

  const getAppointmentsForDate = (date: Date) => {
    return filteredAppointments.filter(a => {
      const aDate = new Date(a.startTime);
      return aDate.getDate() === date.getDate() &&
             aDate.getMonth() === date.getMonth() &&
             aDate.getFullYear() === date.getFullYear();
    });
  };

  // --- Helpers ---
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getDateTitle = () => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
    return currentDate.toLocaleDateString('pt-BR', options);
  };

  // --- Views ---

  const renderDayView = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-fade-in">
      <div className="grid grid-cols-1 divide-y divide-slate-800">
        {hours.map((hour) => {
          const timeString = `${hour.toString().padStart(2, '0')}:00`;
          const dayAppts = getAppointmentsForDate(currentDate);
          const apptsInHour = dayAppts.filter(a => new Date(a.startTime).getHours() === hour);
          const hasAppt = apptsInHour.length > 0;

          return (
            <div key={hour} className="flex min-h-[100px] group hover:bg-slate-800/50 transition-colors relative">
              <div className="w-20 border-r border-slate-800 p-4 text-slate-500 font-mono text-sm flex flex-col justify-between shrink-0">
                <span>{timeString}</span>
              </div>
              <div 
                className="flex-1 p-2 relative flex gap-2 overflow-x-auto"
                onClick={(e) => {
                  // Only trigger if clicked on the empty space, not on an appointment card
                  if (e.target === e.currentTarget) {
                    handleOpenModal(undefined, timeString, currentDate);
                  }
                }}
              >
                {!hasAppt && (
                  <div className="absolute inset-0 flex items-center pl-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <button className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-xs pointer-events-auto hover:bg-slate-600 border border-slate-600 flex items-center gap-1">
                      <Plus size={12} /> Agendar
                    </button>
                  </div>
                )}
                {apptsInHour.map(appt => (
                  <div 
                    key={appt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(appt);
                    }}
                    className={`
                      min-w-[200px] flex-1 rounded-lg border-l-4 p-3 flex justify-between items-center cursor-pointer transition-all hover:brightness-110
                      ${appt.status === 'BLOCKED' 
                        ? 'bg-red-500/10 border-red-500 opacity-80' 
                        : appt.status === 'COMPLETED' 
                          ? 'bg-green-500/10 border-green-500' 
                          : 'bg-blue-500/10 border-blue-500'}
                    `}
                  >
                    <div>
                      <p className={`font-bold ${appt.status === 'BLOCKED' ? 'text-red-300' : 'text-slate-200'}`}>
                        {appt.status === 'BLOCKED' ? <span className="flex items-center gap-1"><Lock size={12}/> Bloqueado</span> : appt.clientName}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> {new Date(appt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {appt.serviceName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-mono bg-slate-950 px-2 py-1 rounded text-slate-400 border border-slate-800">
                         {users.find(u => u.id === appt.professionalId)?.name.split(' ')[0] || 'Prof.'}
                       </span>
                       {appt.status === 'SCHEDULED' && (
                         <div className="text-green-400 p-1 rounded-full border border-green-500/30">
                           <CheckCircle size={14} />
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekView = () => {
    // Standard week logic: Current date's week (Sun-Sat or Mon-Sun). Let's do Sun-Sat for simplicity.
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto animate-fade-in">
        <div className="min-w-[800px] grid grid-cols-7 divide-x divide-slate-800">
          {weekDays.map((day, i) => {
             const isToday = day.toDateString() === new Date().toDateString();
             const dayAppts = getAppointmentsForDate(day);
             
             return (
              <div key={i} className="min-h-[600px] flex flex-col hover:bg-slate-900/80">
                <div 
                   className={`p-3 text-center border-b border-slate-800 ${isToday ? 'bg-green-500/10' : 'bg-slate-950'}`}
                   onClick={() => handleOpenModal(undefined, '09:00', day)}
                >
                  <p className={`text-xs uppercase font-bold ${isToday ? 'text-green-400' : 'text-slate-500'}`}>
                    {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </p>
                  <p className={`text-lg font-bold ${isToday ? 'text-white' : 'text-slate-300'}`}>
                    {day.getDate()}
                  </p>
                </div>
                <div 
                  className="flex-1 p-2 space-y-2 bg-slate-900/50"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      handleOpenModal(undefined, '09:00', day);
                    }
                  }}
                >
                   {dayAppts.map(appt => (
                     <div 
                       key={appt.id} 
                       onClick={(e) => { e.stopPropagation(); handleOpenModal(appt); }}
                       className={`
                         border-l-2 p-2 rounded text-xs cursor-pointer transition-all hover:scale-[1.02]
                         ${appt.status === 'BLOCKED' 
                           ? 'bg-red-500/10 border-red-500' 
                           : 'bg-blue-500/10 border-blue-500'}
                       `}
                     >
                        <div className="flex justify-between items-start">
                          <span className={`font-bold block truncate ${appt.status === 'BLOCKED' ? 'text-red-300' : 'text-slate-200'}`}>
                             {appt.status === 'BLOCKED' ? 'Bloqueado' : appt.clientName}
                          </span>
                          <span className="text-[10px] text-slate-500">{new Date(appt.startTime).getHours()}:00</span>
                        </div>
                        <span className="text-slate-400 block truncate text-[10px]">{appt.serviceName}</span>
                     </div>
                   ))}
                </div>
              </div>
             )
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); 

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-fade-in">
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="text-xs font-bold text-slate-500 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            if (!day) return <div key={idx} className="h-24 md:h-32 bg-transparent" />;
            
            const isToday = day.toDateString() === new Date().toDateString();
            const dayAppts = getAppointmentsForDate(day);
            const hasAppts = dayAppts.length > 0;
            
            return (
              <div 
                key={idx} 
                onClick={() => handleOpenModal(undefined, '09:00', day)}
                className={`
                  h-24 md:h-32 border rounded-lg p-2 flex flex-col transition-all cursor-pointer relative group
                  ${isToday ? 'border-green-500 bg-green-500/5' : 'border-slate-800 bg-slate-950/50 hover:border-slate-600'}
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-green-500 text-slate-900' : 'text-slate-400'}`}>
                    {day.getDate()}
                  </span>
                  {hasAppts && (
                    <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full border border-slate-700">
                      {dayAppts.length}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 mt-1">
                  {dayAppts.slice(0, 3).map(appt => (
                     <div key={appt.id} className={`text-[10px] px-1.5 py-1 rounded truncate border ${appt.status === 'BLOCKED' ? 'bg-red-500/20 text-red-300 border-red-500/20' : 'bg-blue-500/20 text-blue-200 border-blue-500/10'}`}>
                        {new Date(appt.startTime).getHours()}:00 {appt.status === 'BLOCKED' ? 'Bloqueio' : appt.clientName}
                     </div>
                  ))}
                  {dayAppts.length > 3 && (
                    <div className="text-[10px] text-slate-500 text-center py-0.5">
                      + {dayAppts.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Agenda</h2>
          <div className="flex items-center gap-3 text-slate-400 text-sm">
             <button onClick={() => navigateDate('prev')} className="p-1 hover:bg-slate-800 rounded transition-colors">
               <ChevronLeft size={20} />
             </button>
             <div className="flex items-center gap-2 min-w-[180px] justify-center font-medium text-slate-200">
               <CalendarIcon size={16} className="text-green-500" />
               <span className="capitalize">{getDateTitle()}</span>
             </div>
             <button onClick={() => navigateDate('next')} className="p-1 hover:bg-slate-800 rounded transition-colors">
               <ChevronRight size={20} />
             </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3 items-center">
          
          {/* Professional Selector (Admin Only) */}
          {isAdmin && (
            <select 
               value={selectedProfessionalId}
               onChange={(e) => setSelectedProfessionalId(e.target.value)}
               className="bg-slate-950 text-white text-sm rounded-lg px-3 py-2 border border-slate-800 outline-none focus:border-green-500 w-full sm:w-auto"
             >
               <option value="all">Todos os Profissionais</option>
               {professionals.map(p => (
                 <option key={p.id} value={p.id}>{p.name}</option>
               ))}
             </select>
          )}

          {/* View Switcher */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex overflow-x-auto">
            {(['day', 'week', 'month'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${viewMode === v ? 'bg-slate-800 text-green-400 shadow-sm' : 'text-slate-400 hover:text-white'}
                `}
              >
                {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => handleOpenModal()}
              className="flex-1 sm:flex-none px-4 py-2 bg-green-500 hover:bg-green-400 text-slate-900 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus size={18} /> Agendar
            </button>
          </div>
        </div>
      </div>

      {/* Render Active View */}
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}

      {/* Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                 <h3 className="text-xl font-bold text-white">
                   {editingId ? 'Editar Agendamento' : 'Novo Agendamento'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
              </div>

              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/30 flex gap-4">
                 <button 
                   type="button"
                   onClick={() => setIsBlocking(false)}
                   className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isBlocking ? 'bg-green-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                 >
                   Agendamento
                 </button>
                 <button 
                   type="button"
                   onClick={() => setIsBlocking(true)}
                   className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${isBlocking ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                 >
                   <Lock size={14} /> Bloquear Horário
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                 {/* Only show Client/Service if NOT blocking */}
                 {!isBlocking && (
                   <>
                     <div>
                       <label className="text-xs font-bold text-slate-500 uppercase">Cliente</label>
                       <select 
                         required
                         className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                         value={formData.clientId}
                         onChange={e => setFormData({...formData, clientId: e.target.value})}
                       >
                         <option value="">Selecione um cliente...</option>
                         {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                     </div>

                     <div>
                       <label className="text-xs font-bold text-slate-500 uppercase">Serviço</label>
                       <select 
                         required
                         className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                         value={formData.serviceId}
                         onChange={e => {
                           const service = services.find(s => s.id === e.target.value);
                           setFormData({
                             ...formData, 
                             serviceId: e.target.value,
                             duration: service ? service.durationMinutes : formData.duration
                           });
                         }}
                       >
                         <option value="">Selecione um serviço...</option>
                         {services.map(s => <option key={s.id} value={s.id}>{s.name} - {s.durationMinutes} min</option>)}
                       </select>
                     </div>
                   </>
                 )}

                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="text-xs font-bold text-slate-500 uppercase">Profissional</label>
                       <select 
                         required
                         disabled={currentUser.role === UserRole.PROFESSIONAL}
                         className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1 disabled:opacity-50"
                         value={formData.professionalId}
                         onChange={e => setFormData({...formData, professionalId: e.target.value})}
                       >
                         {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                       </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
                      <input 
                        type="date"
                        required
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Horário</label>
                      <input 
                        type="time"
                        required
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                        value={formData.startTime}
                        onChange={e => setFormData({...formData, startTime: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Duração (min)</label>
                      <input 
                        type="number"
                        required
                        min="5"
                        step="5"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                        value={formData.duration}
                        onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})}
                      />
                    </div>
                    
                    {!isBlocking && (
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                        <select 
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                          value={formData.status}
                          onChange={e => setFormData({...formData, status: e.target.value as any})}
                        >
                          <option value="SCHEDULED">Agendado</option>
                          <option value="COMPLETED">Concluído</option>
                          <option value="CANCELLED">Cancelado</option>
                        </select>
                      </div>
                    )}
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Observações {isBlocking ? '/ Motivo' : ''}</label>
                    <textarea 
                       className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1 h-20 resize-none"
                       value={formData.notes}
                       onChange={e => setFormData({...formData, notes: e.target.value})}
                       placeholder={isBlocking ? "Ex: Almoço, Folga, Médico..." : "Preferências do cliente..."}
                    />
                 </div>

                 <div className="flex gap-3 pt-2">
                    {editingId && (
                      <button 
                        type="button" 
                        onClick={handleDelete}
                        className="px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button 
                      type="submit"
                      className={`flex-1 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${isBlocking ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-green-500 hover:bg-green-400 text-slate-900'}`}
                    >
                       <CheckCircle size={20} /> {editingId ? 'Salvar Alterações' : (isBlocking ? 'Bloquear Horário' : 'Confirmar Agendamento')}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
