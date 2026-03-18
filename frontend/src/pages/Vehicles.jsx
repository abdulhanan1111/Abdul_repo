import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2 } from 'lucide-react';
import { CITIES, API_URL } from '../constants';
import Pagination from '../components/Pagination';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    number: '', type: 'Truck', load_capacity: 1000, company_id: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    city: ''
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchData();
  }, [page, filters.status, filters.city]);

  const fetchData = async () => {
    try {
      const skip = (page - 1) * pageSize;
      const params = {
        skip,
        limit: pageSize,
        status: filters.status || undefined,
        city: filters.city || undefined
      };
      
      const [vehiclesRes, companiesRes] = await Promise.all([
        axios.get(`${API_URL}/vehicles`, { params }),
        axios.get(`${API_URL}/companies?limit=100`)
      ]);
      setVehicles(vehiclesRes.data.items);
      setTotal(vehiclesRes.data.total);
      setCompanies(companiesRes.data.items);
      if (companiesRes.data.items.length > 0 && !formData.company_id) {
        setFormData(prev => ({ ...prev, company_id: companiesRes.data.items[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/vehicles/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/vehicles`, formData);
      }
      setShowModal(false);
      setFormData({ number: '', type: 'Truck', load_capacity: 1000, company_id: companies[0]?.id || '' });
      setEditingId(null);
      fetchData();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.detail || 'Error saving vehicle. Ensure plate number is unique.');
    }
  };

  const handleEdit = (vehicle) => {
    setFormData({
      number: vehicle.number,
      type: vehicle.type,
      load_capacity: vehicle.load_capacity,
      company_id: vehicle.company_id || (companies[0]?.id || '')
    });
    setEditingId(vehicle.id);
    setShowModal(true);
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await axios.delete(`${API_URL}/vehicles/${vehicleId}`);
        fetchData();
      } catch (e) {
        console.error(e);
        alert('Error deleting vehicle. It might be assigned to a trip.');
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Vehicle Fleet Tracking</h2>
        <button className="btn btn-primary" onClick={() => {
          if (!showModal) {
            setEditingId(null);
            setFormData({ number: '', type: 'Truck', load_capacity: 1000, company_id: companies[0]?.id || '' });
          }
          setShowModal(!showModal);
        }}>
          {showModal ? 'Cancel' : '+ Add Vehicle'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', padding: '0 4px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label" style={{ fontSize: '0.8rem', opacity: 0.8 }}>Filter by Status</label>
          <select 
            className="form-input" 
            value={filters.status} 
            onChange={e => handleFilterChange('status', e.target.value)}
            style={{ height: '48px', fontSize: '1rem', fontWeight: '500' }}
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label" style={{ fontSize: '0.8rem', opacity: 0.8 }}>Filter by City</label>
          <select 
            className="form-input" 
            value={filters.city}
            onChange={e => handleFilterChange('city', e.target.value)}
            style={{ height: '48px', fontSize: '1rem', fontWeight: '500' }}
          >
            <option value="">All Cities</option>
            {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
      </div>

      {showModal && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
          <div className="dashboard-grid" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Vehicle Registration #</label>
              <input type="text" className="form-input" required value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value.toUpperCase() })} />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <input type="text" className="form-input" required value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Load Capacity (kg)</label>
              <input type="number" className="form-input" required value={formData.load_capacity} onChange={e => setFormData({ ...formData, load_capacity: parseFloat(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <select className="form-input" value={formData.company_id} onChange={e => setFormData({ ...formData, company_id: parseInt(e.target.value) })}>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={companies.length === 0}>Save Vehicle</button>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Reg Number</th>
              <th>Type / Capacity</th>
              <th>Company</th>
              <th>Current City</th>
              <th>Status</th>
              <th>Assigned Trip</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td style={{ fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.05em' }}>{v.number}</td>
                <td>{v.type}<br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.load_capacity} kg max</span></td>
                <td>{v.company?.name || 'Unknown'}</td>
                <td style={{ fontWeight: 600 }}>{v.status?.current_city || 'N/A'}</td>
                <td>
                  <span className={`badge badge-${v.status?.availability_status === 'available' ? 'success' : 'warning'}`}>
                    {v.status?.availability_status || 'Unknown'}
                  </span>
                </td>
                <td>{v.status?.current_trip_id ? `#Trip-${v.status.current_trip_id}` : '-'}</td>
                <td>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', marginRight: '8px' }} onClick={() => handleEdit(v)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(v.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No vehicles match the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      <Pagination 
        total={total} 
        page={page} 
        pageSize={pageSize} 
        onPageChange={setPage} 
      />
    </div>
  );
};

export default Vehicles;
