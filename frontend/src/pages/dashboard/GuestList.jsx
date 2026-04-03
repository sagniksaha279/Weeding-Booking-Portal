import { useState, useEffect } from 'react';
import {  AnimatePresence } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import Swal from 'sweetalert2';


const backend_url = import.meta.env.VITE_BACKEND_URL;

export default function GuestList() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [guests, setGuests] = useState([]);
  const [stats, setStats] = useState(null);
  const [, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', relation: 'friend', side: 'mutual', dietary_preference: 'veg', plus_ones: 0, notes: '' });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) { navigate({ to: '/login' }); return; }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${backend_url}/api/bookings/my-bookings`, { withCredentials: true });
      setBookings(res.data.filter(b => b.status === 'confirmed' || b.status === 'pending'));
      if (res.data.length > 0) {
        const confirmed = res.data.find(b => b.status === 'confirmed') || res.data[0];
        setSelectedBooking(confirmed);
        fetchGuests(confirmed._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuests = async (bookingId) => {
    try {
      const [guestRes, statsRes] = await Promise.all([
        axios.get(`${backend_url}/api/guests/booking/${bookingId}`, { withCredentials: true }),
        axios.get(`${backend_url}/api/guests/stats/${bookingId}`, { withCredentials: true })
      ]);
      setGuests(guestRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      await axios.post(`${backend_url}/api/guests`, { ...formData, booking_id: selectedBooking._id }, { withCredentials: true });
      Swal.fire({ icon: 'success', title: 'Guest Added!', timer: 1500, showConfirmButton: false });
      setShowAddForm(false);
      setFormData({ name: '', email: '', phone: '', relation: 'friend', side: 'mutual', dietary_preference: 'veg', plus_ones: 0, notes: '' });
      fetchGuests(selectedBooking._id);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Failed to add guest', 'error');
    }
  };

  const handleDeleteGuest = async (id) => {
    const result = await Swal.fire({ title: 'Remove guest?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#4A3728' });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${backend_url}/api/guests/${id}`, { withCredentials: true });
        fetchGuests(selectedBooking._id);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        Swal.fire('Error', 'Failed to remove', 'error');
      }
    }
  };

  const handleRSVP = async (id, status) => {
    try {
      await axios.put(`${backend_url}/api/guests/rsvp/${id}`, { rsvp_status: status }, { withCredentials: true });
      fetchGuests(selectedBooking._id);
    } catch (err) {
      console.error(err);
    }
  };

  const inputStyle = "w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#C9A96E] transition-colors";
  const labelStyle = { fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#4A3728', display: 'block', marginBottom: '6px', fontWeight: 600 };

  return (
    <DashboardLayout>
      <div>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Cinzel:wght@400;600;700&family=Jost:wght@300;400;500&display=swap');
        `}</style>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6" style={{ background: 'linear-gradient(135deg, #4A3728, #8B6F47)', padding: 'clamp(24px, 4vw, 36px)' }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: '8px', letterSpacing: '0.4em', color: 'rgba(201,169,110,0.6)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Event Planning
              </span>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, color: '#fff' }}>
                Guest List Manager
              </h1>
            </div>
            <button onClick={() => setShowAddForm(true)}
              className="px-6 py-3 text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90"
              style={{ fontFamily: "'Cinzel', serif", background: '#C9A96E', color: '#1C1008' }}>
              + Add Guest
            </button>
          </div>
        </motion.div>

        {/* Booking Selector */}
        {bookings.length > 1 && (
          <div className="mb-6 flex gap-2 flex-wrap">
            {bookings.map(b => (
              <button key={b._id} onClick={() => { setSelectedBooking(b); fetchGuests(b._id); }}
                className="px-4 py-2 text-xs transition-all"
                style={{
                  fontFamily: "'Cinzel', serif", letterSpacing: '0.15em', textTransform: 'uppercase',
                  background: selectedBooking?._id === b._id ? '#4A3728' : 'white',
                  color: selectedBooking?._id === b._id ? '#fff' : '#4A3728',
                  border: '1px solid rgba(139,111,71,0.15)'
                }}>
                {b.package_name} — {new Date(b.event_date).toLocaleDateString()}
              </button>
            ))}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Guests', value: stats.totalWithPlusOnes, color: '#8B6F47' },
              { label: 'Accepted', value: stats.accepted, color: '#10b981' },
              { label: 'Pending', value: stats.pending, color: '#f59e0b' },
              { label: 'Declined', value: stats.declined, color: '#ef4444' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-[rgba(139,111,71,0.08)] p-4 text-center">
                <span className="block text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif", color: s.color }}>{s.value}</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.2em', color: '#7A6555', textTransform: 'uppercase' }}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Guest Cards */}
        {guests.length === 0 ? (
          <div className="border border-dashed border-[rgba(139,111,71,0.2)] p-16 text-center">
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#4A3728' }}>No guests added yet</h3>
            <p className="text-gray-400 text-sm mt-2">Start building your guest list for the big day!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {guests.map((g, i) => (
              <motion.div key={g._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white border border-[rgba(139,111,71,0.08)] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ background: '#FDF8F3', color: '#8B6F47', border: '1px solid rgba(201,169,110,0.2)' }}>
                    {g.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium text-sm block" style={{ color: '#4A3728' }}>{g.name}</span>
                    <span className="text-xs text-gray-400">{g.relation} · {g.side} side · {g.dietary_preference}</span>
                    {g.plus_ones > 0 && <span className="text-xs text-[#8B6F47] ml-2">+{g.plus_ones}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {['accepted', 'pending', 'declined', 'maybe'].map(status => (
                    <button key={status} onClick={() => handleRSVP(g._id, status)}
                      className="px-2 py-1 text-xs capitalize transition-all"
                      style={{
                        background: g.rsvp_status === status ? (status === 'accepted' ? '#ecfdf5' : status === 'declined' ? '#fef2f2' : status === 'maybe' ? '#eff6ff' : '#fffbeb') : 'transparent',
                        color: g.rsvp_status === status ? (status === 'accepted' ? '#059669' : status === 'declined' ? '#dc2626' : status === 'maybe' ? '#2563eb' : '#d97706') : '#aaa',
                        border: `1px solid ${g.rsvp_status === status ? 'currentColor' : '#e5e7eb'}`,
                      }}>
                      {status}
                    </button>
                  ))}
                  <button onClick={() => handleDeleteGuest(g._id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Guest Modal */}
        <AnimatePresence>
          {showAddForm && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowAddForm(false)} />
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: '#4A3728' }}>Add Guest</h3>
                    <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-700 text-xl">&times;</button>
                  </div>
                  <form onSubmit={handleAddGuest} className="space-y-4">
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputStyle} placeholder="Guest name" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label style={labelStyle}>Email</label>
                        <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputStyle} placeholder="Email" />
                      </div>
                      <div>
                        <label style={labelStyle}>Phone</label>
                        <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputStyle} placeholder="Phone" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label style={labelStyle}>Relation</label>
                        <select value={formData.relation} onChange={e => setFormData({...formData, relation: e.target.value})} className={inputStyle}>
                          {['family', 'friend', 'colleague', 'neighbor', 'other'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Side</label>
                        <select value={formData.side} onChange={e => setFormData({...formData, side: e.target.value})} className={inputStyle}>
                          {['bride', 'groom', 'mutual'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Diet</label>
                        <select value={formData.dietary_preference} onChange={e => setFormData({...formData, dietary_preference: e.target.value})} className={inputStyle}>
                          {['veg', 'non-veg', 'vegan', 'jain', 'other'].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Plus Ones</label>
                      <input type="number" min="0" max="10" value={formData.plus_ones} onChange={e => setFormData({...formData, plus_ones: parseInt(e.target.value) || 0})} className={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Notes</label>
                      <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className={inputStyle} rows="2" placeholder="Special notes..." />
                    </div>
                    <button type="submit"
                      className="w-full py-3.5 uppercase text-xs tracking-widest font-bold relative overflow-hidden group"
                      style={{ fontFamily: "'Cinzel', serif", background: '#4A3728', color: '#FDF8F3' }}>
                      <span className="relative z-10">Add Guest</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#C9A96E] to-[#8B6F47] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
