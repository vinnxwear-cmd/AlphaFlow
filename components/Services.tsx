
import React, { useState } from 'react';
import { Service, AppMode } from '../types';
import { Plus, Edit2, Trash2, X, Clock, DollarSign, Tag, CheckCircle, Percent } from 'lucide-react';

interface ServicesProps {
  services: Service[];
  mode: AppMode;
  onAdd: (service: Omit<Service, 'id'>) => void;
  onUpdate: (service: Service) => void;
  onDelete: (id: string) => void;
}

const Services: React.FC<ServicesProps> = ({ services, mode, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    durationMinutes: 30,
    price: 0,
    category: '',
    commissionPercentage: 0
  });

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        durationMinutes: service.durationMinutes,
        price: service.price,
        category: service.category,
        commissionPercentage: service.commissionPercentage || 0
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', durationMinutes: 30, price: 0, category: '', commissionPercentage: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      onUpdate({ ...editingService, ...formData });
    } else {
      onAdd(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Serviços</h2>
          <p className="text-slate-400">Gerencie o catálogo de serviços da {mode === AppMode.BARBER ? 'Barbearia' : 'Clínica'}.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-green-500 hover:bg-green-400 text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Novo Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group relative">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                  {service.category}
                </span>
                <h3 className="font-bold text-white text-lg mt-2">{service.name}</h3>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(service)}
                  className="p-2 bg-slate-800 text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(service.id)}
                  className="p-2 bg-slate-800 text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock size={16} className="text-slate-500" />
                <span>{service.durationMinutes} minutos</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <DollarSign size={16} className="text-green-500" />
                  <span className="text-green-400 font-bold text-lg">R$ {service.price.toFixed(2)}</span>
                </div>
                {service.commissionPercentage !== undefined && (
                   <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
                     Comissão: {service.commissionPercentage}%
                   </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Serviço</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-green-500"
                  placeholder="Ex: Corte Degradê"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Preço (R$)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Duração (min)</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="number" 
                      required
                      min="5"
                      step="5"
                      value={formData.durationMinutes}
                      onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Categoria</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      required
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white focus:outline-none focus:border-green-500"
                      placeholder="Ex: Cabelo"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Comissão (%)</label>
                  <div className="relative">
                    <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="number" 
                      required
                      min="0"
                      max="100"
                      value={formData.commissionPercentage}
                      onChange={e => setFormData({...formData, commissionPercentage: parseFloat(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle size={20} /> Salvar Serviço
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
