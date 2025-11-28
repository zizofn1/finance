import React, { useState, useContext, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { AppSettings } from '../types';
import { Save, Building, Mail, Shield, Upload } from 'lucide-react';
import { ToastContext } from '../App';

const Settings = () => {
  const { showToast } = useContext(ToastContext);
  const [settings, setSettings] = useState<AppSettings>(dataService.getSettings());

  const handleChange = (section: keyof AppSettings, key: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null 
        ? { ...(prev[section] as any), [key]: value } 
        : value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.saveSettings(settings);
    showToast("Paramètres enregistrés avec succès", "success");
  };

  // Simulated Logo Upload
  const handleLogoUpload = () => {
    // In a real app, this would handle file input
    showToast("Simulation: Fichier sélectionné", "success");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Paramètres</h1>
        <p className="text-slate-500 mt-1">Configurez les détails de l'entreprise et les préférences système.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Company Identity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Building size={20} className="text-indigo-600" />
            Identité de l'Entreprise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Nom de l'Entreprise</label>
              <input 
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={settings.companyName}
                onChange={e => setSettings({...settings, companyName: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Logo</label>
              <div className="flex items-center gap-6">
                 {/* Current Logo Display */}
                 <div className="flex flex-col items-center gap-2">
                   <div className="h-24 w-24 rounded-full overflow-hidden shadow-md border border-slate-100 flex items-center justify-center bg-white">
                      <img src="public/logo.png" alt="Company Logo" className="w-full h-full object-contain" />
                   </div>
                   <span className="text-[10px] text-slate-400 uppercase font-bold">Actuel</span>
                 </div>

                 {/* Upload Area */}
                 <div className="flex-1">
                   <div className="h-24 w-full bg-slate-50 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer" onClick={handleLogoUpload}>
                      <Upload size={24} className="mb-2"/>
                      <span className="text-xs font-medium">Cliquer pour changer</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-indigo-600" />
            Informations Légales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">ICE</label>
              <input 
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={settings.legalIds.ice}
                onChange={e => handleChange('legalIds', 'ice', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">RC (Registre Commerce)</label>
              <input 
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={settings.legalIds.rc}
                onChange={e => handleChange('legalIds', 'rc', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">IF (Identifiant Fiscal)</label>
              <input 
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={settings.legalIds.if}
                onChange={e => handleChange('legalIds', 'if', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Patente</label>
              <input 
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={settings.legalIds.patente}
                onChange={e => handleChange('legalIds', 'patente', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Mail size={20} className="text-indigo-600" />
            Coordonnées
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Email Officiel</label>
              <input 
                type="email"
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={settings.contact.email}
                onChange={e => handleChange('contact', 'email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Téléphone</label>
              <input 
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={settings.contact.phone}
                onChange={e => handleChange('contact', 'phone', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Adresse</label>
              <input 
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={settings.contact.address}
                onChange={e => handleChange('contact', 'address', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SMTP Config (Bonus) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 opacity-75">
           <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail size={20} className="text-indigo-600" />
              Configuration SMTP
            </h2>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase">Avancé</span>
           </div>
           <p className="text-sm text-slate-500 mb-4">Configurez le serveur email pour l'envoi direct de factures.</p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 grayscale pointer-events-none select-none">
             <div>
               <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Hôte SMTP</label>
               <input className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" placeholder="smtp.gmail.com" />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Port</label>
               <input className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" placeholder="587" />
             </div>
           </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 no-print">
            <Save size={18} /> Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;