import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CITIES, API_URL } from '../constants';
import Pagination from '../components/Pagination';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    origin_city: CITIES[0], destination_city: CITIES[1], driver_id: '', vehicle_id: '', shipment_weight: 1000
  });
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchTrips();
    fetchResources();
  }, [page, filters.status, filters.search]);

  const fetchTrips = async () => {
    try {
      const skip = (page - 1) * pageSize;
      const params = {
        skip,
        limit: pageSize,
        status: filters.status || undefined,
        search: filters.search || undefined
      };
      const res = await axios.get(`${API_URL}/trips`, { params });
      setTrips(res.data.items);
      setTotal(res.data.total);
    } catch (e) { console.error('Error fetching trips', e); }
  };

  const fetchResources = async () => {
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        axios.get(`${API_URL}/drivers?limit=100`),
        axios.get(`${API_URL}/vehicles?limit=100`)
      ]);
      const driverList = driversRes.data.items || driversRes.data;
      const vehicleList = vehiclesRes.data.items || vehiclesRes.data;

      setDrivers(driverList);
      setVehicles(vehicleList);
      
      // Select first available resources initially
      const r_d = driverList.find(d => d.status?.availability_status === 'available');
      const r_v = vehicleList.find(v => v.status?.availability_status === 'available');
      setFormData(prev => ({
        ...prev, 
        driver_id: r_d?.id || '',
        vehicle_id: r_v?.id || ''
      }));
    } catch (e) {
      console.error('Error fetching resources', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/trips`, {
        ...formData,
        driver_id: parseInt(formData.driver_id),
        vehicle_id: parseInt(formData.vehicle_id)
      });
      setShowModal(false);
      setFormData({ origin_city: CITIES[0], destination_city: CITIES[1], driver_id: '', vehicle_id: '', shipment_weight: 1000 });
      fetchTrips();
      fetchResources();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.detail || 'Error creating trip. Ensure driver and vehicle are available in the origin city.');
    }
  };

  // Sync selection when origin_city or available lists change
  useEffect(() => {
    if (showModal) {
      const firstD = driversInCity[0]?.id || '';
      const firstV = vehiclesInCity[0]?.id || '';
      setFormData(prev => ({
        ...prev,
        driver_id: driversInCity.some(d => d.id === parseInt(prev.driver_id)) ? prev.driver_id : firstD,
        vehicle_id: vehiclesInCity.some(v => v.id === parseInt(prev.vehicle_id)) ? prev.vehicle_id : firstV
      }));
    }
  }, [formData.origin_city, drivers.length, vehicles.length, showModal]);

  const updateStatus = async (tripId, newStatus) => {
    try {
      await axios.post(`${API_URL}/trips/${tripId}/status?status=${newStatus}`);
      fetchTrips();
      fetchResources();
    } catch (e) {
      console.error(e);
      alert('Error updating status');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // Filter for available drivers and vehicles only
  const availableDrivers = drivers.filter(d => d.status?.availability_status === 'available');
  const availableVehicles = vehicles.filter(v => v.status?.availability_status === 'available');

  // New: Filter by origin city
  const driversInCity = availableDrivers.filter(d => 
    !formData.origin_city || d.status?.current_city?.toLowerCase() === formData.origin_city.toLowerCase()
  );
  const vehiclesInCity = availableVehicles.filter(v => 
    !formData.origin_city || v.status?.current_city?.toLowerCase() === formData.origin_city.toLowerCase()
  );

  const isSameCity = formData.origin_city === formData.destination_city;
  const noResources = driversInCity.length === 0 || vehiclesInCity.length === 0;
  let validationError = '';
  if (isSameCity) {
    validationError = 'Origin and destination cannot be the same city.';
  } else if (noResources && showModal) {
    validationError = 'Need both an available driver and vehicle in the origin city.';
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Created': return 'badge-primary';
      case 'Pickup Confirmed': return 'badge-warning';
      case 'In Transit': return 'badge-warning';
      case 'Delivered': return 'badge-success';
      case 'Completed': return 'badge-success';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Live Trip Management</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(!showModal)}>
          {showModal ? 'Cancel' : '+ Create Trip'}
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
            <option value="Created">Created</option>
            <option value="Pickup Confirmed">Pickup Confirmed</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label" style={{ fontSize: '0.8rem', opacity: 0.8 }}>Filter by Origin City</label>
          <select 
            className="form-input" 
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
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
              <label className="form-label">Origin City</label>
              <select className="form-input" required value={formData.origin_city} onChange={e => setFormData({ ...formData, origin_city: e.target.value })}>
                {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Destination City</label>
              <select className="form-input" required value={formData.destination_city} onChange={e => setFormData({ ...formData, destination_city: e.target.value })}>
                {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Assign Driver (Available in {formData.origin_city || 'Origin'})</label>
              <select className="form-input" value={formData.driver_id} onChange={e => setFormData({ ...formData, driver_id: e.target.value })}>
                {driversInCity.length === 0 && <option value="">No drivers available in this city</option>}
                {driversInCity.map(d => (
                  <option key={d.id} value={d.id}>{d.name} (In: {d.status?.current_city})</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Assign Vehicle (Available in {formData.origin_city || 'Origin'})</label>
              <select className="form-input" value={formData.vehicle_id} onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}>
                {vehiclesInCity.length === 0 && <option value="">No vehicles available in this city</option>}
                {vehiclesInCity.map(v => (
                  <option key={v.id} value={v.id}>{v.number} - {v.type} (In: {v.status?.current_city})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Shipment Weight (kg)</label>
              <input type="number" className="form-input" required value={formData.shipment_weight} onChange={e => setFormData({ ...formData, shipment_weight: parseFloat(e.target.value) })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={!!validationError}>
            Create Trip & Sequence THC
          </button>
          {validationError && (
             <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: 'var(--danger)' }}>{validationError}</span>
          )}
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Route</th>
              <th>Status</th>
              <th>Driver / Vehicle</th>
              <th>Start / Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.id}>
                <td><strong>#Trip-{t.id}</strong></td>
                <td style={{ fontWeight: 500 }}>{t.origin_city} <span style={{color:'var(--text-muted)'}}>→</span> {t.destination_city}</td>
                <td>
                  <span className={`badge ${getStatusBadge(t.status)}`}>{t.status}</span>
                </td>
                <td>{t.driver?.name}<br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.vehicle?.number}</span></td>
                <td>{new Date(t.created_at).toLocaleDateString()}<br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.trip_start_time ? new Date(t.trip_start_time).toLocaleTimeString() : 'Not started'}</span></td>
                <td>
                  {t.status === 'Created' && <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => updateStatus(t.id, 'Pickup Confirmed')}>Confirm Pickup</button>}
                  {t.status === 'Pickup Confirmed' && <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => updateStatus(t.id, 'In Transit')}>Start Transit</button>}
                  {t.status === 'In Transit' && <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => updateStatus(t.id, 'Delivered')}>Mark Delivered</button>}
                  {t.status === 'Delivered' && <button className="btn btn-success" style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: 'var(--success)', color: 'white', border: 'none' }} onClick={() => updateStatus(t.id, 'Completed')}>Complete Trip</button>}
                  {t.status === 'Completed' && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Archived</span>}
                </td>
              </tr>
            ))}
            {trips.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No trips match the current filters.</td></tr>
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

export default Trips;
