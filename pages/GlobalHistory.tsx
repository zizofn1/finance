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
      case 'TRANSACTION': return 'bg-blue-100 text-blue-600';
      case 'INVOICE': return 'bg-purple-100 text-purple-600';
      case 'USAGE': return 'bg-amber-100 text-amber-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Historique Global</h1>
          <p className="text-slate-500 mt-1">Chronologie de toutes les activités de l'entreprise.</p>
        </div>
        <div className="flex gap-3 no-print">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer size={16} /> Imprimer
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 print:border-none print:shadow-none">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100 no-print">
           <div className="flex items-center gap-2 text-slate-500">
             <Filter size={18} />
             <span className="text-sm font-bold uppercase tracking-wide">Filtre Date</span>
           </div>
           <div className="flex items-center gap-2">
             <input 
               type="date" 
               className="border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
               value={dateRange.start}
               onChange={e => setDateRange({...dateRange, start: e.target.value})}
             />
             <ArrowRight size={14} className="text-slate-400" />
             <input 
               type="date" 
               className="border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
               value={dateRange.end}
               onChange={e => setDateRange({...dateRange, end: e.target.value})}
             />
           </div>
           {(dateRange.start || dateRange.end) && (
             <button 
               onClick={() => setDateRange({start: '', end: ''})}
               className="text-xs text-red-500 font-bold hover:underline ml-auto"
             >
               Effacer Filtres
             </button>
           )}
        </div>

        {/* Timeline */}
        <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 print:space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="pl-8 py-4 text-slate-400 italic">Aucun historique trouvé pour cette période.</div>
          ) : (
            filteredHistory.map((item) => (
              <div key={item.id} className="relative pl-8 group break-inside-avoid">
                {/* Connector Dot */}
                <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${getTypeColor(item.type)}`} />
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 p-3 rounded-lg group-hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${getTypeColor(item.type)} print:border print:border-slate-300`}>
                        {getTypeIcon(item.type)}
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(item.date).toLocaleDateString('fr-FR')} {new Date(item.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-slate-900 font-medium">{item.description}</p>
                    {item.meta && (
                      <div className="flex gap-2 mt-1">
                         {Object.entries(item.meta).map(([k, v]) => (
                           <span key={k} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 print:border-slate-300">
                             {k}: {String(v)}
                           </span>
                         ))}
                      </div>
                    )}
                  </div>
                  
                  {item.amount !== undefined && (
                    <div className={`font-bold text-sm ${item.amount > 0 ? 'text-emerald-600' : 'text-slate-600'} print:text-black`}>
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