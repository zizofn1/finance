import React, { useState, useContext } from 'react';
import { dataService } from '../services/dataService';
import { TransactionType, IncomeCategory, ExpenseCategory } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Filter, Link as LinkIcon, User, X, Plus, Download, Search } from 'lucide-react';
import { ToastContext } from '../App';

const AddTransactionModal = ({ onClose, onSave }: { onClose: () => void, onSave: () => void }) => {
  const projects = dataService.getProjects();
  const { showToast } = useContext(ToastContext);
  const [formData, setFormData] = useState({
    type: TransactionType.INCOME,
    category: IncomeCategory.PROJECT_PAYMENT as string,
    amount: 0,
    projectId: '',
    description: ''
  });

  const categories = formData.type === TransactionType.INCOME 
    ? Object.values(IncomeCategory) 
    : Object.values(ExpenseCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return;

    dataService.addTransaction({
      id: `t${Date.now()}`,
      date: new Date().toISOString(),
      amount: formData.amount,
      type: formData.type,
      category: formData.category as any,
      description: formData.description || 'Transaction Manuelle',
      projectId: formData.projectId || undefined
    });
    
    showToast("Transaction enregistrée avec succès", "success");
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4 animate-in fade-in no-print">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-900">Enregistrer une Transaction</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex bg-slate-100 p-1.5 rounded-xl">
            <button 
              type="button"
              onClick={() => setFormData({...formData, type: TransactionType.INCOME, category: IncomeCategory.PROJECT_PAYMENT})}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${formData.type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Recette (Entrée)
            </button>
            <button 
              type="button"
              onClick={() => setFormData({...formData, type: TransactionType.EXPENSE, category: ExpenseCategory.OVERHEAD})}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${formData.type === TransactionType.EXPENSE ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Dépense (Sortie)
            </button>
          </div>

          <div className="relative">
             <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Montant (MAD)</label>
             <div className="relative">
               <span className="absolute left-3 top-2.5 text-slate-400 font-bold">M</span>
               <input 
                type="number"
                required
                min="0"
                className="w-full border border-slate-200 bg-slate-50 rounded-lg pl-7 pr-3 py-2.5 text-lg font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
              />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Catégorie</label>
               <select 
                 className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                 value={formData.category}
                 onChange={e => setFormData({...formData, category: e.target.value})}
               >
                 {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
               </select>
            </div>

            <div>
               <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Lien Projet</label>
               <select 
                 className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                 value={formData.projectId}
                 onChange={e => setFormData({...formData, projectId: e.target.value})}
               >
                 <option value="">-- Général / Aucun --</option>
                 {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Description</label>
            <input 
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="ex. Avance pour cuisine"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Annuler</button>
             <button type="submit" className={`flex-1 px-4 py-3 text-white rounded-lg font-bold shadow-md transition-transform active:scale-95 ${formData.type === TransactionType.INCOME ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
               Enregistrer
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Finance = () => {
  const { showToast } = useContext(ToastContext);
  const [transactions, setTransactions] = useState(dataService.getTransactions().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  
  const projects = dataService.getProjects();
  const clients = dataService.getClients();

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
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Finance</h2>
          <p className="text-slate-500">Suivez chaque centime entrant et sortant.</p>
        </div>
        <div className="flex gap-3 no-print">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95"
          >
            <Plus size={18} /> Nouvelle Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:border-slate-300">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Trésorerie Nette</p>
          <p className={`text-3xl font-bold mt-2 ${netCashFlow >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
            {netCashFlow.toLocaleString()} MAD
          </p>
          <div className="mt-2 text-xs text-slate-400">Solde actuel</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:border-slate-300">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Recettes Totales</p>
          <p className="text-3xl font-bold mt-2 text-emerald-600">+{totalIncome.toLocaleString()} MAD</p>
          <div className="mt-2 text-xs text-emerald-600/70 bg-emerald-50 inline-block px-2 py-0.5 rounded-full font-medium print:bg-white print:text-black">
             Global
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:border-slate-300">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Dépenses Totales</p>
          <p className="text-3xl font-bold mt-2 text-red-600">-{totalExpense.toLocaleString()} MAD</p>
          <div className="mt-2 text-xs text-red-600/70 bg-red-50 inline-block px-2 py-0.5 rounded-full font-medium print:bg-white print:text-black">
             Global
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[500px] print:border-none print:shadow-none">
        {/* Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${filterType === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Tout
            </button>
            <button 
              onClick={() => setFilterType('INCOME')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${filterType === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Recettes
            </button>
            <button 
              onClick={() => setFilterType('EXPENSE')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${filterType === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Dépenses
            </button>
          </div>
          <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
             <input 
               placeholder="Rechercher..." 
               className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
             />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Lien</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">État</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                       <Filter className="mb-3 opacity-20" size={40} />
                       <p className="font-medium">Aucune transaction trouvée</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                      {new Date(t.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold ${
                        t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      } print:border print:border-slate-300 print:text-black`}>
                         {t.type === TransactionType.INCOME ? <ArrowUpCircle size={14}/> : <ArrowDownCircle size={14}/>}
                         {t.category.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                       {t.projectId ? (
                         <div className="flex items-center gap-2 text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-md w-fit print:text-black print:border print:border-slate-300">
                           <LinkIcon size={12} />
                           <span className="truncate max-w-[120px]">{getProjectName(t.projectId)}</span>
                         </div>
                       ) : t.clientId ? (
                         <div className="flex items-center gap-2 text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-md w-fit print:text-black print:border print:border-slate-300">
                           <User size={12} />
                           <span className="truncate max-w-[120px]">{getClientName(t.clientId)}</span>
                         </div>
                       ) : (
                         <span className="text-slate-400 text-xs px-2 py-1 rounded-md border border-slate-100">Général</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                      {t.description}
                      {t.invoiceId && <span className="ml-2 text-slate-400 text-xs font-normal bg-slate-100 px-1.5 py-0.5 rounded">Fac: {t.invoiceId}</span>}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${
                      t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'
                    } print:text-black`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toLocaleString()} MAD
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase tracking-wider print:border print:border-slate-300">Traité</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && <AddTransactionModal onClose={() => setIsModalOpen(false)} onSave={refreshData} />}
    </div>
  );
};

export default Finance;