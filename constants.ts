
import { User, UserRole, Client, Service, Appointment, FinancialRecord, Product } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin Master',
    email: 'admin@alphaflow.com',
    password: 'admin',
    role: UserRole.ADMIN,
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin+Master&background=10b981&color=fff'
  }
];

export const MOCK_CLIENTS: Client[] = [];

export const MOCK_SERVICES_BARBER: Service[] = [];

export const MOCK_SERVICES_CLINIC: Service[] = [];

export const MOCK_PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    name: 'Pomada Modeladora Matte', 
    price: 35.00, 
    stock: 15, 
    category: 'Cabelo', 
    commissionPercentage: 10
  },
  { 
    id: 'p2', 
    name: 'Óleo para Barba Premium', 
    price: 45.00, 
    stock: 8, 
    category: 'Barba', 
    commissionPercentage: 15
  },
  { 
    id: 'p3', 
    name: 'Shampoo Anti-queda', 
    price: 55.00, 
    stock: 12, 
    category: 'Cabelo', 
    commissionPercentage: 10
  },
  { 
    id: 'p4', 
    name: 'Gel Fixador Extra Forte', 
    price: 25.00, 
    stock: 20, 
    category: 'Cabelo', 
    commissionPercentage: 5
  },
  {
    id: 'p5',
    name: 'Balm Hidratante',
    price: 30.00, 
    stock: 10, 
    category: 'Barba', 
    commissionPercentage: 10
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [];

export const MOCK_FINANCIALS: FinancialRecord[] = [];
