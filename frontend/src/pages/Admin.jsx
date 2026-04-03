import { useState, useEffect } from 'react';
import {  AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Swal from 'sweetalert2';

const backend_url = import.meta.env.VITE_BACKEND_URL;
import { motion } from "framer-motion";

const TABS = ['overview', 'bookings', 'payments', 'reviews', 'menus', 'venues'];

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ id: '', pass: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [, setBookedDates] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venueBookings, setVenueBookings] = useState([]);
  const [showVenueCalendar, setShowVenueCalendar] = useState(false);
  const [loadingVenue, setLoadingVenue] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null);
  const [showReschedulePicker, setShowReschedulePicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    axios.get(`${backend_url}/api/bookings/booked-dates`)
      .then(res => setBookedDates(res.data.map(d => new Date(d).toISOString().split('T')[0])))
      .catch(err => console.log(err));
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.id === 'admin' && loginData.pass === 'admin123') {
      setIsAuthenticated(true);
      fetchAll();
    } else {
      Swal.fire('Error', 'Invalid Admin Credentials', 'error');
    }
  };

  const fetchAll = async () => {
    try {
      const [bookRes, analyticsRes, payRes, revRes, venRes] = await Promise.all([
        axios.get(`${backend_url}/api/bookings/admin/all`, { withCredentials: true }),
        axios.get(`${backend_url}/api/analytics`).catch(() => ({ data: null })),
        axios.get(`${backend_url}/api/payments/admin/all`).catch(() => ({ data: [] })),
        axios.get(`${backend_url}/api/reviews/admin/all`).catch(() => ({ data: [] })),
        axios.get(`${backend_url}/api/bookings/venues`, { withCredentials: true }).catch(() => ({ data: [] })),
      ]);
      setBookings(bookRes.data);
      setAnalytics(analyticsRes.data);
      setPayments(payRes.data);
      setReviews(revRes.data);
      setVenues(venRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await axios.put(`${backend_url}/api/bookings/${id}`, { status }, { withCredentials: true });
      fetchAll();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || "Update failed", 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleShowDates = async (venue) => {
    setSelectedVenue(venue);
    setShowVenueCalendar(true);
    setLoadingVenue(true);
    try {
      const res = await axios.get(`${backend_url}/api/bookings/venue/${encodeURIComponent(venue)}`, { withCredentials: true });
      setVenueBookings(res.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch venue bookings', 'error');
    } finally {
      setLoadingVenue(false);
    }
  };

  const handleFreeDate = async (bookingId, bookingDate) => {
    const result = await Swal.fire({
      title: 'Free this date?',
      text: `Cancel booking for ${new Date(bookingDate).toLocaleDateString()}?`,
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, free it',
      confirmButtonColor: '#4A3728'
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${backend_url}/api/bookings/${bookingId}`, { withCredentials: true });
        Swal.fire('Success', 'Date freed!', 'success');
        handleShowDates(selectedVenue);
        fetchAll();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.error || 'Failed', 'error');
      }
    }
  };

  const isVenueDateBooked = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return venueBookings.some(b =>
      new Date(b.event_date).toISOString().split('T')[0] === dateStr && b.status === 'confirmed'
    );
  };

  const startReschedule = (bookingId) => {
    setRescheduleBookingId(bookingId);
    setShowReschedulePicker(true);
  };

  const handleRescheduleDateSelect = async (date) => {
    if (isVenueDateBooked(date)) {
      Swal.fire('Not available', 'Date already booked.', 'error');
      return;
    }
    const result = await Swal.fire({
      title: 'Reschedule?', text: `Propose ${date.toLocaleDateString()}?`,
      icon: 'question', showCancelButton: true, confirmButtonText: 'Yes', confirmButtonColor: '#4A3728'
    });
    if (!result.isConfirmed) return;
    try {
      await axios.post(`${backend_url}/api/bookings/rebook/${rescheduleBookingId}`,
        { suggestedDate: date.toISOString().split('T')[0] }, { withCredentials: true });
      Swal.fire('Sent!', 'Client will be notified.', 'success');
      fetchAll();
    } catch (err) {
      Swal.fire('Error', 'Failed to send request', 'error');
    } finally {
      setShowReschedulePicker(false);
      setRescheduleBookingId(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchSearch = !searchTerm || 
      b.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.event_location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg, #1C1008 0%, #4A3728 50%, #2d1f14 100%)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7 }} className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl border border-[rgba(201,169,110,0.15)] p-10">
            <div className="text-center mb-10">
              <motion.div className="w-3 h-3 bg-[#C9A96E] mx-auto mb-4" style={{ transform: 'rotate(45deg)' }}
                animate={{ scale: [1, 1.3, 1], rotate: [45, 45, 45] }} transition={{ duration: 3, repeat: Infinity }} />
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 300, color: '#fff', marginBottom: '8px' }}>
                Admin Portal
              </h1>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: '8px', letterSpacing: '0.4em', color: 'rgba(201,169,110,0.6)', textTransform: 'uppercase' }}>
                Banquet Management System
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <input type="text" placeholder="Admin ID" required
                className="w-full p-4 bg-white/5 border border-[rgba(201,169,110,0.2)] text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#C9A96E] transition-colors"
                style={{ fontFamily: "'Jost', sans-serif" }}
                onChange={(e) => setLoginData({ ...loginData, id: e.target.value })} />
              <input type="password" placeholder="Password" required
                className="w-full p-4 bg-white/5 border border-[rgba(201,169,110,0.2)] text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#C9A96E] transition-colors"
                style={{ fontFamily: "'Jost', sans-serif" }}
                onChange={(e) => setLoginData({ ...loginData, pass: e.target.value })} />
              <button type="submit"
                className="w-full py-4 uppercase text-sm relative overflow-hidden group"
                style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.3em', fontSize: '10px', fontWeight: 700, background: '#C9A96E', color: '#1C1008' }}>
                <span className="relative z-10">Access Dashboard</span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F8F4EF' }}>
      <style>{`
        .react-calendar { border:none; box-shadow:0 4px 20px rgba(0,0,0,0.08); border-radius:12px; padding:1rem; }
        .react-calendar__tile { padding:0.75rem 0.5rem; font-weight:500; transition:all 0.2s; }
        .react-calendar__tile--now { background:#fef3c7; color:#b45309; }
        .react-calendar__tile--active { background:#8B6F47; color:white; }
        .booked-date { background:#fee2e2 !important; color:#991b1b !important; }
        .booked-date::after { content:'❌'; font-size:0.6rem; position:absolute; bottom:2px; right:4px; }
        .available-date { background:#e6f7e6 !important; color:#166534 !important; }
        .available-date::after { content:'✅'; font-size:0.6rem; position:absolute; bottom:2px; right:4px; }
      `}</style>

      {/* Admin Header */}
      <div style={{ background: 'linear-gradient(135deg, #1C1008, #4A3728)', padding: 'clamp(24px, 4vw, 40px)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ fontFamily: "'Cinzel', serif", fontSize: '8px', letterSpacing: '0.4em', color: 'rgba(201,169,110,0.6)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Administration Panel
              </motion.span>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 300, color: '#fff' }}>
                Master Booking Ledger
              </motion.h1>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {analytics && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-4">
                  <div className="text-center px-4 py-2 border border-[rgba(201,169,110,0.2)]">
                    <span className="block text-lg text-[#C9A96E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {analytics.totalBookings}
                    </span>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                      Bookings
                    </span>
                  </div>
                  <div className="text-center px-4 py-2 border border-[rgba(201,169,110,0.2)]">
                    <span className="block text-lg text-[#C9A96E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      ₹{(analytics.totalRevenue || 0).toLocaleString()}
                    </span>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                      Revenue
                    </span>
                  </div>
                  <div className="text-center px-4 py-2 border border-[rgba(201,169,110,0.2)]">
                    <span className="block text-lg text-[#C9A96E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {analytics.totalUsers}
                    </span>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                      Clients
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 overflow-x-auto pb-2">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-5 py-2.5 transition-all whitespace-nowrap"
                style={{
                  fontFamily: "'Cinzel', serif", fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase',
                  background: activeTab === tab ? 'rgba(201,169,110,0.15)' : 'transparent',
                  color: activeTab === tab ? '#C9A96E' : 'rgba(255,255,255,0.4)',
                  border: `1px solid ${activeTab === tab ? 'rgba(201,169,110,0.3)' : 'transparent'}`,
                }}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { label: 'Total Bookings', value: analytics.totalBookings, color: '#8B6F47' },
                { label: 'Confirmed', value: analytics.confirmedBookings, color: '#10b981' },
                { label: 'Pending', value: analytics.pendingBookings, color: '#f59e0b' },
                { label: 'Revenue', value: `₹${(analytics.totalRevenue || 0).toLocaleString()}`, color: '#6366f1' },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-white border border-[rgba(139,111,71,0.1)] p-5 hover:shadow-lg transition-all hover:-translate-y-1">
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 300, color: stat.color, display: 'block' }}>
                    {stat.value}
                  </span>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.3em', color: '#7A6555', textTransform: 'uppercase' }}>
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Charts area */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Status Breakdown */}
              <div className="bg-white border border-[rgba(139,111,71,0.1)] p-6">
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#4A3728', marginBottom: '16px' }}>
                  Status Breakdown
                </h3>
                <div className="space-y-3">
                  {(analytics.statusBreakdown || []).map((s, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm capitalize" style={{ fontFamily: "'Jost', sans-serif", color: '#7A6555' }}>{s.status}</span>
                        <span className="text-sm font-medium" style={{ color: s.color }}>{s.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: s.color }}
                          initial={{ width: 0 }} animate={{ width: analytics.totalBookings > 0 ? `${(s.count / analytics.totalBookings) * 100}%` : '0%' }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.15 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Packages */}
              <div className="bg-white border border-[rgba(139,111,71,0.1)] p-6">
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#4A3728', marginBottom: '16px' }}>
                  Popular Packages
                </h3>
                {(analytics.packageStats || []).length > 0 ? (
                  <div className="space-y-3">
                    {analytics.packageStats.map((pkg, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-gray-100 hover:border-[#C9A96E] transition-colors">
                        <div>
                          <span className="text-sm font-medium" style={{ color: '#4A3728' }}>{pkg._id}</span>
                          <span className="text-xs text-gray-400 ml-2">{pkg.count} bookings</span>
                        </div>
                        <span className="text-sm font-semibold" style={{ color: '#8B6F47' }}>₹{pkg.revenue?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-8">No package data yet</p>
                )}
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#4A3728] p-5 text-center">
                <span className="block text-2xl text-[#C9A96E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{analytics.totalUsers}</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Clients</span>
              </div>
              <div className="bg-[#4A3728] p-5 text-center">
                <span className="block text-2xl text-[#C9A96E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{analytics.totalGuests}</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Total Guests</span>
              </div>
              <div className="bg-[#4A3728] p-5 text-center">
                <span className="block text-2xl text-[#C9A96E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{analytics.totalReviews}</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Reviews</span>
              </div>
              <div className="bg-[#4A3728] p-5 text-center">
                <span className="block text-2xl text-[#C9A96E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>⭐ {analytics.avgRating}</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Avg Rating</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input type="text" placeholder="Search bookings..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 p-3 border border-gray-200 focus:border-[#C9A96E] outline-none text-sm"
                style={{ fontFamily: "'Jost', sans-serif" }} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="p-3 border border-gray-200 focus:border-[#C9A96E] outline-none text-sm"
                style={{ fontFamily: "'Jost', sans-serif" }}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="overflow-x-auto bg-white border border-[rgba(139,111,71,0.1)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ background: '#4A3728' }}>
                    {['Client', 'Package', 'Date', 'Location', 'Price', 'Status', 'Actions'].map(h => (
                      <th key={h} className="p-4 text-white" style={{ fontFamily: "'Cinzel', serif", fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7" className="p-16 text-center text-gray-400">Loading...</td></tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr><td colSpan="7" className="p-16 text-center text-gray-400">No bookings found</td></tr>
                  ) : (
                    filteredBookings.map((b, idx) => (
                      <motion.tr key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }} className="border-b border-gray-50 hover:bg-[#FDF8F3] transition-colors">
                        <td className="p-4">
                          <span className="font-medium text-sm" style={{ color: '#4A3728' }}>{b.client_name || 'N/A'}</span><br />
                          <span className="text-xs text-gray-400">{b.client_email}</span>
                        </td>
                        <td className="p-4 text-sm">{b.package_name}</td>
                        <td className="p-4 text-sm">{new Date(b.event_date).toLocaleDateString()}</td>
                        <td className="p-4 text-sm">{b.event_location}</td>
                        <td className="p-4 text-sm font-medium" style={{ color: '#8B6F47' }}>₹{b.total_price?.toLocaleString()}</td>
                        <td className="p-4">
                          <span className="text-xs font-bold uppercase px-2 py-1 inline-block"
                            style={{
                              fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.15em',
                              background: b.status === 'confirmed' ? '#ecfdf5' : b.status === 'cancelled' ? '#fef2f2' : b.status === 'pending_rebook' ? '#eff6ff' : '#fffbeb',
                              color: b.status === 'confirmed' ? '#059669' : b.status === 'cancelled' ? '#dc2626' : b.status === 'pending_rebook' ? '#2563eb' : '#d97706',
                            }}>
                            {b.status === 'pending_rebook' ? 'REBOOK' : b.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 flex-wrap">
                            <button disabled={updatingId === b._id || b.status === 'confirmed'}
                              onClick={() => updateStatus(b._id, 'confirmed')}
                              className={`px-3 py-1 text-xs text-white transition-colors ${b.status === 'confirmed' ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600'}`}>
                              {updatingId === b._id ? '...' : 'Approve'}
                            </button>
                            <button disabled={updatingId === b._id || b.status === 'cancelled'}
                              onClick={() => updateStatus(b._id, 'cancelled')}
                              className={`px-3 py-1 text-xs text-white transition-colors ${b.status === 'cancelled' ? 'bg-gray-300' : 'bg-red-500 hover:bg-red-600'}`}>
                              {updatingId === b._id ? '...' : 'Reject'}
                            </button>
                            {b.status === 'confirmed' && (
                              <button onClick={() => startReschedule(b._id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-xs transition-colors">
                                Reschedule
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="overflow-x-auto bg-white border border-[rgba(139,111,71,0.1)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ background: '#4A3728' }}>
                    {['Client', 'Booking', 'Amount', 'Method', 'Status', 'Receipt', 'Date'].map(h => (
                      <th key={h} className="p-4 text-white" style={{ fontFamily: "'Cinzel', serif", fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr><td colSpan="7" className="p-16 text-center text-gray-400">No payments yet</td></tr>
                  ) : payments.map((p, i) => (
                    <tr key={p._id} className="border-b border-gray-50 hover:bg-[#FDF8F3]">
                      <td className="p-4 text-sm">{p.user_id?.name || 'N/A'}</td>
                      <td className="p-4 text-sm">{p.booking_id?.package_name || 'N/A'}</td>
                      <td className="p-4 text-sm font-medium" style={{ color: '#10b981' }}>₹{p.amount?.toLocaleString()}</td>
                      <td className="p-4 text-sm capitalize">{p.payment_method}</td>
                      <td className="p-4"><span className="text-xs uppercase px-2 py-1 bg-green-50 text-green-600">{p.status}</span></td>
                      <td className="p-4 text-xs text-gray-400 font-mono">{p.receipt_number}</td>
                      <td className="p-4 text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {reviews.length === 0 ? (
              <div className="bg-white border border-dashed border-[rgba(139,111,71,0.2)] p-16 text-center">
                <p className="text-gray-400">No reviews yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {reviews.map(r => (
                  <div key={r._id} className="bg-white border border-[rgba(139,111,71,0.1)] p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-medium text-sm" style={{ color: '#4A3728' }}>{r.user_id?.name}</span>
                        <span className="text-xs text-gray-400 ml-3">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                        ))}
                      </div>
                    </div>
                    {r.title && <h4 className="font-medium text-sm mb-1" style={{ color: '#4A3728' }}>{r.title}</h4>}
                    <p className="text-sm text-gray-600">{r.comment}</p>
                    {r.admin_reply && (
                      <div className="mt-3 p-3 bg-[#FDF8F3] border-l-2 border-[#C9A96E]">
                        <span className="text-xs font-bold text-[#8B6F47]">Admin Reply:</span>
                        <p className="text-sm text-gray-600 mt-1">{r.admin_reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Venues Tab */}
        {activeTab === 'venues' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {venues.map(venue => (
                <motion.div key={venue} whileHover={{ y: -4 }}
                  className="bg-white border border-[rgba(139,111,71,0.1)] p-5 flex justify-between items-center hover:shadow-md transition-shadow">
                  <span className="font-medium" style={{ color: '#4A3728' }}>{venue}</span>
                  <button onClick={() => handleShowDates(venue)}
                    className="px-4 py-2 text-xs text-white transition-colors hover:opacity-90"
                    style={{ background: '#4A3728', fontFamily: "'Cinzel', serif", letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    Calendar
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Menus Tab */}
        {activeTab === 'menus' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-dashed border-[rgba(139,111,71,0.2)] p-16 text-center">
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: '#4A3728', marginBottom: '8px' }}>
              Menu Management
            </h3>
            <p className="text-gray-400 text-sm">Add and manage catering menus from this section. Menus can be assigned to bookings.</p>
          </motion.div>
        )}
      </div>

      {/* Venue Calendar Modal */}
      <AnimatePresence>
        {showVenueCalendar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowVenueCalendar(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={e => e.stopPropagation()}>
              <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#4A3728' }}>
                    {selectedVenue} — Calendar
                  </h3>
                  <button onClick={() => setShowVenueCalendar(false)} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                {loadingVenue ? <div className="text-center p-8 text-gray-400">Loading...</div> : (
                  <>
                    <Calendar tileClassName={({ date }) => isVenueDateBooked(date) ? "booked-date" : "available-date"}
                      tileDisabled={({ date }) => isVenueDateBooked(date)} />
                    <div className="mt-4 flex flex-wrap gap-2">
                      {venueBookings.filter(b => b.status === 'confirmed').map(booking => (
                        <button key={booking._id} onClick={() => handleFreeDate(booking._id, booking.event_date)}
                          className="bg-red-50 text-red-700 px-3 py-1.5 text-xs hover:bg-red-100 transition-colors">
                          {new Date(booking.event_date).toLocaleDateString()} — {booking.user_id?.name || 'Unknown'}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showReschedulePicker && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowReschedulePicker(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#4A3728' }}>Select New Date</h3>
                  <button onClick={() => setShowReschedulePicker(false)} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                <Calendar onClickDay={handleRescheduleDateSelect}
                  tileClassName={({ date }) => isVenueDateBooked(date) ? "booked-date" : "available-date"}
                  tileDisabled={({ date }) => isVenueDateBooked(date)} />
                <p className="mt-3 text-sm text-gray-500">Click a free date (green ✅) to propose a reschedule.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
