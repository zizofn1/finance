import React, { useEffect, useState } from 'react';
import { X, Printer } from 'lucide-react';
import { Quote, Invoice, Client, AppSettings } from '../types';
import { dataService, DEFAULT_LOGO } from '../services/dataService';

interface PrintDocumentProps {
    document: Quote | Invoice;
    type: 'QUOTE' | 'INVOICE';
    onClose: () => void;
}

const PrintDocument = ({ document, type, onClose }: PrintDocumentProps) => {
    const [client, setClient] = useState<Client | undefined>(undefined);
    const [settings, setSettings] = useState<AppSettings>(dataService.getSettings());

    useEffect(() => {
        const clients = dataService.getClients();
        setClient(clients.find(c => c.id === document.clientId));
    }, [document.clientId]);

    const handlePrint = () => {
        window.print();
    };

    if (!client) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
            <div className="bg-white text-black w-full max-w-4xl h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative print:w-full print:h-auto print:shadow-none print:rounded-none print:overflow-visible">

                {/* No-Print Header */}
                <div className="sticky top-0 left-0 right-0 bg-slate-900 text-white p-4 flex justify-between items-center print:hidden z-10 rounded-t-xl">
                    <h2 className="font-bold">Aperçu avant impression</h2>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white">Fermer</button>
                        <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                            <Printer size={16} /> Imprimer
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="p-12 print:p-0">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <img
                                src={settings.logoUrl || DEFAULT_LOGO}
                                alt="Logo"
                                className="h-20 object-contain mb-4"
                            />
                            <h1 className="text-2xl font-bold text-slate-900">{settings.companyName}</h1>
                            <div className="text-sm text-slate-600 mt-2 space-y-1">
                                <p>{settings.contact.address}</p>
                                <p>{settings.contact.phone}</p>
                                <p>{settings.contact.email}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-bold text-slate-900 mb-2">{type === 'QUOTE' ? 'DEVIS' : 'FACTURE'}</h2>
                            <p className="text-lg font-mono text-slate-600">#{document.id}</p>
                            <div className="mt-4 text-sm text-slate-600 space-y-1">
                                <p>Date: <span className="font-bold text-slate-900">{new Date(document.date).toLocaleDateString()}</span></p>
                                {type === 'INVOICE' && (
                                    <p>Échéance: <span className="font-bold text-slate-900">{new Date((document as Invoice).dueDate).toLocaleDateString()}</span></p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Client Info */}
                    <div className="mb-12 bg-slate-50 p-6 rounded-lg border border-slate-200 print:border-none print:bg-transparent print:p-0">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Facturer à</h3>
                        <p className="text-xl font-bold text-slate-900">{client.name}</p>
                        <p className="text-slate-600">{client.address}</p>
                        <p className="text-slate-600">{client.phone}</p>
                        <p className="text-slate-600">{client.email}</p>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-12">
                        <thead>
                            <tr className="border-b-2 border-slate-900">
                                <th className="text-left py-3 font-bold text-slate-900">Description</th>
                                <th className="text-right py-3 font-bold text-slate-900 w-24">Qté</th>
                                <th className="text-right py-3 font-bold text-slate-900 w-32">Prix Unit.</th>
                                <th className="text-right py-3 font-bold text-slate-900 w-40">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {document.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-4 text-slate-900">{item.description}</td>
                                    <td className="py-4 text-right text-slate-900">{item.quantity}</td>
                                    <td className="py-4 text-right text-slate-900">{item.unitPrice.toLocaleString()}</td>
                                    <td className="py-4 text-right font-bold text-slate-900">{item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-slate-600">
                                <span>Total HT</span>
                                <span>{document.totalAmount.toLocaleString()} MAD</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>TVA (20%)</span>
                                <span>{(document.totalAmount * 0.2).toLocaleString()} MAD</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-slate-900 pt-3 border-t-2 border-slate-900">
                                <span>Total TTC</span>
                                <span>{(document.totalAmount * 1.2).toLocaleString()} MAD</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200 pt-8 text-center text-xs text-slate-500">
                        <p className="mb-2">Merci de votre confiance.</p>
                        <p>
                            {settings.companyName} - ICE: {settings.legalIds.ice} - RC: {settings.legalIds.rc} - IF: {settings.legalIds.if}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PrintDocument;
