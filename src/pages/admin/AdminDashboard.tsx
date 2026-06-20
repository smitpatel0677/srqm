import { useNavigate } from 'react-router-dom';
import { Store, Users, Star, ShoppingBag, TrendingUp, Settings, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { restaurantStore, ownerStore, orderStore, reviewStore } from '@/store';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const restaurants = restaurantStore.getAll();
  const owners = ownerStore.getAll();
  const orders = orderStore.getAll();
  const reviews = reviewStore.getAll();
  const revenue = orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: 'Restaurants', value: restaurants.length, icon: Store, action: () => navigate('/admin1/restaurants') },
    { label: 'Owners', value: owners.length, icon: Users, action: () => navigate('/admin1/owners') },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, action: null },
    { label: 'Reviews', value: reviews.length, icon: Star, action: () => navigate('/admin1/reviews') },
    { label: 'Revenue', value: `₹${revenue.toFixed(0)}`, icon: TrendingUp, action: null },
  ];

  const quickLinks = [
    { title: 'Manage Restaurants', desc: 'Suspend, reactivate, assign plans', path: '/admin1/restaurants', icon: Store },
    { title: 'Manage Owners', desc: 'View owners and their plans', path: '/admin1/owners', icon: Users },
    { title: 'Moderate Reviews', desc: 'Delete inappropriate reviews', path: '/admin1/reviews', icon: Star },
    { title: 'Site Settings', desc: 'Logo, name, support contact, maintenance', path: '/admin1/settings', icon: Settings },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-8">Platform overview</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {stats.map(({ label, value, icon: Icon, action }, i) => (
          <Card
            key={label}
            className={`rounded-2xl border-border/60 h-full animate-fade-up stagger-${Math.min(i + 1, 9)} ${action ? 'cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-200' : ''}`}
            onClick={() => action?.()}
          >
            <CardContent className="p-4 flex flex-col items-start gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon size={15} strokeWidth={2} className="text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-base font-semibold mb-3 text-muted-foreground">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {quickLinks.map(({ title, desc, path, icon: Icon }, i) => (
          <Card
            key={title}
            className={`rounded-2xl border-border/60 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-200 animate-fade-up stagger-${Math.min(i + 1, 4)}`}
            onClick={() => navigate(path)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Icon size={17} strokeWidth={1.5} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground text-pretty">{desc}</p>
              </div>
              <ChevronRight size={16} strokeWidth={2} className="text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
