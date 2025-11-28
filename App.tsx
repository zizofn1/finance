import React, { useState, useEffect, createContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Hammer, 
  Users, 
  Wallet, 
  Package, 
  Menu, 
  X, 
  LogOut, 
  Settings as SettingsIcon, 
  History,
  ChevronRight,
  Bell
} from 'lucide-react';

// Import Pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import Finance from './pages/Finance';
import Inventory from './pages/Inventory';
import GlobalHistory from './pages/GlobalHistory';
import Settings from './pages/Settings';

// --- Toast System ---
interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error') => void;
}
export const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

const ToastContainer = ({ toast }: { toast: { message: string, type: 'success' | 'error', id: number } | null }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md transform transition-all animate-in slide-in-from-bottom-5 z-50 font-medium text-white flex items-center gap-3 border border-white/20 ${
      toast.type === 'success' ? 'bg-emerald-500/90' : 'bg-red-500/90'
    }`}>
      <span className="bg-white/20 p-1 rounded-full">{toast.type === 'success' ? '✓' : '⚠'}</span>
      {toast.message}
    </div>
  );
};

// --- Modern Sidebar Link ---
const SidebarLink = ({ to, icon: Icon, label, onClick }: { to: string, icon: any, label: string, onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-4 py-3.5 mx-3 rounded-xl transition-all duration-300 group overflow-hidden ${
        isActive 
          ? 'bg-white/10 text-white shadow-lg shadow-indigo-500/20 border border-white/10' 
          : 'text-indigo-200/70 hover:bg-white/5 hover:text-white'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full" />
      )}
      <Icon size={22} className={`transition-transform duration-300 ${isActive ? 'scale-110 text-cyan-300' : 'group-hover:scale-110'}`} />
      <span className="font-medium tracking-wide text-[15px]">{label}</span>
      {isActive && <ChevronRight size={16} className="ml-auto text-white/50 animate-pulse" />}
    </Link>
  );
};

// --- Premium Login Screen ---
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email === 'admin' && password === 'admin') {
        onLogin();
      } else {
        setError('Accès refusé. Essayez "admin"');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px]" />
      </div>

      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/10 relative z-10">
        <div className="text-center mb-10">
           <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 p-1">
             <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden">
               {/* HNA FORSINA TASGHAR (max-width, max-height) */}
               <img 
                 src="/logo.png" 
                 alt="Logo" 
                 className="object-contain" 
                 style={{ maxWidth: '60px', maxHeight: '60px' }} 
               />
             </div>
           </div>
           <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">Bienvenue</h2>
           <p className="text-indigo-200/60 font-medium">Espace Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm text-center flex items-center justify-center gap-2 animate-pulse">
              <span>⚠</span> {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 ml-1">Identifiant</label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 ml-1">Mot de passe</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 ${loading ? 'opacity-80 cursor-wait' : ''}`}
          >
            {loading ? 'Connexion...' : 'Accéder au Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error', id: number } | null>(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') setIsAuthenticated(true);
    
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToast({ message, type, id });
    setTimeout(() => setToast(prev => prev?.id === id ? null : prev), 3000);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <HashRouter>
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
          
          {/* Mobile Overlay */}
          {sidebarOpen && window.innerWidth < 1024 && (
            <div 
              className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* --- ULTRA MODERN SIDEBAR --- */}
          <aside 
            className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shadow-2xl flex flex-col border-r border-slate-800 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Logo Area with Glow */}
            <div className="h-28 flex items-center px-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
               <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-lg shadow-indigo-500/20">
                  {/* HNA TANI FORSINA TASGHAR */}
                  <img 
                    src="/logo.png" 
                    alt="Fun Design" 
                    className="object-contain" 
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight leading-none mb-1">Fun Design</h1>
                  <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                    F&Z Menuiserie
                  </span>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 ml-auto hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar space-y-1">
              <div className="px-6 pb-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Espace Principal</p>
              </div>
              <SidebarLink to="/" icon={LayoutDashboard} label="Tableau de Bord" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} />
              <SidebarLink to="/projects" icon={Hammer} label="Chantiers & Projets" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} />
              <SidebarLink to="/clients" icon={Users} label="Clients & CRM" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} />
              
              <div className="my-6 mx-6 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
              
              <div className="px-6 pb-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Gestion & Finance</p>
              </div>
              <SidebarLink to="/finance" icon={Wallet} label="Trésorerie" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} />
              <SidebarLink to="/inventory" icon={Package} label="Stock & Matériaux" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} />
              
              <div className="my-6 mx-6 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

              <div className="px-6 pb-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Configuration</p>
              </div>
              <SidebarLink to="/history" icon={History} label="Historique" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} />
              <SidebarLink to="/settings" icon={SettingsIcon} label="Paramètres" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} />
            </nav>

            {/* User Profile - Bottom Card */}
            <div className="p-4 relative">
              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3 hover:bg-slate-800 transition-colors cursor-pointer group">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                  AD
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">Administrateur</p>
                  <p className="text-xs text-slate-400 truncate">admin@fundesign.ma</p>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </aside>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#f8fafc]">
            
            {/* Top Bar (Glass Effect) */}
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 lg:px-8 shadow-sm z-10 sticky top-0">
              <div className="flex items-center gap-4">
                <button 
                  className="lg:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={24} />
                </button>
                <div className="hidden md:flex items-center text-sm font-medium text-slate-500 bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-200">
                  <span className="text-indigo-500 mr-2">●</span> Espace de Travail
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all relative">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="h-8 w-px bg-slate-200 mx-1"></div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 hidden sm:block">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
            </header>

            {/* Content Scrollable Area */}
            <main className="flex-1 overflow-auto p-4 lg:p-8 scroll-smooth">
              <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/history" element={<GlobalHistory />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>

            <ToastContainer toast={toast} />
          </div>
        </div>
      </HashRouter>
    </ToastContext.Provider>
  );
};

export default App;