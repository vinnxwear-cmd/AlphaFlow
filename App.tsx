
import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import Layout from './componentes/Layout';
import Dashboard from './componentes/Dashboard';
import Schedule from './componentes/Schedule';
import Clients from './componentes/Clients';
import Financial from './componentes/Financial';
import Services from './componentes/Services';
import Products from './componentes/Products';
import Login from './componentes/Login';
import POS, { CartItem } from './componentes/POS';
import Team from './componentes/Team';
import Settings from './componentes/Settings';
import { AppMode, Service, Product, Client, FinancialRecord, User, SystemConfig, UserRole, Appointment } from './types';
import { 
  MOCK_USERS, 
  MOCK_APPOINTMENTS, 
  MOCK_CLIENTS, 
  MOCK_FINANCIALS, 
  MOCK_SERVICES_BARBER, 
  MOCK_SERVICES_CLINIC,
  MOCK_PRODUCTS
} from './constants';

const App: React.FC = () => {
  // Initialize with null to show Login screen
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appMode, setAppMode] = useState<AppMode>(AppMode.BARBER);
  
  // Data State
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES_BARBER);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [financials, setFinancials] = useState<FinancialRecord[]>(MOCK_FINANCIALS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  
  // System Config State
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    name: 'AlphaFlow',
    logoUrl: ''
  });

  // Update services when mode changes (just for mock purposes)
  useEffect(() => {
    setServices(appMode === AppMode.BARBER ? MOCK_SERVICES_BARBER : MOCK_SERVICES_CLINIC);
  }, [appMode]);

  // --- Handlers for User Management ---
  const handleAddUser = (newUser: Omit<User, 'id'>) => {
    const user: User = {
      ...newUser,
      id: Math.random().toString(36).substr(2, 9)
    };
    setUsers([...users, user]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    // If current user updated themselves, update state
    if (currentUser && currentUser.id === updatedUser.id) {
       setCurrentUser(updatedUser);
    }
  };

  // --- Handlers for Clients ---
  const handleAddClient = (newClient: Client) => {
    setClients([...clients, newClient]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  // --- Handlers for Services ---
  const handleAddService = (newService: Omit<Service, 'id'>) => {
    const service: Service = { ...newService, id: Math.random().toString(36).substr(2, 9) };
    setServices([...services, service]);
  };
  const handleUpdateService = (updatedService: Service) => setServices(services.map(s => s.id === updatedService.id ? updatedService : s));
  const handleDeleteService = (id: string) => setServices(services.filter(s => s.id !== id));

  // --- Handlers for Products ---
  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const product: Product = { ...newProduct, id: Math.random().toString(36).substr(2, 9) };
    setProducts([...products, product]);
  };
  const handleUpdateProduct = (updatedProduct: Product) => setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  const handleDeleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));

  // --- Handlers for Appointments ---
  const handleAddAppointment = (appt: Appointment) => {
    setAppointments([...appointments, appt]);
  };
  const handleUpdateAppointment = (appt: Appointment) => {
    setAppointments(appointments.map(a => a.id === appt.id ? appt : a));
  };
  const handleDeleteAppointment = (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
  };

  // --- Handlers for POS Sale ---
  const handleFinalizeSale = (items: CartItem[], client: Client | null, paymentMethod: string, total: number) => {
    // 1. Update Product Stock
    const updatedProducts = products.map(p => {
      const cartItem = items.find(i => i.id === p.id && i.type === 'PRODUCT');
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });
    setProducts(updatedProducts);

    // 2. Add Financial Record
    const newRecord: FinancialRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      description: `Venda Caixa - ${client ? client.name : 'Consumidor'}`,
      amount: total,
      type: 'INCOME',
      category: 'Vendas'
    };
    setFinancials([newRecord, ...financials]);

    // Optional: Update client total spent
    if (client) {
      setClients(clients.map(c => {
        if (c.id === client.id) {
          return { ...c, totalSpent: c.totalSpent + total, lastVisit: new Date().toISOString().split('T')[0] };
        }
        return c;
      }));
    }
  };

  if (!currentUser) {
    return (
      <Login 
        onLogin={setCurrentUser} 
        users={users} 
        systemName={systemConfig.name}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={{ todayRevenue: 0, appointmentsCount: 0, newClients: 0, occupancyRate: 0 }} 
            financialData={financials} 
            appointments={appointments}
            users={users}
            currentUser={currentUser}
            services={services}
            onNavigate={setActiveTab}
          />
        );
      case 'schedule':
        return (
          <Schedule 
            appointments={appointments} 
            mode={appMode} 
            users={users}
            currentUser={currentUser}
            clients={clients}
            services={services}
            onAdd={handleAddAppointment}
            onUpdate={handleUpdateAppointment}
            onDelete={handleDeleteAppointment}
          />
        );
      case 'pos':
        return <POS products={products} services={services} clients={clients} onFinalizeSale={handleFinalizeSale} />;
      case 'clients':
        return <Clients clients={clients} mode={appMode} onAdd={handleAddClient} onUpdate={handleUpdateClient} />;
      case 'services':
        return <Services services={services} mode={appMode} onAdd={handleAddService} onUpdate={handleUpdateService} onDelete={handleDeleteService} />;
      case 'products':
        return <Products products={products} onAdd={handleAddProduct} onUpdate={handleUpdateProduct} onDelete={handleDeleteProduct} />;
      case 'financial':
        return (
          <Financial 
            records={financials} 
            currentUser={currentUser} 
            users={users}
            appointments={appointments}
            services={services}
          />
        );
      case 'team':
        return <Team currentUser={currentUser} users={users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} />;
      case 'settings':
         return (
           <Settings 
             config={systemConfig} 
             onUpdateSystem={setSystemConfig} 
             currentUser={currentUser}
             onUpdateUser={handleUpdateUser}
           />
         );
      default:
        return (
          <Dashboard 
            stats={{ todayRevenue: 0, appointmentsCount: 0, newClients: 0, occupancyRate: 0 }} 
            financialData={financials} 
            appointments={appointments}
            users={users}
            currentUser={currentUser}
            services={services}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  return (
    <HashRouter>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={currentUser}
        mode={appMode}
        systemConfig={systemConfig}
        onLogout={() => setCurrentUser(null)}
      >
        {renderContent()}
      </Layout>
    </HashRouter>
  );
};

export default App;
