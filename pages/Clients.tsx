import React, { useState, useContext } from 'react';
import { dataService } from '../services/dataService';
import { User, MapPin, Phone, Mail, ArrowRight, TrendingUp, DollarSign, Package, Plus, X, FileText, Download, Printer } from 'lucide-react';
import { Client } from '../types';
import { ToastContext } from '../App';

const ClientDetail = ({ client, onClose }: { client: Client, onClose: () => void }) => {
  const profile = dataService.getClientProfile(client.id);
  const projects = dataService.getProjects().filter(p => p.clientId === client.id);
  const { showToast } = useContext(ToastContext);

  const handleExportCSV = () => {
    // Basic CSV export for this client
    const data = [{
      Client: client.name,
      TotalPaid: profile.totalPaid,
      NetProfit: profile.netProfit,
      Projects: projects.length,
      Notes: client.notes
    }];
    dataService.exportToCSV(data, `client_${client.name.replace(/\s/g,'_')}`);
    showToast("Export CSV réussi", "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-20 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full md:w-[600px] bg-white h-full shadow-2xl overflow-y-auto print:w-full" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
           <div>
             <h2 className="text-2xl font-bold text-slate-900">{client.name}</h2>
             <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
               <MapPin size={14} /> {client.address}
             </div>
           </div>
           <div className="flex items-center gap-2 no-print">
             <button onClick={handleExportCSV} className="text-slate-500 hover:text-indigo-600 p-2 rounded hover:bg-indigo-50 transition-colors" title="Export CSV">
               <Download size={20} />
             </button>
             <button onClick={() => window.print()} className="text-slate-500 hover:text-indigo-600 p-2 rounded hover:bg-indigo-50 transition-colors print:hidden" title="Imprimer">
               <Printer size={20} />
             </button>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">Fermer</button>
           </div>
        </div>

        <div className="p-6 space-y-8">
           {/* Financial Profile Card */}
           <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg print:bg-white print:text-black print:border print:border-black">
              <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2 print:text-black">
                <TrendingUp size={16} /> Profil Financier
              </h3>
              <div className="grid grid-cols-2 gap-6">
                 <div>
                   <p className="text-xs text-slate-400 uppercase print:text-black">Total Payé</p>
                   <p className="text-2xl font-bold text-emerald-400 print:text-black">{profile.totalPaid.toLocaleString()} MAD</p>
                 </div>
                 <div>
                   <p className="text-xs text-slate-400 uppercase print:text-black">Bénéfice Net</p>
                   <p className={`text-2xl font-bold ${profile.netProfit > 0 ? 'text-blue-400' : 'text-red-400'} print:text-black`}>
                     {profile.netProfit.toLocaleString()} MAD
                   </p>
                 </div>
                 <div className="col-span-2 pt-4 border-t border-slate-700 print:border-slate-300 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Coût Matériaux</p>
                      <p className="text-lg font-semibold text-slate-300 print:text-black">{profile.totalMaterialCost.toLocaleString()} MAD</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Facturé</p>
                      <p className="text-lg font-semibold text-slate-300 print:text-black">{profile.totalInvoiced.toLocaleString()} MAD</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Contact Info */}
           <div className="space-y-3">
             <h4 className="font-bold text-slate-900">Coordonnées</h4>
             <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg print:border print:border-slate-200">
                  <Phone size={18} className="text-slate-400" />
                  <span className="text-slate-700">{client.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg print:border print:border-slate-200">
                  <Mail size={18} className="text-slate-400" />
                  <span className="text-slate-700 truncate">{client.email}</span>
                </div>
             </div>
             <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-sm italic border border-amber-100 print:border-slate-300 print:text-black">
               "{client.notes}"
             </div>
           </div>

           {/* Project History */}
           <div>
             <h4 className="font-bold text-slate-900 mb-3">Historique Projets ({projects.length})</h4>
             <div className="space-y-3">
               {projects.map(p => (
                 <div key={p.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div>
                      <h5 className="font-bold text-slate-800">{p.name}</h5>
                      <span className="text-xs text-slate-500">{p.type} • {new Date(p.startDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="text-right">
                       <span className={`text-xs px-2 py-1 rounded font-bold ${
                         p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                       } print:border print:border-slate-300 print:text-black`}>
                         {p.status}
                       </span>
                    </div>
                 </div>
               ))}
               {projects.length === 0 && <p className="text-slate-400 text-sm">Aucun projet trouvé.</p>}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const AddClientModal = ({ onClose, onSave }: { onClose: () => void, onSave: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    dataService.addClient({
      id: `c${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address || 'No Address',
      notes: formData.notes
    });
    
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm p-4 no-print">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-900">Ajouter Client</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nom Complet *</label>
            <input 
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="ex. Ahmed Ben Ali"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Téléphone</label>
            <input 
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="+216 00 000 000"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Adresse</label>
            <input 
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ville, Quartier..."
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <div className="pt-2 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Annuler</button>
             <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Créer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Clients = () => {
  const [clients, setClients] = useState(dataService.getClients());
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900">CRM Clients</h2>
        <div className="flex gap-2 no-print">
          <button 
            onClick={handleGlobalPrint}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer size={16} /> Imprimer Liste
          </button>
          <button 
            onClick={handleGlobalExportCSV}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={16} /> Export CSV
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2 shadow-sm font-bold"
          >
            <User size={16} /> Ajouter Client
          </button>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
          <User size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">Aucun Client</h3>
          <p className="text-slate-500 mb-4">Ajoutez votre premier client pour commencer.</p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="text-blue-600 font-medium hover:underline flex items-center justify-center gap-1 mx-auto no-print"
          >
            <Plus size={16}/> Créer Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => (
              <div 
                key={client.id} 
                onClick={() => setSelectedClient(client)}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between cursor-pointer hover:border-blue-400 transition-all group print:border-slate-300 print:shadow-none break-inside-avoid"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors print:bg-white print:border print:border-slate-200">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{client.name}</h3>
                        <p className="text-xs text-slate-400 truncate max-w-[150px]">{client.address}</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-500 no-print" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-slate-50 p-2 rounded text-center print:border print:border-slate-200">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Projets</p>
                        <p className="text-lg font-bold text-slate-700">
                          {dataService.getProjects().filter(p => p.clientId === client.id).length}
                        </p>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded text-center print:border print:border-slate-200">
                        <p className="text-[10px] text-emerald-600 uppercase font-bold">Profit</p>
                        <p className="text-lg font-bold text-emerald-700">
                          {dataService.getClientProfile(client.id).netProfit.toLocaleString()} MAD
                        </p>
                    </div>
                  </div>
                </div>
              </div>
          ))}
        </div>
      )}

      {selectedClient && <ClientDetail client={selectedClient} onClose={() => setSelectedClient(null)} />}
      {isAddModalOpen && <AddClientModal onClose={() => setIsAddModalOpen(false)} onSave={refreshClients} />}
    </div>
  );
};

export default Clients;