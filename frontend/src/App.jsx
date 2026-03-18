import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Moon, Sun } from 'lucide-react';

// Lazy load pages eventually, using basic imports for now
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import Drivers from './pages/Drivers';
import Vehicles from './pages/Vehicles';
import THC from './pages/THC';
import Companies from './pages/Companies';
import AIAssistant from './pages/AIAssistant';
import Login from './pages/Login';
import THCView from './pages/THCView';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Map routes to theme class names
const ROUTE_THEMES = {
  '/': 'theme-dashboard',
  '/companies': 'theme-companies',
  '/drivers': 'theme-drivers',
  '/vehicles': 'theme-vehicles',
  '/trips': 'theme-trips',
  '/thc': 'theme-thc',
  '/ai': 'theme-ai',
};

function AppLayout() {
  const location = useLocation();
  const themeClass = ROUTE_THEMES[location.pathname] || 'theme-dashboard';
  const [colorMode, setColorMode] = React.useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = window.localStorage.getItem('color-mode');
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  React.useEffect(() => {
    document.documentElement.dataset.colorMode = colorMode;
    window.localStorage.setItem('color-mode', colorMode);
  }, [colorMode]);

  const toggleColorMode = () => {
    setColorMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ProtectedRoute>
      <div className={`app-container ${themeClass} ${colorMode === 'light' ? 'light-mode' : 'dark-mode'}`}>
        <Sidebar />
        <main className="main-content">
          <div className="topbar">
            <h2 className="card-title" style={{ margin: 0 }}>System Operations</h2>
            <div className="topbar-actions">
              <div className="badge badge-success">System Online</div>
              <button
                type="button"
                className="theme-toggle"
                onClick={toggleColorMode}
                aria-label="Toggle light or dark mode"
                aria-pressed={colorMode === 'light'}
                title={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                <span className="theme-toggle-text">
                  {colorMode === 'light' ? 'Dark' : 'Light'}
                </span>
              </button>
            </div>
          </div>
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/thc" element={<THC />} />
              <Route path="/ai" element={<AIAssistant />} />
            </Routes>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/thc/view/:id" element={<THCView />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
