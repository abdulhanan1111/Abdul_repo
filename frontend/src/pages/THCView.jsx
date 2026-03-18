import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Download, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { API_URL } from '../constants';

const THCView = () => {
    const { id } = useParams();
    const [thc, setThc] = useState(null);
    const challanRef = useRef();

    useEffect(() => {
        const fetchThc = async () => {
            try {
                const response = await axios.get(`${API_URL}/trips/thc?limit=1000`);
                const found = response.data.find(t => t.id === parseInt(id));
                setThc(found);
            } catch (e) {
                console.error(e);
            }
        };
        fetchThc();
    }, [id]);

    const downloadPDF = () => {
        const element = challanRef.current;
        html2canvas(element, { scale: 2, backgroundColor: '#1e293b' }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`THC-${thc.id}.pdf`);
        });
    };

    if (!thc) return <div style={{ color: 'var(--text-main)', padding: '50px', textAlign: 'center' }}>Loading Official Document...</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ maxWidth: '950px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ color: 'var(--text-main)', margin: 0 }}>Official Document View</h2>
                    <button className="btn btn-primary" onClick={downloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={18} /> Download PDF
                    </button>
                </div>

                <div ref={challanRef} style={{ color: 'var(--text-main)', padding: '40px', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ borderBottom: '3px solid var(--primary)', paddingBottom: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: '2.5rem' }}>Trip Hire Challan</h1>
                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '1rem' }}>Logistics Management System - Official Digital Record</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ backgroundColor: 'var(--success)', color: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600 }}>AUTHENTICATED</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 8px 0' }}>THC ID</p>
                            <p style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--primary)' }}>#THC-{thc.id}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 8px 0' }}>Associated Trip</p>
                            <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>#TRIP-{thc.trip_id}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 8px 0' }}>Generation Date</p>
                            <p style={{ fontWeight: 600 }}>{new Date(thc.generated_at).toLocaleString()}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                        <div style={{ backgroundColor: 'var(--surface-hover)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <h3 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Logistics Resources</h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <p style={{ margin: 0 }}><strong>Allocated Driver:</strong> <span style={{ float: 'right' }}>{thc.driver_name}</span></p>
                                <p style={{ margin: 0 }}><strong>Vehicle Plate:</strong> <span style={{ float: 'right', fontFamily: 'monospace', color: 'var(--primary)' }}>{thc.vehicle_number}</span></p>
                            </div>
                        </div>
                        <div style={{ backgroundColor: 'var(--surface-hover)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <h3 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Route Details</h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <p style={{ margin: 0 }}><strong>Dispatch Point:</strong> <span style={{ float: 'right' }}>{thc.origin_city}</span></p>
                                <p style={{ margin: 0 }}><strong>Final Destination:</strong> <span style={{ float: 'right' }}>{thc.destination_city}</span></p>
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--success-bg)', padding: '32px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Shipment Load:</span>
                                    <span style={{ fontWeight: 600 }}>{thc.shipment_weight} kg</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Calculated Distance:</span>
                                    <span style={{ fontWeight: 600 }}>{Math.round(thc.distance_km)} km</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', borderLeft: '2px solid rgba(16, 185, 129, 0.3)', paddingLeft: '32px' }}>
                                <p style={{ margin: 0, color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Freight Payable</p>
                                <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '-1px' }}>₹{Math.round(thc.freight_cost).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
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
            </div>
        </div>
    );
};

export default THCView;
