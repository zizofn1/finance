import {
  Client, Project, Transaction, Material, MaterialUsage,
  TransactionType, IncomeCategory, ExpenseCategory, ProjectStatus,
  Quote, Invoice, DocStatus, ClientFinancialProfile, AppSettings, HistoryItem
} from '../types';

// --- CONSTANTS ---
// Default Logo (SVG Data URI) to ensure it always loads
export const DEFAULT_LOGO = "/logo.png";

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
  contact: { email: '', phone: '', address: '' },
  logoUrl: DEFAULT_LOGO
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

// Ensure settings has a valid logo if missing or if it refers to the broken file
if (!settings.logoUrl) {
  settings.logoUrl = DEFAULT_LOGO;
  save(STORAGE_KEYS.SETTINGS, settings);
}

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
  getSettings: () => ({ ...settings }),

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
        description: `Achat Stock: ${material.name} (${material.currentStock} ${material.unit})${material.supplier ? ` - Fournisseur: ${material.supplier}` : ''}`
      };
      transactions = [...transactions, transaction];
      save(STORAGE_KEYS.TRANSACTIONS, transactions);
    }

    return material;
  },

  updateStock: (materialId: string, newQuantity: number) => {
    materials = materials.map(m => m.id === materialId ? { ...m, currentStock: newQuantity } : m);
    save(STORAGE_KEYS.MATERIALS, materials);
  },

  restockMaterial: (materialId: string, quantityToAdd: number, unitCost: number, supplier?: string) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    // Highest Price Logic: Keep the higher cost to protect margin
    const newCostPerUnit = Math.max(material.costPerUnit, unitCost);
    const newStock = material.currentStock + quantityToAdd;

    // Update supplier if provided
    const updatedMaterial = {
      ...material,
      currentStock: newStock,
      costPerUnit: newCostPerUnit,
      supplier: supplier || material.supplier // Update supplier if provided, else keep old
    };

    materials = materials.map(m => m.id === materialId ? updatedMaterial : m);
    save(STORAGE_KEYS.MATERIALS, materials);

    // Create Expense Transaction
    const expenseAmount = quantityToAdd * unitCost;
    const transaction: Transaction = {
      id: `t_restock_${Date.now()}`,
      date: new Date().toISOString(),
      amount: expenseAmount,
      type: TransactionType.EXPENSE,
      category: ExpenseCategory.RESTOCK_INVENTORY,
      description: `Réapprovisionnement: ${material.name} (+${quantityToAdd} ${material.unit} @ ${unitCost} MAD)${supplier ? ` - Fournisseur: ${supplier}` : ''}`,
      paymentMethod: 'CASH' as any // Default to CASH, can be updated later
    };

    transactions = [...transactions, transaction];
    save(STORAGE_KEYS.TRANSACTIONS, transactions);
  },

  addTransaction: (transaction: Transaction) => {
    transactions = [...transactions, transaction];
    save(STORAGE_KEYS.TRANSACTIONS, transactions);
    return transaction;
  },

  updateTransaction: (updatedTransaction: Transaction) => {
    transactions = transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
    save(STORAGE_KEYS.TRANSACTIONS, transactions);
  },

  updateClient: (updatedClient: Client) => {
    clients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    save(STORAGE_KEYS.CLIENTS, clients);
  },

  updateProject: (updatedProject: Project) => {
    projects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    save(STORAGE_KEYS.PROJECTS, projects);
  },

  // --- NEW METHODS FOR DOCUMENTS ---
  addQuote: (quote: Quote) => {
    // Ensure clientId is set (if not provided, try to get from project)
    if (!quote.clientId && quote.projectId) {
      const project = projects.find(p => p.id === quote.projectId);
      if (project) quote.clientId = project.clientId;
    }
    quotes = [...quotes, quote];
    save(STORAGE_KEYS.QUOTES, quotes);
    return quote;
  },

  addInvoice: (invoice: Invoice) => {
    // Ensure clientId is set
    if (!invoice.clientId && invoice.projectId) {
      const project = projects.find(p => p.id === invoice.projectId);
      if (project) invoice.clientId = project.clientId;
    }
    invoices = [...invoices, invoice];
    save(STORAGE_KEYS.INVOICES, invoices);
    return invoice;
  },

  updateQuote: (quote: Quote) => {
    quotes = quotes.map(q => q.id === quote.id ? quote : q);
    save(STORAGE_KEYS.QUOTES, quotes);
    return quote;
  },

  updateInvoice: (invoice: Invoice) => {
    invoices = invoices.map(i => i.id === invoice.id ? invoice : i);
    save(STORAGE_KEYS.INVOICES, invoices);
    return invoice;
  },

  updateInvoiceStatus: (id: string, status: DocStatus) => {
    invoices = invoices.map(i => i.id === id ? { ...i, status } : i);
    save(STORAGE_KEYS.INVOICES, invoices);
  },

  generateDocumentId: (type: 'QUOTE' | 'INVOICE') => {
    const prefix = type === 'QUOTE' ? 'DEV' : 'FAC';
    const year = new Date().getFullYear();
    const list = type === 'QUOTE' ? quotes : invoices;
    const count = list.filter(d => d.id.startsWith(`${prefix}-${year}`)).length;
    const sequence = (count + 1).toString().padStart(3, '0');
    return `${prefix}-${year}-${sequence}`;
  },

  // --- BUSINESS LOGIC ---

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

    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      // Fix: Use absolute value of prev to ensure direction is correct even if prev was negative
      return ((curr - prev) / Math.abs(prev)) * 100;
    };

    const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);

    // Fix: User wants "Real Margin" (Marge réelle) not the monthly trend.
    // So we calculate the Global Profit Margin %
    const globalMargin = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    return {
      revenue: { value: totalIncome, trend: calcTrend(incomeCurrent, incomeLast) },
      expenses: { value: totalExpense, trend: calcTrend(expenseCurrent, expenseLast) },
      profit: { value: totalIncome - totalExpense, trend: globalMargin }
    };
  },

  getGlobalHistory: (): HistoryItem[] => {
    const history: HistoryItem[] = [];

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

    invoices.forEach(i => {
      history.push({
        id: i.id,
        date: i.date,
        type: 'INVOICE',
        description: `Facture #${i.id.substring(0, 6)}`,
        amount: i.totalAmount,
        referenceId: i.projectId,
        meta: { status: i.status }
      });
    });

    materialUsage.forEach(u => {
      const mat = materials.find(m => m.id === u.materialId);
      history.push({
        id: u.id,
        date: u.date,
        type: 'USAGE',
        description: `Utilisation ${u.quantity} ${mat?.unit || 'unités'} - ${mat?.name}`,
        amount: -(u.quantity * u.costAtTimeOfUse),
        referenceId: u.projectId
      });
    });

    projects.forEach(p => {
      history.push({
        id: p.id,
        date: p.startDate,
        type: 'PROJECT',
        description: `Nouveau Projet: ${p.name}`,
        referenceId: p.clientId
      });
    });

    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  exportToCSV: (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(';'),
      ...data.map(row => headers.map(fieldName => {
        const val = row[fieldName];
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(';'))
    ].join('\n');

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

  getClientHistory: (clientId: string): HistoryItem[] => {
    const clientProjects = projects.filter(p => p.clientId === clientId);
    const clientProjectIds = clientProjects.map(p => p.id);
    const history: HistoryItem[] = [];

    // 1. Transactions (Directly linked to client OR linked to client's projects)
    transactions.forEach(t => {
      if (t.clientId === clientId || (t.projectId && clientProjectIds.includes(t.projectId))) {
        history.push({
          id: t.id,
          date: t.date,
          type: 'TRANSACTION',
          description: t.description,
          amount: t.type === TransactionType.INCOME ? t.amount : -t.amount,
          meta: { category: t.category }
        });
      }
    });

    // 2. Material Usage (Linked to client's projects)
    materialUsage.forEach(u => {
      if (clientProjectIds.includes(u.projectId)) {
        const mat = materials.find(m => m.id === u.materialId);
        const project = projects.find(p => p.id === u.projectId);
        history.push({
          id: u.id,
          date: u.date,
          type: 'USAGE',
          description: `Utilisation: ${mat?.name} (${u.quantity} ${mat?.unit})`,
          amount: -(u.quantity * u.costAtTimeOfUse),
          referenceId: u.projectId,
          meta: { projectName: project?.name }
        });
      }
    });

    // 3. Projects Created
    clientProjects.forEach(p => {
      history.push({
        id: p.id,
        date: p.startDate,
        type: 'PROJECT',
        description: `Nouveau Projet: ${p.name}`,
        referenceId: p.clientId
      });
    });

    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getCombinedDataForAI: () => {
    return {
      projects: projects.map(p => ({ ...p, financials: dataService.getProjectFinancials(p.id) })),
      inventory: materials,
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
  },

  // NEW: Debt Management Helper
  getOutstandingBalance: () => {
    const totalInvoiced = invoices.reduce((s, i) => s + i.totalAmount, 0);
    // Approximate payments based on transactions linked to projects?
    // Better to check invoice status or sum Partial payments if tracked deeply.
    // For now, simple approximation:
    const unpaidInvoices = invoices.filter(i => i.status !== DocStatus.PAID);
    const estimatedReceivables = unpaidInvoices.reduce((s, i) => s + i.totalAmount, 0); // Simplified

    return estimatedReceivables;
  },

  // --- DATA EXPORT ---
  exportDataToFile: () => {
    const allData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      clients,
      projects,
      materials,
      materialUsage,
      transactions,
      quotes,
      invoices,
      settings
    };

    const jsonString = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');

    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `joinerypro_backup_${dateStr}.json`;

    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};