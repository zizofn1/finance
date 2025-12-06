import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { dataService } from '../services/dataService';
import { User, MapPin, Phone, Mail, ArrowRight, TrendingUp, DollarSign, Package, Plus, X, FileText, Download, Printer, Calendar, List, Pencil } from 'lucide-react';
import { Client, HistoryItem } from '../types';
import { ToastContext } from '../App';

const ClientDetail = ({ client, onClose }: { client: Client, onClose: () => void }) => {
  const profile = dataService.getClientProfile(client.id);
  const projects = dataService.getProjects().filter(p => p.clientId === client.id);
  const { showToast } = useContext(ToastContext);
  const [printMode, setPrintMode] = useState<'basic' | 'detailed' | null>(null); // null means not in print preview mode
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handlePrintRequest = () => {
    setShowPrintOptions(true);
  };

  const executePrint = (mode: 'basic' | 'detailed') => {
    setPrintMode(mode);

    if (mode === 'detailed') {
      setHistory(dataService.getClientHistory(client.id));
    }

    // Allow React to render the state updates before printing
    setTimeout(() => {
      window.print();
      setPrintMode(null); // Reset print mode after printing
    }, 500);

    setShowPrintOptions(false);
  };

  const handleExportCSV = () => {
    // Basic CSV export for this client
    const data = [{
      Client: client.name,
      TotalPaid: profile.totalPaid,
      NetProfit: profile.netProfit,
      Projects: projects.length,
      Notes: client.notes
    }];
    dataService.exportToCSV(data, `client_${client.name.replace(/\s/g, '_')}`);
    showToast("Export CSV réussi", "success");
  };

  return createPortal(
    <div id="print-modal-overlay" className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm print:static print:bg-white print:block print:backdrop-blur-none" onClick={onClose}>
      <div id="print-modal-content" className="w-full md:w-[600px] bg-void h-full shadow-2xl overflow-y-auto print:w-full print:h-auto print:overflow-visible print:shadow-none border-l border-white-10" onClick={e => e.stopPropagation()}>
        {printMode ? (
          // Print View Content
          <div id="print-area" className="bg-white text-black p-8 w-full h-auto">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Rapport Client</h1>
                <h2 className="text-xl text-gray-600">{client.name}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Date d'impression</p>
                <p className="font-bold">{new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg border-b border-gray-300 mb-2 pb-1">Informations Client</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold">Téléphone:</span> {client.phone}</p>
                  <p><span className="font-semibold">Email:</span> {client.email}</p>
                  <p><span className="font-semibold">Adresse:</span> {client.address}</p>
                  {client.notes && <p className="mt-2 text-gray-600 italic">"{client.notes}"</p>}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg border-b border-gray-300 mb-2 pb-1">Résumé Financier</h3>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between"><span className="font-semibold">Total Facturé:</span> <span>{profile.totalInvoiced.toLocaleString()} MAD</span></p>
                  <p className="flex justify-between"><span className="font-semibold">Total Payé:</span> <span>{profile.totalPaid.toLocaleString()} MAD</span></p>
                  <p className="flex justify-between"><span className="font-semibold">Coût Matériaux:</span> <span>{profile.totalMaterialCost.toLocaleString()} MAD</span></p>
                  <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between font-bold text-lg">
                    <span>Bénéfice Net:</span>
                    <span className={profile.netProfit >= 0 ? 'text-black' : 'text-red-600'}>{profile.netProfit.toLocaleString()} MAD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Summary */}
            <div className="mb-8">
              <h3 className="font-bold text-lg border-b border-gray-300 mb-4 pb-1">Projets ({projects.length})</h3>
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="py-2 px-2 font-bold border border-gray-300">Nom du Projet</th>
                    <th className="py-2 px-2 font-bold border border-gray-300">Type</th>
                    <th className="py-2 px-2 font-bold border border-gray-300">Date Début</th>
                    <th className="py-2 px-2 font-bold border border-gray-300 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id}>
                      <td className="py-2 px-2 border border-gray-300">{p.name}</td>
                      <td className="py-2 px-2 border border-gray-300">{p.type}</td>
                      <td className="py-2 px-2 border border-gray-300">{new Date(p.startDate).toLocaleDateString('fr-FR')}</td>
                      <td className="py-2 px-2 border border-gray-300 text-right">{p.status}</td>
                    </tr>
                  ))}
                  {projects.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-gray-500 border border-gray-300">Aucun projet</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Detailed History */}
            {printMode === 'detailed' && (
              <div className="break-before-page">
                <h3 className="font-bold text-lg border-b border-gray-300 mb-4 pb-1">Historique Détaillé</h3>
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="py-2 px-2 font-bold border border-gray-300 w-24">Date</th>
                      <th className="py-2 px-2 font-bold border border-gray-300 w-24">Type</th>
                      <th className="py-2 px-2 font-bold border border-gray-300">Description</th>
                      <th className="py-2 px-2 font-bold border border-gray-300 text-right w-32">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-2 border border-gray-300">{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                        <td className="py-2 px-2 border border-gray-300 text-xs font-bold uppercase">{item.type === 'USAGE' ? 'STOCK' : item.type}</td>
                        <td className="py-2 px-2 border border-gray-300">
                          {item.description}
                          {item.meta?.projectName && <div className="text-xs text-gray-500">Projet: {item.meta.projectName}</div>}
                        </td>
                        <td className={`py-2 px-2 border border-gray-300 text-right font-bold ${item.amount < 0 ? 'text-red-600' : ''}`}>
                          {item.amount !== 0 ? `${item.amount > 0 ? '+' : ''}${item.amount.toLocaleString()} MAD` : '-'}
                        </td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr><td colSpan={4} className="py-4 text-center text-gray-500 border border-gray-300">Aucun historique disponible</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-400">
              Généré par Fun Design F&Z ERP
            </div>
          </div>
        ) : (
          // Regular Client Detail View Content
          <>
            <div className="p-6 border-b border-white-10 flex justify-between items-start bg-white-5 no-print">
              <div>
                <h2 className="text-2xl font-bold text-white font-display">{client.name}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                  <MapPin size={14} /> {client.address}
                </div>
              </div>
              <div className="flex items-center gap-2 no-print">
                <button onClick={handleExportCSV} className="text-slate-400 hover:text-primary p-2 rounded hover:bg-primary/10 transition-colors" title="Export CSV">
                  <Download size={20} />
                </button>
                <button onClick={handlePrintRequest} className="text-slate-400 hover:text-primary p-2 rounded hover:bg-primary/10 transition-colors" title="Imprimer">
                  <Printer size={20} />
                </button>
                <button onClick={onClose} className="text-slate-400 hover:text-white p-2">Fermer</button>
              </div>
            </div>

            {/* Print Options Modal */}
            {showPrintOptions && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-surface border border-white-10 rounded-xl p-6 shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Printer size={20} className="text-primary" /> Options d'Impression
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => executePrint('basic')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-white-10 hover:bg-white-5 hover:border-primary/50 transition-all group"
                    >
                      <div className="text-left">
                        <p className="font-bold text-white group-hover:text-primary">Rapport Basique</p>
                        <p className="text-xs text-slate-400">Info client et résumé financier</p>
                      </div>
                      <FileText size={18} className="text-slate-500 group-hover:text-primary" />
                    </button>
                    <button
                      onClick={() => executePrint('detailed')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-white-10 hover:bg-white-5 hover:border-primary/50 transition-all group"
                    >
                      <div className="text-left">
                        <p className="font-bold text-white group-hover:text-primary">Rapport Détaillé</p>
                        <p className="text-xs text-slate-400">Inclut historique complet et stock</p>
                      </div>
                      <List size={18} className="text-slate-500 group-hover:text-primary" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowPrintOptions(false)}
                    className="mt-4 w-full py-2 text-sm text-slate-400 hover:text-white font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            <div className="p-6 space-y-8">
              {/* Financial Profile Card */}
              <div className="bg-surface text-white rounded-xl p-6 shadow-lg border border-white-10">
                <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" /> Profil Financier
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Total Payé</p>
                    <p className="text-2xl font-bold text-emerald-400">{profile.totalPaid.toLocaleString()} MAD</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Bénéfice Net</p>
                    <p className={`text-2xl font-bold ${profile.netProfit > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {profile.netProfit.toLocaleString()} MAD
                    </p>
                  </div>
                  <div className="col-span-2 pt-4 border-t border-white-10 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Coût Matériaux</p>
                      <p className="text-lg font-semibold text-slate-300">{profile.totalMaterialCost.toLocaleString()} MAD</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Facturé</p>
                      <p className="text-lg font-semibold text-slate-300">{profile.totalInvoiced.toLocaleString()} MAD</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-white">Coordonnées</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-white-5 rounded-lg border border-white-5">
                    <Phone size={18} className="text-slate-400" />
                    <span className="text-slate-300">{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white-5 rounded-lg border border-white-5">
                    <Mail size={18} className="text-slate-400" />
                    <span className="text-slate-300 truncate">{client.email}</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 text-sm italic border border-amber-500/20">
                  "{client.notes}"
                </div>
              </div>

              {/* Project History */}
              <div>
                <h4 className="font-bold text-white mb-3">Historique Projets ({projects.length})</h4>
                <div className="space-y-3">
                  {projects.map(p => (
                    <div key={p.id} className="border border-white-10 rounded-lg p-4 flex justify-between items-center hover:bg-white-5 transition-colors bg-surface">
                      <div>
                        <h5 className="font-bold text-slate-200">{p.name}</h5>
                        <span className="text-xs text-slate-500">{p.type} • {new Date(p.startDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded font-bold ${p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && <p className="text-slate-500 text-sm">Aucun projet trouvé.</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

const AddClientModal = ({ onClose, onSave, initialData }: { onClose: () => void, onSave: () => void, initialData?: Client | null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    notes: initialData?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const clientData: Client = {
      id: initialData?.id || `c${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address || 'No Address',
      notes: formData.notes
    };

    if (initialData) {
      dataService.updateClient(clientData);
    } else {
      dataService.addClient(clientData);
    }

    onSave();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
      <div className="glass-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-white-10">
        <div className="p-4 border-b border-white-10 flex justify-between items-center bg-white-5">
          <h3 className="font-bold text-lg text-white">{initialData ? 'Modifier Client' : 'Ajouter Client'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Nom Complet *</label>
            <input
              required
              className="w-full bg-surface border border-white-10 rounded-lg p-2.5 text-sm text-white focus:border-primary/50 outline-none"
              placeholder="ex. Ahmed Ben Ali"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Téléphone</label>
            <input
              className="w-full bg-surface border border-white-10 rounded-lg p-2.5 text-sm text-white focus:border-primary/50 outline-none"
              placeholder="+216 00 000 000"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Email</label>
            <input
              type="email"
              className="w-full bg-surface border border-white-10 rounded-lg p-2.5 text-sm text-white focus:border-primary/50 outline-none"
              placeholder="client@example.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Adresse</label>
            <input
              className="w-full bg-surface border border-white-10 rounded-lg p-2.5 text-sm text-white focus:border-primary/50 outline-none"
              placeholder="Ville, Quartier..."
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Notes</label>
            <textarea
              className="w-full bg-surface border border-white-10 rounded-lg p-2.5 text-sm text-white focus:border-primary/50 outline-none resize-none h-20"
              placeholder="Notes supplémentaires..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-white-10 text-slate-400 rounded-lg hover:bg-white-5">Annuler</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 font-medium shadow-md">
              {initialData ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const Clients = () => {
  const [clients, setClients] = useState(dataService.getClients());
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { showToast } = useContext(ToastContext);

  const refreshClients = () => {
    setClients(dataService.getClients());
  };

  const handleGlobalExportCSV = () => {
    const data = clients.map(client => {
      const profile = dataService.getClientProfile(client.id);
      return {
        Nom: client.name,
        Telephone: client.phone,
        Adresse: client.address,
        'Bénéfice Net': profile.netProfit,
        'Projets': profile.projectCount
      };
    });
    dataService.exportToCSV(data, 'liste_clients_complet');
    showToast("Liste des clients exportée", "success");
  };

  const handleGlobalPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className={selectedClient ? 'print:hidden' : ''}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-white font-display">CRM Clients</h2>
          <div className="flex gap-2 no-print">
            <button
              onClick={handleGlobalPrint}
              className="flex items-center gap-2 border border-white-10 bg-surface text-slate-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white-5 transition-colors shadow-sm"
            >
              <Printer size={16} /> Imprimer Liste
            </button>
            <button
              onClick={handleGlobalExportCSV}
              className="flex items-center gap-2 border border-white-10 bg-surface text-slate-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white-5 transition-colors shadow-sm"
            >
              <Download size={16} /> Export CSV
            </button>
            <button
              onClick={() => {
                setEditingClient(null);
                setIsAddModalOpen(true);
              }}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/80 flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] font-bold transition-all active:scale-95"
            >
              <User size={16} /> Ajouter Client
            </button>
          </div>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-20 bg-white-5 rounded-xl border border-white-10 border-dashed">
            <User size={48} className="mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-white">Aucun Client</h3>
            <p className="text-slate-500 mb-4">Ajoutez votre premier client pour commencer.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-primary font-medium hover:underline flex items-center justify-center gap-1 mx-auto no-print"
            >
              <Plus size={16} /> Créer Client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map(client => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="glass-card rounded-xl shadow-sm border border-white-10 p-6 flex flex-col justify-between cursor-pointer hover:border-primary/50 transition-all group print:border-slate-300 print:shadow-none break-inside-avoid relative"
              >
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingClient(client);
                      setIsAddModalOpen(true);
                    }}
                    className="p-1.5 bg-white-5 hover:bg-primary/20 text-slate-400 hover:text-primary rounded-lg transition-colors border border-transparent hover:border-primary/30"
                    title="Modifier"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white-5 flex items-center justify-center text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors border border-white-5">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-primary transition-colors">{client.name}</h3>
                        <p className="text-xs text-slate-500 truncate max-w-[150px]">{client.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-white-5 p-2 rounded text-center border border-white-5">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Projets</p>
                      <p className="text-lg font-bold text-slate-200">
                        {dataService.getProjects().filter(p => p.clientId === client.id).length}
                      </p>
                    </div>
                    <div className="bg-emerald-500/10 p-2 rounded text-center border border-emerald-500/20">
                      <p className="text-[10px] text-emerald-400 uppercase font-bold">Profit</p>
                      <p className="text-lg font-bold text-emerald-400">
                        {dataService.getClientProfile(client.id).netProfit.toLocaleString()} MAD
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedClient && <ClientDetail client={selectedClient} onClose={() => setSelectedClient(null)} />}
      {isAddModalOpen && (
        <AddClientModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={refreshClients}
          initialData={editingClient}
        />
      )}
    </div>
  );
};

export default Clients;