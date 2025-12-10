
import React, { useState } from 'react';
import { Client, AppMode } from '../types';
import { Phone, MessageCircle, FileText, Search, Plus, MapPin, X, Save, User } from 'lucide-react';

interface ClientsProps {
  clients: Client[];
  mode: AppMode;
  onAdd: (client: Client) => void;
  onUpdate: (client: Client) => void;
}

const Clients: React.FC<ClientsProps> = ({ clients, mode, onAdd, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Client>>({});

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const openFormModal = (client?: Client) => {
    if (client) {
      setFormData({ ...client });
      setIsEditing(true);
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: { street: '', number: '', neighborhood: '', city: '', zipCode: '' },
        totalSpent: 0,
        notes: ''
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
    setIsDetailsOpen(false);
  };

  const openDetailsModal = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && formData.id) {
       onUpdate(formData as Client);
    } else {
       onAdd({ ...formData, id: Date.now().toString(), totalSpent: 0 } as Client);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">{mode === AppMode.BARBER ? 'Clientes' : 'Pacientes'}</h2>
          <p className="text-slate-400">Base de contatos e histórico completo.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-green-500 w-full md:w-64"
            />
          </div>
          <button 
            onClick={() => openFormModal()}
            className="bg-green-500 hover:bg-green-400 text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={20} /> Novo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-green-500/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-green-400 border border-slate-700">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">{client.name}</h3>
                  <p className="text-xs text-slate-500">Última visita: {client.lastVisit ? new Date(client.lastVisit).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
               {mode === AppMode.CLINIC && client.medicalRecord && (
                 <div className="text-xs bg-red-900/20 text-red-300 p-2 rounded border border-red-900/30 truncate">
                    <strong>Alerta:</strong> {client.medicalRecord}
                 </div>
               )}
               {client.address && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                    <MapPin size={12} />
                    {client.address.city} - {client.address.neighborhood}
                  </div>
               )}
               <div className="flex justify-between text-sm text-slate-400 border-b border-slate-800 pb-2">
                 <span>Total investido</span>
                 <span className="text-green-400 font-mono">R$ {client.totalSpent.toFixed(2)}</span>
               </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleWhatsApp(client.phone)}
                className="flex-1 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600/30 transition-colors text-sm font-medium"
              >
                <MessageCircle size={16} /> WhatsApp
              </button>
              <button 
                onClick={() => openDetailsModal(client)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                <FileText size={16} /> Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {isDetailsOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-green-500 border border-slate-700">
                   {selectedClient.name.charAt(0)}
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-white">{selectedClient.name}</h2>
                   <p className="text-slate-400 text-sm flex items-center gap-2"><Phone size={14} /> {selectedClient.phone}</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <button 
                   onClick={() => openFormModal(selectedClient)}
                   className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-bold"
                 >
                   Editar
                 </button>
                 <button onClick={() => setIsDetailsOpen(false)} className="text-slate-400 hover:text-white p-2">
                   <X size={24} />
                 </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Info Column */}
                  <div className="space-y-4">
                     <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Informações Pessoais</h3>
                     <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-slate-500">Email</p>
                          <p className="text-slate-200">{selectedClient.email || '-'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Endereço</p>
                          <p className="text-slate-200">
                            {selectedClient.address ? `${selectedClient.address.street}, ${selectedClient.address.number}` : '-'}
                          </p>
                          <p className="text-slate-400 text-xs">
                             {selectedClient.address ? `${selectedClient.address.neighborhood} - ${selectedClient.address.city}` : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Observações</p>
                          <p className="text-slate-200 italic">{selectedClient.notes || 'Nenhuma observação.'}</p>
                        </div>
                     </div>
                  </div>

                  {/* History Column */}
                  <div className="space-y-4">
                     <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Histórico</h3>
                     <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 text-center">
                        <p className="text-slate-500 text-sm">Total Gasto</p>
                        <p className="text-3xl font-bold text-green-400">R$ {selectedClient.totalSpent.toFixed(2)}</p>
                     </div>
                     <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                        <p className="text-slate-500 text-sm mb-2">Últimos Atendimentos</p>
                        {/* Mock history list */}
                        <div className="space-y-2">
                           <div className="flex justify-between text-xs text-slate-300 border-b border-slate-800 pb-1">
                              <span>20/10/2023</span>
                              <span>Corte de Cabelo</span>
                           </div>
                           <div className="flex justify-between text-xs text-slate-300 border-b border-slate-800 pb-1">
                              <span>15/09/2023</span>
                              <span>Barba</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                      <input 
                        required
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Celular / WhatsApp</label>
                      <input 
                        required
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                        value={formData.phone || ''}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                      <input 
                        type="email"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                        value={formData.email || ''}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                 </div>

                 <div className="border-t border-slate-800 pt-4">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><MapPin size={14} /> Endereço</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="col-span-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Rua</label>
                          <input 
                             className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                             value={formData.address?.street || ''}
                             onChange={e => setFormData({...formData, address: {...formData.address!, street: e.target.value}})}
                          />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Número</label>
                          <input 
                             className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                             value={formData.address?.number || ''}
                             onChange={e => setFormData({...formData, address: {...formData.address!, number: e.target.value}})}
                          />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Bairro</label>
                          <input 
                             className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                             value={formData.address?.neighborhood || ''}
                             onChange={e => setFormData({...formData, address: {...formData.address!, neighborhood: e.target.value}})}
                          />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Cidade</label>
                          <input 
                             className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                             value={formData.address?.city || ''}
                             onChange={e => setFormData({...formData, address: {...formData.address!, city: e.target.value}})}
                          />
                       </div>
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Observações</label>
                    <textarea 
                       className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1 h-20 resize-none"
                       value={formData.notes || ''}
                       onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                 </div>

                 <button className="w-full bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Save size={20} /> Salvar Cliente
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
