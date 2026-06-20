import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, CreditCard, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/components/layouts/PublicLayout';
import { cartStore, restaurantStore, orderStore, uuid } from '@/store';
import { toast } from 'sonner';
import type { Order } from '@/types';

function validatePhone(p: string) {
  const clean = p.replace(/\D/g, '');
  if (clean.length !== 10) return 'Phone must be 10 digits';
  if (clean === '1234567890' || clean === '0987654321') return 'Please enter a valid phone number';
  return '';
}

export default function CartPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantSlug = searchParams.get('restaurant') || '';

  const cartState = cartStore.get();
  const [items, setItems] = useState(
    cartState?.restaurantSlug === restaurantSlug ? cartState.items : []
  );

  const restaurant = restaurantStore.getBySlug(restaurantSlug);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [payment, setPayment] = useState<'cash' | 'online'>('cash');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);

  const update = (id: string, delta: number) => {
    const next = items
      .map((i) => i.menuItemId === id ? { ...i, quantity: i.quantity + delta } : i)
      .filter((i) => i.quantity > 0);
    setItems(next);
    cartStore.set({ restaurantSlug, items: next });
  };

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    const pe = validatePhone(phone);
    if (pe) e.phone = pe;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = () => {
    if (!validate()) return;
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    if (!restaurant) { toast.error('Restaurant not found'); return; }
    setPlacing(true);

    const order: Order = {
      id: uuid(),
      restaurantId: restaurant.id,
      restaurantSlug,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      paymentMethod: payment,
      items,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orderStore.save(order);
    cartStore.clear();
    toast.success('Order placed!');
    navigate(`/order/${order.id}`);
  };

  if (items.length === 0 && !placing) {
    return (
      <PublicLayout>
        <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-up">
          <ShoppingBag size={48} strokeWidth={1.5} className="mx-auto mb-4 text-muted-foreground opacity-40" />
          <p className="text-lg font-semibold">Your cart is empty</p>
          <p className="text-muted-foreground text-sm mt-1">Add items from the menu to get started</p>
          <Button className="mt-5 rounded-xl press-active" onClick={() => navigate(restaurantSlug ? `/m/${restaurantSlug}` : '/restaurants')}>
            Browse Menu
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-up">
        <Button variant="ghost" size="sm" className="gap-2 mb-5 -ml-2 rounded-xl" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} strokeWidth={2} /> Back to Menu
        </Button>
        <h1 className="text-2xl font-bold mb-1">Your Cart</h1>
        {restaurant && (
          <p className="text-sm text-muted-foreground mb-6">
            From: <span className="font-medium text-foreground">{restaurant.name}</span>
          </p>
        )}

        {/* Items */}
        <Card className="mb-5 rounded-2xl border-border/60">
          <CardContent className="p-0 divide-y divide-border">
            {items.map((item) => (
              <div key={item.menuItemId} className="flex items-center gap-3 p-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-muted">
                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-primary text-sm font-semibold">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg" onClick={() => update(item.menuItemId, -1)}>
                    {item.quantity === 1 ? <Trash2 size={11} strokeWidth={2} className="text-destructive" /> : <Minus size={11} strokeWidth={2} />}
                  </Button>
                  <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                  <Button size="icon" className="h-7 w-7 rounded-lg" onClick={() => update(item.menuItemId, 1)}>
                    <Plus size={11} strokeWidth={2} />
                  </Button>
                </div>
                <p className="w-16 text-right font-semibold text-sm shrink-0">₹{(item.price * item.quantity).toFixed(0)}</p>
              </div>
            ))}
            <div className="flex justify-between items-center px-4 py-3.5 bg-muted/50 rounded-b-2xl">
              <span className="font-bold">Total</span>
              <span className="font-bold text-primary text-xl">₹{total.toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Customer details */}
        <Card className="mb-5 rounded-2xl border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base">Your Details</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div>
              <Label htmlFor="cname" className="text-sm font-normal text-muted-foreground">Full Name</Label>
              <Input id="cname" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 rounded-xl" />
              {errors.name && <p className="text-destructive text-xs mt-1 animate-fade-in">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="cphone" className="text-sm font-normal text-muted-foreground">Phone Number</Label>
              <Input id="cphone" placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 rounded-xl" maxLength={10} inputMode="numeric" />
              {errors.phone && <p className="text-destructive text-xs mt-1 animate-fade-in">{errors.phone}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Payment method — pill toggle */}
        <Card className="mb-7 rounded-2xl border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base">Payment Method</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-3">
              <button
                onClick={() => setPayment('cash')}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all press-active ${payment === 'cash' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
              >
                <Banknote size={20} strokeWidth={1.5} className={payment === 'cash' ? 'text-primary' : 'text-muted-foreground'} />
                <span className={`text-sm font-medium ${payment === 'cash' ? 'text-primary' : 'text-muted-foreground'}`}>Cash</span>
              </button>
              <button
                onClick={() => setPayment('online')}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all press-active ${payment === 'online' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
              >
                <CreditCard size={20} strokeWidth={1.5} className={payment === 'online' ? 'text-primary' : 'text-muted-foreground'} />
                <span className={`text-sm font-medium ${payment === 'online' ? 'text-primary' : 'text-muted-foreground'}`}>Online</span>
              </button>
            </div>
            {payment === 'online' && restaurant?.paymentInfo && (
              <div className="mt-3 p-3 bg-muted rounded-xl text-sm animate-fade-in">
                <p className="font-medium mb-1">Payment Details:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{restaurant.paymentInfo}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Button className="w-full h-13 text-base rounded-xl press-active animate-glow-pulse" onClick={placeOrder} disabled={placing}>
          {placing ? 'Placing Order...' : `Place Order • ₹${total.toFixed(0)}`}
        </Button>
      </div>
    </PublicLayout>
  );
}
