import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, FileText, Truck, Users, Activity, Bot, LogOut } from 'lucide-react';
import { useAuth } from '../AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Truck className="h-6 w-6" style={{ color: 'var(--primary)' }} />
        <h1>Trip & THC Admin</h1>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} end><Home size={20} /> Dashboard</NavLink>
        <NavLink to="/companies" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><LayoutDashboard size={20} /> Companies</NavLink>
        <NavLink to="/drivers" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><Users size={20} /> Drivers</NavLink>
        <NavLink to="/vehicles" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><Truck size={20} /> Vehicles</NavLink>
        <NavLink to="/trips" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><Activity size={20} /> Trips</NavLink>
        <NavLink to="/thc" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><FileText size={20} /> THC Records</NavLink>
        <NavLink to="/ai" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><Bot size={20} /> AI Assistant</NavLink>
        
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={logout} 
            className="nav-item" 
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)' }}
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
