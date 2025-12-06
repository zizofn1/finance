import React, { useState, useContext, useRef } from 'react';
import { AppSettings } from '../types';
import { Save, Building, Mail, Shield, Upload, Trash2, CheckCircle2, Download, Database } from 'lucide-react';
import { ToastContext, SettingsContext } from '../App';
import { DEFAULT_LOGO, dataService } from '../services/dataService';

const Settings = () => {
  const { showToast } = useContext(ToastContext);
  const { settings, updateSettings } = useContext(SettingsContext);

  // Local state to manage form before saving
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [isProcessingImg, setIsProcessingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (section: keyof AppSettings, key: string, value: string | number | boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...(prev[section] as any), [key]: value }
        : value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
    showToast("Paramètres enregistrés avec succès", "success");
  };

  // Handle Logo Upload with Resize Logic
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Basic Size Check (Prevent massive files processing)
    if (file.size > 5 * 1024 * 1024) {
      showToast("L'image est trop volumineuse (> 5MB).", "error");
      return;
    }

    setIsProcessingImg(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 2. Resize Logic using Canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300; // Limit width to 300px for localStorage safety
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // 3. Get compressed Base64
        const dataUrl = canvas.toDataURL('image/png', 0.8); // 0.8 quality

        setLocalSettings(prev => ({ ...prev, logoUrl: dataUrl }));
        setIsProcessingImg(false);
        showToast("Logo optimisé et chargé. N'oubliez pas d'enregistrer.", "success");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLocalSettings(prev => ({ ...prev, logoUrl: DEFAULT_LOGO })); // Reset to default SVG
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-display">Paramètres</h1>
          <p className="text-slate-400 mt-2">Configurez l'identité visuelle et les détails légaux de votre entreprise.</p>
        </div>
        <button
          onClick={handleSave}
          className="hidden md:flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/80 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all active:scale-95 no-print"
        >
          <Save size={18} /> Enregistrer les changements
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Company Identity */}
        <div className="glass-card rounded-2xl shadow-sm border border-white-10 overflow-hidden">
          <div className="bg-white-5 px-8 py-4 border-b border-white-10 flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Building size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Identité & Branding</h2>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Nom de l'Entreprise</label>
              <input
                className="w-full border border-white-10 bg-surface rounded-xl px-4 py-3 text-base font-medium text-white focus:border-primary/50 outline-none transition-all"
                value={localSettings.companyName}
                onChange={e => setLocalSettings({ ...localSettings, companyName: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-4 uppercase tracking-wide">Logo Officiel</label>
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Current Logo Display */}
                <div className="flex flex-col items-center gap-3">
                  <div className="h-32 w-32 rounded-2xl bg-surface shadow-lg border border-white-10 flex items-center justify-center relative overflow-hidden group">
                    <img
                      src={localSettings.logoUrl || DEFAULT_LOGO}
                      alt="Company Logo"
                      className="w-full h-full object-contain p-4"
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO; }}
                    />
                    {/* Overlay helper */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Aperçu Actuel</span>
                </div>

                {/* Upload Area */}
                <div className="flex-1 w-full">
                  <div
                    onClick={!isProcessingImg ? triggerFileInput : undefined}
                    className={`h-32 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer relative ${isProcessingImg
                      ? 'bg-white-5 border-white-10 cursor-wait'
                      : 'bg-white-5 border-white-10 hover:bg-white-10 hover:border-primary/50'
                      }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isProcessingImg}
                    />

                    {isProcessingImg ? (
                      <div className="flex flex-col items-center text-primary">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                        <span className="text-sm font-medium">Optimisation...</span>
                      </div>
                    ) : (
                      <>
                        <div className="bg-surface p-3 rounded-full shadow-sm mb-2 text-primary border border-white-10">
                          <Upload size={20} />
                        </div>
                        <span className="text-sm font-bold text-slate-300">Cliquez pour changer le logo</span>
                        <span className="text-xs text-slate-500 mt-1">PNG, JPG (Max 5MB) • Redimensionné auto</span>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 font-medium px-2 py-1 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={12} /> Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Information */}
        <div className="glass-card rounded-2xl shadow-sm border border-white-10 overflow-hidden">
          <div className="bg-white-5 px-8 py-4 border-b border-white-10 flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
              <Shield size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Mentions Légales</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">ICE (Identifiant Commun)</label>
              <input
                className="w-full border border-white-10 bg-surface rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-all"
                value={localSettings.legalIds.ice}
                onChange={e => handleChange('legalIds', 'ice', e.target.value)}
                placeholder="Ex. 000123456789"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">RC (Registre de Commerce)</label>
              <input
                className="w-full border border-white-10 bg-surface rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-all"
                value={localSettings.legalIds.rc}
                onChange={e => handleChange('legalIds', 'rc', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">IF (Identifiant Fiscal)</label>
              <input
                className="w-full border border-white-10 bg-surface rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-all"
                value={localSettings.legalIds.if}
                onChange={e => handleChange('legalIds', 'if', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Taxe Professionnelle</label>
              <input
                className="w-full border border-white-10 bg-surface rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-all"
                value={localSettings.legalIds.patente}
                onChange={e => handleChange('legalIds', 'patente', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="glass-card rounded-2xl shadow-sm border border-white-10 overflow-hidden">
          <div className="bg-white-5 px-8 py-4 border-b border-white-10 flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400">
              <Mail size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Contact & Facturation</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Email Professionnel</label>
              <input
                type="email"
                className="w-full border border-white-10 bg-surface rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-all"
                value={localSettings.contact.email}
                onChange={e => handleChange('contact', 'email', e.target.value)}
                placeholder="contact@entreprise.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Numéro de Téléphone</label>
              <input
                className="w-full border border-white-10 bg-surface rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-all"
                value={localSettings.contact.phone}
                onChange={e => handleChange('contact', 'phone', e.target.value)}
                placeholder="+212 6..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Adresse du Siège</label>
              <input
                className="w-full border border-white-10 bg-surface rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-all"
                value={localSettings.contact.address}
                onChange={e => handleChange('contact', 'address', e.target.value)}
                placeholder="Adresse complète"
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="glass-card rounded-2xl shadow-sm border border-white-10 overflow-hidden">
          <div className="bg-white-5 px-8 py-4 border-b border-white-10 flex items-center gap-3">
            <div className="bg-violet-500/10 p-2 rounded-lg text-violet-400">
              <Database size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Gestion des Données</h2>
          </div>
          <div className="p-8">
            <p className="text-slate-400 text-sm mb-6">
              Téléchargez une copie de sauvegarde de toutes vos données (Clients, Projets, Factures, etc.) pour les conserver en sécurité sur votre ordinateur.
            </p>
            <button
              type="button"
              onClick={() => {
                dataService.exportDataToFile();
                showToast("Téléchargement de la sauvegarde lancé", "success");
              }}
              className="flex items-center gap-3 bg-white-5 hover:bg-white-10 border border-white-10 text-white px-6 py-4 rounded-xl font-bold transition-all group w-full md:w-auto"
            >
              <div className="bg-violet-500/20 p-2 rounded-lg text-violet-300 group-hover:text-white transition-colors">
                <Download size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">Sauvegarder les Données</div>
                <div className="text-xs text-slate-500 font-medium group-hover:text-slate-400">Format JSON (.json)</div>
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-12">
          <button type="submit" className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary/80 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all active:scale-95 no-print">
            <CheckCircle2 size={20} /> Sauvegarder la Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;