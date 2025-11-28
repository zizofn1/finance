import { 
  Client, Project, Transaction, Material, MaterialUsage, 
  TransactionType, IncomeCategory, ExpenseCategory, ProjectStatus,
  Quote, Invoice, DocStatus, ClientFinancialProfile, AppSettings, HistoryItem
} from '../types';

// --- PERSISTENCE HELPERS ---
const STORAGE_KEYS = {
  CLIENTS: 'jp_clients',
  MATERIALS: 'jp_materials',
  PROJECTS: 'jp_projects',
  USAGE: 'jp_usage',
  QUOTES: 'jp_quotes',
  INVOICES: 'jp_invoices',
  TRANSACTIONS: 'jp_transactions',
  SETTINGS: 'jp_settings'
};

const load = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const save = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- DEFAULT SETTINGS ---
const defaultSettings: AppSettings = {
  companyName: 'Fun Design F&Z',
  legalIds: { ice: '', rc: '', if: '', patente: '' },
  contact: { email: '', phone: '', address: '' }
};

// --- DATABASE STATE ---
let clients: Client[] = load(STORAGE_KEYS.CLIENTS, []);
let materials: Material[] = load(STORAGE_KEYS.MATERIALS, []);
let projects: Project[] = load(STORAGE_KEYS.PROJECTS, []);
let materialUsage: MaterialUsage[] = load(STORAGE_KEYS.USAGE, []);
let quotes: Quote[] = load(STORAGE_KEYS.QUOTES, []);
let invoices: Invoice[] = load(STORAGE_KEYS.INVOICES, []);
let transactions: Transaction[] = load(STORAGE_KEYS.TRANSACTIONS, []);
let settings: AppSettings = load(STORAGE_KEYS.SETTINGS, defaultSettings);

// --- LOGIC LAYER ---

export const dataService = {
  // Getters
  getClients: () => [...clients],
  getMaterials: () => [...materials],
  getProjects: () => [...projects],
  getMaterialUsage: () => [...materialUsage],
  getTransactions: () => [...transactions],
  getQuotes: () => [...quotes],
  getInvoices: () => [...invoices],
  getSettings: () => ({...settings}),

  // Setters
  saveSettings: (newSettings: AppSettings) => {
    settings = newSettings;
    save(STORAGE_KEYS.SETTINGS, settings);
  },

  addClient: (client: Client) => {
    clients = [...clients, client];
    save(STORAGE_KEYS.CLIENTS, clients);
    return client;
  },

  addProject: (project: Project) => {
    projects = [...projects, project];
    save(STORAGE_KEYS.PROJECTS, projects);
    return project;
  },

  addMaterial: (material: Material) => {
    materials = [...materials, material];
    save(STORAGE_KEYS.MATERIALS, materials);

    // CRITICAL FIX: Inventory Purchase = Expense
    // Automatically create an expense transaction for the initial stock purchase
    if (material.costPerUnit > 0 && material.currentStock > 0) {
      const expenseAmount = material.costPerUnit * material.currentStock;
      const transaction: Transaction = {
        id: `t_auto_${Date.now()}`,
        date: new Date().toISOString(),
        amount: expenseAmount,
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.RESTOCK_INVENTORY,
        description: `Achat Stock: ${material.name} (${material.currentStock} ${material.unit})`
      };
      transactions = [...transactions, transaction];
      save(STORAGE_KEYS.TRANSACTIONS, transactions);
    }

    return material;
  },

  updateStock: (materialId: string, newQuantity: number) => {
    // Note: If we were implementing full restock logic here, we should also ask for cost 
    // and create a transaction. For now, assuming direct adjustment.
    materials = materials.map(m => m.id === materialId ? { ...m, currentStock: newQuantity } : m);
    save(STORAGE_KEYS.MATERIALS, materials);
  },

  addTransaction: (transaction: Transaction) => {
    transactions = [...transactions, transaction];
    save(STORAGE_KEYS.TRANSACTIONS, transactions);
    return transaction;
  },

  // --- BUSINESS LOGIC ---

  // 1. Dashboard Stats with Accurate Trends
  getFinancialStatsWithTrends: () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const getMonthlySum = (month: number, year: number, type?: TransactionType) => {
      return transactions
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === month && d.getFullYear() === year && (!type || t.type === type);
        })
        .reduce((sum, t) => sum + t.amount, 0);
    };

    // Current Month
    const incomeCurrent = getMonthlySum(currentMonth, currentYear, TransactionType.INCOME);
    const expenseCurrent = getMonthlySum(currentMonth, currentYear, TransactionType.EXPENSE);
    const profitCurrent = incomeCurrent - expenseCurrent;

    // Last Month
    const incomeLast = getMonthlySum(lastMonth, lastMonthYear, TransactionType.INCOME);
    const expenseLast = getMonthlySum(lastMonth, lastMonthYear, TransactionType.EXPENSE);
    const profitLast = incomeLast - expenseLast;

    // Calc Trend %
    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    // All-time totals for display
    const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);

    return {
      revenue: { value: totalIncome, trend: calcTrend(incomeCurrent, incomeLast) },
      expenses: { value: totalExpense, trend: calcTrend(expenseCurrent, expenseLast) },
      profit: { value: totalIncome - totalExpense, trend: calcTrend(profitCurrent, profitLast) }
    };
  },

  // 2. Global History (Aggregation)
  getGlobalHistory: (): HistoryItem[] => {
    const history: HistoryItem[] = [];

    // Transactions
    transactions.forEach(t => {
      history.push({
        id: t.id,
        date: t.date,
        type: 'TRANSACTION',
        description: t.description,
        amount: t.type === TransactionType.INCOME ? t.amount : -t.amount,
        meta: { category: t.category }
      });
    });

    // Invoices
    invoices.forEach(i => {
      history.push({
        id: i.id,
        date: i.date,
        type: 'INVOICE',
        description: `Facture générée pour Projet`,
        amount: i.totalAmount,
        referenceId: i.projectId,
        meta: { status: i.status }
      });
    });

    // Material Usage
    materialUsage.forEach(u => {
      const mat = materials.find(m => m.id === u.materialId);
      history.push({
        id: u.id,
        date: u.date,
        type: 'USAGE',
        description: `Utilisation ${u.quantity} ${mat?.unit || 'unités'} de ${mat?.name || 'Matériau'}`,
        amount: -(u.quantity * u.costAtTimeOfUse),
        referenceId: u.projectId
      });
    });

    // Projects (Creation)
    projects.forEach(p => {
      history.push({
        id: p.id,
        date: p.startDate,
        type: 'PROJECT',
        description: `Projet Créé: ${p.name}`,
        referenceId: p.clientId
      });
    });

    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // 3. Helper to Export Data
  exportToCSV: (data: any[], filename: string) => {
    if (!data.length) return;
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content with SEMICOLON delimiter for French Excel support
    const csvContent = [
      headers.join(';'), // Header row
      ...data.map(row => headers.map(fieldName => {
        const val = row[fieldName];
        // Handle strings with semicolons or newlines by wrapping in quotes
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(';'))
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  // 4. Existing logic...
  getProjectFinancials: (projectId: string) => {
    const projectIncome = transactions
      .filter(t => t.projectId === projectId && t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const directExpenses = transactions
      .filter(t => t.projectId === projectId && t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const materialCost = materialUsage
      .filter(u => u.projectId === projectId)
      .reduce((sum, u) => sum + (u.quantity * u.costAtTimeOfUse), 0);

    const totalCost = directExpenses + materialCost;
    const profit = projectIncome - totalCost;

    return { income: projectIncome, expenses: directExpenses, materialCost, totalCost, profit };
  },

  consumeMaterial: (projectId: string, materialId: string, quantity: number) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) throw new Error("Material not found");
    if (material.currentStock < quantity) throw new Error("Stock insuffisant");

    materials = materials.map(m => m.id === materialId ? { ...m, currentStock: m.currentStock - quantity } : m);
    save(STORAGE_KEYS.MATERIALS, materials);

    const usageRecord: MaterialUsage = {
      id: `u${Date.now()}`,
      projectId,
      materialId,
      quantity,
      costAtTimeOfUse: material.costPerUnit,
      date: new Date().toISOString()
    };
    
    materialUsage = [...materialUsage, usageRecord];
    save(STORAGE_KEYS.USAGE, materialUsage);
    
    return usageRecord;
  },

  getClientProfile: (clientId: string): ClientFinancialProfile => {
    const clientProjects = projects.filter(p => p.clientId === clientId);
    const clientProjectIds = clientProjects.map(p => p.id);

    const totalInvoiced = invoices
      .filter(i => clientProjectIds.includes(i.projectId))
      .reduce((sum, i) => sum + i.totalAmount, 0);

    const totalPaid = transactions
      .filter(t => t.type === TransactionType.INCOME && 
                   ((t.projectId && clientProjectIds.includes(t.projectId)) || t.clientId === clientId))
      .reduce((sum, t) => sum + t.amount, 0);

    const totalMaterialCost = materialUsage
      .filter(u => clientProjectIds.includes(u.projectId))
      .reduce((sum, u) => sum + (u.quantity * u.costAtTimeOfUse), 0);
    
    const netProfit = totalPaid - totalMaterialCost;

    return { totalInvoiced, totalPaid, totalMaterialCost, netProfit, projectCount: clientProjects.length };
  },

  getCombinedDataForAI: () => {
    return {
      projects: projects.map(p => ({ ...p, financials: dataService.getProjectFinancials(p.id) })),
      inventory: materials.filter(m => m.currentStock < m.minStockLevel),
      cashFlow: {
        totalIncome: transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0),
        totalExpense: transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0),
      }
    };
  },

  getMonthlyRevenue: () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const income = transactions
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === index && d.getFullYear() === currentYear && t.type === TransactionType.INCOME;
        })
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expense = transactions
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === index && d.getFullYear() === currentYear && t.type === TransactionType.EXPENSE;
        })
        .reduce((sum, t) => sum + t.amount, 0);
        
      return { name: month, income, expense, profit: income - expense };
    });
  }
};