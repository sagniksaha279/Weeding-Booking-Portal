import { Link} from "@tanstack/react-router";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
const backend_url = import.meta.env.VITE_BACKEND_URL;
import { motion } from "framer-motion";

/* ───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap');

:root {
  --brand:#8B6F47;
  --brand-dark:#4A3728;
  --gold:#C9A96E;
  --nav-h:70px;
}

.nb-root {
  position:fixed;
  top:0;
  width:100%;
  z-index:1000;
  background:rgba(253,248,243,.95);
  backdrop-filter:blur(10px);
  transition:.3s;
}

.nb-root.hidden {
  transform:translateY(-100%);
}

.nb-main {
  height:var(--nav-h);
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 28px;
  max-width:1400px;
  margin:auto;
}

.nb-logo-text {
  font-family:'Cinzel',serif;
  font-size:14px;
  letter-spacing:.2em;
}

.nb-links {
  display:flex;
  gap:20px;
}

.nb-link {
  font-family:'Cinzel',serif;
  font-size:10px;
  letter-spacing:.2em;
  text-decoration:none;
  color:#4A3728;
}

/* USER CHIP */
.nb-user-chip {
  display:flex;
  align-items:center;
  gap:8px;
  padding:4px 10px;
  border-radius:20px;
  border:1px solid rgba(139,111,71,.2);
  cursor:pointer;
  text-decoration:none;
  color:inherit;
}

.nb-user-avatar {
  width:28px;
  height:28px;
  border-radius:50%;
  background:#4A3728;
  display:flex;
  align-items:center;
  justify-content:center;
}

.nb-user-initial {
  color:#C9A96E;
}

.nb-user-name {
  font-size:10px;
}

/* ADMIN LINK (HIDDEN STYLE) */
.nb-admin {
  font-size:9px;
  opacity:.5;
}

/* AUTH */
.nb-auth {
  display:flex;
  align-items:center;
  gap:10px;
}

.nb-auth-signup {
  font-size:10px;
  padding:8px 14px;
  background:#4A3728;
  color:#fff;
  text-decoration:none;
}

.nb-auth-logout {
  background:none;
  border:none;
  cursor:pointer;
}

/* HAMBURGER */
.nb-hamburger {
  display:none;
  flex-direction:column;
  gap:4px;
}

.nb-bar {
  width:20px;
  height:2px;
  background:#000;
}

/* DRAWER */
.nb-drawer {
  position:fixed;
  top:0;
  right:0;
  width:260px;
  height:100%;
  background:#4A3728;
  transform:translateX(100%);
  transition:.3s;
}

.nb-drawer.open {
  transform:translateX(0);
}

.nb-drawer a {
  display:block;
  padding:14px;
  color:white;
  text-decoration:none;
}

/* RESPONSIVE */
@media(max-width:900px){
  .nb-links,.nb-auth { display:none; }
  .nb-hamburger { display:flex; }
}

.nb-spacer { height:70px; }
`;

/* NAV LINKS */
const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/plans", label: "Plans" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/reviews", label: "Reviews" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const lastScrollY = useRef(0);

  const [user, setUser] = useState(() => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
  });

  /* SECRET KEY COMBO (Ctrl + Shift + A) */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        setShowAdmin((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  /* SCROLL HIDE */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastScrollY.current && y > 100);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await axios.post(
      `${backend_url}/api/auth/logout`,
      {},
      { withCredentials: true }
    );
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  /* ROLE CHECK */
  const isAdmin = user?.role === "admin";

  return (
    <>
      <style>{STYLES}</style>

      <nav className={`nb-root ${hidden ? "hidden" : ""}`}>
        <div className="nb-main">

          {/* LOGO */}
          <Link to="/">
            <span className="nb-logo-text">Wedding Chapter</span>
          </Link>

          {/* LINKS */}
          <div className="nb-links">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className="nb-link">
                {label}
              </Link>
            ))}

            {/* ADMIN (HIDDEN / ROLE BASED) */}
            {(showAdmin || isAdmin) && (
              <Link to="/admin" className="nb-link nb-admin">
                Admin
              </Link>
            )}
          </div>

          {/* AUTH */}
          <div className="nb-auth">
            {user ? (
              <>
                <Link to="/dashboard" className="nb-user-chip">
                  <div className="nb-user-avatar">
                    <span className="nb-user-initial">
                      {user.name?.charAt(0)}
                    </span>
                  </div>
                  <span className="nb-user-name">{user.name}</span>
                </Link>

                <button onClick={handleLogout} className="nb-auth-logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nb-link">Login</Link>
                <Link to="/signup" className="nb-auth-signup">Sign Up</Link>
              </>
            )}
          </div>

          {/* HAMBURGER */}
          <button
            className="nb-hamburger"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <div className="nb-bar"></div>
            <div className="nb-bar"></div>
            <div className="nb-bar"></div>
          </button>

        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <div className={`nb-drawer ${drawerOpen ? "open" : ""}`}>
        {NAV_LINKS.map(({ to, label }) => (
          <Link key={to} to={to}>{label}</Link>
        ))}

        {/* ADMIN IN MOBILE */}
        {(showAdmin || isAdmin) && (
          <Link to="/admin">Admin</Link>
        )}

        {user ? (
          <>
            <Link to="/dashboard" className="nb-user-chip">
              <div className="nb-user-avatar">
                <span className="nb-user-initial">
                  {user.name?.charAt(0)}
                </span>
              </div>
              <span className="nb-user-name">{user.name}</span>
            </Link>

            <button onClick={handleLogout} className="nb-auth-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>

      <div className="nb-spacer" />
    </>
  );
}