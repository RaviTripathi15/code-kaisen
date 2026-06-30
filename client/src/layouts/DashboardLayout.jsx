import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSockets } from '../context/SocketContext';
import {
  LayoutDashboard, Map, FileSpreadsheet, AlertTriangle, Users, Bell,
  LogOut, FolderTree, User, PlusCircle, Calendar, Layers, BarChart3,
  BookOpen, Menu, X, BellRing, ChevronRight, ChevronLeft,
  CheckCircle2, Clock, Shield,
} from 'lucide-react';

const PAGE_TITLES = {
  '/': 'Dashboard', '/map': 'Utility Map', '/report': 'Report Complaint',
  '/tracking': 'Complaint Tracking', '/profile': 'Profile',
  '/permits/create': 'Create Permit', '/calendar': 'Excavation Schedule',
  '/complaints-queue': 'Complaints Queue', '/analytics': 'Analytics',
  '/admin/departments': 'Departments', '/admin/conflicts': 'Conflict Manager',
  '/admin/users': 'User Management', '/admin/audit': 'Audit Logs',
};

/* ── badge counts per nav item (demo — wire to real data via context) ── */
const BADGE_MAP = {};

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markNotificationAsRead, markAllAsRead } = useSockets();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen]         = useState(false);   // mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);  // desktop collapse
  const [notifOpen, setNotifOpen]             = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const getMenuLinks = () => {
    const role = user?.role;
    if (role === 'Citizen') return [
      { path: '/',         label: 'Dashboard',       icon: LayoutDashboard, description: 'Overview & stats' },
      { path: '/map',      label: 'Live Dig Map',     icon: Map,             description: 'Active excavations' },
      { path: '/report',   label: 'Report Issue',     icon: FileSpreadsheet, description: 'File a complaint' },
      { path: '/tracking', label: 'Track Complaints', icon: Layers,          description: 'Status & updates' },
      { path: '/profile',  label: 'Profile',          icon: User,            description: 'Account settings' },
    ];
    if (role === 'Department Officer') return [
      { path: '/',                 label: 'Dashboard',     icon: LayoutDashboard },
      { path: '/permits/create',   label: 'Create Permit', icon: PlusCircle },
      { path: '/map',              label: 'GIS Map',       icon: Map },
      { path: '/calendar',         label: 'Schedule',      icon: Calendar },
      { path: '/complaints-queue', label: 'Complaints',    icon: FileSpreadsheet },
      { path: '/analytics',        label: 'Analytics',     icon: BarChart3 },
      { path: '/profile',          label: 'Profile',       icon: User },
    ];
    if (role === 'Super Admin') return [
      { path: '/',                   label: 'Nodal Dashboard', icon: LayoutDashboard },
      { path: '/map',                label: 'Permits Map',     icon: Map },
      { path: '/admin/departments',  label: 'Departments',     icon: FolderTree },
      { path: '/admin/conflicts',    label: 'Conflicts',       icon: AlertTriangle },
      { path: '/admin/users',        label: 'Users',           icon: Users },
      { path: '/admin/audit',        label: 'Audit Logs',      icon: BookOpen },
      { path: '/profile',            label: 'Profile',         icon: User },
    ];
    return [];
  };

  const menuLinks = getMenuLinks();
  const currentPageTitle = PAGE_TITLES[location.pathname] || 'SETU Portal';

  /* ── role badge ── */
  const roleTag = {
    'Citizen':           { label: 'Citizen',   color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
    'Department Officer':{ label: 'Officer',   color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
    'Super Admin':       { label: 'Admin',     color: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
  }[user?.role] || { label: user?.role, color: 'bg-slate-800 text-slate-400 border-slate-700' };

  const sidebarW = sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64';

  return (
    <div className="flex bg-slate-950" style={{ height: '100dvh', overflow: 'hidden' }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════════ */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col glass-sidebar
        transition-all duration-300 ease-in-out
        w-64 ${sidebarW}
        lg:static lg:inset-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo row */}
        <div className={`
          flex h-16 items-center border-b border-slate-800/80 bg-slate-950/60 px-4
          ${sidebarCollapsed ? 'justify-center' : 'justify-between'}
        `}>
          {!sidebarCollapsed && (
            <Link to="/" className="flex items-center gap-2.5 min-w-0 transition-opacity hover:opacity-90">
              <div className="flex-shrink-0 rounded-xl border border-gov-500/40 bg-gov-600/20 p-2">
                <Layers className="h-5 w-5 text-gov-400" />
              </div>
              <div className="min-w-0">
                <span className="block font-display text-base font-extrabold leading-none text-white truncate">SETU Portal</span>
                <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                  Town Utility Coord
                </span>
              </div>
            </Link>
          )}
          {sidebarCollapsed && (
            <Link to="/" className="rounded-xl border border-gov-500/40 bg-gov-600/20 p-2">
              <Layers className="h-5 w-5 text-gov-400" />
            </Link>
          )}
          {/* Desktop collapse toggle */}
          <button
            className="hidden lg:flex items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
            onClick={() => setSidebarCollapsed(v => !v)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed
              ? <ChevronRight className="h-4 w-4" />
              : <ChevronLeft className="h-4 w-4" />}
          </button>
          {/* Mobile close */}
          <button
            className="lg:hidden flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 scroll-area py-4 px-2">
          {!sidebarCollapsed && (
            <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
              Navigation
            </p>
          )}
          <ul className="space-y-0.5" role="list">
            {menuLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              const badge = BADGE_MAP[link.path];

              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? link.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                      transition-all duration-200 outline-none
                      focus-visible:ring-2 focus-visible:ring-gov-500
                      ${isActive
                        ? 'bg-gov-500/15 border border-gov-500/35 text-gov-300 shadow-lg shadow-gov-950/20'
                        : 'text-slate-400 hover:bg-slate-900/70 hover:text-slate-200 border border-transparent'}
                      ${sidebarCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    {/* Active left accent bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-gov-400" />
                    )}

                    <Icon className={`
                      h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200
                      group-hover:scale-110
                      ${isActive ? 'text-gov-400' : 'text-slate-500 group-hover:text-slate-300'}
                    `} />

                    {!sidebarCollapsed && (
                      <div className="min-w-0 flex-1">
                        <span className="block truncate leading-none">{link.label}</span>
                        {link.description && (
                          <span className={`block truncate text-[10px] font-normal mt-0.5 ${isActive ? 'text-gov-500/70' : 'text-slate-600'}`}>
                            {link.description}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Badge */}
                    {badge && !sidebarCollapsed && (
                      <span className="flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white px-1">
                        {badge}
                      </span>
                    )}
                    {badge && sidebarCollapsed && (
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
                    )}

                    {isActive && !sidebarCollapsed && (
                      <ChevronRight className="h-3 w-3 flex-shrink-0 text-gov-500 opacity-70" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile section */}
        {!sidebarCollapsed ? (
          <div className="border-t border-slate-800/80 bg-slate-950/40 p-3 space-y-2">
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-900/60 group"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gov-500/30 bg-gov-700/20 font-bold text-sm text-gov-400 uppercase">
                {user?.name?.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {user?.name}
                </p>
                <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${roleTag.color}`}>
                  {roleTag.label}
                </span>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/8 px-4 py-2 text-xs font-semibold text-rose-400 transition-all duration-200 hover:bg-rose-500/15 hover:border-rose-500/40"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="border-t border-slate-800/80 bg-slate-950/40 p-2 flex flex-col items-center gap-2">
            <Link
              to="/profile"
              title={user?.name}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gov-500/30 bg-gov-700/20 font-bold text-sm text-gov-400 uppercase hover:border-gov-500/60 transition-colors"
            >
              {user?.name?.charAt(0)}
            </Link>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/8 text-rose-400 hover:bg-rose-500/15 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </aside>

      {/* ════════════════════════════════════════════
          MAIN CONTENT AREA
      ════════════════════════════════════════════ */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* ── Top Header ── */}
        <header
          className="z-30 flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-950/70 px-4 sm:px-6 backdrop-blur-xl"
          role="banner"
        >
          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <Layers className="h-3.5 w-3.5" />
              <ChevronRight className="h-3 w-3" />
              <span className="font-semibold text-slate-300">{currentPageTitle}</span>
            </div>
          </div>

          {/* Centre: dept / ward badge */}
          <div className="hidden items-center gap-2 md:flex">
            {user?.department && (
              <span
                className="rounded-lg border px-2.5 py-1 text-xs font-bold"
                style={{
                  backgroundColor: `${user.department.color || '#14b8a6'}18`,
                  color: user.department.color || '#14b8a6',
                  borderColor: `${user.department.color || '#14b8a6'}38`,
                }}
              >
                {user.department.name}
              </span>
            )}
            {user?.role === 'Citizen' && user?.ward && (
              <span className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-400">
                {user.ward}
              </span>
            )}
          </div>

          {/* Right: notifications + avatar */}
          <div className="flex items-center gap-2">

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(v => !v)}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                className={`relative rounded-xl p-2.5 transition-all duration-200 outline-none
                  focus-visible:ring-2 focus-visible:ring-gov-500
                  ${notifOpen ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
              >
                {unreadCount > 0 ? (
                  <>
                    <BellRing className="h-[18px] w-[18px] text-gov-400" style={{ animation: 'bellRing 2s ease infinite' }} />
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white ring-2 ring-slate-950">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </>
                ) : (
                  <Bell className="h-[18px] w-[18px]" />
                )}
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 z-40 mt-2 w-80 rounded-2xl border border-slate-800 glass-panel shadow-2xl shadow-slate-950/60 animate-slide-down overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => { markAllAsRead(); setNotifOpen(false); }}
                          className="text-[11px] font-semibold text-gov-400 hover:text-gov-300 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Items */}
                    <div className="max-h-72 scroll-area divide-y divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 p-8 text-center">
                          <CheckCircle2 className="h-8 w-8 text-slate-700" />
                          <p className="text-xs text-slate-500">You're all caught up</p>
                        </div>
                      ) : notifications.map((notif) => (
                        <button
                          key={notif._id}
                          onClick={() => markNotificationAsRead(notif._id)}
                          className={`w-full flex flex-col gap-1 px-4 py-3 text-left text-xs transition-colors hover:bg-slate-900/60
                            ${!notif.read ? 'bg-gov-500/5' : 'opacity-65 hover:opacity-100'}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-200 truncate">{notif.title}</span>
                            {!notif.read && <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gov-500" />}
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-400 line-clamp-2">{notif.message}</p>
                          <span className="mt-0.5 text-[9px] text-slate-600">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Divider + avatar */}
            <div className="flex items-center gap-2.5 border-l border-slate-800 pl-3">
              <span className="hidden text-xs text-slate-500 md:inline">
                Hi, <span className="font-semibold text-slate-300">{user?.name?.split(' ')[0]}</span>
              </span>
              <Link
                to="/profile"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gov-500/25 bg-gov-700/25 text-xs font-bold text-gov-400 hover:border-gov-500/50 transition-colors uppercase"
                aria-label="Go to profile"
              >
                {user?.name?.charAt(0)}
              </Link>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main
          className="flex-1 scroll-area bg-slate-950 p-4 sm:p-6 lg:p-8"
          id="main-content"
          role="main"
        >
          <div className="mx-auto max-w-7xl animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>

      {/* bell ring keyframe */}
      <style>{`
        @keyframes bellRing {
          0%,100%{ transform:rotate(0deg) }
          10%{ transform:rotate(14deg) }
          20%{ transform:rotate(-12deg) }
          30%{ transform:rotate(10deg) }
          40%{ transform:rotate(-8deg) }
          50%{ transform:rotate(6deg) }
          60%{ transform:rotate(0deg) }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
