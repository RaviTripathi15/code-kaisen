import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSockets } from '../context/SocketContext';
import {
  LayoutDashboard,
  Map,
  FileSpreadsheet,
  AlertTriangle,
  Users,
  Bell,
  LogOut,
  FolderTree,
  User,
  PlusCircle,
  Calendar,
  Layers,
  BarChart3,
  BookOpen,
  Menu,
  X,
  BellRing,
  ChevronRight,
} from 'lucide-react';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/map': 'Utility Map',
  '/report': 'Report Complaint',
  '/tracking': 'Complaint Tracking',
  '/profile': 'Profile',
  '/permits/create': 'Create Permit',
  '/calendar': 'Excavation Schedule',
  '/complaints-queue': 'Complaints Queue',
  '/analytics': 'Analytics',
  '/admin/departments': 'Departments',
  '/admin/conflicts': 'Conflict Manager',
  '/admin/users': 'User Management',
  '/admin/audit': 'Audit Logs',
};

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markNotificationAsRead, markAllAsRead } = useSockets();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuLinks = () => {
    const role = user?.role;

    if (role === 'Citizen') {
      return [
        { path: '/', label: 'Dashboard', description: 'Overview & stats', icon: LayoutDashboard },
        { path: '/map', label: 'Live Dig Map', description: 'Active excavations', icon: Map },
        { path: '/report', label: 'Report Issue', description: 'File a complaint', icon: FileSpreadsheet },
        { path: '/tracking', label: 'Track Complaints', description: 'Status & updates', icon: Layers },
        { path: '/profile', label: 'Profile', description: 'Account settings', icon: User },
      ];
    }

    if (role === 'Department Officer') {
      return [
        { path: '/', label: 'Dashboard', description: 'Department overview', icon: LayoutDashboard },
        { path: '/permits/create', label: 'Create Permit', description: 'New dig request', icon: PlusCircle },
        { path: '/map', label: 'GIS Map', description: 'Utility layers', icon: Map },
        { path: '/calendar', label: 'Schedule', description: 'Excavation calendar', icon: Calendar },
        { path: '/complaints-queue', label: 'Complaints', description: 'Pending queue', icon: FileSpreadsheet },
        { path: '/analytics', label: 'Analytics', description: 'Performance data', icon: BarChart3 },
        { path: '/profile', label: 'Profile', description: 'Account settings', icon: User },
      ];
    }

    if (role === 'Super Admin') {
      return [
        { path: '/', label: 'Nodal Dashboard', description: 'System overview', icon: LayoutDashboard },
        { path: '/map', label: 'Permits Map', description: 'All active permits', icon: Map },
        { path: '/admin/departments', label: 'Departments', description: 'Manage agencies', icon: FolderTree },
        { path: '/admin/conflicts', label: 'Conflicts', description: 'Resolve overlaps', icon: AlertTriangle },
        { path: '/admin/users', label: 'Users', description: 'Access control', icon: Users },
        { path: '/admin/audit', label: 'Audit Logs', description: 'System history', icon: BookOpen },
        { path: '/profile', label: 'Profile', description: 'Account settings', icon: User },
      ];
    }

    return [];
  };

  const menuLinks = getMenuLinks();
  const currentPageTitle = PAGE_TITLES[location.pathname] || 'SETU Portal';

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col glass-sidebar transition-transform duration-300 lg:static lg:inset-auto lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950 px-5">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="rounded-xl border border-gov-500/40 bg-gov-600/20 p-2">
              <Layers className="h-5 w-5 text-gov-400" />
            </div>
            <div>
              <span className="block font-display text-lg font-extrabold leading-none text-white">SETU Portal</span>
              <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                Town Utility Coord
              </span>
            </div>
          </Link>
          <button
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Navigation</p>
          {menuLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={isActive ? 'nav-link-active' : 'nav-link-inactive'}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? 'text-gov-400' : 'text-slate-500'}`} />
                <div className="min-w-0 flex-1">
                  <span className="block truncate">{link.label}</span>
                  <span className={`block truncate text-[10px] font-normal ${isActive ? 'text-gov-500/70' : 'text-slate-600'}`}>
                    {link.description}
                  </span>
                </div>
                {isActive && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gov-500" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2 border-t border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gov-500/30 bg-gov-700/20 font-bold text-gov-400">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-200">{user?.name}</p>
              <p className="truncate text-[10px] font-medium text-gov-500">{user?.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-400 transition-all duration-200 hover:bg-rose-500/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex h-16 items-center justify-between border-b border-slate-900 bg-slate-950/65 px-5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="hidden sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Current Section</p>
              <h2 className="font-display text-sm font-bold text-white">{currentPageTitle}</h2>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {user?.department && (
              <span
                className="rounded-lg border px-2.5 py-1 text-xs font-bold"
                style={{
                  backgroundColor: `${user.department.color || '#14b8a6'}15`,
                  color: user.department.color || '#14b8a6',
                  borderColor: `${user.department.color || '#14b8a6'}35`,
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

          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <button
                className={`relative rounded-xl p-2.5 transition-all duration-200 ${
                  notifDropdownOpen
                    ? 'bg-slate-900 text-slate-100'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              >
                {unreadCount > 0 ? (
                  <>
                    <BellRing className="h-5 w-5 animate-pulse text-gov-400" />
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white ring-2 ring-slate-950">
                      {unreadCount}
                    </span>
                  </>
                ) : (
                  <Bell className="h-5 w-5" />
                )}
              </button>

              {notifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifDropdownOpen(false)} />
                  <div className="absolute right-0 z-40 mt-2.5 w-80 overflow-hidden rounded-2xl border border-slate-800 glass-panel shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-850 bg-slate-950 p-3.5">
                      <span className="text-xs font-bold text-slate-200">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            markAllAsRead();
                            setNotifDropdownOpen(false);
                          }}
                          className="text-[10px] font-semibold text-gov-400 transition-colors hover:text-gov-300"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 divide-y divide-slate-850/80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">No new notifications</div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            className={`flex cursor-pointer flex-col gap-1 p-3.5 text-xs transition-colors hover:bg-slate-900/60 ${
                              !notif.read ? 'bg-gov-500/5' : 'opacity-70'
                            }`}
                            onClick={() => markNotificationAsRead(notif._id)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-200">{notif.title}</span>
                              {!notif.read && <span className="h-1.5 w-1.5 rounded-full bg-gov-500" />}
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-400">{notif.message}</p>
                            <span className="mt-1 self-end text-[9px] text-slate-500">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2.5 border-l border-slate-800 pl-4">
              <span className="hidden text-xs text-slate-400 md:inline">
                Hi, <span className="font-semibold text-slate-200">{user?.name.split(' ')[0]}</span>
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gov-500/25 bg-gov-700/30 text-xs font-bold text-gov-400">
                {user?.role.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-950 p-5 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fade-in-up">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
