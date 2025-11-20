export enum SystemStatus {
  Active = 'active',
  Paused = 'paused',
  Error = 'error',
}

export interface System {
  id: string; // Changed from number to string to match n8n API
  name: string;
  description: string;
  category: string;
  status: SystemStatus;
  revenue: number;
  conversions: number;
  roi: number;
}

export enum View {
  Dashboard = 'dashboard',
  AllSystems = 'all-systems',
  Marketing = 'marketing',
  Ecommerce = 'ecommerce',
  Social = 'social',
  Productivity = 'productivity',
  Education = 'education',
  Finance = 'finance',
  HR = 'hr',
  Support = 'support',
  Analytics = 'analytics',
  Integrations = 'integrations',
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    audioData?: string;
    sources?: any[];
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'not_configured';