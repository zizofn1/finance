import React, { useState, useContext } from 'react';
import { dataService } from '../services/dataService';
import { HistoryItem } from '../types';
import { Calendar, Download, Printer, Filter, ArrowRight, FileText, Activity, Box } from 'lucide-react';
import { ToastContext } from '../App';

const GlobalHistory = () => {
  const { showToast } = useContext(ToastContext);
  const [history] = useState<HistoryItem[]>(dataService.getGlobalHistory());
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const filteredHistory = history.filter(item => {
    if (!dateRange.start && !dateRange.end) return true;
    const itemDate = new Date(item.date).getTime();
    const start = dateRange.start ? new Date(dateRange.start).getTime() : 0;
    const end = dateRange.end ? new Date(dateRange.end).getTime() + 86400000 : Infinity; // Add day to include end date
    return itemDate >= start && itemDate <= end;
  });

  const handleExportCSV = () => {
    try {
      dataService.exportToCSV(filteredHistory, 'historique_global');
      showToast("Historique global exporté avec succès", "success");
    } catch (e) {
      showToast("Échec de l'export", "error");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TRANSACTION': return <Activity size={16} />;
      case 'INVOICE': return <FileText size={16} />;
      case 'USAGE': return <Box size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TRANSACTION': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'INVOICE': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'USAGE': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-display">Historique Global</h1>
          <p className="text-slate-400 mt-1">Chronologie de toutes les activités de l'entreprise.</p>
        </div>
        <div className="flex gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 border border-white-10 bg-surface text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white-5 transition-colors shadow-sm"
          >
            <Printer size={16} /> Imprimer
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/80 shadow-md transition-all active:scale-95"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="glass-card rounded-xl shadow-sm border border-white-10 p-6 print:border-none print:shadow-none">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-white-5 rounded-lg border border-white-10 no-print">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter size={18} />
            <span className="text-sm font-bold uppercase tracking-wide">Filtre Date</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="bg-surface border border-white-10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50"
              value={dateRange.start}
              onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <ArrowRight size={14} className="text-slate-500" />
            <input
              type="date"
              className="bg-surface border border-white-10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50"
              value={dateRange.end}
              onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
          {(dateRange.start || dateRange.end) && (
            <button
              onClick={() => setDateRange({ start: '', end: '' })}
              className="text-xs text-red-400 font-bold hover:underline ml-auto"
            >
              Effacer Filtres
            </button>
          )}
        </div>

        {/* Timeline */}
        <div className="relative border-l-2 border-white-10 ml-4 space-y-8 print:space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="pl-8 py-4 text-slate-500 italic">Aucun historique trouvé pour cette période.</div>
          ) : (
            filteredHistory.map((item) => (
              <div key={item.id} className="relative pl-8 group break-inside-avoid">
                {/* Connector Dot */}
                <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-surface shadow-sm ${getTypeColor(item.type).split(' ')[0]}`} />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 p-3 rounded-lg group-hover:bg-white-5 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border ${getTypeColor(item.type)} print:border-slate-300`}>
                        {getTypeIcon(item.type)}
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(item.date).toLocaleDateString('fr-FR')} {new Date(item.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-200 font-medium">{item.description}</p>
                    {item.meta && (
                      <div className="flex gap-2 mt-1">
                        {Object.entries(item.meta).map(([k, v]) => (
                          <span key={k} className="text-[10px] text-slate-400 bg-white-5 px-1.5 py-0.5 rounded border border-white-10 print:border-slate-300">
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {item.amount !== undefined && (
                    <div className={`font-bold text-sm ${item.amount > 0 ? 'text-emerald-400' : 'text-slate-400'} print:text-black`}>
                      {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()} MAD
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalHistory;