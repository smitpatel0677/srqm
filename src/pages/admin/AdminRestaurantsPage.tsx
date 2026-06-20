import { useState, useCallback } from 'react';
import { CheckCircle, XCircle, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { restaurantStore, ownerStore, getOwnerPlan } from '@/store';
import { toast } from 'sonner';

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState(() => restaurantStore.getAll());
  const refresh = useCallback(() => setRestaurants(restaurantStore.getAll()), []);

  const toggleSuspend = (id: string, suspended: boolean) => {
    const r = restaurantStore.getById(id);
    if (!r) return;
    restaurantStore.save({ ...r, suspended });
    refresh();
    toast.success(suspended ? 'Restaurant suspended' : 'Restaurant reactivated');
  };

  const setPlan = (ownerId: string, plan: 'free' | 'basic' | 'premium') => {
    const owner = ownerStore.getById(ownerId);
    if (!owner) return;
    const expiry = plan === 'free' ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    ownerStore.save({ ...owner, plan, planExpiresAt: expiry });
    const current = ownerStore.getCurrent();
    if (current?.id === ownerId) ownerStore.setCurrent({ ...current, plan, planExpiresAt: expiry });
    refresh();
    toast.success(`Plan updated to ${plan}`);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold mb-6">Restaurants</h1>

      {restaurants.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl text-muted-foreground animate-fade-in">
          No restaurants registered yet.
        </div>
      ) : (
        <div className="space-y-3">
          {restaurants.map((r, i) => {
            const owner = ownerStore.getById(r.ownerId);
            const plan = owner ? getOwnerPlan(owner) : 'free';
            return (
              <Card key={r.id} className={`rounded-2xl border-border/60 hover:shadow-sm transition-all duration-200 animate-fade-up stagger-${Math.min(i + 1, 9)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      {r.logo
                        ? <img src={r.logo} alt={r.name} className="w-full h-full object-cover" />
                        : <span className="font-bold text-muted-foreground">{r.name[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{r.name}</p>
                        <Badge variant={r.suspended ? 'destructive' : 'secondary'} className="text-xs rounded-full">
                          {r.suspended ? 'Suspended' : 'Active'}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize rounded-full">{plan}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1"><MapPin size={10} strokeWidth={2} />{r.location}</span>
                        <span className="flex items-center gap-1"><Phone size={10} strokeWidth={2} />{r.phone}</span>
                        {owner && <span>Owner: {owner.email}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <Select value={plan} onValueChange={(v) => setPlan(r.ownerId, v as 'free' | 'basic' | 'premium')}>
                        <SelectTrigger className="w-28 h-8 text-xs rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                      {r.suspended ? (
                        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-xl press-active" onClick={() => toggleSuspend(r.id, false)}>
                          <CheckCircle size={12} strokeWidth={2} /> Reactivate
                        </Button>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="h-8 gap-1.5 text-xs rounded-xl press-active">
                              <XCircle size={12} strokeWidth={2} /> Suspend
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-3xl">
                            <AlertDialogHeader><AlertDialogTitle>Suspend Restaurant?</AlertDialogTitle><AlertDialogDescription>This will hide the restaurant from public view.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => toggleSuspend(r.id, true)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Suspend</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
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
