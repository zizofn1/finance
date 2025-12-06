import React, { useState, useContext } from 'react';
import { dataService } from '../services/dataService';
import { TransactionType, IncomeCategory, ExpenseCategory, PaymentMethod, Transaction, CATEGORY_LABELS } from '../types';
import { X } from 'lucide-react';
import { ToastContext } from '../App';

export const TransactionModal = ({ onClose, onSave, initialData }: { onClose: () => void, onSave: () => void, initialData?: Partial<Transaction> | null }) => {
    const projects = dataService.getProjects();
    const { showToast } = useContext(ToastContext);
    const [formData, setFormData] = useState({
        type: initialData?.type || TransactionType.INCOME,
        category: initialData?.category || IncomeCategory.PROJECT_PAYMENT as string,
        amount: initialData?.amount || 0,
        projectId: initialData?.projectId || '',
        description: initialData?.description || '',
        paymentMethod: initialData?.paymentMethod || PaymentMethod.CASH
    });

    const categories = formData.type === TransactionType.INCOME
        ? Object.values(IncomeCategory)
        : Object.values(ExpenseCategory);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.amount <= 0) return;

        const transactionData: Transaction = {
            id: initialData?.id || `t${Date.now()}`,
            date: initialData?.date || new Date().toISOString(),
            amount: formData.amount,
            type: formData.type,
            category: formData.category as any,
            description: formData.description || 'Transaction Manuelle',
            projectId: formData.projectId || undefined,
            paymentMethod: formData.paymentMethod as PaymentMethod
        };

        if (initialData && initialData.id) {
            dataService.updateTransaction(transactionData);
            showToast("Transaction modifiée avec succès", "success");
        } else {
            dataService.addTransaction(transactionData);
            showToast("Transaction enregistrée avec succès", "success");
        }

        onSave();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in no-print">
            <div className="glass-card rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-white-10">
                <div className="p-5 border-b border-white-10 flex justify-between items-center bg-white-5">
                    <h3 className="font-bold text-lg text-white">{initialData?.id ? 'Modifier Transaction' : 'Enregistrer Transaction'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white bg-white-5 rounded-full p-1"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="flex bg-white-5 p-1.5 rounded-xl border border-white-10">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: TransactionType.INCOME, category: IncomeCategory.PROJECT_PAYMENT })}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${formData.type === TransactionType.INCOME ? 'bg-emerald-500/20 text-emerald-400 shadow-sm border border-emerald-500/30' : 'text-slate-400 hover:text-white'}`}
                        >
                            Recette (Entrée)
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: TransactionType.EXPENSE, category: ExpenseCategory.OVERHEAD })}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${formData.type === TransactionType.EXPENSE ? 'bg-red-500/20 text-red-400 shadow-sm border border-red-500/30' : 'text-slate-400 hover:text-white'}`}
                        >
                            Dépense (Sortie)
                        </button>
                    </div>

                    <div className="relative">
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Montant (MAD)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-500 font-bold">M</span>
                            <input
                                type="number"
                                required
                                min="0"
                                className="w-full border border-white-10 bg-surface rounded-lg pl-7 pr-3 py-2.5 text-lg font-bold text-white focus:border-primary/50 outline-none transition-all"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Catégorie</label>
                            <select
                                className="w-full border border-white-10 bg-surface rounded-lg p-2.5 text-sm text-white focus:border-primary/50 outline-none"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Méthode</label>
                            <select
                                className="w-full border border-white-10 bg-surface rounded-lg p-2.5 text-sm text-white focus:border-primary/50 outline-none"
                                value={formData.paymentMethod}
                                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                            >
                                <option value={PaymentMethod.CASH}>Espèces</option>
                                <option value={PaymentMethod.CHECK}>Chèque</option>
                                <option value={PaymentMethod.TRANSFER}>Virement</option>
                                <option value={PaymentMethod.OTHER}>Autre</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Lien Projet</label>
                        <select
                            className="w-full border border-white-10 bg-surface rounded-lg p-2.5 text-sm text-white focus:border-primary/50 outline-none"
                            value={formData.projectId}
                            onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                        >
                            <option value="">-- Général / Aucun --</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
                        <input
                            className="w-full border border-white-10 bg-surface rounded-lg p-2.5 text-sm text-white focus:border-primary/50 outline-none"
                            placeholder="ex. Avance pour cuisine"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-white-10 text-slate-400 rounded-lg hover:bg-white-5 font-medium">Annuler</button>
                        <button type="submit" className={`flex-1 px-4 py-3 text-white rounded-lg font-bold shadow-md transition-transform active:scale-95 ${formData.type === TransactionType.INCOME ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                            {initialData?.id ? 'Modifier' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
