# 💒 Wedding Banquet Management System

A comprehensive, premium wedding banquet management platform built with React, Node.js, Express, and MongoDB. Designed for banquet owners (admins) and clients to manage every aspect of wedding event planning.

---

## ✨ Features

### 🎯 Client Features
- **Beautiful Landing Page** — Animated hero, services showcase, portfolio gallery, testimonials
- **User Authentication** — Secure login/signup with JWT cookies, multi-step signup with password strength indicator
- **Vendor Directory** — Browse 12+ vendor categories with search, filtering, and pagination
- **Smart Booking System** — Package selection, date conflict detection, add-ons, venue-aware scheduling
- **Guest List Manager** — Add/edit/remove guests, RSVP tracking, dietary preferences, bride/groom side split, plus-ones
- **Payment Tracking** — Record payments (cash/card/UPI/bank transfer), view receipts, track payment status
- **Real-time Notifications** — Booking updates, payment confirmations, reminders
- **Event Checklist** — Custom to-do lists per booking with priority levels and due dates
- **Client Dashboard** — Animated metrics, inquiry tracking, booking overview, quick actions
- **Profile Management** — Edit profile, change password, upload profile image

### 👨‍💼 Admin Features
- **Analytics Dashboard** — Total bookings, revenue stats, status breakdown, popular packages, venue utilization
- **Booking Management** — Approve/reject bookings, reschedule with calendar, conflict resolution
- **Venue Date Management** — Calendar view per venue, free/book dates, visual availability
- **Payment Ledger** — View all payments, receipt tracking, revenue reports
- **Review Management** — View all reviews, reply to customer feedback
- **Menu Management** — Add/edit catering menus (8 pre-loaded), assign to bookings

### 🎨 Design & UX
- **Premium Wedding Aesthetic** — Gold, cream, and deep brown color palette with serif typography
- **Framer Motion Animations** — Page transitions, card reveals, hover effects, loading states
- **Fully Responsive** — Optimized for mobile, tablet, and desktop (320px to 4K)
- **Glass Morphism** — Frosted glass effects on cards and modals
- **Custom Scroll Progress** — Visual scroll indicator in navbar
- **Animated Backgrounds** — Floating particles, gradient orbs, shimmer effects
- **SweetAlert2 Integration** — Beautiful confirmation and notification dialogs

---

## 🛠️ Tech Stack

| Layer      | Technology                                             |
|------------|--------------------------------------------------------|
| Frontend   | React 18, Vite 8, TanStack Router, Tailwind CSS 3     |
| Animations | Framer Motion 12, CSS Keyframes                       |
| Forms      | React Hook Form, Zod Validation                       |
| Backend    | Node.js, Express 5, Mongoose 9                        |
| Database   | MongoDB                                                |
| Auth       | JWT (HTTP-only cookies), bcryptjs                     |
| Uploads    | Multer (profile images)                               |
| UI Libraries | SweetAlert2, Lucide React, React Calendar           |

---

## 📁 Project Structure

```
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers (12 controllers)
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── chatController.js
│   │   ├── inquiryController.js
│   │   ├── vendorController.js
│   │   ├── paymentController.js      ← NEW
│   │   ├── guestController.js        ← NEW
│   │   ├── reviewController.js       ← NEW
│   │   ├── notificationController.js ← NEW
│   │   ├── menuController.js         ← NEW
│   │   ├── checklistController.js    ← NEW
│   │   └── analyticsController.js    ← NEW
│   ├── models/          # Mongoose schemas (9 models)
│   │   ├── user.js      # Enhanced with roles
│   │   ├── booking.js   # Enhanced with event types, timeline
│   │   ├── payment.js        ← NEW
│   │   ├── guest.js           ← NEW
│   │   ├── review.js          ← NEW
│   │   ├── notification.js    ← NEW
│   │   ├── menu.js            ← NEW
│   │   ├── checklist.js       ← NEW
│   │   └── ...
│   ├── routes/          # API routes (12 route files)
│   ├── middleware/       # JWT auth middleware
│   ├── data/            # Seed data (12 vendors, 8 menus)
│   └── server.js        # Express server with all routes
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, Footer, DashboardLayout
│   │   ├── pages/       # 15+ page components
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MyBookings.jsx
│   │   │   │   ├── MyEnquiries.jsx
│   │   │   │   ├── MyPayments.jsx     ← NEW
│   │   │   │   ├── GuestList.jsx      ← NEW
│   │   │   │   ├── Notifications.jsx  ← NEW
│   │   │   │   └── Profile.jsx
│   │   │   ├── Admin.jsx  # Enhanced with tabs & analytics
│   │   │   ├── Login.jsx  # Redesigned with animations
│   │   │   ├── Signup.jsx # Multi-step with strength meter
│   │   │   └── ...
│   │   ├── utils/
│   │   │   └── api.js   # Centralized API client ← NEW
│   │   ├── App.jsx      # Router with 20+ routes
│   │   └── index.css    # Enhanced global styles
│   └── tailwind.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env`:

### 3. Seed Database

```bash
cd backend
node seed.js
```

### 4. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit: `http://localhost:5173` (frontend url)

### 5. Admin Access
- URL: `/admin`
- ID: `admin`
- Password: `admin123`

---

## 📱 API Endpoints

### Auth
| Method | Endpoint                | Description          |
|--------|-------------------------|----------------------|
| POST   | /api/auth/register      | Register user        |
| POST   | /api/auth/login         | Login user           |
| POST   | /api/auth/logout        | Logout user          |
| PUT    | /api/auth/update-profile| Update profile       |
| PUT    | /api/auth/change-password| Change password     |

### Bookings
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| POST   | /api/bookings                 | Create booking           |
| GET    | /api/bookings/my-bookings     | User's bookings          |
| GET    | /api/bookings/admin/all       | All bookings (admin)     |
| PUT    | /api/bookings/:id             | Update booking status    |
| GET    | /api/bookings/booked-dates    | Get all booked dates     |
| POST   | /api/bookings/rebook/:id      | Request reschedule       |

### Payments (NEW)
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| POST   | /api/payments                 | Record payment           |
| GET    | /api/payments/my-payments     | User's payments          |
| GET    | /api/payments/admin/all       | All payments             |
| GET    | /api/payments/admin/revenue   | Revenue statistics       |

### Guests (NEW)
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| POST   | /api/guests                   | Add guest                |
| GET    | /api/guests/booking/:id       | Booking's guests         |
| GET    | /api/guests/stats/:id         | Guest statistics         |
| PUT    | /api/guests/rsvp/:id          | Update RSVP              |

### Reviews, Notifications, Menus, Checklists, Analytics
(Similar CRUD endpoints — see routes/ directory)

---

## 🎨 Design System

- **Primary:** `#4A3728` (Deep Brown)
- **Accent:** `#C9A96E` (Gold)
- **Brand:** `#8B6F47` (Warm Brown)
- **Background:** `#FDF8F3` (Cream)
- **Typography:** Cinzel (headings), Cormorant Garamond (display), Jost (body)

---

## 📄 License

MIT License — Free for personal and commercial use.
