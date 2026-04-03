import { Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import API from "../utils/api";

const STYLES = `
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
.nb-root.hidden { transform:translateY(-100%); }

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

.nb-links { display:flex; gap:20px; }

.nb-link {
  font-family:'Cinzel',serif;
  font-size:10px;
  letter-spacing:.2em;
  text-decoration:none;
  color:#4A3728;
}

.nb-user-chip {
  display:flex;
  align-items:center;
  gap:8px;
  padding:4px 10px;
  border-radius:20px;
  border:1px solid rgba(139,111,71,.2);
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

.nb-user-initial { color:#C9A96E; }

.nb-user-name { font-size:10px; }

.nb-admin { font-size:9px; opacity:.5; }

.nb-auth { display:flex; align-items:center; gap:10px; }

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
  cursor:pointer;
}

.nb-bar {
  width:20px;
  height:2px;
  background:#000;
}

/* DRAWER */
.nb-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 260px;
  height: 100%;
  background: #4A3728;

  transform: translateX(100%);
  transition: transform 0.3s ease;

  z-index: 2000;
  padding-top: 80px;
}

.nb-drawer.open {
  transform: translateX(0);
}

.nb-drawer a,
.nb-drawer button {
  display: block;
  padding: 16px;
  color: white;
  text-decoration: none;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  background:none;
  border:none;
  text-align:left;
  width:100%;
}

/* OVERLAY */
.nb-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  z-index: 1500;
}

/* MOBILE */
@media(max-width:900px){
  .nb-links,
  .nb-auth {
    display:none;
  }

  .nb-hamburger {
    display:flex;
  }
}

.nb-spacer { height:70px; }
`;

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

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  /* FETCH USER */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/auth/me", {
          withCredentials: true,
        });

        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch {
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  /* LOGOUT */
  const handleLogout = async () => {
    try {
      await API.post("/auth/logout", {}, { withCredentials: true });
    } catch {
      console.log("Logout API failed");
    }

    localStorage.removeItem("user");
    setUser(null);
    window.location.replace("/");
  };

  /* LOCK SCROLL WHEN DRAWER OPEN */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "auto";
  }, [drawerOpen]);

  /* SECRET ADMIN */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        setShowAdmin((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  /* SCROLL */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastScrollY.current && y > 100);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAdmin = user?.role === "admin";

  if (loadingUser) return null;

  return (
    <>
      <style>{STYLES}</style>

      {/* OVERLAY */}
      {drawerOpen && (
        <div
          className="nb-overlay"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <nav className={`nb-root ${hidden ? "hidden" : ""}`}>
        <div className="nb-main">

          <Link to="/" className="nb-logo-text">
            Wedding Chapter
          </Link>

          <div className="nb-links">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className="nb-link">
                {label}
              </Link>
            ))}

            {(showAdmin || isAdmin) && (
              <Link to="/admin" className="nb-link nb-admin">
                Admin
              </Link>
            )}
          </div>

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

      {/* DRAWER */}
      <div className={`nb-drawer ${drawerOpen ? "open" : ""}`}>
        {NAV_LINKS.map(({ to, label }) => (
          <Link key={to} to={to} onClick={() => setDrawerOpen(false)}>
            {label}
          </Link>
        ))}

        {(showAdmin || isAdmin) && (
          <Link to="/admin" onClick={() => setDrawerOpen(false)}>
            Admin
          </Link>
        )}

        {user ? (
          <>
            <Link to="/dashboard" onClick={() => setDrawerOpen(false)}>
              {user.name}
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setDrawerOpen(false)}>Login</Link>
            <Link to="/signup" onClick={() => setDrawerOpen(false)}>Sign Up</Link>
          </>
        )}
      </div>

      <div className="nb-spacer" />
    </>
  );
}