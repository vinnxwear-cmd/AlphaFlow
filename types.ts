
export enum UserRole {
  ADMIN = 'ADMIN',
  PROFESSIONAL = 'PROFESSIONAL',
  RECEPTIONIST = 'RECEPTIONIST'
}

export enum AppMode {
  BARBER = 'BARBER',
  CLINIC = 'CLINIC'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    zipCode: string;
  };
  lastVisit?: string;
  totalSpent: number;
  notes?: string;
  medicalRecord?: string; // For Clinics
}

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  category: string;
  commissionPercentage?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  commissionPercentage?: number;
}

export interface Appointment {
  id: string;
  clientId?: string; // Optional for Block
  clientName: string; 
  professionalId: string;
  serviceId?: string; // Optional for Block
  serviceName: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'BLOCKED';
  price: number;
  notes?: string;
}

export interface FinancialRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  professionalId?: string;
}

export interface DashboardStats {
  todayRevenue: number;
  appointmentsCount: number;
  newClients: number;
  occupancyRate: number;
}

export interface SystemConfig {
  name: string;
  logoUrl?: string;
}
