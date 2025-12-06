import React, { useState, useEffect, createContext, useContext } from 'react';
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
  Bell,
  Building,
  Search,
  PieChart,
  Zap,
  Sun,
  Moon,
  FileText
} from 'lucide-react';

// Import Pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import Finance from './pages/Finance';
import Inventory from './pages/Inventory';
import Documents from './pages/Documents';
import GlobalHistory from './pages/GlobalHistory';
import Settings from './pages/Settings';
import { AppSettings } from './types';
import { dataService, DEFAULT_LOGO } from './services/dataService';
import { emailService } from './services/emailService';

// --- Global Settings Context ---
interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
}

export const SettingsContext = createContext<SettingsContextType>({
  settings: dataService.getSettings(),
  updateSettings: () => { }
});

// --- Toast System ---
interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error') => void;
}
export const ToastContext = createContext<ToastContextType>({ showToast: () => { } });

const ToastContainer = ({ toast }: { toast: { message: string, type: 'success' | 'error', id: number } | null }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur-md transform transition-all animate-in slide-in-from-bottom-5 z-50 font-medium text-white flex items-center gap-3 border border-white/10 ${toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500/30' : 'bg-red-600 text-white border-red-500/30'
      }`}>
      <span className={`p-1 rounded-full w-6 h-6 flex items-center justify-center text-xs ${toast.type === 'success' ? 'bg-white/20' : 'bg-white/20'}`}>
        {toast.type === 'success' ? '✓' : '✕'}
      </span>
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
      className={`group relative flex items-center gap-3 px-4 py-3 mx-3 rounded-xl transition-all duration-300 ${isActive
        ? 'bg-primary/20 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-primary/20'
        : 'text-slate-400 hover:bg-white-5 hover:text-white hover:translate-x-1'
        }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_#8b5cf6]"></div>
      )}
      <Icon
        size={20}
        className={`transition-colors duration-300 ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-white'}`}
      />
      <span className="font-medium text-[14px] tracking-wide">{label}</span>
    </Link>
  );
};

// --- Premium Login Screen ---
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const { settings } = useContext(SettingsContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email === 'jamilaltf' && password === 'Zouhair12') {
        onLogin();
      } else {
        setError('Identifiants incorrects');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-sm w-full glass-card rounded-3xl p-8 relative z-10 animate-float">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-2xl bg-surface border border-white-10 flex items-center justify-center mb-6 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <img
              src={settings.logoUrl || DEFAULT_LOGO}
              alt="Logo"
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_LOGO;
              }}
            />
          </div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Espace Pro</h2>
          <p className="text-slate-400 text-sm mt-2">Bienvenue dans le futur de la gestion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium text-center border border-red-500/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative w-full bg-surface border border-white-10 rounded-xl px-4 py-3.5 text-white focus:border-primary/50 focus:bg-surface/80 outline-none transition-all placeholder-slate-500 font-medium text-sm"
                placeholder="Identifiant"
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative w-full bg-surface border border-white-10 rounded-xl px-4 py-3.5 text-white focus:border-primary/50 focus:bg-surface/80 outline-none transition-all placeholder-slate-500 font-medium text-sm"
                placeholder="Mot de passe"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] mt-4 ${loading ? 'opacity-80 cursor-wait' : ''}`}
          >
            {loading ? 'Connexion...' : 'Se Connecter'}
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
  const [appSettings, setAppSettings] = useState<AppSettings>(dataService.getSettings());
  // --- THEME PERSISTENCE ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- SESSION TIMEOUT ---
  useEffect(() => {
    if (!isAuthenticated) return;

    const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes
    let logoutTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        handleLogout();
        // We can't use showToast here easily because it's inside the component that provides the context
        // But since we are logging out, the user will see the login screen.
        alert("Session expirée pour inactivité.");
      }, TIMEOUT_DURATION);
    };

    // Events to track activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    resetTimer(); // Start timer

    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') setIsAuthenticated(true);

    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- STOCK NOTIFICATIONS ---
  useEffect(() => {
    if (isAuthenticated) {
      const materials = dataService.getMaterials();
      const lowStockItems = materials.filter(m => m.currentStock <= m.minStockLevel);

      if (lowStockItems.length > 0) {
        // Delay slightly to ensure toast system is ready
        setTimeout(() => {
          showToast(`Attention: ${lowStockItems.length} articles en rupture de stock !`, 'error');
          console.warn("Low Stock Alert:", lowStockItems.map(m => m.name));
          // Send "Email" (Mock)
          emailService.sendLowStockAlert(lowStockItems);
        }, 2000);
      }
    }
  }, [isAuthenticated]);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    dataService.saveSettings(newSettings);
  };

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

  const SettingsProvider = ({ children }: { children: React.ReactNode }) => (
    <SettingsContext.Provider value={{ settings: appSettings, updateSettings: handleUpdateSettings }}>
      {children}
    </SettingsContext.Provider>
  );

  if (!isAuthenticated) {
    return (
      <SettingsProvider>
        <LoginScreen onLogin={handleLogin} />
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
      <ToastContext.Provider value={{ showToast }}>
        <HashRouter>
          <div className="flex h-screen bg-void text-white overflow-hidden font-sans selection:bg-primary/30 selection:text-white">

            {/* Mobile Overlay */}
            {sidebarOpen && window.innerWidth < 1024 && (
              <div
                className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* --- SIDEBAR --- */}
            <aside
              className={`fixed inset-y-0 left-0 z-50 w-72 glass border-r border-white-5 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.3)] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 print:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
              {/* Logo Area */}
              <div className="h-24 flex items-center px-6 border-b border-white-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-white-10 shadow-lg shadow-primary/10">
                    <img
                      src={appSettings.logoUrl || DEFAULT_LOGO}
                      alt="Logo"
                      className="w-full h-full object-contain p-1.5"
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-sm font-bold text-white truncate font-display tracking-wide">
                      {appSettings.companyName || 'Mon Entreprise'}
                    </h1>

                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar space-y-1">
                <div className="px-6 mb-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pilotage</p>
                </div>
                <SidebarLink to="/" icon={LayoutDashboard} label="Tableau de Bord" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} />
                <SidebarLink to="/projects" icon={Hammer} label="Chantiers & Devis" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} />
                <SidebarLink to="/clients" icon={Users} label="Clients" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} />

                <div className="px-6 mb-3 mt-8">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gestion</p>
                </div>
                <SidebarLink to="/finance" icon={Wallet} label="Finance & Tréso" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} />
                <SidebarLink to="/documents" icon={FileText} label="Devis & Factures" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} />
                <SidebarLink to="/inventory" icon={Package} label="Stock" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} />

                <div className="px-6 mb-3 mt-8">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Système</p>
                </div>
                <SidebarLink to="/history" icon={History} label="Historique" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} />
                <SidebarLink to="/settings" icon={SettingsIcon} label="Paramètres" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} />
              </nav>

              {/* User Footer */}
              <div className="p-4 border-t border-white-5 bg-black/20">
                <div className="bg-surface/50 rounded-xl p-3 flex items-center justify-between group border border-white-5 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 text-sm">
                      A
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">Administrateur</p>
                      <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span> En ligne
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Déconnexion"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">

              {/* Background Ambient Glow */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-20%] right-[10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]"></div>
              </div>

              {/* Floating Header */}
              <header className="h-20 flex items-center justify-between px-6 lg:px-10 shrink-0 print:hidden z-20">
                <div className="flex items-center gap-4">
                  <button
                    className="lg:hidden text-slate-400 p-2 hover:bg-white-5 rounded-lg transition-colors"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu size={24} />
                  </button>
                  <div className="hidden md:flex items-center text-slate-400 bg-surface/50 border border-white-5 px-4 py-2.5 rounded-xl w-72 hover:border-primary/30 hover:bg-surface transition-all focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                    <Search size={16} className="mr-3" />
                    <input className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-slate-500" placeholder="Rechercher..." />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end mr-2">
                    <span className="text-sm font-bold text-white capitalize font-display">
                      {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="p-2.5 bg-surface/50 text-slate-400 hover:text-white hover:bg-primary/20 rounded-full transition-all border border-white-5 hover:border-primary/30"
                  >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                  <button
                    onClick={() => showToast('Aucune nouvelle notification', 'success')}
                    className="relative p-2.5 bg-surface/50 text-slate-400 hover:text-white hover:bg-primary/20 rounded-full transition-all border border-white-5 hover:border-primary/30"
                  >
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-surface shadow-[0_0_8px_#ef4444]"></span>
                  </button>
                </div>
              </header>

              {/* Content Scrollable Area */}
              <main className="flex-1 overflow-auto px-6 lg:px-10 pb-6 pt-2 scroll-smooth print:p-0 z-10 custom-scrollbar">
                <div className="max-w-[1600px] mx-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/documents" element={<Documents />} />
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
    </SettingsProvider>
  );
};

export default App;