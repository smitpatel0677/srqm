import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { ownerStore, restaurantStore, getOwnerPlan, maxRestaurants, fileToBase64, uuid } from '@/store';
import { toast } from 'sonner';
import type { Restaurant } from '@/types';

interface RestaurantFormProps { mode: 'create' | 'edit'; }

export default function RestaurantFormPage({ mode }: RestaurantFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const owner = ownerStore.getCurrent();

  const existing = mode === 'edit' && id ? restaurantStore.getById(id) : null;

  const [name, setName] = useState(existing?.name || '');
  const [location, setLocation] = useState(existing?.location || '');
  const [phone, setPhone] = useState(existing?.phone || '');
  const [paymentInfo, setPaymentInfo] = useState(existing?.paymentInfo || '');
  const [logo, setLogo] = useState(existing?.logo || '');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!owner) { navigate('/owner/login'); return null; }

  const plan = getOwnerPlan(owner);
  const ownedCount = restaurantStore.getByOwner(owner.id).filter((r) => r.id !== existing?.id).length;

  if (mode === 'create' && ownedCount >= maxRestaurants(plan)) {
    return (
      <div className="p-6 max-w-lg mx-auto animate-fade-up">
        <Button variant="ghost" size="sm" className="gap-2 mb-5 -ml-2 rounded-xl" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} strokeWidth={2} /> Back
        </Button>
        <div className="text-center py-12 border border-dashed rounded-2xl">
          <p className="font-semibold text-lg">Restaurant limit reached</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Your {plan} plan allows up to {maxRestaurants(plan)} restaurant{maxRestaurants(plan) !== 1 ? 's' : ''}. Upgrade to add more.
          </p>
          <Button className="mt-4 rounded-xl press-active" onClick={() => navigate('/owner/profile')}>Upgrade Plan</Button>
        </div>
      </div>
    );
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    const b64 = await fileToBase64(file);
    setLogo(b64);
  };

  const validate = () => {
    if (!name.trim()) { toast.error('Restaurant name is required'); return false; }
    if (!location.trim()) { toast.error('Location is required'); return false; }
    if (!phone.trim()) { toast.error('Phone number is required'); return false; }
    if (!logo && mode === 'create') { toast.error('Logo is required'); return false; }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      if (mode === 'create') {
        const r: Restaurant = {
          id: uuid(),
          ownerId: owner.id,
          name: name.trim(),
          slug: restaurantStore.generateSlug(),
          logo,
          location: location.trim(),
          phone: phone.trim(),
          paymentInfo: paymentInfo.trim(),
          suspended: false,
          createdAt: new Date().toISOString(),
        };
        restaurantStore.save(r);
        toast.success('Restaurant created!');
        navigate(`/owner/restaurants/${r.id}/menu`);
      } else if (existing) {
        restaurantStore.save({ ...existing, name: name.trim(), logo: logo || existing.logo, location: location.trim(), phone: phone.trim(), paymentInfo: paymentInfo.trim() });
        toast.success('Restaurant updated!');
        navigate('/owner/restaurants');
      }
      setSaving(false);
    }, 500);
  };

  const handleDelete = () => {
    if (!existing) return;
    restaurantStore.delete(existing.id);
    toast.success('Restaurant deleted');
    navigate('/owner/restaurants');
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto animate-fade-up">
      <Button variant="ghost" size="sm" className="gap-2 mb-5 -ml-2 rounded-xl" onClick={() => navigate(-1)}>
        <ArrowLeft size={14} strokeWidth={2} /> Back
      </Button>
      <h1 className="text-2xl font-bold mb-6">{mode === 'create' ? 'Create Restaurant' : 'Edit Restaurant'}</h1>

      <Card className="rounded-2xl border-border/60">
        <CardHeader className="pb-3"><CardTitle className="text-base">Restaurant Details</CardTitle></CardHeader>
        <CardContent className="space-y-4 pt-0">
          {/* Logo */}
          <div>
            <Label className="text-sm font-normal text-muted-foreground">Logo {mode === 'create' && <span className="text-destructive">*</span>}</Label>
            <div className="mt-2 flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden">
                {logo
                  ? <img src={logo} alt="logo" className="w-full h-full object-cover" />
                  : <Upload size={22} strokeWidth={1.5} className="text-muted-foreground" />}
              </div>
              <div>
                <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => fileRef.current?.click()}>
                  {logo ? 'Change Logo' : 'Upload Logo'}
                </Button>
                {logo && (
                  <Button type="button" variant="ghost" size="sm" className="ml-2 rounded-xl text-destructive" onClick={() => setLogo('')}>
                    <X size={14} strokeWidth={2} />
                  </Button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <p className="text-xs text-muted-foreground mt-1.5">PNG, JPG, WebP</p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="rname" className="text-sm font-normal text-muted-foreground">Name <span className="text-destructive">*</span></Label>
            <Input id="rname" placeholder="Restaurant name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 rounded-xl" />
          </div>
          <div>
            <Label htmlFor="rloc" className="text-sm font-normal text-muted-foreground">Location <span className="text-destructive">*</span></Label>
            <Input id="rloc" placeholder="City / Area" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 rounded-xl" />
          </div>
          <div>
            <Label htmlFor="rphone" className="text-sm font-normal text-muted-foreground">Phone <span className="text-destructive">*</span></Label>
            <Input id="rphone" placeholder="Contact number" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 rounded-xl" />
          </div>
          <div>
            <Label htmlFor="rpay" className="text-sm font-normal text-muted-foreground">Payment Info <span className="text-xs opacity-70">(for online payments)</span></Label>
            <Textarea id="rpay" placeholder="UPI ID: yourname@upi or bank details..." value={paymentInfo} onChange={(e) => setPaymentInfo(e.target.value)} className="mt-1 rounded-xl" rows={3} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="flex-1 h-11 rounded-xl press-active" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : mode === 'create' ? 'Create Restaurant' : 'Save Changes'}
            </Button>
            {mode === 'edit' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="h-11 rounded-xl press-active">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Restaurant?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete this restaurant and all its menu items. This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
