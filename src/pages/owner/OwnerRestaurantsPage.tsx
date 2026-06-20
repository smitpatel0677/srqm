import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, QrCode, ClipboardList, UtensilsCrossed, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ownerStore, restaurantStore, menuStore, orderStore, getOwnerPlan, maxRestaurants } from '@/store';
import { useEffect, useState } from 'react';
import type { Restaurant } from '@/types';

export default function OwnerRestaurantsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const owner = ownerStore.getCurrent();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    if (!owner) { navigate('/owner/login'); return; }
    setRestaurants(restaurantStore.getByOwner(owner.id));
  }, [owner, navigate, location.key]);

  if (!owner) return null;
  const plan = getOwnerPlan(owner);
  const canCreate = restaurants.length < maxRestaurants(plan);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Restaurants</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {restaurants.length} / {maxRestaurants(plan) === Infinity ? '∞' : maxRestaurants(plan)} used
          </p>
        </div>
        <Button
          className="gap-2 rounded-xl press-active shrink-0"
          onClick={() => canCreate ? navigate('/owner/restaurants/create') : undefined}
          disabled={!canCreate}
        >
          <Plus size={16} strokeWidth={2} /> New Restaurant
        </Button>
      </div>

      {!canCreate && (
        <div className="mb-5 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-sm text-yellow-700 dark:text-yellow-400">
          You've reached the limit for your {plan} plan.{' '}
          <button className="underline font-medium" onClick={() => navigate('/owner/profile')}>Upgrade</button> to add more.
        </div>
      )}

      {restaurants.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl animate-fade-in">
          <UtensilsCrossed size={36} strokeWidth={1.5} className="mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="font-medium">No restaurants yet</p>
          <Button className="mt-4 rounded-xl press-active" onClick={() => navigate('/owner/restaurants/create')}>
            <Plus size={14} strokeWidth={2} className="mr-1.5" /> Create your first restaurant
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restaurants.map((r, i) => {
            const items = menuStore.getByRestaurant(r.id);
            const orders = orderStore.getByRestaurant(r.id);
            const pending = orders.filter((o) => o.status === 'pending').length;
            return (
              <Card key={r.id} className={`h-full rounded-2xl border-border/60 hover:shadow-md hover:border-primary/20 transition-all duration-200 animate-fade-up stagger-${Math.min(i + 1, 9)}`}>
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex gap-3 mb-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      {r.logo
                        ? <img src={r.logo} alt={r.name} className="w-full h-full object-cover" />
                        : <span className="font-bold text-lg text-muted-foreground">{r.name[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <p className="font-semibold flex-1 truncate">{r.name}</p>
                        {r.suspended && <Badge variant="destructive" className="text-xs shrink-0 rounded-full">Suspended</Badge>}
                        {pending > 0 && <Badge className="text-xs shrink-0 rounded-full bg-yellow-500 text-white">{pending} new</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{r.location}</p>
                      <p className="text-xs text-muted-foreground">{items.length} items · {orders.length} orders</p>
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
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-xl press-active" onClick={() => navigate(`/owner/restaurants/${r.id}/edit`)}>
                      <Pencil size={12} strokeWidth={2} /> Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
