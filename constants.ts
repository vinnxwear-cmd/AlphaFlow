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

export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_APPOINTMENTS: Appointment[] = [];

export const MOCK_FINANCIALS: FinancialRecord[] = [];