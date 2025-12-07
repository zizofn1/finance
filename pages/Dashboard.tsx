import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Sparkles, AlertTriangle, TrendingUp, Info, Activity, Wallet, User, Plus, MoveRight, X, ExternalLink } from 'lucide-react';
import { dataService } from '../services/dataService';
import { generateInsights } from '../services/aiService';
import { SmartInsight } from '../types';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, subtext, icon: Icon, trend, colorClass, isExpense = false }: any) => {
  const isUp = trend >= 0;
  const isGood = isExpense ? !isUp : isUp;
  const trendColor = isGood ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10';

  return (
    <div className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-primary/10 transition-colors"></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl ${colorClass} text-white shadow-lg shadow-black/20`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border border-white/5 ${trendColor}`}>
            {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="text-3xl font-display font-bold text-white tracking-tight">{value}</h3>
        <p className="text-sm font-medium text-slate-400 mt-1">{title}</p>
        {subtext && <p className="text-xs text-slate-500 mt-2">{subtext}</p>}
      </div>
    </div>
  );
};

const InsightCard: React.FC<{ insight: SmartInsight, onExpand: () => void }> = ({ insight, onExpand }) => {
  const getStyle = (type: string) => {
    switch (type) {
      case 'WARNING': return { border: 'border-l-4 border-red-500', bg: 'bg-surface', icon: AlertTriangle, iconColor: 'text-red-500', badge: 'bg-red-500/10 text-red-400 border border-red-500/20' };
      case 'OPPORTUNITY': return { border: 'border-l-4 border-emerald-500', bg: 'bg-surface', icon: TrendingUp, iconColor: 'text-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
      default: return { border: 'border-l-4 border-blue-500', bg: 'bg-surface', icon: Info, iconColor: 'text-blue-500', badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
    }
  };

  const style = getStyle(insight.type);
  const Icon = style.icon;

  return (
    <div className={`${style.bg} ${style.border} shadow-lg shadow-black/20 rounded-r-xl p-5 mb-3 transition-all hover:translate-x-1 border-y border-r border-white-5`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0 mt-1">
          <Icon className={style.iconColor} size={20} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-slate-200 text-sm">{insight.title}</h4>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wide ${style.badge}`}>
              {insight.type}
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{insight.description}</p>
          <div className="flex justify-between items-center mt-3">
            {insight.metric ? (
              <span className="text-xs font-bold font-mono text-slate-300 bg-white-5 px-2 py-1 rounded border border-white-10">
                {insight.metric}
              </span>
            ) : <span></span>}
            <button
              onClick={onExpand}
              className="text-xs font-bold text-primary hover:text-white flex items-center gap-1 transition-colors"
            >
              Voir plus <ExternalLink size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InsightModal = ({ insight, onClose }: { insight: SmartInsight, onClose: () => void }) => {
  const getStyle = (type: string) => {
    switch (type) {
      case 'WARNING': return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
      case 'OPPORTUNITY': return { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      default: return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    }
  };

  const style = getStyle(insight.type);
  const Icon = style.icon;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="glass-card rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-white-10 transform transition-all">
        <div className="p-5 border-b border-white-10 flex justify-between items-center bg-white-5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${style.bg} ${style.color} border ${style.border}`}>
              <Icon size={20} />
            </div>
            <h3 className="font-bold text-lg text-white">Détail de l'Analyse</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-white-5 p-1 rounded-full"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-xl font-bold text-white mb-2">{insight.title}</h4>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white-5 border border-white-10 text-xs font-bold text-slate-300 mb-4">
              <span className={`w-2 h-2 rounded-full ${style.color.replace('text-', 'bg-')}`}></span>
              {insight.type}
            </div>
            <p className="text-slate-300 leading-relaxed text-base">
              {insight.description}
            </p>
          </div>

          {insight.metric && (
            <div className="bg-white-5 rounded-xl p-4 border border-white-10">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Métrique Clé</p>
              <p className="text-2xl font-mono font-bold text-white">{insight.metric}</p>
            </div>
          )}

          <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
            <div className="flex gap-3">
              <Sparkles size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white mb-1">Conseil IA</p>
                <p className="text-xs text-slate-400">
                  Cette analyse est générée automatiquement par l'IA en fonction de vos données financières récentes.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white-5 border-t border-white-10 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white-10 hover:bg-white-20 text-white rounded-lg font-medium text-sm transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const RecentActivity = ({ transactions }: { transactions: any[] }) => (
  <div className="space-y-2">
    {transactions.slice(0, 5).map((t, idx) => (
      <div key={t.id || idx} className="flex items-center justify-between p-3 hover:bg-white-5 rounded-xl transition-colors group border border-transparent hover:border-white-5">
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
            }`}>
            {t.type === 'INCOME' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200 group-hover:text-primary transition-colors">
              {t.description}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {new Date(t.date).toLocaleDateString('fr-FR')} • {t.category.replace('_', ' ')}
            </p>
          </div>
        </div>
        <span className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-300'}`}>
          {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()} MAD
        </span>
      </div>
    ))}
    {transactions.length === 0 && (
      <div className="text-center py-8">
        <p className="text-slate-500 text-sm">Aucune activité récente.</p>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<SmartInsight | null>(null);

  const [stats, setStats] = useState({
    revenue: { value: 0, trend: 0 },
    expenses: { value: 0, trend: 0 },
    profit: { value: 0, trend: 0 }
  });

  const [recentTrans, setRecentTrans] = useState<any[]>([]);

  const loadInsights = async () => {
    setLoadingInsights(true);
    const dataForAI = dataService.getCombinedDataForAI();
    const generated = await generateInsights(dataForAI);
    console.log("📊 AI Insights Result:", generated);
    setInsights(generated);
    setLoadingInsights(false);
  };

  useEffect(() => {
    const trans = dataService.getTransactions();
    const calculatedStats = dataService.getFinancialStatsWithTrends();
    setStats(calculatedStats);
    setRecentTrans(trans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setChartData(dataService.getMonthlyRevenue());

    // Auto-load AI insights once on mount
    loadInsights();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Tableau de Bord</h1>
          <p className="text-slate-400 mt-2">Vue d'ensemble de vos performances financières.</p>
        </div>
        <div className="flex gap-3 no-print">
          <Link to="/projects" className="flex items-center gap-2 bg-surface border border-white-10 hover:bg-white-5 hover:border-white-10 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm">
            <Plus size={16} /> Nouveau Projet
          </Link>
          <Link to="/finance" className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Wallet size={16} /> Transaction
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Chiffre d'Affaires"
          value={`${stats.revenue.value.toLocaleString()} MAD`}
          trend={stats.revenue.trend}
          icon={TrendingUp}
          colorClass="bg-primary"
          subtext="Total encaissé"
        />
        <StatCard
          title="Dépenses"
          value={`${stats.expenses.value.toLocaleString()} MAD`}
          trend={stats.expenses.trend}
          isExpense={true}
          icon={Wallet}
          colorClass="bg-slate-700"
          subtext="Coûts totaux"
        />
        <StatCard
          title="Bénéfice Net"
          value={`${stats.profit.value.toLocaleString()} MAD`}
          trend={stats.profit.trend}
          icon={Activity}
          colorClass="bg-emerald-500"
          subtext="Marge réelle"
        />
        <StatCard
          title="Clients Actifs"
          value={dataService.getClients().length}
          icon={User}
          colorClass="bg-secondary"
          subtext="Base de données"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Chart Section */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-8 flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-white">Flux de Trésorerie</h3>
              <p className="text-sm text-slate-400">Évolution mensuelle des recettes et dépenses</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-white-5 px-2 py-1 rounded-md border border-white-5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Recettes</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-white-5 px-2 py-1 rounded-md border border-white-5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Dépenses</span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.map(d => ({ ...d, expense: -d.expense }))} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151725',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string) => [
                    `${Math.abs(value).toLocaleString()} MAD`,
                    name === 'expense' ? 'Dépenses' : name === 'income' ? 'Recettes' : name
                  ]}
                />
                <Area type="monotone" dataKey="income" name="Recettes" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" name="Dépenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: AI & Activity */}
        <div className="space-y-8">

          {/* AI Insights */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none animate-pulse-slow"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/20 text-primary rounded-lg border border-primary/20">
                  <Sparkles size={16} />
                </div>
                <h3 className="text-lg font-bold text-white">Analyses IA</h3>
              </div>
              <button
                onClick={loadInsights}
                className="text-xs text-primary font-bold hover:text-white hover:underline no-print flex items-center gap-1 transition-colors"
                disabled={loadingInsights}
              >
                {loadingInsights ? '...' : 'Actualiser'}
              </button>
            </div>

            <div className="min-h-[200px] relative z-10">
              {loadingInsights ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-sm font-medium">Analyse des données en cours...</span>
                </div>
              ) : insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.map((insight, idx) => (
                    <InsightCard
                      key={idx}
                      insight={insight}
                      onExpand={() => setSelectedInsight(insight)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white-5 rounded-xl border border-dashed border-white-10">
                  <p className="text-slate-500 text-sm font-medium">Tout semble normal. Aucune alerte.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Dernières Opérations</h3>
              <Link to="/finance" className="text-xs text-slate-400 font-bold hover:text-primary flex items-center gap-1 transition-colors no-print">
                Voir tout <MoveRight size={12} />
              </Link>
            </div>
            <RecentActivity transactions={recentTrans} />
          </div>
        </div>
      </div>
      {selectedInsight && <InsightModal insight={selectedInsight} onClose={() => setSelectedInsight(null)} />}
    </div>
  );
};

export default Dashboard;