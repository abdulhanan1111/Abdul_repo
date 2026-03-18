import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2 } from 'lucide-react';
import { CITIES, API_URL } from '../constants';
import Pagination from '../components/Pagination';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', license_number: '', company_id: ''
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
      
      const [driversRes, companiesRes] = await Promise.all([
        axios.get(`${API_URL}/drivers`, { params }),
        axios.get(`${API_URL}/companies?limit=100`)
      ]);
      setDrivers(driversRes.data.items);
      setTotal(driversRes.data.total);
      setCompanies(driversRes.data.items.length > 0 ? companiesRes.data.items : companiesRes.data.items); // companies list is small so we fetch all
      // FIX: use companiesRes.data.items for companies list
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
        await axios.put(`${API_URL}/drivers/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/drivers`, formData);
      }
      setShowModal(false);
      setFormData({ name: '', phone: '', license_number: '', company_id: companies[0]?.id || '' });
      setEditingId(null);
      fetchData();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.detail || 'Error saving driver. Ensure phone/license are unique.');
    }
  };

  const handleEdit = (driver) => {
    setFormData({
      name: driver.name,
      phone: driver.phone,
      license_number: driver.license_number,
      company_id: driver.company_id || (companies[0]?.id || '')
    });
    setEditingId(driver.id);
    setShowModal(true);
  };

  const handleDelete = async (driverId) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await axios.delete(`${API_URL}/drivers/${driverId}`);
        fetchData();
      } catch (e) {
        console.error(e);
        alert('Error deleting driver. They might be assigned to a trip.');
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const uniqueCities = [...new Set(drivers.map(d => d.status?.current_city).filter(Boolean))];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Driver Roster & Status Tracking</h2>
        <button className="btn btn-primary" onClick={() => {
          if (!showModal) {
            setEditingId(null);
            setFormData({ name: '', phone: '', license_number: '', company_id: companies[0]?.id || '' });
          }
          setShowModal(!showModal);
        }}>
          {showModal ? 'Cancel' : '+ Add Driver'}
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
              <label className="form-label">Name</label>
              <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="text" className="form-input" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">License Number</label>
              <input type="text" className="form-input" required value={formData.license_number} onChange={e => setFormData({ ...formData, license_number: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <select className="form-input" value={formData.company_id} onChange={e => setFormData({ ...formData, company_id: parseInt(e.target.value) })}>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={companies.length === 0}>Save Driver</button>
          {companies.length === 0 && <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: 'var(--danger)' }}>Must add a company first!</span>}
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact / License</th>
              <th>Company</th>
              <th>Current City</th>
              <th>Status</th>
              <th>Assigned Trip</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td style={{ fontWeight: 500 }}>{d.name}</td>
                <td>{d.phone}<br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.license_number}</span></td>
                <td>{d.company?.name || 'Unknown'}</td>
                <td style={{ fontWeight: 600 }}>{d.status?.current_city || 'N/A'}</td>
                <td>
                  <span className={`badge badge-${d.status?.availability_status === 'available' ? 'success' : 'warning'}`}>
                    {d.status?.availability_status || 'Unknown'}
                  </span>
                </td>
                <td>{d.status?.current_trip_id ? `#Trip-${d.status.current_trip_id}` : '-'}</td>
                <td>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', marginRight: '8px' }} onClick={() => handleEdit(d)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(d.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No drivers match the current filters.</td></tr>
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

export default Drivers;
