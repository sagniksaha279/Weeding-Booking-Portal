import axios from 'axios';
const backend_url = import.meta.env.VITE_BACKEND_URL;
const API = axios.create({
  baseURL: `${backend_url}/api`,
  withCredentials: true,
});

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const logout = () => API.post('/auth/logout');
export const updateProfile = (data) => API.put('/auth/update-profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);

// Vendors
export const getVendors = (page = 1, limit = 10) => API.get(`/vendors?page=${page}&limit=${limit}`);
export const getVendorById = (id) => API.get(`/vendors/${id}`);

// Bookings
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my-bookings');
export const getAllBookings = () => API.get('/bookings/admin/all');
export const updateBookingStatus = (id, data) => API.put(`/bookings/${id}`, data);
export const getBookedDates = () => API.get('/bookings/booked-dates');
export const getVenues = () => API.get('/bookings/venues');
export const getVenueBookings = (venue) => API.get(`/bookings/venue/${encodeURIComponent(venue)}`);
export const cancelBooking = (id) => API.post(`/bookings/cancel/${id}`);
export const rebookBooking = (id, data) => API.post(`/bookings/rebook/${id}`, data);
export const approveRebook = (id) => API.post(`/bookings/user/approve-rebook/${id}`);
export const rejectRebook = (id) => API.post(`/bookings/user/reject-rebook/${id}`);

// Inquiries
export const createInquiry = (data) => API.post('/inquiries', data);
export const getMyInquiries = () => API.get('/inquiries/my-inquiries');

// Payments
export const createPayment = (data) => API.post('/payments', data);
export const getMyPayments = () => API.get('/payments/my-payments');
export const getBookingPayments = (bookingId) => API.get(`/payments/booking/${bookingId}`);
export const getAllPayments = () => API.get('/payments/admin/all');
export const getRevenueStats = () => API.get('/payments/admin/revenue');

// Guests
export const addGuest = (data) => API.post('/guests', data);
export const getBookingGuests = (bookingId) => API.get(`/guests/booking/${bookingId}`);
export const getGuestStats = (bookingId) => API.get(`/guests/stats/${bookingId}`);
export const updateGuest = (id, data) => API.put(`/guests/${id}`, data);
export const updateRSVP = (id, data) => API.put(`/guests/rsvp/${id}`, data);
export const deleteGuest = (id) => API.delete(`/guests/${id}`);

// Reviews
export const createReview = (data) => API.post('/reviews', data);
export const getVendorReviews = (vendorId) => API.get(`/reviews/vendor/${vendorId}`);
export const getAllReviews = () => API.get('/reviews/admin/all');
export const replyToReview = (id, data) => API.put(`/reviews/reply/${id}`, data);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.put(`/notifications/read/${id}`);
export const markAllNotificationsRead = () => API.put('/notifications/read-all');
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

// Menus
export const getMenus = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return API.get(`/menus?${params}`);
};
export const createMenu = (data) => API.post('/menus', data);
export const updateMenu = (id, data) => API.put(`/menus/${id}`, data);
export const deleteMenu = (id) => API.delete(`/menus/${id}`);

// Checklists
export const createChecklist = (data) => API.post('/checklists', data);
export const getBookingChecklist = (bookingId) => API.get(`/checklists/booking/${bookingId}`);
export const toggleChecklistItem = (checklistId, itemId) => API.put(`/checklists/toggle/${checklistId}/${itemId}`);
export const deleteChecklistItem = (checklistId, itemId) => API.delete(`/checklists/${checklistId}/${itemId}`);

// Analytics
export const getAnalytics = () => API.get('/analytics');

// Chat
export const sendMessage = (data) => API.post('/chat/send', data);
export const getMessages = (userId) => API.get(`/chat/${userId}`);
export const markMessagesRead = (userId) => API.put(`/chat/read/${userId}`);

export default API;
