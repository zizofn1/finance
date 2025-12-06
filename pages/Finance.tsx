import React, { useState, useContext } from 'react';
import { dataService } from '../services/dataService';
import { TransactionType, PaymentMethod, Transaction, CATEGORY_LABELS } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Filter, Link as LinkIcon, User, Plus, Download, Search, HandCoins, Pencil } from 'lucide-react';
import { ToastContext } from '../App';
import { TransactionModal } from '../components/TransactionModal';

const Finance = () => {
  const { showToast } = useContext(ToastContext);
  const [transactions, setTransactions] = useState(dataService.getTransactions().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const projects = dataService.getProjects();
  const clients = dataService.getClients();
  const receivables = dataService.getOutstandingBalance();

  const getProjectName = (id?: string) => projects.find(p => p.id === id)?.name;
  const getClientName = (id?: string) => clients.find(c => c.id === id)?.name;

  const refreshData = () => {
    setTransactions(dataService.getTransactions().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleExport = () => {
    try {
      dataService.exportToCSV(transactions, 'transactions_export');
      showToast("Export CSV téléchargé avec succès", "success");
    } catch (e) {
      showToast("Échec de l'export CSV", "error");
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
  const netCashFlow = totalIncome - totalExpense;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight font-display">Finance</h2>
          <p className="text-slate-400">Suivez chaque centime entrant et sortant.</p>
        </div>
        <div className="flex gap-3 no-print">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-white-10 bg-surface text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white-5 shadow-sm transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-5 py-2 rounded-lg text-sm font-bold hover:brightness-110 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all active:scale-95"
          >
            <Plus size={18} /> Nouvelle Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-xl border border-white-10 shadow-sm">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Trésorerie Actuelle</p>
          <p className={`text-3xl font-bold mt-2 ${netCashFlow >= 0 ? 'text-white' : 'text-red-400'}`}>
            {netCashFlow.toLocaleString()} MAD
          </p>
        </div>
        <div className="glass-card p-6 rounded-xl border border-white-10 shadow-sm">
          <p className="text-sm font-bold text-emerald-400/80 uppercase tracking-wide">Recettes Totales</p>
          <p className="text-3xl font-bold mt-2 text-emerald-400">+{totalIncome.toLocaleString()} MAD</p>
        </div>
        <div className="glass-card p-6 rounded-xl border border-white-10 shadow-sm">
          <p className="text-sm font-bold text-red-400/80 uppercase tracking-wide">Dépenses Totales</p>
          <p className="text-3xl font-bold mt-2 text-red-400">-{totalExpense.toLocaleString()} MAD</p>
        </div>

        {/* NEW: Debt Management (Financing Helper) */}
        <div className="bg-primary/10 p-6 rounded-xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <HandCoins className="text-primary" size={20} />
            <p className="text-sm font-bold text-primary uppercase tracking-wide">Créances Clients</p>
          </div>
          <p className="text-3xl font-bold text-white">{receivables.toLocaleString()} MAD</p>
          <p className="text-xs text-primary/80 mt-1">À recouvrer (Factures non payées)</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-card rounded-xl shadow-sm border border-white-10 flex flex-col min-h-[500px] print:border-none print:shadow-none">
        {/* Filters */}
        <div className="p-5 border-b border-white-10 flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
          <div className="flex bg-white-5 p-1 rounded-lg border border-white-5">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${filterType === 'ALL' ? 'bg-surface text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Tout
            </button>
            <button
              onClick={() => setFilterType('INCOME')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${filterType === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Recettes
            </button>
            <button
              onClick={() => setFilterType('EXPENSE')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${filterType === 'EXPENSE' ? 'bg-red-500/20 text-red-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Dépenses
            </button>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-white-10 rounded-lg focus:outline-none focus:border-primary/50 text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-white-5">
            <thead className="bg-white-5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Lien</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Méthode</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white-5">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <Filter className="mb-3 opacity-20" size={40} />
                      <p className="font-medium">Aucune transaction trouvée</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white-5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-400">
                      {new Date(t.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold ${t.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {t.type === TransactionType.INCOME ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                        {CATEGORY_LABELS[t.category] || t.category.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {t.projectId ? (
                        <div className="flex items-center gap-2 text-primary font-medium bg-primary/10 px-2 py-1 rounded-md w-fit border border-primary/20">
                          <LinkIcon size={12} />
                          <span className="truncate max-w-[120px]">{getProjectName(t.projectId)}</span>
                        </div>
                      ) : t.clientId ? (
                        <div className="flex items-center gap-2 text-secondary font-medium bg-secondary/10 px-2 py-1 rounded-md w-fit border border-secondary/20">
                          <User size={12} />
                          <span className="truncate max-w-[120px]">{getClientName(t.clientId)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs px-2 py-1 rounded-md border border-white-5">Général</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 font-medium">
                      {t.description}
                      {t.invoiceId && <span className="ml-2 text-slate-500 text-xs font-normal bg-white-5 px-1.5 py-0.5 rounded">Fac: {t.invoiceId}</span>}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-white'
                      }`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toLocaleString()} MAD
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-slate-400">
                      {t.paymentMethod === PaymentMethod.CASH ? 'Espèces' :
                        t.paymentMethod === PaymentMethod.CHECK ? 'Chèque' :
                          t.paymentMethod === PaymentMethod.TRANSFER ? 'Virement' : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingTransaction(t);
                          setIsModalOpen(true);
                        }}
                        className="p-2 bg-white-5 hover:bg-primary/20 text-slate-400 hover:text-primary rounded-lg transition-colors border border-transparent hover:border-primary/30"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <TransactionModal
          onClose={() => setIsModalOpen(false)}
          onSave={refreshData}
          initialData={editingTransaction}
        />
      )}
    </div>
  );
};

export default Finance;