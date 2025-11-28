import React, { useState } from 'react';
import { Project, MaterialUsage, DocStatus, ProjectStatus } from '../types';
import { dataService } from '../services/dataService';
import { Hammer, Calendar, CheckCircle2, CircleDollarSign, AlertCircle, Box, FileText, Plus, ArrowRight, X, Layout, PieChart } from 'lucide-react';

// --- Subcomponents ---

const ProjectDocuments = ({ projectId }: { projectId: string }) => {
  const quotes = dataService.getQuotes().filter(q => q.projectId === projectId);
  const invoices = dataService.getInvoices().filter(i => i.projectId === projectId);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Factures</h4>
          <button className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 no-print">
            <Plus size={12} /> Créer Facture
          </button>
        </div>
        {invoices.length === 0 && (
          <div className="p-4 border border-dashed border-slate-200 rounded-lg text-center bg-slate-50/50">
             <p className="text-sm text-slate-400 italic">Aucune facture émise.</p>
          </div>
        )}
        <div className="space-y-3">
          {invoices.map(inv => (
            <div key={inv.id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                   <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Facture #{inv.id.toUpperCase()}</p>
                  <p className="text-xs text-slate-500">Échéance: {new Date(inv.dueDate).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{inv.totalAmount.toLocaleString()} MAD</p>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                  inv.status === DocStatus.PAID ? 'bg-emerald-100 text-emerald-700' : 
                  inv.status === DocStatus.PARTIAL ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {inv.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
         <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Devis</h4>
          <button className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 no-print">
            <Plus size={12} /> Nouveau Devis
          </button>
        </div>
        {quotes.length === 0 && (
          <div className="p-4 border border-dashed border-slate-200 rounded-lg text-center bg-slate-50/50">
             <p className="text-sm text-slate-400 italic">Aucun devis créé.</p>
          </div>
        )}
        {quotes.map(quote => (
           <div key={quote.id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                   <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Devis #{quote.id.toUpperCase()}</p>
                  <p className="text-xs text-slate-500">{new Date(quote.date).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{quote.totalAmount.toLocaleString()} MAD</p>
                <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {quote.status}
                </span>
              </div>
           </div>
        ))}
      </div>
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
      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6 text-sm text-amber-800 flex gap-2">
        <AlertCircle size={16} />
        Aucun matériau en stock. Allez dans Stock pour ajouter des articles.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-6 no-print">
      <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
        <Box size={16} className="text-indigo-600" />
        Sortie de Stock (Consommation)
      </h4>
      <div className="flex gap-3 mb-2">
        <div className="flex-1">
          <select 
            className="w-full text-sm rounded-lg border-slate-200 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
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
        <div className="w-24">
           <input 
            type="number" 
            min="0.1" 
            step="0.1" 
            className="w-full text-sm rounded-lg border-slate-200 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={qty}
            onChange={(e) => setQty(parseFloat(e.target.value))}
          />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-5 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm">
          Ajouter
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      <p className="text-xs text-slate-400 mt-2">
        Déduit du stock et calcule le coût réel.
      </p>
    </form>
  );
};

const ProjectDetail = ({ project }: { project: Project }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOCS'>('OVERVIEW');
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  
  const financials = dataService.getProjectFinancials(project.id);
  const materialsUsed = dataService.getMaterialUsage().filter(m => m.projectId === project.id);
  const inventory = dataService.getMaterials();

  const getMaterialName = (id: string) => inventory.find(i => i.id === id)?.name || 'Inconnu';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-white">
        <div className="flex justify-between items-start mb-6">
           <div>
             <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
                  {project.type}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                  project.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {project.status.replace('_', ' ')}
                </span>
             </div>
             <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{project.name}</h2>
           </div>
           <div className="text-right">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Budget Estimé</p>
             <p className="text-2xl font-bold text-slate-900">{project.budget.toLocaleString()} MAD</p>
           </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 text-sm font-medium text-slate-500 border-b border-slate-100 no-print">
          <button 
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-3 transition-all ${activeTab === 'OVERVIEW' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'hover:text-slate-800'}`}
          >
            <Layout size={16} className="inline mr-2" />
            Aperçu & Coûts
          </button>
          <button 
            onClick={() => setActiveTab('DOCS')}
            className={`pb-3 transition-all ${activeTab === 'DOCS' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'hover:text-slate-800'}`}
          >
            <FileText size={16} className="inline mr-2" />
            Factures & Devis
          </button>
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-white">
        {activeTab === 'DOCS' ? (
          <ProjectDocuments projectId={project.id} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in">
            {/* Financial Summary */}
            <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-wide mb-1">Recettes (Payé)</p>
                  <p className="text-2xl font-bold text-emerald-700">{financials.income.toLocaleString()} MAD</p>
              </div>
              <div className="p-5 bg-white rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Coût Matériel</p>
                  <p className="text-2xl font-bold text-slate-700">{financials.materialCost.toLocaleString()} MAD</p>
              </div>
              <div className="p-5 bg-white rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Autres Frais</p>
                  <p className="text-2xl font-bold text-slate-700">{financials.expenses.toLocaleString()} MAD</p>
              </div>
              <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 shadow-lg print:border-slate-300 print:text-black print:bg-white">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 print:text-black">Bénéfice Réel</p>
                  <p className={`text-2xl font-bold ${financials.profit >= 0 ? 'text-emerald-400' : 'text-red-400'} print:text-black`}>
                    {financials.profit.toLocaleString()} MAD
                  </p>
              </div>
            </div>

            {/* Consumption Logic */}
            <div className="col-span-1 md:col-span-3 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-1">
                    <MaterialConsumptionForm projectId={project.id} onConsume={() => setRefreshTrigger(prev => prev + 1)} />
                 </div>
                 <div className="lg:col-span-2">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <PieChart size={16} className="text-slate-400" /> Historique de Consommation
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                      <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/80">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Article</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase">Qté</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase">Coût</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                          {materialsUsed.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-4 py-10 text-center text-slate-400 text-sm italic">
                                Aucun matériau utilisé pour ce projet.
                              </td>
                            </tr>
                          ) : (
                            materialsUsed.map((usage) => (
                              <tr key={usage.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-slate-500 font-medium">{new Date(usage.date).toLocaleDateString('fr-FR')}</td>
                                <td className="px-4 py-3 text-sm font-bold text-slate-800">{getMaterialName(usage.materialId)}</td>
                                <td className="px-4 py-3 text-sm text-right text-slate-600">{usage.quantity}</td>
                                <td className="px-4 py-3 text-sm text-right font-bold text-red-600">
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
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectCard: React.FC<{ project: Project, onClick: () => void, active: boolean }> = ({ project, onClick, active }) => {
  const financials = dataService.getProjectFinancials(project.id);
  // Safe calculation for margin
  const profitMargin = financials.income > 0 ? (financials.profit / financials.income) * 100 : 0;
  
  return (
    <div 
      onClick={onClick}
      className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden group break-inside-avoid ${
        active 
          ? 'bg-indigo-50/50 border-indigo-500 shadow-md ring-1 ring-indigo-500' 
          : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
            {project.type}
          </span>
          <h3 className="font-bold text-slate-900 mt-2 text-lg leading-tight">{project.name}</h3>
        </div>
        {project.status === 'COMPLETED' 
          ? <div className="text-emerald-500 bg-emerald-50 p-1.5 rounded-full"><CheckCircle2 size={18} /></div>
          : <div className="text-amber-500 bg-amber-50 p-1.5 rounded-full"><Hammer size={18} /></div>
        }
      </div>
      
      <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100/50">
        <div className="text-xs text-slate-500 font-medium">
          <Calendar size={12} className="inline mr-1.5 mb-0.5 text-slate-400" />
          {new Date(project.startDate).toLocaleDateString('fr-FR')}
        </div>
        <div className="text-right">
           <p className="text-[10px] font-bold text-slate-400 uppercase">Marge Réelle</p>
           <p className={`font-bold text-sm ${profitMargin < 20 ? 'text-red-600' : 'text-emerald-600'}`}>
             {financials.income === 0 ? 'N/A' : `${profitMargin.toFixed(1)}%`}
           </p>
        </div>
      </div>
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 print:hidden"></div>}
    </div>
  );
};

const AddProjectModal = ({ onClose, onSave }: { onClose: () => void, onSave: (id: string) => void }) => {
  const clients = dataService.getClients();
  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || '',
    name: '',
    type: 'KITCHEN' as const,
    budget: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.clientId) return;

    const newProject: Project = {
      id: `p${Date.now()}`,
      clientId: formData.clientId,
      name: formData.name,
      type: formData.type as any,
      status: ProjectStatus.ESTIMATE,
      startDate: new Date().toISOString(),
      budget: formData.budget,
      description: 'Nouveau Projet'
    };
    
    dataService.addProject(newProject);
    onSave(newProject.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4 animate-in fade-in no-print">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-900">Créer un Projet</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1 rounded-full"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {clients.length === 0 ? (
            <div className="text-center p-6 bg-amber-50 rounded-xl text-amber-800 text-sm border border-amber-100">
              <AlertCircle className="mx-auto mb-3" size={32} />
              <p className="font-bold mb-1">Aucun Client Trouvé</p>
              <p>Vous devez ajouter un client avant de créer un projet.</p>
              <div className="mt-4">
                <a href="#/clients" className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-amber-200 transition-colors">Aller aux Clients</a>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Client</label>
                <select 
                   className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                   value={formData.clientId}
                   onChange={e => setFormData({...formData, clientId: e.target.value})}
                >
                  <option value="" disabled>Choisir un Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Nom du Projet</label>
                <input 
                  required
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="ex. Cuisine Moderne Blanche"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Type</label>
                <select 
                   className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                   value={formData.type}
                   onChange={e => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="KITCHEN">Cuisine</option>
                  <option value="WARDROBE">Dressing / Placard</option>
                  <option value="OFFICE">Bureau</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Budget Estimé (MAD)</label>
                <input 
                  type="number"
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.budget}
                  onChange={e => setFormData({...formData, budget: parseFloat(e.target.value)})}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-sm shadow-md">Créer Projet</button>
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
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Projets</h2>
           <button 
             onClick={() => setIsAddModalOpen(true)}
             className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 shadow-md transition-all active:scale-95 no-print"
           >
             <Plus size={14} /> Nouveau
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-4 print:overflow-visible">
          {projects.length === 0 ? (
            <div className="text-center py-12 px-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
               <div className="bg-white p-3 rounded-full inline-block mb-3 shadow-sm">
                 <Hammer size={24} className="text-slate-300" />
               </div>
               <p className="text-slate-900 font-medium mb-1">Aucun projet actif</p>
               <p className="text-slate-500 text-xs mb-4">Créez un projet pour suivre les coûts et la facturation.</p>
               <button onClick={() => setIsAddModalOpen(true)} className="text-indigo-600 font-bold text-sm hover:underline no-print">Créer le premier projet</button>
            </div>
          ) : (
            projects.map(p => (
              <ProjectCard 
                key={p.id} 
                project={p} 
                active={p.id === selectedId} 
                onClick={() => setSelectedId(p.id)} 
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
          <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center animate-in fade-in">
            <div className="bg-white p-6 rounded-full shadow-sm mb-6">
               <Hammer size={48} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun Projet Sélectionné</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Sélectionnez un projet dans la liste de gauche pour voir les détails financiers et les documents.
            </p>
          </div>
        )}
      </div>

      {isAddModalOpen && <AddProjectModal onClose={() => setIsAddModalOpen(false)} onSave={refreshProjects} />}
    </div>
  );
};

export default Projects;