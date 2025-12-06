import React, { useState } from 'react';
import { Package, AlertTriangle, Plus, Search, X, TrendingDown, Layers } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Material } from '../types';

const Inventory = () => {
  const [materials, setMaterials] = useState(dataService.getMaterials());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<{ name: string, unit: string, costPerUnit: number, currentStock: number, minStockLevel: number, supplier?: string }>({ name: '', unit: 'Sheet', costPerUnit: 0, currentStock: 0, minStockLevel: 5, supplier: '' });
  const [restockItem, setRestockItem] = useState<Material | null>(null);
  const [restockAmount, setRestockAmount] = useState(1);
  const [restockCost, setRestockCost] = useState(0);
  const [restockSupplier, setRestockSupplier] = useState('');

  const handleRefresh = () => {
    setMaterials(dataService.getMaterials());
  };

  const handleRestock = (id: string, amount: number, cost: number, supplier?: string) => {
    if (amount <= 0) return;
    const item = materials.find(m => m.id === id);
    if (item) {
      dataService.restockMaterial(id, amount, cost, supplier);
      setRestockItem(null);
      handleRefresh();
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;

    dataService.addMaterial({
      id: `m${Date.now()}`,
      ...newItem
    });

    setNewItem({ name: '', unit: 'Sheet', costPerUnit: 0, currentStock: 0, minStockLevel: 5, supplier: '' });
    setShowAddForm(false);
    handleRefresh();
  };

  const totalValue = materials.reduce((acc, m) => acc + (m.currentStock * m.costPerUnit), 0);
  const lowStockItems = materials.filter(m => m.currentStock <= m.minStockLevel);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight font-display">Stock</h2>
          <p className="text-slate-400 mt-1">Gérez votre inventaire et la valeur des actifs.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/80 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all active:scale-95 flex items-center gap-2 no-print"
        >
          <Plus size={18} /> Ajouter Matériau
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl border border-white-10 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-5">
            <Layers size={100} className="text-white" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Valeur Totale</p>
          <p className="text-3xl font-bold text-white mt-2">{totalValue.toLocaleString()} MAD</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <span className="bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Valorisation Actuelle</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-white-10 shadow-sm">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Articles en Stock</p>
          <div className="flex items-end gap-3 mt-2">
            <p className="text-3xl font-bold text-white">{materials.length}</p>
            <span className="text-sm text-slate-500 mb-1 font-medium">Références Uniques</span>
          </div>
          <div className="w-full bg-white-5 h-1.5 mt-3 rounded-full overflow-hidden">
            <div className="bg-secondary h-full w-3/4"></div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border shadow-sm transition-colors ${lowStockItems.length > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-bold uppercase tracking-wide ${lowStockItems.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                Rupture Possible
              </p>
              <p className={`text-3xl font-bold mt-2 ${lowStockItems.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {lowStockItems.length}
              </p>
              <p className={`text-xs mt-1 font-medium ${lowStockItems.length > 0 ? 'text-red-400/80' : 'text-emerald-400/80'}`}>
                Articles sous le seuil minimum
              </p>
            </div>
            {lowStockItems.length > 0 && <AlertTriangle className="text-red-500" size={28} />}
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="glass-card p-8 rounded-xl border border-primary/30 shadow-lg animate-in fade-in slide-in-from-top-4 no-print relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-white">Nouveau Matériau</h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white bg-white-5 p-2 rounded-full"><X size={20} /></button>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Nom du Matériau</label>
              <input
                autoFocus
                className="w-full border border-white-10 bg-surface rounded-lg p-2.5 text-sm font-medium text-white focus:border-primary/50 outline-none"
                placeholder="ex. MDF 18mm Blanc"
                value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Unité</label>
              <select
                className="w-full border border-white-10 bg-surface rounded-lg p-2.5 text-sm font-medium text-white focus:border-primary/50 outline-none"
                value={newItem.unit}
                onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
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
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Coût (MAD)</label>
              <input
                type="number"
                className="w-full border border-white-10 bg-surface rounded-lg p-2.5 text-sm font-medium text-white focus:border-primary/50 outline-none"
                value={newItem.costPerUnit}
                onChange={e => setNewItem({ ...newItem, costPerUnit: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Stock Initial</label>
              <input
                type="number"
                className="w-full border border-white-10 bg-surface rounded-lg p-2.5 text-sm font-medium text-white focus:border-primary/50 outline-none"
                value={newItem.currentStock}
                onChange={e => setNewItem({ ...newItem, currentStock: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Fournisseur</label>
              <input
                type="text"
                className="w-full border border-white-10 bg-surface rounded-lg p-2.5 text-sm font-medium text-white focus:border-primary/50 outline-none"
                placeholder="ex. Bois Maroc"
                value={newItem.supplier || ''}
                onChange={e => setNewItem({ ...newItem, supplier: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-5 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:bg-white-5 rounded-lg transition-colors">Annuler</button>
              <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/80 shadow-md">Enregistrer</button>
            </div>
          </form>
          <p className="text-xs text-amber-400 mt-2 flex items-center gap-1"><AlertTriangle size={12} /> L'ajout de stock initial créera automatiquement une dépense.</p>
        </div>
      )}

      {/* Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="glass-card p-6 rounded-xl shadow-2xl w-full max-w-sm border border-white-10">
            <h3 className="font-bold text-lg text-white mb-4">Ajouter Stock</h3>
            <p className="text-sm text-slate-400 mb-4">
              Ajout de stock pour <span className="text-white font-bold">{restockItem.name}</span>.
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleRestock(restockItem.id, restockAmount, restockCost, restockSupplier);
            }}>
              <div className="mb-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Quantité à ajouter</label>
                  <input
                    type="number"
                    autoFocus
                    min="1"
                    className="w-full border border-white-10 bg-surface rounded-lg p-3 text-lg font-bold text-white focus:border-primary/50 outline-none text-center"
                    value={restockAmount}
                    onChange={e => setRestockAmount(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Prix d'achat Unitaire (MAD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border border-white-10 bg-surface rounded-lg p-3 text-lg font-bold text-white focus:border-primary/50 outline-none text-center"
                    value={restockCost}
                    onChange={e => setRestockCost(parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-[10px] text-slate-500 mt-1 text-center">
                    Prix Actuel: {restockItem.costPerUnit} MAD
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Fournisseur</label>
                  <input
                    type="text"
                    className="w-full border border-white-10 bg-surface rounded-lg p-3 text-sm font-medium text-white focus:border-primary/50 outline-none"
                    placeholder="ex. Bois Maroc"
                    value={restockSupplier}
                    onChange={e => setRestockSupplier(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-400 hover:bg-white-5 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="glass-card rounded-xl shadow-sm border border-white-10 overflow-hidden">
        <div className="p-5 border-b border-white-10 flex flex-col sm:flex-row gap-4 justify-between bg-white-5 no-print">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              className="pl-10 pr-4 py-2 w-full text-sm bg-surface border border-white-10 rounded-lg focus:border-primary/50 outline-none shadow-sm text-white placeholder-slate-500"
              placeholder="Rechercher..."
            />
          </div>
        </div>
        <table className="min-w-full divide-y divide-white-5">
          <thead className="bg-white-5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Matériau</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Coût / Unité</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4">Niveau Stock</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Valeur Totale</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white-5">
            {materials.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-500">
                  <Package size={56} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium text-lg">L'inventaire est vide</p>
                  <p className="text-sm opacity-60">Ajoutez des matériaux pour commencer le suivi.</p>
                </td>
              </tr>
            ) : materials.map((m) => {
              // 3-Tier Traffic Light System
              let statusColor = 'bg-emerald-500'; // >= 6
              let statusBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
              let statusText = 'OK';

              if (m.currentStock === 0) {
                statusColor = 'bg-slate-500';
                statusBadgeClass = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                statusText = 'Épuisé';
              } else if (m.currentStock < 3) {
                statusColor = 'bg-red-500';
                statusBadgeClass = 'bg-red-500/10 text-red-400 border-red-500/20';
                statusText = 'Critique';
              } else if (m.currentStock < 6) {
                statusColor = 'bg-orange-500';
                statusBadgeClass = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
                statusText = 'Attention';
              }

              const stockPercentage = Math.min(100, (m.currentStock / 20) * 100); // Visual max scale approx 20 units

              return (
                <tr key={m.id} className="hover:bg-white-5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{m.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {m.id.toUpperCase()}</div>
                    {m.supplier && <div className="text-[10px] text-emerald-400 mt-1 font-medium">Frs: {m.supplier}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 font-medium">
                    {m.costPerUnit.toLocaleString()} MAD <span className="text-slate-500 text-xs font-normal">/ {m.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-300 w-8">{m.currentStock}</span>
                      <div className="flex-1 h-2 bg-white-10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${statusColor}`}
                          style={{ width: `${stockPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-white">
                    {(m.costPerUnit * m.currentStock).toLocaleString()} MAD
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusBadgeClass}`}>
                      {statusText}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setRestockItem(m);
                        setRestockAmount(1);
                        setRestockCost(m.costPerUnit);
                        setRestockSupplier(m.supplier || '');
                      }}
                      className="p-2 bg-white-5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors border border-transparent hover:border-emerald-500/30"
                      title="Ajouter Stock"
                    >
                      <Plus size={18} />
                    </button>
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