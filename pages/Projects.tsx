import React, { useState, useContext } from 'react';
import { Project, MaterialUsage, DocStatus, ProjectStatus, Quote, Invoice, TransactionType, ExpenseCategory, Transaction, CATEGORY_LABELS } from '../types';
import { dataService } from '../services/dataService';
import { Hammer, Calendar, CheckCircle2, CircleDollarSign, AlertCircle, Box, FileText, Plus, ArrowRight, X, Layout, PieChart, Printer, Pencil, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { ToastContext } from '../App';
import { TransactionModal } from '../components/TransactionModal';

// --- Subcomponents ---

const CreateDocModal = ({
  type,
  projectId,
  onClose,
  onSave
}: {
  type: 'QUOTE' | 'INVOICE',
  projectId: string,
  onClose: () => void,
  onSave: () => void
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const project = dataService.getProjects().find(p => p.id === projectId);
    const clientId = project?.clientId || 'unknown';

    if (type === 'QUOTE') {
      const newQuote: Quote = {
        id: `q${Date.now()}`,
        projectId,
        clientId,
        date: new Date().toISOString(),
        items: [{ description: "Prestation globale", quantity: 1, unitPrice: amount, total: amount }],
        totalAmount: amount,
        status: DocStatus.DRAFT
      };
      dataService.addQuote(newQuote);
    } else {
      const newInvoice: Invoice = {
        id: `inv${Date.now()}`,
        projectId,
        clientId,
        date: new Date().toISOString(),
        dueDate: dueDate || new Date().toISOString(),
        items: [{ description: "Prestation globale", quantity: 1, unitPrice: amount, total: amount }],
        totalAmount: amount,
        paidAmount: 0,
        status: DocStatus.SENT
      };
      dataService.addInvoice(newInvoice);
    }

    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in no-print">
      <div className="glass-card rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-white-10">
        <div className="p-4 border-b border-white-10 flex justify-between items-center bg-white-5">
          <h3 className="font-bold text-lg text-white">
            {type === 'QUOTE' ? 'Nouveau Devis' : 'Nouvelle Facture'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Montant Total (MAD)</label>
            <input
              type="number"
              required
              min="1"
              className="w-full bg-surface border border-white-10 rounded-lg p-2.5 text-lg font-bold text-white outline-none focus:border-primary/50"
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value))}
            />
          </div>
          {type === 'INVOICE' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Date d'échéance</label>
              <input
                type="date"
                required
                className="w-full bg-surface border border-white-10 rounded-lg p-2.5 text-sm text-white outline-none focus:border-primary/50"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          )}
          <button type="submit" className="w-full bg-primary hover:bg-primary/80 text-white py-3 rounded-lg font-bold shadow-lg mt-2 transition-all">
            Créer {type === 'QUOTE' ? 'Devis' : 'Facture'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ProjectDocuments = ({ projectId }: { projectId: string }) => {
  const [modalType, setModalType] = useState<'QUOTE' | 'INVOICE' | null>(null);
  const [refresh, setRefresh] = useState(0);

  const quotes = dataService.getQuotes().filter(q => q.projectId === projectId);
  const invoices = dataService.getInvoices().filter(i => i.projectId === projectId);

  const handleCreated = () => {
    setRefresh(prev => prev + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Invoices Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Factures</h4>
          <button
            onClick={() => setModalType('INVOICE')}
            className="text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 no-print border border-primary/20"
          >
            <Plus size={12} /> Créer Facture
          </button>
        </div>
        {invoices.length === 0 ? (
          <div className="p-4 border border-dashed border-white-10 rounded-lg text-center bg-white-5">
            <p className="text-sm text-slate-500 italic">Aucune facture émise.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-4 bg-surface border border-white-5 rounded-xl shadow-sm hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Facture #{inv.id.substring(0, 6).toUpperCase()}</p>
                    <p className="text-xs text-slate-400">Échéance: {new Date(inv.dueDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{inv.totalAmount.toLocaleString()} MAD</p>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${inv.status === DocStatus.PAID ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    inv.status === DocStatus.PARTIAL ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-700 text-slate-400 border border-slate-600'
                    }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quotes Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Devis</h4>
          <button
            onClick={() => setModalType('QUOTE')}
            className="text-xs font-bold bg-white-5 hover:bg-white-10 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 no-print border border-white-10"
          >
            <Plus size={12} /> Nouveau Devis
          </button>
        </div>
        {quotes.length === 0 ? (
          <div className="p-4 border border-dashed border-white-10 rounded-lg text-center bg-white-5">
            <p className="text-sm text-slate-500 italic">Aucun devis créé.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map(quote => (
              <div key={quote.id} className="flex justify-between items-center p-4 bg-surface border border-white-5 rounded-xl shadow-sm hover:border-secondary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Devis #{quote.id.substring(0, 6).toUpperCase()}</p>
                    <p className="text-xs text-slate-400">{new Date(quote.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{quote.totalAmount.toLocaleString()} MAD</p>
                  <span className="text-[10px] uppercase font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full mt-1 inline-block border border-secondary/20">
                    {quote.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalType && (
        <CreateDocModal
          type={modalType}
          projectId={projectId}
          onClose={() => setModalType(null)}
          onSave={handleCreated}
        />
      )}
    </div>
  );
};

const MaterialConsumptionForm = ({ projectId, onConsume }: { projectId: string, onConsume: () => void }) => {
  const materials = dataService.getMaterials();
  const [selectedMat, setSelectedMat] = useState(materials[0]?.id || '');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMat) {
      setError("Aucun matériau sélectionné.");
      return;
    }
    try {
      dataService.consumeMaterial(projectId, selectedMat, qty);
      onConsume();
      setQty(1);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (materials.length === 0) {
    return (
      <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 mb-6 text-sm text-amber-400 flex gap-2">
        <AlertCircle size={16} />
        Aucun matériau en stock. Allez dans Stock pour ajouter des articles.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white-5 p-5 rounded-xl border border-white-10 mb-6 no-print">
      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <Box size={16} className="text-primary" />
        Sortie de Stock (Consommation)
      </h4>
      <div className="flex flex-col gap-4 mb-4">
        <div className="w-full">
          <label className="block text-xs font-bold text-slate-400 mb-1.5">Matériau</label>
          <select
            className="w-full text-sm bg-surface rounded-lg border border-white-10 p-3 text-white focus:border-primary/50 outline-none"
            value={selectedMat}
            onChange={(e) => setSelectedMat(e.target.value)}
          >
            {materials.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.currentStock} {m.unit} dispo)
              </option>
            ))}
          </select>
        </div>
        <div className="w-full">
          <label className="block text-xs font-bold text-slate-400 mb-1.5">Qté</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            className="w-full text-sm bg-surface rounded-lg border border-white-10 p-3 text-white focus:border-primary/50 outline-none"
            value={qty}
            onChange={(e) => setQty(parseFloat(e.target.value))}
          />
        </div>
        <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg text-sm font-bold hover:bg-primary/80 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-1">
          <Plus size={18} /> Ajouter
        </button>
      </div>
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      <p className="text-xs text-slate-500 mt-2">
        Déduit du stock et calcule le coût réel.
      </p>
    </form>
  );
};

const ProjectTransactions = ({ projectId }: { projectId: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [refresh, setRefresh] = useState(0);

  const transactions = dataService.getTransactions()
    .filter(t => t.projectId === projectId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSave = () => {
    setRefresh(prev => prev + 1);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Transactions du Projet</h4>
        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
          }}
          className="text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 no-print border border-primary/20"
        >
          <Plus size={12} /> Ajouter Transaction
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="p-4 border border-dashed border-white-10 rounded-lg text-center bg-white-5">
          <p className="text-sm text-slate-500 italic">Aucune transaction liée à ce projet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white-10 shadow-sm">
          <table className="min-w-full divide-y divide-white-5">
            <thead className="bg-white-5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Catégorie</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Description</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase">Montant</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-white-5">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-white-5 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-400 font-medium">{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${t.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {t.type === TransactionType.INCOME ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                      {t.type === TransactionType.INCOME ? 'Recette' : 'Dépense'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{CATEGORY_LABELS[t.category] || t.category.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{t.description}</td>
                  <td className={`px-4 py-3 text-sm text-right font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-white'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toLocaleString()} MAD
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditingTransaction(t);
                        setIsModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-white bg-white-5 hover:bg-white-10 p-1.5 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <TransactionModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={editingTransaction || { projectId }}
        />
      )}
    </div>
  );
};

const ProjectDetail = ({ project }: { project: Project }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOCS' | 'TRANSACTIONS'>('OVERVIEW');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const financials = dataService.getProjectFinancials(project.id);
  const materialsUsed = dataService.getMaterialUsage().filter(m => m.projectId === project.id);
  const inventory = dataService.getMaterials();

  const getMaterialName = (id: string) => inventory.find(i => i.id === id)?.name || 'Inconnu';

  return (
    <div className="glass-card rounded-2xl border border-white-10 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white-10 bg-white-5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider border border-primary/20">
                {project.type}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${project.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight font-display">{project.name}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Budget Estimé</p>
            <p className="text-2xl font-bold text-white">{project.budget.toLocaleString()} MAD</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 text-sm font-medium text-slate-400 border-b border-white-5 no-print">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-3 transition-all ${activeTab === 'OVERVIEW' ? 'text-primary border-b-2 border-primary font-bold' : 'hover:text-white'}`}
          >
            <Layout size={16} className="inline mr-2" />
            Aperçu & Coûts
          </button>
          <button
            onClick={() => setActiveTab('DOCS')}
            className={`pb-3 transition-all ${activeTab === 'DOCS' ? 'text-primary border-b-2 border-primary font-bold' : 'hover:text-white'}`}
          >
            <FileText size={16} className="inline mr-2" />
            Factures & Devis
          </button>
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`pb-3 transition-all ${activeTab === 'TRANSACTIONS' ? 'text-primary border-b-2 border-primary font-bold' : 'hover:text-white'}`}
          >
            <CircleDollarSign size={16} className="inline mr-2" />
            Transactions
          </button>
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
        {activeTab === 'DOCS' ? (
          <ProjectDocuments projectId={project.id} />
        ) : activeTab === 'TRANSACTIONS' ? (
          <ProjectTransactions projectId={project.id} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in">
            {/* Financial Summary */}
            <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <p className="text-xs font-bold text-emerald-400/70 uppercase tracking-wide mb-1">Recettes (Payé)</p>
                <p className="text-2xl font-bold text-emerald-400">{financials.income.toLocaleString()} MAD</p>
              </div>
              <div className="p-5 bg-surface rounded-xl border border-white-10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Coût Matériel</p>
                <p className="text-2xl font-bold text-white">{financials.materialCost.toLocaleString()} MAD</p>
              </div>
              <div className="p-5 bg-surface rounded-xl border border-white-10 relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Autres Frais</p>
                    <p className="text-2xl font-bold text-white">{financials.expenses.toLocaleString()} MAD</p>
                  </div>
                  <button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white-5 hover:bg-white-10 text-slate-300 p-2 rounded-lg"
                    title="Ajouter une dépense"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="p-5 bg-gradient-to-br from-surface to-black rounded-xl border border-white-10 shadow-lg">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Bénéfice Réel</p>
                <p className={`text-2xl font-bold ${financials.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {financials.profit.toLocaleString()} MAD
                </p>
              </div>
            </div>

            {/* Consumption Logic */}
            <div className="col-span-1 md:col-span-3 mt-4 space-y-8">
              <div>
                <MaterialConsumptionForm projectId={project.id} onConsume={() => setRefreshTrigger(prev => prev + 1)} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <PieChart size={16} className="text-slate-400" /> Historique de Consommation
                </h3>
                <div className="overflow-hidden rounded-xl border border-white-10 shadow-sm">
                  <table className="min-w-full divide-y divide-white-5">
                    <thead className="bg-white-5">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Article</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase">Qté</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase">Coût</th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-white-5">
                      {materialsUsed.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-10 text-center text-slate-500 text-sm italic">
                            Aucun matériau utilisé pour ce projet.
                          </td>
                        </tr>
                      ) : (
                        materialsUsed.map((usage) => (
                          <tr key={usage.id} className="hover:bg-white-5 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-400 font-medium">{new Date(usage.date).toLocaleDateString('fr-FR')}</td>
                            <td className="px-4 py-3 text-sm font-bold text-white">{getMaterialName(usage.materialId)}</td>
                            <td className="px-4 py-3 text-sm text-right text-slate-400">{usage.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-red-400">
                              -{(usage.quantity * usage.costAtTimeOfUse).toLocaleString()} MAD
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {isExpenseModalOpen && (
        <TransactionModal
          onClose={() => setIsExpenseModalOpen(false)}
          onSave={() => setRefreshTrigger(prev => prev + 1)}
          initialData={{
            projectId: project.id,
            type: TransactionType.EXPENSE,
            category: ExpenseCategory.OVERHEAD
          }}
        />
      )}
    </div>
  );
};

const ProjectCard: React.FC<{ project: Project, onClick: () => void, onEdit: (e: React.MouseEvent) => void, active: boolean }> = ({ project, onClick, onEdit, active }) => {
  const financials = dataService.getProjectFinancials(project.id);
  const profitMargin = financials.income > 0 ? (financials.profit / financials.income) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden group break-inside-avoid ${active
        ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(139,92,246,0.2)]'
        : 'bg-surface border-white-10 hover:border-primary/50 hover:shadow-md'
        }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white-5 px-2 py-0.5 rounded-full border border-white-10">
            {project.type}
          </span>
          <h3 className="font-bold text-white mt-2 text-lg leading-tight group-hover:text-primary transition-colors">{project.name}</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-slate-400 hover:text-white bg-white-5 hover:bg-white-10 p-1.5 rounded-full transition-colors border border-white-5"
            title="Modifier Projet"
          >
            <Pencil size={14} />
          </button>
          {project.status === 'COMPLETED'
            ? <div className="text-emerald-400 bg-emerald-500/10 p-1.5 rounded-full border border-emerald-500/20"><CheckCircle2 size={18} /></div>
            : <div className="text-amber-400 bg-amber-500/10 p-1.5 rounded-full border border-amber-500/20"><Hammer size={18} /></div>
          }
        </div>
      </div>

      <div className="flex justify-between items-end mt-4 pt-4 border-t border-white-5">
        <div className="text-xs text-slate-500 font-medium">
          <Calendar size={12} className="inline mr-1.5 mb-0.5 text-slate-600" />
          {new Date(project.startDate).toLocaleDateString('fr-FR')}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Marge Réelle</p>
          <p className={`font-bold text-sm ${profitMargin < 20 ? 'text-red-400' : 'text-emerald-400'}`}>
            {financials.income === 0 ? 'N/A' : `${profitMargin.toFixed(1)}%`}
          </p>
        </div>
      </div>
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary print:hidden"></div>}
    </div>
  );
};

const AddProjectModal = ({ onClose, onSave, initialData }: { onClose: () => void, onSave: (id: string) => void, initialData?: Project | null }) => {
  const clients = dataService.getClients();
  const [formData, setFormData] = useState({
    clientId: initialData?.clientId || clients[0]?.id || '',
    name: initialData?.name || '',
    type: initialData?.type || 'KITCHEN' as const,
    budget: initialData?.budget || 0,
    status: initialData?.status || ProjectStatus.ESTIMATE
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.clientId) return;

    const projectData: Project = {
      id: initialData?.id || `p${Date.now()}`,
      clientId: formData.clientId,
      name: formData.name,
      type: formData.type as any,
      status: formData.status,
      startDate: initialData?.startDate || new Date().toISOString(),
      budget: formData.budget,
      description: initialData?.description || 'Nouveau Projet'
    };

    if (initialData) {
      dataService.updateProject(projectData);
    } else {
      dataService.addProject(projectData);
    }

    onSave(projectData.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in no-print">
      <div className="glass-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-white-10">
        <div className="p-5 border-b border-white-10 flex justify-between items-center bg-white-5">
          <h3 className="font-bold text-lg text-white">{initialData ? 'Modifier Projet' : 'Créer un Projet'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-white-5 p-1 rounded-full"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {clients.length === 0 ? (
            <div className="text-center p-6 bg-amber-500/10 rounded-xl text-amber-400 text-sm border border-amber-500/20">
              <AlertCircle className="mx-auto mb-3" size={32} />
              <p className="font-bold mb-1">Aucun Client Trouvé</p>
              <p>Vous devez ajouter un client avant de créer un projet.</p>
              <div className="mt-4">
                <a href="#/clients" className="bg-amber-500/20 text-amber-300 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-amber-500/30 transition-colors">Aller aux Clients</a>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Client</label>
                <select
                  className="w-full border border-white-10 bg-surface rounded-lg p-2.5 text-sm text-white focus:border-primary/50 outline-none"
                  value={formData.clientId}
                  onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                >
                  <option value="" disabled>Choisir un Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Nom du Projet</label>
                <input
                  required
                  className="w-full border border-white-10 bg-surface rounded-lg p-2.5 text-sm text-white focus:border-primary/50 outline-none"
                  placeholder="ex. Cuisine Moderne Blanche"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Type</label>
                  <select
                    className="w-full border border-white-10 bg-surface rounded-lg p-2.5 text-sm text-white focus:border-primary/50 outline-none"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="KITCHEN">Cuisine</option>
                    <option value="WARDROBE">Dressing</option>
                    <option value="OFFICE">Bureau</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Statut</label>
                  <select
                    className="w-full border border-white-10 bg-surface rounded-lg p-2.5 text-sm text-white focus:border-primary/50 outline-none"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                  >
                    <option value={ProjectStatus.ESTIMATE}>Devis / Étude</option>
                    <option value={ProjectStatus.IN_PROGRESS}>En Cours</option>
                    <option value={ProjectStatus.COMPLETED}>Terminé</option>
                    <option value={ProjectStatus.CANCELLED}>Annulé</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Budget Estimé (MAD)</label>
                <input
                  type="number"
                  className="w-full border border-white-10 bg-surface rounded-lg p-2.5 text-sm text-white focus:border-primary/50 outline-none"
                  value={formData.budget}
                  onChange={e => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-white-10 text-slate-400 rounded-lg hover:bg-white-5 font-medium text-sm">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/80 font-bold text-sm shadow-md">
                  {initialData ? 'Modifier' : 'Créer Projet'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState(dataService.getProjects());
  const [selectedId, setSelectedId] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const selectedProject = projects.find(p => p.id === selectedId);

  const refreshProjects = (newId?: string) => {
    setProjects(dataService.getProjects());
    if (newId) setSelectedId(newId);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-6rem)] gap-8 max-w-7xl mx-auto print:h-auto">
      {/* List Sidebar */}
      <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-hidden print:w-full">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-2xl font-bold text-white tracking-tight font-display">Chantiers</h2>
          <button
            onClick={() => {
              setEditingProject(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/80 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all active:scale-95 no-print"
          >
            <Plus size={14} /> Nouveau
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-4 print:overflow-visible">
          {projects.length === 0 ? (
            <div className="text-center py-12 px-6 border-2 border-dashed border-white-10 rounded-xl bg-white-5">
              <div className="bg-surface p-3 rounded-full inline-block mb-3 shadow-sm border border-white-10">
                <Hammer size={24} className="text-slate-500" />
              </div>
              <p className="text-white font-medium mb-1">Aucun projet actif</p>
              <p className="text-slate-500 text-xs mb-4">Créez un projet pour suivre les coûts et la facturation.</p>
              <button onClick={() => setIsAddModalOpen(true)} className="text-primary font-bold text-sm hover:underline no-print">Créer le premier projet</button>
            </div>
          ) : (
            projects.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                active={p.id === selectedId}
                onClick={() => setSelectedId(p.id)}
                onEdit={(e) => {
                  e.stopPropagation();
                  setEditingProject(p);
                  setIsAddModalOpen(true);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="w-full md:w-2/3 h-full no-print">
        {selectedProject ? (
          <ProjectDetail project={selectedProject} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-white-5 rounded-2xl border-2 border-dashed border-white-10 p-8 text-center animate-in fade-in">
            <div className="bg-surface p-6 rounded-full shadow-sm mb-6 border border-white-10">
              <Hammer size={48} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aucun Projet Sélectionné</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Sélectionnez un projet dans la liste de gauche pour voir les détails financiers et les documents.
            </p>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <AddProjectModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={refreshProjects}
          initialData={editingProject}
        />
      )}
    </div>
  );
};

export default Projects;