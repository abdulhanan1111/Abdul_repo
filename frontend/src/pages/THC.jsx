import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Download, Eye, X, ExternalLink } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CITIES, API_URL } from '../constants';
import Pagination from '../components/Pagination';

const THC = () => {
  const [thcs, setThcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedThc, setSelectedThc] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const challanRef = useRef();

  useEffect(() => {
    const fetchThcs = async () => {
      try {
        setLoading(true);
        const skip = (page - 1) * pageSize;
        const response = await axios.get(`${API_URL}/trips/thc`, {
          params: { skip, limit: pageSize }
        });
        setThcs(response.data.items);
        setTotal(response.data.total);
      } catch (error) {
        console.error('Error fetching THCs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchThcs();
  }, [page]);

  const downloadPDF = async () => {
    const element = challanRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`THC-${selectedThc.id}.pdf`);
  };

  const openInNewTab = (thc) => {
    window.open(`/thc/view/${thc.id}`, '_blank');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Trip Hire Challans (THC)</h2>
      </div>
      
      {loading ? (
        <p>Loading records...</p>
      ) : thcs.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No THCs generated yet. THCs are created automatically when a Trip is created.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>THC ID</th>
                <th>Trip ID</th>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Route</th>
                <th>Freight Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {thcs.map(thc => (
                <tr key={thc.id}>
                  <td><strong>#THC-{thc.id}</strong></td>
                  <td>Trip-{thc.trip_id}</td>
                  <td>{thc.driver_name}</td>
                  <td>{thc.vehicle_number}</td>
                  <td>{thc.origin_city} → {thc.destination_city}</td>
                  <td style={{ fontWeight: '600', color: 'var(--success)' }}>₹{Math.round(thc.freight_cost).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setSelectedThc(thc)}>
                      <Eye size={14} style={{ marginRight: '4px' }} /> View Full Challan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && thcs.length > 0 && (
        <Pagination 
          total={total} 
          page={page} 
          pageSize={pageSize} 
          onPageChange={setPage} 
        />
      )}

      {selectedThc && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'var(--bg-color)', padding: '40px', borderRadius: '16px', maxWidth: '950px', width: '95%', maxHeight: '95vh', overflowY: 'auto', position: 'relative', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <button onClick={() => setSelectedThc(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
               <X size={24} />
            </button>
            
            <div ref={challanRef} style={{ color: 'var(--text-main)', padding: '40px', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ borderBottom: '3px solid var(--primary)', paddingBottom: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ margin: 0, color: 'var(--primary)', letterSpacing: '-0.5px' }}>Trip Hire Challan</h1>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Logistics Management System - Official Document</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ backgroundColor: 'var(--success)', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>VALID RECORD</span>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 8px 0' }}>THC ID</p>
                  <p style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--primary)' }}>#THC-{selectedThc.id}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 8px 0' }}>Associated Trip</p>
                  <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>#TRIP-{selectedThc.trip_id}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 8px 0' }}>Generation Date</p>
                  <p style={{ fontWeight: 600 }}>{new Date(selectedThc.generated_at).toLocaleString()}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                <div style={{ backgroundColor: 'var(--surface-hover)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Logistics Resources</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <p style={{ margin: 0 }}><strong>Allocated Driver:</strong> <span style={{ float: 'right' }}>{selectedThc.driver_name}</span></p>
                    <p style={{ margin: 0 }}><strong>Vehicle Plate:</strong> <span style={{ float: 'right', fontFamily: 'monospace', color: 'var(--primary)' }}>{selectedThc.vehicle_number}</span></p>
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--surface-hover)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Route Details</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <p style={{ margin: 0 }}><strong>Dispatch Point:</strong> <span style={{ float: 'right' }}>{selectedThc.origin_city}</span></p>
                    <p style={{ margin: 0 }}><strong>Final Destination:</strong> <span style={{ float: 'right' }}>{selectedThc.destination_city}</span></p>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--success-bg)', padding: '32px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Shipment Load:</span>
                      <span style={{ fontWeight: 600 }}>{selectedThc.shipment_weight} kg</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Calculated Distance:</span>
                      <span style={{ fontWeight: 600 }}>{Math.round(selectedThc.distance_km)} km</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', borderLeft: '2px solid rgba(16, 185, 129, 0.3)', paddingLeft: '32px' }}>
                    <p style={{ margin: 0, color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Freight Payable</p>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '-1px' }}>₹{Math.round(selectedThc.freight_cost).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ width: '200px' }}>
                  <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '8px' }}></div>
                  <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Authorized Signatory</p>
                </div>
                <div style={{ width: '200px' }}>
                  <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '8px' }}></div>
                  <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Receiver's Confirmation</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '32px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => openInNewTab(selectedThc)}
                style={{ flex: 1, height: '54px', fontSize: '1.1rem', gap: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ExternalLink size={20} /> Open in New Tab
              </button>
              <button 
                className="btn btn-primary" 
                onClick={downloadPDF} 
                style={{ flex: 1, height: '54px', fontSize: '1.1rem', gap: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Download size={20} /> Generate & Download Official PDF
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default THC;
