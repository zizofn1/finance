import React, { useState } from 'react';
import { Package, AlertTriangle, Plus, Search, X, TrendingDown, Layers } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Material } from '../types';

const Inventory = () => {
  const [materials, setMaterials] = useState(dataService.getMaterials());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', unit: 'Sheet', costPerUnit: 0, currentStock: 0, minStockLevel: 5 });

  const handleRefresh = () => {
    setMaterials(dataService.getMaterials());
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;
    
    dataService.addMaterial({
      id: `m${Date.now()}`,
      ...newItem
    });
    
    setNewItem({ name: '', unit: 'Sheet', costPerUnit: 0, currentStock: 0, minStockLevel: 5 });
    setShowAddForm(false);
    handleRefresh();
  };

  const totalValue = materials.reduce((acc, m) => acc + (m.currentStock * m.costPerUnit), 0);
  const lowStockItems = materials.filter(m => m.currentStock <= m.minStockLevel);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Stock</h2>
          <p className="text-slate-500 mt-1">Gérez votre inventaire et la valeur des actifs.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95 flex items-center gap-2 no-print"
        >
          <Plus size={18} /> Ajouter Matériau
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-5">
             <Layers size={100} />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Valeur Totale</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{totalValue.toLocaleString()} MAD</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 font-medium">
             <span className="bg-emerald-50 px-2 py-0.5 rounded-full">Valorisation Actuelle</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Articles en Stock</p>
          <div className="flex items-end gap-3 mt-2">
            <p className="text-3xl font-bold text-slate-900">{materials.length}</p>
            <span className="text-sm text-slate-500 mb-1 font-medium">Références Uniques</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
             <div className="bg-blue-500 h-full w-3/4"></div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border shadow-sm transition-colors ${lowStockItems.length > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-bold uppercase tracking-wide ${lowStockItems.length > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                Rupture Possible
              </p>
              <p className={`text-3xl font-bold mt-2 ${lowStockItems.length > 0 ? 'text-red-800' : 'text-emerald-800'}`}>
                {lowStockItems.length}
              </p>
              <p className={`text-xs mt-1 font-medium ${lowStockItems.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                Articles sous le seuil minimum
              </p>
            </div>
            {lowStockItems.length > 0 && <AlertTriangle className="text-red-500" size={28} />}
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white p-8 rounded-xl border border-indigo-100 shadow-lg animate-in fade-in slide-in-from-top-4 no-print">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-xl text-slate-900">Nouveau Matériau</h3>
             <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full"><X size={20}/></button>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Nom du Matériau</label>
              <input 
                autoFocus
                className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="ex. MDF 18mm Blanc"
                value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Unité</label>
              <select 
                className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newItem.unit}
                onChange={e => setNewItem({...newItem, unit: e.target.value})}
              >
                <option>Feuille</option>
                <option>Mètre</option>
                <option>Boîte</option>
                <option>Litre</option>
                <option>Paire</option>
                <option>Pièce</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Coût (MAD)</label>
              <input 
                type="number" 
                className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newItem.costPerUnit}
                onChange={e => setNewItem({...newItem, costPerUnit: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Stock Initial</label>
              <input 
                type="number" 
                className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newItem.currentStock}
                onChange={e => setNewItem({...newItem, currentStock: parseFloat(e.target.value)})}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-5 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Annuler</button>
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md">Enregistrer</button>
            </div>
          </form>
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><AlertTriangle size={12}/> L'ajout de stock initial créera automatiquement une dépense.</p>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 no-print">
           <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              className="pl-10 pr-4 py-2 w-full text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm" 
              placeholder="Rechercher..." 
            />
          </div>
          <div className="flex gap-2">
             {/* Future Filter Controls */}
          </div>
        </div>
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Matériau</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Coût / Unité</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4">Niveau Stock</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Valeur Totale</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {materials.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                  <Package size={56} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium text-lg">L'inventaire est vide</p>
                  <p className="text-sm opacity-60">Ajoutez des matériaux pour commencer le suivi.</p>
                </td>
              </tr>
            ) : materials.map((m) => {
              // 3-Tier Traffic Light System
              let statusColor = 'bg-emerald-500'; // >= 6
              let statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
              let statusText = 'OK';
              
              if (m.currentStock === 0) {
                 statusColor = 'bg-slate-400';
                 statusBadgeClass = 'bg-slate-100 text-slate-500 border-slate-200';
                 statusText = 'Épuisé';
              } else if (m.currentStock < 3) {
                 statusColor = 'bg-red-500';
                 statusBadgeClass = 'bg-red-50 text-red-700 border-red-100';
                 statusText = 'Critique';
              } else if (m.currentStock < 6) {
                 statusColor = 'bg-orange-500';
                 statusBadgeClass = 'bg-orange-50 text-orange-700 border-orange-100';
                 statusText = 'Attention';
              }

              const stockPercentage = Math.min(100, (m.currentStock / 20) * 100); // Visual max scale approx 20 units

              return (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{m.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {m.id.toUpperCase()}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {m.costPerUnit.toLocaleString()} MAD <span className="text-slate-400 text-xs font-normal">/ {m.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                       <span className="text-sm font-bold text-slate-700 w-8">{m.currentStock}</span>
                       <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${statusColor}`} 
                            style={{ width: `${stockPercentage}%` }}
                          />
                       </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                    {(m.costPerUnit * m.currentStock).toLocaleString()} MAD
                  </td>
                  <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusBadgeClass}`}>
                        {statusText}
                      </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;