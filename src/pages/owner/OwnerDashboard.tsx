import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, QrCode, UtensilsCrossed, ClipboardList, ShoppingBag, TrendingUp, Star, FileText, Download, Moon, Bell, Store, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ownerStore, restaurantStore, orderStore, menuStore, getOwnerPlan, planHas } from '@/store';
import { useEffect, useState } from 'react';
import type { Restaurant, Order } from '@/types';

const featureCards = [
  { icon: QrCode, title: 'QR Code Generator', desc: 'Generate branded QR codes', plan: null },
  { icon: ShoppingBag, title: 'Digital Ordering', desc: 'Customers order from phone', plan: null },
  { icon: Bell, title: 'Live Order Alerts', desc: 'Real-time notifications', plan: null },
  { icon: TrendingUp, title: 'Earnings View', desc: 'Daily & monthly earnings', plan: null },
  { icon: Star, title: 'Ratings & Reviews', desc: 'Customer feedback system', plan: null },
  { icon: FileText, title: 'PDF Receipts', desc: 'Professional order bills', plan: null },
  { icon: Download, title: 'QR Download', desc: 'PNG & PDF download', plan: null },
  { icon: ClipboardList, title: 'Analytics', desc: 'Monthly reports & insights', plan: 'basic' as const },
  { icon: Moon, title: 'Custom Theme', desc: 'Personalize your menu color', plan: 'premium' as const },
];

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const owner = ownerStore.getCurrent();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!owner) { navigate('/owner/login'); return; }
    setRestaurants(restaurantStore.getByOwner(owner.id));
    const allOrders = owner
      ? restaurantStore.getByOwner(owner.id).flatMap((r) => orderStore.getByRestaurant(r.id))
      : [];
    setOrders(allOrders);
  }, [owner, navigate, location.key]);

  if (!owner) return null;
  const plan = getOwnerPlan(owner);
  const revenue = orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.total, 0);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-up">
      {/* Welcome banner */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-balance">Welcome back, {owner.name || 'Owner'} 👋</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Plan: <Badge variant={plan === 'free' ? 'secondary' : 'default'} className="ml-1 capitalize rounded-full">{plan}</Badge>
              {owner.planExpiresAt && plan !== 'free' && (
                <span className="ml-2 text-xs opacity-70">· Expires {new Date(owner.planExpiresAt).toLocaleDateString()}</span>
              )}
            </p>
          </div>
          {plan === 'free' && (
            <Button size="sm" className="gap-1.5 rounded-xl press-active shrink-0" onClick={() => navigate('/owner/profile')}>
              <TrendingUp size={13} strokeWidth={2} /> Upgrade Plan
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
        {[
          { label: 'Restaurants', value: restaurants.length, icon: Store, action: () => navigate('/owner/restaurants') },
          { label: 'Total Orders', value: orders.length, icon: ShoppingBag, action: null },
          { label: 'Revenue', value: `₹${revenue.toFixed(0)}`, icon: TrendingUp, action: null },
        ].map(({ label, value, icon: Icon, action }) => (
          <Card
            key={label}
            className={`rounded-2xl border-border/60 h-full ${action ? 'cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-200' : ''}`}
            onClick={() => action?.()}
          >
            <CardContent className="p-4 flex flex-col items-start gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon size={17} strokeWidth={2} className="text-primary" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Your Restaurants */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Your Restaurants</h2>
        <Button size="sm" className="gap-1.5 rounded-xl press-active" onClick={() => navigate('/owner/restaurants/create')}>
          <Plus size={14} strokeWidth={2} /> New
        </Button>
      </div>

      {restaurants.length === 0 ? (
        <Card className="mb-8 rounded-2xl border-dashed border-border/60">
          <CardContent className="p-8 text-center">
            <UtensilsCrossed size={36} strokeWidth={1.5} className="mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-medium">No restaurants yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first restaurant to start accepting orders</p>
            <Button className="mt-4 rounded-xl press-active" onClick={() => navigate('/owner/restaurants/create')}>
              <Plus size={14} strokeWidth={2} className="mr-1.5" /> Create Restaurant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {restaurants.map((r, i) => {
            const rOrders = orderStore.getByRestaurant(r.id);
            const items = menuStore.getByRestaurant(r.id);
            const pendingCount = rOrders.filter((o) => o.status === 'pending').length;
            return (
              <Card key={r.id} className={`rounded-2xl border-border/60 hover:shadow-md hover:border-primary/20 transition-all duration-200 h-full animate-fade-up stagger-${Math.min(i + 1, 9)}`}>
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      {r.logo
                        ? <img src={r.logo} alt={r.name} className="w-full h-full object-cover" />
                        : <span className="font-bold text-muted-foreground">{r.name[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <p className="font-semibold truncate flex-1">{r.name}</p>
                        {r.suspended && <Badge variant="destructive" className="text-xs shrink-0 rounded-full">Suspended</Badge>}
                        {pendingCount > 0 && (
                          <Badge className="text-xs shrink-0 rounded-full bg-yellow-500 text-white">{pendingCount} new</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{r.location}</p>
                      <p className="text-xs text-muted-foreground">{items.length} items · {rOrders.length} orders</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <Button size="sm" className="h-8 gap-1.5 rounded-xl press-active" onClick={() => navigate(`/owner/restaurants/${r.id}/orders`)}>
                      <ClipboardList size={12} strokeWidth={2} /> Orders
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-xl press-active" onClick={() => navigate(`/owner/restaurants/${r.id}/menu`)}>
                      <UtensilsCrossed size={12} strokeWidth={2} /> Menu
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-xl press-active" onClick={() => navigate(`/owner/restaurants/${r.id}/qr`)}>
                      <QrCode size={12} strokeWidth={2} /> QR
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs text-primary rounded-xl press-active" onClick={() => navigate(`/r/${r.slug}`)}>
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Feature cards */}
      <h2 className="text-lg font-bold mb-4">Platform Features</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {featureCards.map(({ icon: Icon, title, desc, plan: reqPlan }) => {
          const locked = reqPlan === 'basic' ? !planHas(plan, 'analytics') : reqPlan === 'premium' ? !planHas(plan, 'themeColor') : false;
          return (
            <div
              key={title}
              className={`p-4 border rounded-2xl bg-card relative overflow-hidden transition-all duration-200 ${locked ? 'opacity-60' : 'border-border/60 hover:border-primary/20 hover:shadow-sm'}`}
            >
              {locked && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="flex items-center gap-1 bg-muted rounded-full px-2 py-0.5 text-xs text-muted-foreground font-medium">
                    <Lock size={9} strokeWidth={2} /> {reqPlan === 'basic' ? 'Basic' : 'Premium'}
                  </div>
                </div>
              )}
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Icon size={15} strokeWidth={2} className="text-primary" />
              </div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}


