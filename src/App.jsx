import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  Home, Newspaper, Users, FolderKanban, MessageSquareText,
  BarChart3, LogIn, LogOut, Menu, X, Search, Bell, Shield,
  FileText, FileUp, UserCog
} from 'lucide-react';

import HomePage from './pages/Home';
import NewsPage from './pages/News';
import OfficialsPage from './pages/Officials';
import ProjectsPage from './pages/Projects';
import ChatbotPage from './pages/Chatbot';
import AnalyticsPage from './pages/Analytics';
import LoginPage from './pages/Login';
import PublicationsPage from './pages/Publications';
import DocumentsPage from './pages/Documents';
import UserManagementPage from './pages/UserManagement';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  if (location.pathname === '/login') {
    return <LoginPage />;
  }

  const navLinks = [
    { to: '/', icon: Home, label: 'Dashboard', section: 'main' },
    { to: '/news', icon: Newspaper, label: 'News & Updates', section: 'main' },
    { to: '/officials', icon: Users, label: 'Public Officials', section: 'main' },
    { to: '/projects', icon: FolderKanban, label: 'Government Projects', section: 'main' },
    { to: '/publications', icon: FileText, label: 'Publications', section: 'main' },
    { to: '/documents', icon: FileUp, label: 'Documents', section: 'services' },
    { to: '/chatbot', icon: MessageSquareText, label: 'AI Assistant', section: 'services' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics', section: 'admin' },
    { to: '/user-management', icon: UserCog, label: 'User Management', section: 'admin' },
  ];

  const mainLinks = navLinks.filter(l => l.section === 'main');
  const serviceLinks = navLinks.filter(l => l.section === 'services');
  const adminLinks = navLinks.filter(l => l.section === 'admin');

  return (
    <div className="app-layout">
      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">SL</div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">GovChat Sierra Leone</span>
            <span className="sidebar-brand-sub">Digital Services Hub</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Main Menu</span>
          {mainLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon />
              {link.label}
            </NavLink>
          ))}

          <span className="sidebar-section-label">Services</span>
          {serviceLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon />
              {link.label}
            </NavLink>
          ))}

          <span className="sidebar-section-label">Administration</span>
          {adminLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-badge">
            <div className="sidebar-footer-dot"></div>
            <span className="sidebar-footer-text">System Online • v1.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="header-search">
              <Search />
              <input type="text" placeholder="Search government information..." />
            </div>
          </div>
          <div className="header-right">
            <button className="header-icon-btn">
              <Bell size={18} />
              <span className="badge"></span>
            </button>
            {isAuthenticated ? (
              <button className="header-user" onClick={logout}>
                <div className="header-avatar">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <span className="header-user-name">{user?.name || 'Admin'}</span>
                <LogOut size={14} />
              </button>
            ) : (
              <NavLink to="/login" className="header-user">
                <div className="header-avatar"><LogIn size={14} /></div>
                <span className="header-user-name">Sign In</span>
              </NavLink>
            )}
          </div>
        </header>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/officials" element={<OfficialsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/publications" element={<PublicationsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/user-management" element={<UserManagementPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
