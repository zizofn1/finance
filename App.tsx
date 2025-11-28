import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Hammer, Users, Wallet, Package, Menu, X, LogOut, Settings as SettingsIcon, History } from 'lucide-react';
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
    <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-2xl transform transition-all animate-in slide-in-from-bottom-5 z-50 font-medium text-white flex items-center gap-3 no-print ${
      toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
    }`}>
      {toast.type === 'success' ? '✓' : '⚠'} {toast.message}
    </div>
  );
};

const SidebarLink = ({ to, icon: Icon, label, onClick }: { to: string, icon: any, label: string, onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
      <span className="font-medium tracking-wide text-sm">{label}</span>
    </Link>
  );
};

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error', id: number } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToast({ message, type, id });
    setTimeout(() => {
      setToast(prev => prev?.id === id ? null : prev);
    }, 3000);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <HashRouter>
        <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
          {/* Mobile Overlay */}
          {sidebarOpen && window.innerWidth < 768 && (
            <div 
              className="fixed inset-0 bg-slate-900/80 z-40 md:hidden backdrop-blur-sm no-print"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside 
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-2xl flex flex-col no-print ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Brand */}
            <div className="h-20 flex items-center px-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="shadow-lg rounded-full overflow-hidden bg-white w-10 h-10 flex items-center justify-center">
                   <img src="logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight leading-none">Fun Design F&Z</h1>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">ERP System</span>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 ml-auto hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
              <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Menu Principal</p>
              <SidebarLink to="/" icon={LayoutDashboard} label="Tableau de Bord" onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} />
              <SidebarLink to="/projects" icon={Hammer} label="Projets" onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} />
              <SidebarLink to="/clients" icon={Users} label="Clients" onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} />
              <div className="pt-4 pb-2">
                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Gestion</p>
                <SidebarLink to="/finance" icon={Wallet} label="Finance" onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} />
                <SidebarLink to="/inventory" icon={Package} label="Stock" onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} />
                <SidebarLink to="/history" icon={History} label="Historique" onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} />
              </div>
            </nav>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3 px-2">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  FZ
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">Admin</p>
                  <p className="text-xs text-slate-500 truncate">admin@fundesign.com</p>
                </div>
                <Link to="/settings" onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <SettingsIcon size={18} />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            
            {/* Top Navbar */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10 sticky top-0 no-print">
              <div className="flex items-center gap-3">
                <button 
                  className="md:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <h2 className="text-sm font-medium text-slate-500 hidden md:block">
                  <span className="text-slate-300 mx-2">/</span> Espace de Travail
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 hidden sm:block">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
            </header>

            <main className="flex-1 overflow-auto bg-slate-100 p-4 md:p-8 scroll-smooth print:bg-white print:p-0">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/history" element={<GlobalHistory />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>

            <ToastContainer toast={toast} />
          </div>
        </div>
      </HashRouter>
    </ToastContext.Provider>
  );
};

export default App;