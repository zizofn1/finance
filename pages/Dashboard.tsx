import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Sparkles, AlertTriangle, TrendingUp, Info, Activity, Wallet, User, Plus } from 'lucide-react';
import { dataService } from '../services/dataService';
import { generateInsights } from '../services/geminiService';
import { SmartInsight } from '../types';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, subtext, icon: Icon, trend, colorClass, isExpense = false }: any) => {
  // Logic: 
  // If Trend > 0 (Increased): Arrow is Up. 
  // If Trend < 0 (Decreased): Arrow is Down.
  // 
  // Color Logic:
  // Normal (Income/Profit): Increase = Good (Green), Decrease = Bad (Red)
  // Expense: Increase = Bad (Red), Decrease = Good (Green)
  
  const isUp = trend >= 0;
  const isGood = isExpense ? !isUp : isUp;
  const trendColor = isGood ? 'text-emerald-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon size={22} className="text-white" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center text-sm font-semibold ${trendColor}`}>
            {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
};

const InsightCard: React.FC<{ insight: SmartInsight }> = ({ insight }) => {
  const getStyle = (type: string) => {
    switch (type) {
      case 'WARNING': return { border: 'border-l-4 border-l-red-500', bg: 'bg-white', icon: AlertTriangle, iconColor: 'text-red-500', badge: 'bg-red-100 text-red-700' };
      case 'OPPORTUNITY': return { border: 'border-l-4 border-l-emerald-500', bg: 'bg-white', icon: TrendingUp, iconColor: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-700' };
      default: return { border: 'border-l-4 border-l-blue-500', bg: 'bg-white', icon: Info, iconColor: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' };
    }
  };

  const style = getStyle(insight.type);
  const Icon = style.icon;

  return (
    <div className={`${style.bg} ${style.border} shadow-sm rounded-r-lg p-5 mb-3 transition-all hover:shadow-md border-y border-r border-slate-100`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0 mt-1">
           <Icon className={style.iconColor} size={20} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-semibold text-slate-800 text-sm">{insight.title}</h4>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wide ${style.badge}`}>
              {insight.type}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{insight.description}</p>
          {insight.metric && (
             <div className="mt-3 inline-block">
                <span className="text-xs font-bold font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                  {insight.metric}
                </span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RecentActivity = ({ transactions }: { transactions: any[] }) => (
  <div className="space-y-4">
    {transactions.slice(0, 5).map((t, idx) => (
      <div key={t.id || idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
          }`}>
             {t.type === 'INCOME' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {t.description}
            </p>
            <p className="text-xs text-slate-500">
              {new Date(t.date).toLocaleDateString('fr-FR')} • {t.category.replace('_', ' ')}
            </p>
          </div>
        </div>
        <span className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
          {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()} MAD
        </span>
      </div>
    ))}
    {transactions.length === 0 && (
      <p className="text-center text-slate-400 text-sm py-4">Aucune activité récente.</p>
    )}
  </div>
);

const Dashboard = () => {
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Use new detailed stats
  const [stats, setStats] = useState({
    revenue: { value: 0, trend: 0 },
    expenses: { value: 0, trend: 0 },
    profit: { value: 0, trend: 0 }
  });
  
  const [recentTrans, setRecentTrans] = useState<any[]>([]);

  useEffect(() => {
    // 1. Get Core Data
    const trans = dataService.getTransactions();
    
    // 2. Metrics with real trends
    const calculatedStats = dataService.getFinancialStatsWithTrends();
    setStats(calculatedStats);

    setRecentTrans(trans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setChartData(dataService.getMonthlyRevenue());

    // 3. AI Trigger
    const fetchAI = async () => {
      setLoadingInsights(true);
      const dataForAI = dataService.getCombinedDataForAI();
      const generated = await generateInsights(dataForAI);
      setInsights(generated);
      setLoadingInsights(false);
    };

    fetchAI();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tableau de Bord</h1>
          <p className="text-slate-500 mt-1">Aperçu des performances de votre entreprise.</p>
        </div>
        <div className="flex gap-3 no-print">
          <Link to="/projects" className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus size={16} /> Nouveau Projet
          </Link>
          <Link to="/finance" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md">
            <Plus size={16} /> Transaction
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
          colorClass="bg-indigo-500"
          subtext="vs Mois dernier"
        />
        <StatCard 
          title="Dépenses" 
          value={`${stats.expenses.value.toLocaleString()} MAD`} 
          trend={stats.expenses.trend}
          isExpense={true} // Critical: Inverts color logic
          icon={Wallet} 
          colorClass="bg-orange-500"
          subtext="vs Mois dernier"
        />
        <StatCard 
          title="Bénéfice Net" 
          value={`${stats.profit.value.toLocaleString()} MAD`} 
          trend={stats.profit.trend}
          icon={Activity} 
          colorClass="bg-emerald-500"
          subtext="vs Mois dernier"
        />
         <StatCard 
          title="Clients Actifs" 
          value={dataService.getClients().length}
          icon={User} 
          colorClass="bg-blue-500"
          subtext="Base de données" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Flux de Trésorerie</h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`${value.toLocaleString()} MAD`, '']}
                />
                <Area type="monotone" dataKey="income" name="Recettes" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" name="Dépenses" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: AI & Activity */}
        <div className="space-y-8">
          
          {/* AI Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-500" size={18} />
                <h3 className="text-lg font-bold text-slate-900">Intelligence Artificielle</h3>
              </div>
              <button onClick={() => window.location.reload()} className="text-xs text-indigo-600 hover:underline no-print">
                Actualiser
              </button>
            </div>
            
            <div className="min-h-[200px]">
              {loadingInsights ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="text-sm">Analyse des données en cours...</span>
                </div>
              ) : insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.map((insight, idx) => (
                    <InsightCard key={idx} insight={insight} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p className="text-slate-500 text-sm">Aucune alerte critique.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-900">Transactions Récentes</h3>
               <Link to="/finance" className="text-sm text-indigo-600 font-medium hover:text-indigo-800 no-print">Voir Tout</Link>
             </div>
             <RecentActivity transactions={recentTrans} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;