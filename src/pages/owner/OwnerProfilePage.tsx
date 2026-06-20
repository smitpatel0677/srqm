import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ownerStore, restaurantStore, settingsStore, getOwnerPlan } from '@/store';
import { toast } from 'sonner';

const plans = [
  { key: 'free', label: 'Free', price: '₹0', features: ['1 Restaurant', '20 Menu Items', 'QR Code', 'Ordering', 'Earnings', 'Reviews', 'PDF Bills'] },
  { key: 'basic', label: 'Basic', price: '₹29/mo', features: ['5 Restaurants', 'Unlimited Items', 'Analytics', 'Order Filters', 'Categories'] },
  { key: 'premium', label: 'Premium', price: '₹49/mo', features: ['Unlimited Restaurants', 'Unlimited Items', 'Lifetime Analytics', 'Custom Theme'] },
];

export default function OwnerProfilePage() {
  const navigate = useNavigate();
  const owner = ownerStore.getCurrent();
  const [name, setName] = useState(owner?.name || '');
  const [phone, setPhone] = useState(owner?.phone || '');
  const [saving, setSaving] = useState(false);
  const settings = settingsStore.get();

  if (!owner) { navigate('/owner/login'); return null; }
  const plan = getOwnerPlan(owner);

  const handleSave = () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    setTimeout(() => {
      const updated = { ...owner, name: name.trim(), phone: phone.trim() };
      ownerStore.save(updated);
      ownerStore.setCurrent(updated);
      toast.success('Profile updated');
      setSaving(false);
    }, 400);
  };

  const handleDelete = () => {
    restaurantStore.getByOwner(owner.id).forEach((r) => restaurantStore.delete(r.id));
    ownerStore.delete(owner.id);
    ownerStore.setCurrent(null);
    toast.success('Account deleted');
    navigate('/');
  };

  const handleUpgradePlan = (planName: string) => {
    const phone = settings.supportPhone || '9876543210';
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(`I would like to purchase ${planName} plan`)}`, '_blank');
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      {/* Profile card */}
      <Card className="mb-5 rounded-2xl border-border/60">
        <CardHeader className="pb-3"><CardTitle className="text-base">Your Details</CardTitle></CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div>
            <Label className="text-sm font-normal text-muted-foreground">Email</Label>
            <p className="text-sm mt-1 font-medium">{owner.email}</p>
          </div>
          <div>
            <Label htmlFor="pname" className="text-sm font-normal text-muted-foreground">Display Name</Label>
            <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 rounded-xl" />
          </div>
          <div>
            <Label htmlFor="pphone" className="text-sm font-normal text-muted-foreground">Phone</Label>
            <Input id="pphone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 rounded-xl" maxLength={10} inputMode="numeric" />
          </div>
          <Button className="rounded-xl press-active" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </CardContent>
      </Card>

      {/* Plans */}
      <Card className="mb-5 rounded-2xl border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            Plan
            <Badge variant={plan === 'free' ? 'secondary' : 'default'} className="capitalize rounded-full">{plan}</Badge>
            {owner.planExpiresAt && plan !== 'free' && (
              <span className="text-xs text-muted-foreground font-normal">· Expires {new Date(owner.planExpiresAt).toLocaleDateString()}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {plans.map((p) => (
              <div key={p.key} className={`p-4 rounded-xl border text-sm flex flex-col ${plan === p.key ? 'border-primary bg-primary/5' : 'border-border/60'}`}>
                <div className="flex justify-between items-center mb-3">
                  <p className="font-semibold">{p.label}</p>
                  <span className="text-xs font-medium text-muted-foreground">{p.price}</span>
                </div>
                {p.key !== 'free' && plan !== p.key && (
                  <Button size="sm" className="w-full mb-3 h-8 text-xs rounded-xl press-active" onClick={() => handleUpgradePlan(p.label)}>
                    Upgrade via WhatsApp
                  </Button>
                )}
                {plan === p.key && <p className="text-xs text-primary font-semibold mb-2">✓ Current Plan</p>}
                <ul className="space-y-1 text-xs text-muted-foreground mt-auto">
                  {p.features.map((f) => <li key={f} className="flex items-center gap-1"><span className="text-primary opacity-60">·</span> {f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="rounded-2xl border-destructive/30">
        <CardHeader className="pb-3"><CardTitle className="text-base text-destructive">Danger Zone</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">This will permanently delete your account, all restaurants and data.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="rounded-xl press-active">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete your account and all restaurants. This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete My Account</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
