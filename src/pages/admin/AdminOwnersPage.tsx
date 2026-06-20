import { ownerStore, restaurantStore, getOwnerPlan } from '@/store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminOwnersPage() {
  const owners = ownerStore.getAll();

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold mb-6">Owners</h1>
      {owners.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl text-muted-foreground animate-fade-in">No registered owners.</div>
      ) : (
        <div className="space-y-3">
          {owners.map((owner, i) => {
            const restaurants = restaurantStore.getByOwner(owner.id);
            const plan = getOwnerPlan(owner);
            return (
              <Card key={owner.id} className={`rounded-2xl border-border/60 animate-fade-up stagger-${Math.min(i + 1, 9)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{owner.name || 'Unknown'}</p>
                        <Badge variant={plan === 'free' ? 'secondary' : 'default'} className="text-xs capitalize rounded-full">{plan}</Badge>
                        {owner.planExpiresAt && plan !== 'free' && (
                          <span className="text-xs text-muted-foreground">exp {new Date(owner.planExpiresAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{owner.email}</p>
                      <p className="text-xs text-muted-foreground">{owner.phone || 'No phone'} · Joined {new Date(owner.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-sm shrink-0 text-right">
                      <p className="font-semibold text-foreground">{restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}</p>
                      <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                        {restaurants.map((r) => (
                          <p key={r.id} className="truncate max-w-48">{r.name}{r.suspended ? ' (suspended)' : ''}</p>
                        ))}
                      </div>
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
