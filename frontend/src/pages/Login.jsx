import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(username, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-color-gradient)',
      padding: '24px'
    }}>
      
      {/* Decorative Orbs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: '50vw', height: '50vw', background: 'var(--primary)', filter: 'blur(100px)', opacity: '0.15', zIndex: 0, borderRadius: '50%' }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: '50vw', height: '50vw', background: 'var(--secondary)', filter: 'blur(100px)', opacity: '0.15', zIndex: 0, borderRadius: '50%' }} />

      <div className="card" style={{ maxWidth: '440px', width: '100%', zIndex: 10, position: 'relative', overflow: 'visible' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', height: '64px', 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)'
          }}>
            <Truck color="white" size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>Admin Portal</h1>
          <p style={{ color: 'var(--text-muted)' }}>Enter your credentials to access the Trip & THC Management System.</p>
        </div>

        {error && (
          <div style={{ 
            background: 'var(--danger-bg)', 
            color: 'var(--danger)', 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            fontSize: '0.9rem',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-input" 
              value={username} onChange={e => setUsername(e.target.value)} 
              required autoFocus
              placeholder="e.g. admin"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} onChange={e => setPassword(e.target.value)} 
              required
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px' }} disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
      </div>
    </div>
  );
}
