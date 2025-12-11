
import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  CheckSquare, 
  DollarSign, 
  LogOut, 
  Menu,
  Package,
  ShoppingBag,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { User, AppMode, SystemConfig, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  mode: AppMode;
  systemConfig: SystemConfig;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  user, 
  mode,
  systemConfig,
  onLogout
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'schedule', label: 'Agenda', icon: <Calendar size={20} /> },
    { id: 'pos', label: 'Caixa / PDV', icon: <ShoppingBag size={20} /> },
    { id: 'clients', label: mode === AppMode.BARBER ? 'Clientes' : 'Pacientes', icon: <Users size={20} /> },
    { id: 'services', label: 'Serviços', icon: <CheckSquare size={20} /> },
    { id: 'products', label: 'Produtos', icon: <Package size={20} /> },
    { id: 'financial', label: 'Financeiro', icon: <DollarSign size={20} /> },
    { id: 'team', label: 'Equipe', icon: <ShieldCheck size={20} /> },
    { id: 'settings', label: 'Configurações', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30 w-64 h-full bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          {systemConfig.logoUrl ? (
             <img src={systemConfig.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
          ) : (
             <div className="w-8 h-8 rounded bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center font-bold text-slate-900">
                {systemConfig.name.charAt(0)}
             </div>
          )}
          <h1 className="text-xl font-bold text-white tracking-tight truncate">{systemConfig.name}</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 px-2">
            <img 
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
              alt="User" 
              className="w-10 h-10 rounded-full border border-slate-700" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.role}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-slate-950 border-b border-slate-800 flex items-center px-4 justify-between">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center font-bold text-slate-900">
               {systemConfig.name.charAt(0)}
             </div>
             <span className="font-bold text-white truncate max-w-[150px]">{systemConfig.name}</span>
           </div>
           <button onClick={() => setSidebarOpen(true)} className="text-slate-200">
             <Menu size={24} />
           </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
