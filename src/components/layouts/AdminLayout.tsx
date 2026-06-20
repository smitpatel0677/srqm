import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Store, Users, Star, Settings, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/common/Logo';
import OfflineBanner from '@/components/common/OfflineBanner';
import { useTheme } from '@/hooks/useTheme';
import { adminStore } from '@/store';
import { toast } from 'sonner';

const navItems = [
  { to: '/admin1/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin1/restaurants', icon: Store, label: 'Restaurants' },
  { to: '/admin1/owners', icon: Users, label: 'Owners' },
  { to: '/admin1/reviews', icon: Star, label: 'Reviews' },
  { to: '/admin1/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    adminStore.setSession(false);
    toast.success('Logged out');
    navigate('/admin1');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <Logo size="sm" />
        <p className="text-xs text-sidebar-foreground/60 mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-2 space-y-1 mt-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`
            }
          >
            <Icon size={16} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Button variant="ghost" size="sm" onClick={toggle} className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/50">
          {theme === 'dark' ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive">
          <LogOut size={16} strokeWidth={2} />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-sidebar flex flex-col border-r border-sidebar-border">
            <div className="flex items-center justify-end p-3 border-b border-sidebar-border">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X size={18} strokeWidth={2} />
              </Button>
            </div>
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <OfflineBanner />
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-background sticky top-0 z-30">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} strokeWidth={2} />
          </Button>
          <Logo size="sm" />
        </div>
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
