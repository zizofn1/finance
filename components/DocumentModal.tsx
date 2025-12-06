import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, User, FileText, Save, Clock } from 'lucide-react';
import { Quote, Invoice, InvoiceItem, Client, DocStatus } from '../types';
import { dataService } from '../services/dataService';

interface DocumentModalProps {
    type: 'QUOTE' | 'INVOICE';
    onClose: () => void;
    onSave: () => void;
    initialData?: Quote | Invoice;
}

const DocumentModal = ({ type, onClose, onSave, initialData }: DocumentModalProps) => {
    const [clients] = useState<Client[]>(dataService.getClients());
    const [formData, setFormData] = useState({
        clientId: initialData?.clientId || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        dueDate: (initialData as Invoice)?.dueDate || '',
        items: initialData?.items || [] as InvoiceItem[],
        status: initialData?.status || DocStatus.DRAFT
    });

    const [newItem, setNewItem] = useState<InvoiceItem>({
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
    });

    // Auto-calculate total for new item
    useEffect(() => {
        setNewItem(prev => ({ ...prev, total: prev.quantity * prev.unitPrice }));
    }, [newItem.quantity, newItem.unitPrice]);

    const handleAddItem = () => {
        if (!newItem.description || newItem.quantity <= 0) return;
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
        setNewItem({ description: '', quantity: 1, unitPrice: 0, total: 0 });
    };

    const handleRemoveItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + item.total, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.clientId || formData.items.length === 0) return;

        const totalAmount = calculateTotal();
        const commonData = {
            clientId: formData.clientId,
            date: formData.date,
            items: formData.items,
            totalAmount,
            status: formData.status
        };

        if (type === 'QUOTE') {
            const quote: Quote = {
                id: initialData?.id || dataService.generateDocumentId('QUOTE'),
                ...commonData
            };
            // If editing, update, else add
            if (initialData) {
                dataService.updateQuote(quote);
            } else {
                dataService.addQuote(quote);
            }
        } else {
            const invoice: Invoice = {
                id: initialData?.id || dataService.generateDocumentId('INVOICE'),
                dueDate: formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                paidAmount: (initialData as Invoice)?.paidAmount || 0,
                ...commonData
            };
            if (initialData) {
                dataService.updateInvoice(invoice);
            } else {
                dataService.addInvoice(invoice);
            }
        }

        onSave();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl border border-white-10">

                {/* Header */}
                <div className="p-6 border-b border-white-10 flex justify-between items-center bg-white-5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="text-primary" />
                        {initialData ? 'Modifier' : 'Nouveau'} {type === 'QUOTE' ? 'Devis' : 'Facture'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-white-10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="doc-form" onSubmit={handleSubmit} className="space-y-8">

                        {/* Top Section: Client & Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Client</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-slate-500" size={16} />
                                    <select
                                        required
                                        className="w-full bg-surface border border-white-10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-primary/50 outline-none appearance-none"
                                        value={formData.clientId}
                                        onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                                    >
                                        <option value="">Sélectionner un client</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 text-slate-500" size={16} />
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-surface border border-white-10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-primary/50 outline-none"
                                        value={formData.date.split('T')[0]}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            {type === 'INVOICE' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Échéance</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 text-slate-500" size={16} />
                                        <input
                                            type="date"
                                            className="w-full bg-surface border border-white-10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-primary/50 outline-none"
                                            value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
                                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items Section */}
                        <div>
                            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-white-10 pb-2">Articles / Prestations</h3>

                            {/* Items List */}
                            <div className="space-y-2 mb-4">
                                {formData.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 bg-white-5 p-3 rounded-lg group hover:bg-white-10 transition-colors">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">{item.description}</p>
                                        </div>
                                        <div className="w-24 text-right">
                                            <p className="text-sm text-slate-300">{item.quantity} x {item.unitPrice}</p>
                                        </div>
                                        <div className="w-32 text-right font-bold text-white">
                                            {item.total.toLocaleString()} MAD
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {formData.items.length === 0 && (
                                    <div className="text-center py-8 text-slate-500 border-2 border-dashed border-white-10 rounded-lg">
                                        Aucun article ajouté
                                    </div>
                                )}
                            </div>

                            {/* Add Item Form */}
                            <div className="grid grid-cols-12 gap-3 bg-surface p-4 rounded-xl border border-white-10">
                                <div className="col-span-6">
                                    <input
                                        placeholder="Description (ex: Caisson Cuisine)"
                                        className="w-full bg-black/20 border border-white-10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                                        value={newItem.description}
                                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Qté"
                                        className="w-full bg-black/20 border border-white-10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none text-center"
                                        value={newItem.quantity}
                                        onChange={e => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Prix Unitaire"
                                        className="w-full bg-black/20 border border-white-10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none text-right"
                                        value={newItem.unitPrice}
                                        onChange={e => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) })}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="w-full h-full bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-lg flex items-center justify-center transition-colors"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between text-slate-400 text-sm">
                                    <span>Total HT</span>
                                    <span>{calculateTotal().toLocaleString()} MAD</span>
                                </div>
                                <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-white-10">
                                    <span>Total TTC</span>
                                    <span>{calculateTotal().toLocaleString()} MAD</span>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white-10 bg-surface flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:bg-white-5 rounded-lg transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        form="doc-form"
                        className="bg-primary text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/80 shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        <Save size={18} /> Enregistrer
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DocumentModal;
