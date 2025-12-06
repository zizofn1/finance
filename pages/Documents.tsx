import React, { useState } from 'react';
import { FileText, Plus, Search, Printer, ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Quote, Invoice, DocStatus, Client } from '../types';
import DocumentModal from '../components/DocumentModal';
import PrintDocument from '../components/PrintDocument';

const Documents = () => {
    const [activeTab, setActiveTab] = useState<'QUOTES' | 'INVOICES'>('QUOTES');
    const [quotes, setQuotes] = useState<Quote[]>(dataService.getQuotes());
    const [invoices, setInvoices] = useState<Invoice[]>(dataService.getInvoices());
    const [clients] = useState<Client[]>(dataService.getClients());
    const [showModal, setShowModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState<Quote | Invoice | undefined>(undefined);
    const [printDoc, setPrintDoc] = useState<{ doc: Quote | Invoice, type: 'QUOTE' | 'INVOICE' } | undefined>(undefined);

    const handleRefresh = () => {
        setQuotes(dataService.getQuotes());
        setInvoices(dataService.getInvoices());
    };

    const handleNew = () => {
        setEditingDoc(undefined);
        setShowModal(true);
    };

    const handleEdit = (doc: Quote | Invoice) => {
        setEditingDoc(doc);
        setShowModal(true);
    };

    const handlePrint = (doc: Quote | Invoice, type: 'QUOTE' | 'INVOICE') => {
        setPrintDoc({ doc, type });
    };

    const handleConvertToInvoice = (quote: Quote) => {
        const newInvoice: Invoice = {
            id: dataService.generateDocumentId('INVOICE'),
            clientId: quote.clientId,
            date: new Date().toISOString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            items: quote.items,
            totalAmount: quote.totalAmount,
            paidAmount: 0,
            status: DocStatus.DRAFT,
            quoteId: quote.id
        };
        setEditingDoc(newInvoice);
        setActiveTab('INVOICES');
        setShowModal(true);
    };

    const handleSave = () => {
        handleRefresh();
        setShowModal(false);
    };

    const getClientName = (clientId: string) => {
        return clients.find(c => c.id === clientId)?.name || 'Client Inconnu';
    };

    const getStatusBadge = (status: DocStatus) => {
        switch (status) {
            case DocStatus.DRAFT: return <span className="px-2 py-1 rounded-full bg-slate-500/10 text-slate-400 text-xs font-bold border border-slate-500/20">Brouillon</span>;
            case DocStatus.SENT: return <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">Envoyé</span>;
            case DocStatus.ACCEPTED: return <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">Accepté</span>;
            case DocStatus.PAID: return <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">Payé</span>;
            case DocStatus.PARTIAL: return <span className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold border border-orange-500/20">Partiel</span>;
            case DocStatus.OVERDUE: return <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">En Retard</span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight font-display">Documents</h2>
                    <p className="text-slate-400 mt-1">Gérez vos devis et factures clients.</p>
                </div>
                <button
                    onClick={handleNew}
                    className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/80 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus size={18} /> Nouveau {activeTab === 'QUOTES' ? 'Devis' : 'Facture'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white-10">
                <button
                    onClick={() => setActiveTab('QUOTES')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'QUOTES' ? 'text-primary' : 'text-slate-400 hover:text-white'}`}
                >
                    Devis
                    {activeTab === 'QUOTES' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_#8b5cf6]"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('INVOICES')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'INVOICES' ? 'text-primary' : 'text-slate-400 hover:text-white'}`}
                >
                    Factures
                    {activeTab === 'INVOICES' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_#8b5cf6]"></div>}
                </button>
            </div>

            {/* Content */}
            <div className="glass-card rounded-xl shadow-sm border border-white-10 overflow-hidden">
                <div className="p-5 border-b border-white-10 flex flex-col sm:flex-row gap-4 justify-between bg-white-5">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input
                            className="pl-10 pr-4 py-2 w-full text-sm bg-surface border border-white-10 rounded-lg focus:border-primary/50 outline-none shadow-sm text-white placeholder-slate-500"
                            placeholder={`Rechercher un ${activeTab === 'QUOTES' ? 'devis' : 'facture'}...`}
                        />
                    </div>
                </div>

                <table className="min-w-full divide-y divide-white-5">
                    <thead className="bg-white-5">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Référence</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Montant Total</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white-5">
                        {activeTab === 'QUOTES' ? (
                            quotes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-500">
                                        <FileText size={56} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-medium text-lg">Aucun devis</p>
                                        <p className="text-sm opacity-60">Créez votre premier devis pour commencer.</p>
                                    </td>
                                </tr>
                            ) : (
                                quotes.map(q => (
                                    <tr key={q.id} className="hover:bg-white-5 transition-colors group cursor-pointer" onClick={() => handleEdit(q)}>
                                        <td className="px-6 py-4 text-sm font-bold text-white font-mono">#{q.id.substring(0, 8).toUpperCase()}</td>
                                        <td className="px-6 py-4 text-sm text-slate-300">{new Date(q.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            {getClientName(q.clientId)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-white">{q.totalAmount.toLocaleString()} MAD</td>
                                        <td className="px-6 py-4 text-center">{getStatusBadge(q.status)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    title="Convertir en Facture"
                                                    className="text-slate-400 hover:text-emerald-400 p-2 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                    onClick={(e) => { e.stopPropagation(); handleConvertToInvoice(q); }}
                                                >
                                                    <ArrowRight size={18} />
                                                </button>
                                                <button
                                                    title="Imprimer"
                                                    className="text-slate-400 hover:text-white p-2 hover:bg-white-5 rounded-lg transition-colors"
                                                    onClick={(e) => { e.stopPropagation(); handlePrint(q, 'QUOTE'); }}
                                                >
                                                    <Printer size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )
                        ) : (
                            invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-500">
                                        <FileText size={56} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-medium text-lg">Aucune facture</p>
                                    </td>
                                </tr>
                            ) : (
                                invoices.map(i => (
                                    <tr key={i.id} className="hover:bg-white-5 transition-colors group cursor-pointer" onClick={() => handleEdit(i)}>
                                        <td className="px-6 py-4 text-sm font-bold text-white font-mono">#{i.id.substring(0, 8).toUpperCase()}</td>
                                        <td className="px-6 py-4 text-sm text-slate-300">{new Date(i.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">{getClientName(i.clientId)}</td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-white">{i.totalAmount.toLocaleString()} MAD</td>
                                        <td className="px-6 py-4 text-center">{getStatusBadge(i.status)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                className="text-slate-400 hover:text-white p-2 hover:bg-white-5 rounded-lg transition-colors"
                                                onClick={(e) => { e.stopPropagation(); handlePrint(i, 'INVOICE'); }}
                                            >
                                                <Printer size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <DocumentModal
                    type={activeTab === 'QUOTES' ? 'QUOTE' : 'INVOICE'}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    initialData={editingDoc}
                />
            )}

            {/* Print Modal */}
            {printDoc && (
                <PrintDocument
                    document={printDoc.doc}
                    type={printDoc.type}
                    onClose={() => setPrintDoc(undefined)}
                />
            )}
        </div>
    );
};

export default Documents;
