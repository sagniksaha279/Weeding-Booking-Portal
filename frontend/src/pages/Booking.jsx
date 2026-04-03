import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from '@tanstack/react-router';
import Swal from "sweetalert2";
import './booking.css';

// ========== HOOKS ==========
function useInView(threshold = 0.14) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Reveal({ children, delay = 0, dir = 'up' }) {
  const [ref, inView] = useInView();
  const map = { up:'bkFadeUp', left:'bkSlideL', right:'bkSlideR', plain:'bkFadeIn' };
  return (
    <div ref={ref} style={{
      animation: inView ? `${map[dir]} .88s ${delay}s cubic-bezier(.23,1,.32,1) both` : 'none',
      opacity: inView ? undefined : 0,
    }}>{children}</div>
  );
}

const api = import.meta.env.VITE_BACKEND_URL;


function Ornament() {
  return (
    <div className="bk-ornament">
      <div className="bk-ornament-line" />
      <div className="bk-ornament-gem" />
      <div className="bk-ornament-line r" />
    </div>
  );
}

function TiltCard({ children, className }) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateZ(4px)`;
  }, []);
  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
  }, []);
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className} style={{ transition: 'transform 0.3s ease-out' }}>
      {children}
    </div>
  );
}

export default function Booking() {
  /*const navigate =*/ useNavigate();
  const [user, /*setUser*/] = useState(() => JSON.parse(localStorage.getItem('user')));

  // Form states
  const [step, setStep] = useState(1);
  const [blockedDates, setBlockedDates] = useState([]);
  const [formData, setFormData] = useState({
    package_name: 'Premium Edition',
    event_location: '',
    event_date: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    message: ''
  });
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User bookings & reschedule
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  // Memoize fetch functions
  const fetchBlockedDates = useCallback(async () => {
    try {
      const res = await axios.get(`${api}/api/bookings/booked-dates`);
      setBlockedDates(res.data);
    } catch (err) {
      console.error("Error fetching booked dates", err);
    }
  }, []);

  const fetchUserBookings = useCallback(async () => {
    if (!user) return;
    setLoadingBookings(true);
    try {
      const res = await axios.get(`${api}/api/bookings/my-bookings`, { withCredentials: true });
      console.log("User bookings:", res.data);
      setUserBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoadingBookings(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserBookings();
    fetchBlockedDates();
  }, [user, fetchUserBookings, fetchBlockedDates]);

  const approveReschedule = useCallback(async (bookingId) => {
    const result = await Swal.fire({
      title: 'Accept new date?',
      text: 'Do you agree to the reschedule request? The date will be updated.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, accept',
    });
    if (!result.isConfirmed) return;

    setApprovingId(bookingId);
    try {
      await axios.post(`${api}/api/bookings/user/approve-rebook/${bookingId}`, {}, { withCredentials: true });
      Swal.fire('Success', 'Reschedule accepted. Your booking date has been updated.', 'success');
      fetchUserBookings();   // refresh list
      fetchBlockedDates();   // refresh date picker blocked dates
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Failed to approve reschedule', 'error');
    } finally {
      setApprovingId(null);
    }
  }, [fetchUserBookings, fetchBlockedDates]);

  const rejectReschedule = useCallback(async (bookingId) => {
    const result = await Swal.fire({
      title: 'Reject reschedule?',
      text: 'The original date will remain unchanged.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject',
    });
    if (!result.isConfirmed) return;

    setRejectingId(bookingId);
    try {
      await axios.post(`${api}/api/bookings/user/reject-rebook/${bookingId}`, {}, { withCredentials: true });
      Swal.fire('Rejected', 'Reschedule request rejected. Your original date is kept.', 'success');
      fetchUserBookings();   // refresh list
      fetchBlockedDates();   // refresh date picker blocked dates
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Failed to reject', 'error');
    } finally {
      setRejectingId(null);
    }
  }, [fetchUserBookings, fetchBlockedDates]);

  // ========== PRICING & FORM LOGIC ==========
  const packages = [
    { id: 'classic', name: 'Classic Edition', price: 150000, desc: 'Essential Elegance' },
    { id: 'premium', name: 'Premium Edition', price: 250000, desc: 'Enhanced Experience', popular: true },
    { id: 'luxury', name: 'Luxury Edition', price: 400000, desc: 'Ultimate Grandeur' }
  ];
  const addonsList = [
    { id: 'photo', name: 'Cinematic Photography', price: 45000 },
    { id: 'decor', name: 'Premium Floral Decor', price: 60000 },
    { id: 'music', name: 'Live Symphony Band', price: 35000 }
  ];

  const calculateTotal = () => {
    const pkgPrice = packages.find(p => p.name === formData.package_name)?.price || 0;
    const addonsPrice = selectedAddons.reduce((acc, curr) => {
      const addon = addonsList.find(a => a.id === curr);
      return acc + (addon ? addon.price : 0);
    }, 0);
    return pkgPrice + addonsPrice;
  };

  const handlePackageSelect = (name) => {
    setFormData({ ...formData, package_name: name });
  };

  const handleAddonToggle = (id) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "event_date") {
      if (blockedDates.includes(value)) {
        Swal.fire("Unavailable", "This date is already booked!", "warning");
        return;
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      Swal.fire("Error", "Please log in to confirm booking", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        addons: selectedAddons,
        total_price: calculateTotal()
      };
      await axios.post(`${api}/api/bookings`, payload, { withCredentials: true });
      Swal.fire('Success', 'Booking confirmed successfully!', 'success');
      setStep(1);
      setFormData({ ...formData, event_date: '', event_location: '', message: '' });
      setSelectedAddons([]);
      fetchUserBookings();
      fetchBlockedDates();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Failed to submit booking', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const steps = [
    { num: 1, lbl: 'Selection' },
    { num: 2, lbl: 'Details' },
    { num: 3, lbl: 'Review' }
  ];

  // ========== RENDER ==========
  return (
    <>
      {/* Hero */}
      <section className="bk-hero">
        <div className="bk-hero-bg" />
        <div className="bk-hero-overlay" />
        <div className="bk-hero-grain" />
        <div className="bk-hero-content">
          <span className="bk-hero-pill">Reservations</span>
          <h1 className="bk-hero-h1">Secure Your <span className="gold-italic">Legacy</span></h1>
          <p className="bk-hero-sub">Curating unforgettable experiences with meticulous attention to detail. Reserve your chapter in our story.</p>
        </div>
        <div className="bk-scroll-cue">
          <div className="bk-scroll-track" />
          <span className="bk-scroll-lbl">Begin</span>
        </div>
      </section>

      {/* Ticker */}
      <div className="bk-ticker">
        <div className="bk-ticker-inner">
          {[...Array(6)].map((_, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <span className="bk-ticker-item">Exclusive Venues</span>
              <span className="bk-ticker-dot" />
              <span className="bk-ticker-item">Bespoke Catering</span>
              <span className="bk-ticker-dot" />
              <span className="bk-ticker-item">Cinematic Memories</span>
              <span className="bk-ticker-dot" />
            </span>
          ))}
        </div>
      </div>

      <div className="bk-outer">
        <div className="bk-inner">
          {/* Stepper */}
          <div className="bk-stepper-wrap">
            {steps.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', width: idx < steps.length - 1 ? '100%' : 'auto' }}>
                <div className="bk-step-item">
                  <div className={`bk-step-num ${step === s.num ? 'active' : step > s.num ? 'done' : 'inactive'}`}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span className={`bk-step-label ${step === s.num ? 'active' : step > s.num ? 'done' : 'inactive'}`}>{s.lbl}</span>
                </div>
                {idx < steps.length - 1 && <div className={`bk-step-connector ${step > s.num ? 'done' : 'inactive'}`} style={{ flex: 1, margin: '0 12px' }} />}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="bk-card">
            {step === 1 && (
              <Reveal dir="up">
                <div className="bk-card-step-hdr">
                  <div className="bk-card-step-icon">I</div>
                  <div>
                    <span className="bk-card-step-num-badge">Step One</span>
                    <h2 className="bk-card-step-title">Curate Your <em>Experience</em></h2>
                  </div>
                </div>

                <div className="bk-pkg-grid">
                  {packages.map(pkg => (
                    <TiltCard key={pkg.id} className={`bk-pkg-card ${formData.package_name === pkg.name ? 'selected' : ''}`}>
                      <div onClick={() => handlePackageSelect(pkg.name)}>
                        {pkg.popular && <span className="bk-pkg-popular">Most Requested</span>}
                        {formData.package_name === pkg.name && (
                          <div className="bk-pkg-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></div>
                        )}
                        <h3 className="bk-pkg-name">{pkg.name}</h3>
                        <span className="bk-pkg-desc">{pkg.desc}</span>
                        <div className="bk-pkg-price">₹{pkg.price.toLocaleString()}</div>
                      </div>
                    </TiltCard>
                  ))}
                </div>

                <span className="bk-addons-label">Enhancements & Add-ons</span>
                <div className="bk-addons-grid">
                  {addonsList.map(addon => (
                    <div key={addon.id} className={`bk-addon-item ${selectedAddons.includes(addon.id) ? 'checked' : ''}`} onClick={() => handleAddonToggle(addon.id)}>
                      <div className="bk-addon-checkbox">✓</div>
                      <div>
                        <div className="bk-addon-name">{addon.name}</div>
                        <div className="bk-addon-price">+ ₹{addon.price.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bk-price-bar">
                  <span className="bk-price-bar-lbl">Estimated Investment</span>
                  <span className="bk-price-bar-val">₹{calculateTotal().toLocaleString()}</span>
                </div>

                <div className="bk-step-footer" style={{ justifyContent: 'flex-end' }}>
                  <button onClick={handleNext} className="bk-btn-next"><span>Continue</span> →</button>
                </div>
              </Reveal>
            )}

            {step === 2 && (
              <Reveal dir="up">
                <div className="bk-card-step-hdr">
                  <div className="bk-card-step-icon">II</div>
                  <div>
                    <span className="bk-card-step-num-badge">Step Two</span>
                    <h2 className="bk-card-step-title">Event <em>Particulars</em></h2>
                  </div>
                </div>

                <div className="bk-form-grid-2">
                  <div className="bk-field">
                    <label className="bk-label">Primary Contact</label>
                    <input type="text" name="name" className="bk-input" placeholder="Your full name" value={formData.name} onChange={handleChange} required />
                    <div className="bk-field-bar" />
                  </div>
                  <div className="bk-field">
                    <label className="bk-label">Email Address</label>
                    <input type="email" name="email" className="bk-input" placeholder="your@email.com" value={formData.email} onChange={handleChange} required />
                    <div className="bk-field-bar" />
                  </div>
                  <div className="bk-field">
                    <label className="bk-label">Phone Number</label>
                    <input type="tel" name="phone" className="bk-input" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} required />
                    <div className="bk-field-bar" />
                  </div>
                  <div className="bk-field">
                    <label className="bk-label">Event Date</label>
                    <input type="date" name="event_date" className="bk-input" value={formData.event_date} onChange={handleChange} min={new Date().toISOString().split("T")[0]} required />
                    <div className="bk-field-bar" />
                  </div>
                </div>

                <div className="bk-field-full">
                  <label className="bk-label">Preferred Location</label>
                  <select name="event_location" className="bk-select" value={formData.event_location} onChange={handleChange} required>
                    <option value="" disabled>Select a distinguished venue</option>
                    <option value="The Grand Heritage Palace">The Grand Heritage Palace</option>
                    <option value="Royal Crest Estate">Royal Crest Estate</option>
                    <option value="Whispering Pines Resort">Whispering Pines Resort</option>
                  </select>
                  <div className="bk-field-bar" />
                </div>

                <div className="bk-field-full">
                  <label className="bk-label">Special Requests (Optional)</label>
                  <textarea name="message" className="bk-textarea" rows="3" placeholder="Tell us about your vision..." value={formData.message} onChange={handleChange}></textarea>
                  <div className="bk-field-bar" />
                </div>

                <div className="bk-step-footer">
                  <button onClick={handlePrev} className="bk-btn-back">← <span>Back</span></button>
                  <button onClick={handleNext} className="bk-btn-next" disabled={!formData.name || !formData.email || !formData.event_date || !formData.event_location}><span>Review Details</span> →</button>
                </div>
              </Reveal>
            )}

            {step === 3 && (
              <Reveal dir="up">
                <div className="bk-card-step-hdr">
                  <div className="bk-card-step-icon">III</div>
                  <div>
                    <span className="bk-card-step-num-badge">Step Three</span>
                    <h2 className="bk-card-step-title">Final <em>Review</em></h2>
                  </div>
                </div>

                <div className="bk-review-box">
                  <span className="bk-review-section-label">Selected Package</span>
                  <div className="bk-review-row">
                    <span className="bk-review-key">Experience Tier</span>
                    <span className="bk-review-val">{formData.package_name}</span>
                  </div>
                  {selectedAddons.length > 0 && (
                    <div className="bk-review-row">
                      <span className="bk-review-key">Add-ons</span>
                      <span className="bk-review-val">{selectedAddons.map(id => addonsList.find(a => a.id === id)?.name).join(', ')}</span>
                    </div>
                  )}
                  <div className="bk-review-total-row">
                    <span className="bk-review-total-lbl">Total Investment</span>
                    <span className="bk-review-total-val">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>

                <div className="bk-contact-box">
                  <span className="bk-review-section-label">Event Details</span>
                  <div className="bk-review-row"><span className="bk-review-key">Date</span><span className="bk-review-val">{formData.event_date}</span></div>
                  <div className="bk-review-row"><span className="bk-review-key">Venue</span><span className="bk-review-val">{formData.event_location}</span></div>
                  <div className="bk-review-row"><span className="bk-review-key">Host</span><span className="bk-review-val">{formData.name}</span></div>
                  <div className="bk-review-row"><span className="bk-review-key">Contact</span><span className="bk-review-val">{formData.phone}</span></div>
                </div>

                {!user ? (
                  <div className="bk-login-gate">
                    <p className="bk-login-gate-p">Please authenticate to finalize your reservation.</p>
                    <div className="bk-login-gate-btns">
                      <Link to="/login" className="bk-btn-next"><span>Sign In</span></Link>
                      <Link to="/register" className="bk-btn-back"><span>Create Account</span></Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bk-terms-row">
                      <div className={`bk-terms-checkbox ${termsAccepted ? 'checked' : ''}`} onClick={() => setTermsAccepted(!termsAccepted)}>✓</div>
                      <p className="bk-terms-text">I acknowledge and agree to the <span className="bk-terms-link">Terms of Service</span> and <span className="bk-terms-link">Cancellation Policy</span>.</p>
                    </div>
                    <div className="bk-step-footer">
                      <button onClick={handlePrev} className="bk-btn-back">← <span>Modify</span></button>
                      <button onClick={handleSubmit} disabled={!termsAccepted || isSubmitting} className="bk-confirm-btn">
                        {isSubmitting ? <span className="bk-spin" /> : <span>Confirm Reservation</span>}
                      </button>
                    </div>
                  </>
                )}
              </Reveal>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Section (My Bookings) */}
      {user && (
        <div className="bk-outer" style={{ paddingTop: 0, background: 'transparent' }}>
          <div className="bk-inner">
            <div className="bk-card" style={{ marginTop: 0, background: '#fff' }}>
              <div className="bk-card-step-hdr">
                <div className="bk-card-step-icon" style={{ background: 'var(--gold)' }}>📋</div>
                <div>
                  <span className="bk-card-step-num-badge">My Bookings</span>
                  <h2 className="bk-card-step-title">Your <em>Upcoming Events</em></h2>
                </div>
              </div>

              {loadingBookings ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <span className="bk-spin" style={{ borderColor: 'var(--brand-dark)', borderTopColor: 'transparent' }} />
                </div>
              ) : userBookings.length === 0 ? (
                <div className="text-center" style={{ padding: '32px 0', color: 'var(--muted)', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem' }}>
                  <p>You have no bookings yet. Use the form above to book your event.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {userBookings.map(booking => {
                    const isPendingReschedule = booking.status?.toLowerCase() === 'pending_rebook';
                    const hasRequested = !!booking.requested_date;

                    return (
                      <div key={booking._id} style={{ border: '1px solid rgba(139,111,71,.2)', padding: '24px', borderRadius: '4px', background: '#faf9f7' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                          <div>
                            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: 'var(--brand-dark)', marginBottom: '8px' }}>{booking.package_name}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '4px' }}>Venue: <span style={{ color: 'var(--brand-dark)' }}>{booking.event_location}</span></p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '4px' }}>Date: <span style={{ color: 'var(--brand-dark)' }}>{new Date(booking.event_date).toLocaleDateString()}</span></p>
                            <p style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: '8px' }}>
                              Status: <span style={{
                                color: booking.status === 'confirmed' ? '#2e7d32' :
                                       booking.status === 'pending_rebook' ? '#1565c0' :
                                       '#f57f17'
                              }}>
                                {booking.status === 'pending_rebook' ? 'Pending Reschedule' : (booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1))}
                              </span>
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'var(--brand-dark)', lineHeight: 1 }}>₹{booking.total_price.toLocaleString()}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Total Investment</p>
                          </div>
                        </div>

                        {isPendingReschedule && hasRequested && (
                          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(139,111,71,.15)' }}>
                            <p style={{ fontSize: '0.9rem', color: '#1565c0', marginBottom: '12px' }}>
                              The admin has proposed a new date: <strong>{new Date(booking.requested_date).toLocaleDateString()}</strong>
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <button
                                onClick={() => approveReschedule(booking._id)}
                                disabled={approvingId === booking._id || rejectingId === booking._id}
                                className="bk-btn-next"
                                style={{ padding: '10px 24px', fontSize: '8.5px', background: '#2e7d32' }}
                              >
                                {approvingId === booking._id ? 'Processing...' : 'Approve New Date'}
                              </button>
                              <button
                                onClick={() => rejectReschedule(booking._id)}
                                disabled={approvingId === booking._id || rejectingId === booking._id}
                                className="bk-btn-back"
                                style={{ padding: '10px 24px', fontSize: '8.5px', borderColor: 'var(--muted)', color: 'var(--brand-dark)' }}
                              >
                                {rejectingId === booking._id ? 'Processing...' : 'Decline'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Why Book */}
      <section className="bk-why-sec">
        <Ornament />
        <Reveal dir="up">
          <div className="bk-why-grid">
            <div className="bk-why-card">
              <span className="bk-why-num">01</span>
              <h3 className="bk-why-title">Unrivaled Prestige</h3>
              <p className="bk-why-text">Access to the most exclusive and historically significant venues, reserved only for the discerning few.</p>
            </div>
            <div className="bk-why-card">
              <span className="bk-why-num">02</span>
              <h3 className="bk-why-title">Bespoke Curation</h3>
              <p className="bk-why-text">Every element is tailored to your distinct taste, ensuring your event is a true reflection of your legacy.</p>
            </div>
            <div className="bk-why-card">
              <span className="bk-why-num">03</span>
              <h3 className="bk-why-title">Flawless Execution</h3>
              <p className="bk-why-text">Our master planners anticipate every need, delivering a seamless experience from conception to completion.</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Venues */}
      <section className="bk-venues-sec">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="bk-eyebrow">The Collection</span>
          <h2 className="bk-cta-h2" style={{ color: 'var(--brand-dark)', fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>Featured <em>Estates</em></h2>
        </div>
        <div className="bk-venues-grid">
          {[
            { tag: 'Heritage', name: 'The Grand Palace', cap: 'Capacity: 500-1200 Guests' },
            { tag: 'Botanical', name: 'Whispering Pines', cap: 'Capacity: 200-600 Guests' },
            { tag: 'Modern', name: 'Royal Crest Estate', cap: 'Capacity: 300-800 Guests' }
          ].map((v, i) => (
            <Reveal key={i} dir="up" delay={i * 0.15}>
              <div className="bk-venue-card">
                <div className="bk-venue-img" style={{ background: 'var(--brand-dark)' }} />
                <div className="bk-venue-grad" />
                <div className="bk-venue-info">
                  <span className="bk-venue-tag">{v.tag}</span>
                  <h3 className="bk-venue-name">{v.name}</h3>
                  <p className="bk-venue-cap">{v.cap}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bk-cta-sec">
        <div className="bk-cta-ring" style={{ width: '800px', height: '800px', transform: 'translate(-50%, -50%)' }} />
        <div className="bk-cta-ring" style={{ width: '1200px', height: '1200px', transform: 'translate(-50%, -50%)', opacity: 0.5 }} />
        
        <Reveal dir="up">
          <span className="bk-eyebrow" style={{ color: 'rgba(201,169,110,.7)' }}>Ready to begin?</span>
          <h2 className="bk-cta-h2">Design Your <em>Masterpiece</em></h2>
          <p className="bk-cta-sub">Speak with our elite concierge team to arrange a private viewing or discuss your grand vision.</p>
          
          <div className="bk-cta-btns">
            <button className="bk-btn-gold" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Start Reservation</button>
            <Link to="/contact" className="bk-btn-wht">Contact Concierge</Link>
          </div>

          <div className="bk-est">
            <Ornament />
            <p>Est. MMXVIII</p>
          </div>
        </Reveal>
      </section>
    </>
  );
}