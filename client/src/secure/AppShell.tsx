import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Zap, ListChecks, ArrowLeftRight,
  UserCircle, LogOut, Menu, X, Wallet
} from 'lucide-react';
import { useAuthStore } from '../store';
import './app-shell.css';
import '../../src/assets/design-tokens.css';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
  { to: '/browse', icon: <Zap size={15} />, label: 'Browse Market' },
  { to: '/my-listings', icon: <ListChecks size={15} />, label: 'My Listings' },
  { to: '/transactions', icon: <ArrowLeftRight size={15} />, label: 'Transactions' },
  { to: '/earnings', icon: <Wallet size={15} />, label: 'Earnings' },
  { to: '/profile', icon: <UserCircle size={15} />, label: 'Profile' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = (user?.full_name ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="shell-root">
      {/* Overlay for mobile */}
      <div
        className={`shell-overlay${sidebarOpen ? '' : ' hidden'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`shell-sidebar${sidebarOpen ? ' open' : ''}`}>
        <NavLink to="/dashboard" className="shell-sidebar-logo" onClick={() => setSidebarOpen(false)}>
          <div className="shell-logo-bolt" />
          <span className="shell-logo-text">Kilo</span>
        </NavLink>

        <nav className="shell-nav">
          <div className="shell-nav-label">Navigate</div>
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `shell-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="shell-nav-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="shell-sidebar-bottom">
          <button className="shell-logout-btn" onClick={handleLogout}>
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="shell-main">
        <header className="shell-topbar">
          <button
            className="shell-hamburger"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <p className="shell-topbar-greeting">
            Welcome back, <span>{user?.full_name?.split(' ')[0] ?? 'User'}</span>
          </p>
          <div className="shell-topbar-avatar">{initials}</div>
        </header>

        <div className="shell-content">{children}</div>
      </div>
    </div>
  );
}
