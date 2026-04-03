import { useState, useEffect } from 'react';
import {  AnimatePresence } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import Swal from 'sweetalert2';


const backend_url = import.meta.env.VITE_BACKEND_URL;


export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) { navigate({ to: '/login' }); return; }
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${backend_url}/api/payments/my-payments`, { withCredentials: true });
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  return (
    <DashboardLayout>
      <div>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Cinzel:wght@400;600;700&family=Jost:wght@300;400;500&display=swap');
        `}</style>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8" style={{ background: 'linear-gradient(135deg, #4A3728, #8B6F47)', padding: 'clamp(24px, 4vw, 36px)' }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: '8px', letterSpacing: '0.4em', color: 'rgba(201,169,110,0.6)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Financial Overview
          </span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, color: '#fff', marginBottom: '16px' }}>
            My Payments
          </h1>
          <div className="flex gap-6 flex-wrap">
            <div>
              <span className="block text-2xl text-[#C9A96E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                ₹{totalPaid.toLocaleString()}
              </span>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                Total Paid
              </span>
            </div>
            <div>
              <span className="block text-2xl text-[#C9A96E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {payments.length}
              </span>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                Transactions
              </span>
            </div>
          </div>
        </motion.div>

        {/* Payment List */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading payments...</div>
        ) : payments.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="border border-dashed border-[rgba(139,111,71,0.2)] p-16 text-center">
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#4A3728' }}>No payments yet</h3>
            <p className="text-gray-400 text-sm mt-2">Your payment history will appear here after making a booking payment.</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {payments.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-[rgba(139,111,71,0.08)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center border border-[rgba(201,169,110,0.2)]"
                    style={{ background: p.status === 'completed' ? '#ecfdf5' : '#fef2f2' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p.status === 'completed' ? '#10b981' : '#ef4444'} strokeWidth="1.5">
                      {p.status === 'completed' ? <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></> : <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>}
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-sm block" style={{ color: '#4A3728' }}>
                      {p.booking_id?.package_name || 'Booking Payment'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString()} · {p.payment_method?.toUpperCase()} · {p.receipt_number}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-medium block" style={{ color: '#10b981', fontFamily: "'Cormorant Garamond', serif" }}>
                    ₹{p.amount?.toLocaleString()}
                  </span>
                  <span className="text-xs uppercase px-2 py-0.5 inline-block"
                    style={{
                      background: p.status === 'completed' ? '#ecfdf5' : '#fef2f2',
                      color: p.status === 'completed' ? '#059669' : '#dc2626',
                      fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.15em'
                    }}>
                    {p.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
