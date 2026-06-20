import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, UtensilsCrossed, User, LogOut, Sun, Moon, Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/common/Logo';
import OfflineBanner from '@/components/common/OfflineBanner';
import { useTheme } from '@/hooks/useTheme';
import { ownerStore } from '@/store';
import { toast } from 'sonner';

const navItems = [
  { to: '/owner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/owner/restaurants', icon: UtensilsCrossed, label: 'My Restaurants' },
  { to: '/owner/profile', icon: User, label: 'Profile' },
];

export default function OwnerLayout() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const owner = ownerStore.getCurrent();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    ownerStore.setCurrent(null);
    toast.success('Logged out successfully');
    navigate('/owner/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <Logo size="sm" />
        <p className="text-xs text-sidebar-foreground/60 mt-1">Owner Panel</p>
      </div>
      {owner && (
        <div className="px-4 py-3 border-b border-sidebar-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
            {owner.name?.[0]?.toUpperCase() || 'O'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate text-sidebar-foreground">{owner.name || 'Owner'}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{owner.email}</p>
          </div>
        </div>
      )}
      <nav className="flex-1 p-2 space-y-1">
        <p className="text-xs font-semibold text-sidebar-foreground/50 px-3 pt-2 pb-1 uppercase tracking-wider">Navigation</p>
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
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
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
        {/* Mobile topbar */}
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

export function OwnerBreadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={14} strokeWidth={2} />}
          <span className={i === items.length - 1 ? 'text-foreground font-medium' : ''}>{item.label}</span>
        </span>
      ))}
    </div>
  );
}
