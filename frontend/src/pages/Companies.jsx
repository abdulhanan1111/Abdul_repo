import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, X, Edit } from 'lucide-react';
import { CITIES, API_URL } from '../constants';
import Pagination from '../components/Pagination';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', type: 'internal', contact_person: '', phone: '', city: ''
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchCompanies();
  }, [page]);

  const fetchCompanies = async () => {
    try {
      const skip = (page - 1) * pageSize;
      const res = await axios.get(`${API_URL}/companies`, {
        params: { skip, limit: pageSize }
      });
      setCompanies(res.data.items);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/companies/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/companies`, formData);
      }
      setShowModal(false);
      setFormData({ name: '', type: 'internal', contact_person: '', phone: '', city: '' });
      setEditingId(null);
      fetchCompanies();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.detail || 'Error saving company');
    }
  };

  const handleEdit = (company) => {
    setFormData({
      name: company.name,
      type: company.type,
      contact_person: company.contact_person,
      phone: company.phone,
      city: company.city
    });
    setEditingId(company.id);
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will also delete ALL drivers and vehicles associated with this company.`)) {
      try {
        console.log(`Attempting to delete company ${id} (${name})`);
        const res = await axios.delete(`${API_URL}/companies/${id}`);
        console.log('Delete response:', res.data);
        fetchCompanies();
      } catch (e) {
        console.error('Delete error:', e);
        if (e.response) console.error('Error info:', e.response.data);
        alert('Error deleting company: ' + (e.response?.data?.detail || e.message));
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Companies Master</h2>
        <button className="btn btn-primary" onClick={() => {
          if (!showModal) {
            setEditingId(null);
            setFormData({ name: '', type: 'internal', contact_person: '', phone: '', city: '' });
          }
          setShowModal(!showModal);
        }}>
          {showModal ? 'Cancel' : '+ Add Company'}
        </button>
      </div>

      {showModal && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
          <div className="dashboard-grid" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                <option value="internal">Internal</option>
                <option value="partner">Partner</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">City Base</label>
              <select className="form-input" required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}>
                <option value="">Select City</option>
                {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input type="text" className="form-input" required value={formData.contact_person} onChange={e => setFormData({ ...formData, contact_person: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="text" className="form-input" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Save Company</button>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>City</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td><span className={`badge badge-${c.type === 'internal' ? 'primary' : 'warning'}`}>{c.type}</span></td>
                <td>{c.city}</td>
                <td>{c.contact_person} ({c.phone})</td>
                <td>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 8px', marginRight: '8px' }}
                    onClick={() => handleEdit(c)}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 8px', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    onClick={() => handleDelete(c.id, c.name)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No companies found. Add an internal company to start.</td></tr>
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

export default Companies;
