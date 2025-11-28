
// Part A: Data Structure & Schema (Relational Architecture)

// --- Enums for Strict Categorization ---

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum IncomeCategory {
  PROJECT_PAYMENT = 'PROJECT_PAYMENT', // Linked to an Invoice/Project
  MATERIAL_SALE = 'MATERIAL_SALE',     // Over-the-counter sale
  SERVICE_FEE = 'SERVICE_FEE',         // Design fees, consultation
  OTHER = 'OTHER'
}

export enum ExpenseCategory {
  PROJECT_MATERIAL = 'PROJECT_MATERIAL', // Direct Cost of Goods Sold (COGS)
  OVERHEAD = 'OVERHEAD',                 // Rent, Utilities, Salaries
  TOOL_PURCHASE = 'TOOL_PURCHASE',       // Assets
  RESTOCK_INVENTORY = 'RESTOCK_INVENTORY' // Buying Stock
}

export enum ProjectStatus {
  ESTIMATE = 'ESTIMATE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum DocStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED', // For Quotes
  PAID = 'PAID',         // For Invoices
  PARTIAL = 'PARTIAL',   // For Invoices
  OVERDUE = 'OVERDUE'
}

// --- Core Models ---

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  gpsLocation?: { lat: number; lng: number };
  email: string;
  notes: string;
}

export interface Project {
  id: string;
  clientId: string; // ForeignKey -> Client
  name: string;
  type: 'KITCHEN' | 'WARDROBE' | 'OFFICE' | 'OTHER';
  status: ProjectStatus;
  startDate: string;
  deadline?: string;
  budget: number; // The generic budget, superseded by Quotes
  description: string;
}

// --- Inventory & Job Costing ---

export interface Material {
  id: string;
  name: string; // e.g., "MDF 18mm White"
  unit: string; // "Sheet", "Box", "Liter"
  costPerUnit: number; // Moving Average Cost ideally
  currentStock: number;
  minStockLevel: number;
}

export interface MaterialUsage {
  id: string;
  projectId: string; // ForeignKey -> Project
  materialId: string; // ForeignKey -> Material
  quantity: number;
  costAtTimeOfUse: number; // Freeze the cost at the moment of consumption
  date: string;
}

// --- Documents (Workflow) ---

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  projectId: string; // ForeignKey -> Project
  date: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: DocStatus; // DRAFT -> SENT -> ACCEPTED
}

export interface Invoice {
  id: string;
  projectId: string; // ForeignKey -> Project
  quoteId?: string; // OneToOne (Optional) -> Quote
  date: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: DocStatus; // SENT -> PARTIAL -> PAID
}

// --- Finance (The Money Trail) ---

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: IncomeCategory | ExpenseCategory;
  description: string;
  
  // The "Liaisons"
  projectId?: string; // Link to Project
  invoiceId?: string; // Link to Invoice (Income)
  clientId?: string;  // Link to Client (Direct)
}

// --- Settings & Configuration ---

export interface AppSettings {
  companyName: string;
  legalIds: {
    ice: string; // Identifiant Commun de l'Entreprise
    rc: string;  // Registre de Commerce
    if: string;  // Identifiant Fiscal
    patente: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  logoUrl?: string; // Base64 or URL
  smtp?: {
    host: string;
    port: number;
    user: string;
    secure: boolean;
  };
}

// --- Analysis View Objects ---

export interface ClientFinancialProfile {
  totalInvoiced: number;
  totalPaid: number;
  totalMaterialCost: number;
  netProfit: number;
  projectCount: number;
}

export interface SmartInsight {
  title: string;
  description: string;
  type: 'WARNING' | 'OPPORTUNITY' | 'INFO';
  metric?: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  type: 'TRANSACTION' | 'INVOICE' | 'USAGE' | 'PROJECT';
  description: string;
  amount?: number;
  referenceId?: string; // ID of the related object
  meta?: any; // Extra display info
}
