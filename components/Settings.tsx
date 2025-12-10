import React, { useState, useRef } from 'react';
import { SystemConfig, User, UserRole } from '../types';
import { Save, Image, Type, Upload, Trash2, User as UserIcon, Lock } from 'lucide-react';

interface SettingsProps {
  config: SystemConfig;
  onUpdateSystem: (config: SystemConfig) => void;
  currentUser: User;
  onUpdateUser: (user: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ config, onUpdateSystem, currentUser, onUpdateUser }) => {
  // System Config State
  const [systemFormData, setSystemFormData] = useState<SystemConfig>(config);
  
  // Profile Config State
  const [profileFormData, setProfileFormData] = useState({
    name: currentUser.name,
    password: currentUser.password || '',
    avatarUrl: currentUser.avatarUrl || ''
  });

  const [successMsg, setSuccessMsg] = useState('');
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser.role === UserRole.ADMIN;

  // --- Profile Handlers ---
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name: profileFormData.name,
      password: profileFormData.password,
      avatarUrl: profileFormData.avatarUrl
    });
    showSuccess('Perfil atualizado com sucesso!');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileFormData({ ...profileFormData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setProfileFormData({ ...profileFormData, avatarUrl: '' });
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  // --- System Handlers ---
  const handleSystemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSystem(systemFormData);
    showSuccess('Configurações do sistema salvas!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSystemFormData({ ...systemFormData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setSystemFormData({ ...systemFormData, logoUrl: '' });
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-8 pb-10">
       <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">Configurações</h2>
            <p className="text-slate-400">Gerencie seu perfil e as preferências do sistema.</p>
          </div>
          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-lg animate-fade-in font-medium">
              {successMsg}
            </div>
          )}
       </div>

       {/* --- PERFIL DO USUÁRIO (Todos os usuários) --- */}
       <div className="max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <UserIcon className="text-green-500" size={24} /> Meu Perfil
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
             {/* Avatar Section */}
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Foto de Perfil</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden relative group">
                     {profileFormData.avatarUrl ? (
                       <>
                         <img src={profileFormData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={removeAvatar} className="text-red-400 hover:text-red-300"><Trash2 size={20}/></button>
                         </div>
                       </>
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-500">
                         <UserIcon size={32} />
                       </div>
                     )}
                  </div>
                  <div>
                    <input 
                      type="file" 
                      ref={avatarInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label 
                      htmlFor="avatar-upload"
                      className="cursor-pointer inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 transition-colors text-sm font-medium"
                    >
                      <Upload size={16} /> Alterar Foto
                    </label>
                    <p className="text-xs text-slate-500 mt-2">Recomendado: 300x300px</p>
                  </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={profileFormData.name}
                    onChange={e => setProfileFormData({...profileFormData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Lock size={14} /> Senha
                  </label>
                  <input 
                    type="password" 
                    value={profileFormData.password}
                    onChange={e => setProfileFormData({...profileFormData, password: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                    placeholder="Deixe vazio para manter"
                  />
               </div>
             </div>
             
             <div className="flex justify-end">
               <button 
                 type="submit"
                 className="bg-green-500 hover:bg-green-400 text-slate-900 font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-all"
               >
                 <Save size={18} /> Salvar Perfil
               </button>
             </div>
          </form>
       </div>

       {/* --- CONFIG DO SISTEMA (Apenas Admin) --- */}
       {isAdmin && (
         <div className="max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            {/* Admin Badge */}
            <div className="absolute top-0 right-0 bg-purple-600/20 text-purple-400 px-3 py-1 rounded-bl-lg text-xs font-bold border-b border-l border-purple-600/30">
              Área Administrativa
            </div>

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Type className="text-purple-500" size={24} /> Identidade Visual
            </h3>

            <form onSubmit={handleSystemSubmit} className="space-y-6">
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nome da Empresa</label>
                  <input 
                    type="text" 
                    value={systemFormData.name}
                    onChange={e => setSystemFormData({...systemFormData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-green-500 outline-none transition-colors"
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Logo do Sistema</label>
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 bg-slate-950 border border-slate-700 rounded-lg flex items-center justify-center overflow-hidden relative group">
                      {systemFormData.logoUrl ? (
                        <>
                          <img src={systemFormData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <button type="button" onClick={removeLogo} className="text-red-400 hover:text-red-300"><Trash2 size={20} /></button>
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-600 flex flex-col items-center">
                          <Image size={24} />
                          <span className="text-[10px] mt-1">Sem Logo</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="file" 
                        ref={logoInputRef}
                        onChange={handleLogoUpload}
                        accept="image/png, image/jpeg, image/jpg"
                        className="hidden"
                        id="logo-upload"
                      />
                      <label 
                        htmlFor="logo-upload"
                        className="cursor-pointer inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 transition-colors text-sm font-medium"
                      >
                        <Upload size={16} /> Carregar Logo
                      </label>
                      <p className="text-xs text-slate-500 mt-2">
                        Formatos: JPEG, PNG. Fundo transparente recomendado.
                      </p>
                    </div>
                  </div>
               </div>
               
               {/* Preview Bar */}
               <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-sm text-slate-500">Pré-visualização:</span>
                  <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 rounded border border-slate-800">
                     {systemFormData.logoUrl ? (
                        <img src={systemFormData.logoUrl} alt="Logo Preview" className="w-8 h-8 object-contain rounded" />
                     ) : (
                        <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center font-bold text-slate-900">
                           {systemFormData.name.charAt(0)}
                        </div>
                     )}
                     <span className="font-bold text-white">{systemFormData.name}</span>
                  </div>
               </div>

               <div className="flex justify-end">
                 <button 
                   type="submit"
                   className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20"
                 >
                   <Save size={18} /> Salvar Sistema
                 </button>
               </div>
            </form>
         </div>
       )}
    </div>
  );
};

export default Settings;