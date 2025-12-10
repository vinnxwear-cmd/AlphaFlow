
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, Plus, Edit2, Check, X, Lock } from 'lucide-react';

interface TeamProps {
  currentUser: User;
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
}

const Team: React.FC<TeamProps> = ({ currentUser, users, onAddUser, onUpdateUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.PROFESSIONAL,
    avatarUrl: ''
  });

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: user.password || '',
        role: user.role,
        avatarUrl: user.avatarUrl || ''
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: UserRole.PROFESSIONAL, avatarUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser({ ...editingUser, ...formData });
    } else {
      onAddUser(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Equipe</h2>
          <p className="text-slate-400">Gerencie usuários e permissões.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-green-500 hover:bg-green-400 text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
          >
            <Plus size={20} /> Novo Usuário
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div key={user.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all relative">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                alt={user.name} 
                className="w-16 h-16 rounded-full border-2 border-slate-700"
              />
              <div>
                 <h3 className="text-lg font-bold text-white">{user.name}</h3>
                 <span className={`text-xs px-2 py-0.5 rounded border ${
                    user.role === UserRole.ADMIN ? 'bg-purple-900/30 text-purple-400 border-purple-800' : 
                    'bg-slate-800 text-slate-400 border-slate-700'
                 }`}>
                    {user.role}
                 </span>
                 <p className="text-xs text-slate-500 mt-1">{user.email}</p>
              </div>
            </div>

            {/* Actions */}
            {(isAdmin || currentUser.id === user.id) && (
               <button 
                 onClick={() => handleOpenModal(user)}
                 className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors border border-slate-700"
               >
                 <Edit2 size={14} /> Editar Perfil
               </button>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
             <div className="flex justify-between items-center p-5 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white">
                  {editingUser ? (currentUser.id === editingUser.id ? 'Meu Perfil' : 'Editar Usuário') : 'Novo Usuário'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Nome</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                  <input 
                    type="email"
                    required
                    disabled={editingUser && currentUser.id !== editingUser.id && !isAdmin}
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1 disabled:opacity-50"
                  />
                </div>
                
                {/* Only Admin can change role, and not their own role to something else if they are the only admin (simplified logic here) */}
                {isAdmin && currentUser.id !== editingUser?.id && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Cargo</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                    >
                      <option value={UserRole.PROFESSIONAL}>Profissional</option>
                      <option value={UserRole.ADMIN}>Admin</option>
                      <option value={UserRole.RECEPTIONIST}>Recepcionista</option>
                    </select>
                  </div>
                )}

                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Lock size={12}/> Senha</label>
                   <input 
                     type="password"
                     placeholder={editingUser ? "Deixe em branco para manter" : "Crie uma senha"}
                     value={formData.password}
                     onChange={e => setFormData({...formData, password: e.target.value})}
                     className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-green-500 outline-none mt-1"
                     required={!editingUser} // Required only on creation
                   />
                </div>

                <button className="w-full bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-3 rounded-lg mt-2 flex items-center justify-center gap-2">
                   <Check size={20} /> Salvar
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
