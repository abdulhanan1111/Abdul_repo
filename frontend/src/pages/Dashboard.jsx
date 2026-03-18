import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Users, DollarSign, CheckCircle, MapPin, Building2 } from 'lucide-react';
import { API_URL } from '../constants';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_trips: 0,
    total_vehicles: 0,
    total_drivers: 0,
    total_companies: 0,
    completed_trips: 0,
    total_revenue: 0,
    trips_by_status: [],
    revenue_over_time: [],
    trips_by_city: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const analyticsRes = await axios.get(`${API_URL}/dashboard/analytics`);
        setStats(analyticsRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setError('Failed to sync system data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const PIE_COLORS = ['#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

  if (loading) {
    return <div className="card"><p>Loading dashboard analytics...</p></div>;
  }

  if (error) {
    return <div className="card" style={{ color: 'var(--danger)', textAlign: 'center' }}><p>{error}</p></div>;
  }

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '24px' }}>
        <h2 className="card-title">System Analytics Dashboard</h2>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)'}}><DollarSign /></div>
          <div className="metric-info">
            <h3>Total Revenue</h3>
            <p>₹{Math.round(stats.total_revenue).toLocaleString()}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><MapPin /></div>
          <div className="metric-info">
            <h3>Total Trips</h3>
            <p>{stats.total_trips}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'rgba(2, 132, 199, 0.1)', color: 'var(--info)'}}><CheckCircle /></div>
          <div className="metric-info">
            <h3>Completed Trips</h3>
            <p>{stats.completed_trips}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><Truck /></div>
          <div className="metric-info">
            <h3>Total Vehicles</h3>
            <p>{stats.total_vehicles}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'rgba(244, 114, 182, 0.1)', color: '#f472b6'}}><Users /></div>
          <div className="metric-info">
            <h3>Total Drivers</h3>
            <p>{stats.total_drivers}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24'}}><Building2 /></div>
          <div className="metric-info">
            <h3>Total Companies</h3>
            <p>{stats.total_companies}</p>
          </div>
        </div>
      </div>


      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '20px' }}>Revenue (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.revenue_over_time} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(value) => `₹${value/1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-color-dark)', border: '1px solid var(--border)' }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '20px' }}>Trips by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.trips_by_status} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-color-dark)', border: '1px solid var(--border)' }} />
              <Legend />
              <Bar dataKey="count" name="Number of Trips" fill="#457b9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 className="card-title" style={{ marginBottom: '20px' }}>Trips by Origin City (Top 10)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats.trips_by_city}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="count"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {stats.trips_by_city.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-color-dark)', border: '1px solid var(--border)' }} />
            <Legend />
          </PieChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
