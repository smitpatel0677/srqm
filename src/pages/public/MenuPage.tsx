import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Plus, Minus, Phone, MapPin, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PublicLayout from '@/components/layouts/PublicLayout';
import { restaurantStore, menuStore, categoryStore, cartStore } from '@/store';
import type { CartItem } from '@/types';

export default function MenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = cartStore.get();
    return saved && saved.restaurantSlug === slug ? saved.items : [];
  });

  const restaurant = restaurantStore.getBySlug(slug!);
  const items = useMemo(() => restaurant ? menuStore.getByRestaurant(restaurant.id) : [], [restaurant]);
  const categories = useMemo(() => restaurant ? categoryStore.getByRestaurant(restaurant.id) : [], [restaurant]);

  const updateCart = useCallback((newCart: CartItem[]) => {
    setCart(newCart);
    cartStore.set({ restaurantSlug: slug!, items: newCart });
  }, [slug]);

  const addItem = (item: typeof items[0]) => {
    const existing = cart.find((c) => c.menuItemId === item.id);
    if (existing) {
      updateCart(cart.map((c) => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      updateCart([...cart, { menuItemId: item.id, name: item.name, image: item.image, price: item.price, quantity: 1 }]);
    }
  };

  const removeItem = (itemId: string) => {
    const existing = cart.find((c) => c.menuItemId === itemId);
    if (!existing) return;
    if (existing.quantity <= 1) {
      updateCart(cart.filter((c) => c.menuItemId !== itemId));
    } else {
      updateCart(cart.map((c) => c.menuItemId === itemId ? { ...c, quantity: c.quantity - 1 } : c));
    }
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  if (!restaurant) {
    return (
      <PublicLayout>
        <div className="text-center py-20 text-muted-foreground">
          <UtensilsCrossed size={40} strokeWidth={1.5} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Restaurant not found.</p>
        </div>
      </PublicLayout>
    );
  }
  if (restaurant.suspended) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-xl font-semibold text-destructive">This restaurant is currently unavailable</p>
          <Button className="mt-4 rounded-xl" onClick={() => navigate('/restaurants')}>Browse Restaurants</Button>
        </div>
      </PublicLayout>
    );
  }

  const filtered = items.filter((i) => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || i.categoryId === activeCategory;
    return matchSearch && matchCat;
  });

  const grouped = categories.length > 0
    ? categories
        .map((cat) => ({ cat, items: filtered.filter((i) => i.categoryId === cat.id) }))
        .concat([{ cat: { id: 'uncategorized', name: 'Other', restaurantId: restaurant.id, createdAt: '' }, items: filtered.filter((i) => !i.categoryId) }])
        .filter((g) => g.items.length > 0)
    : [{ cat: null, items: filtered }];

  return (
    <PublicLayout showGetStarted={false}>
      {/* Sticky restaurant header */}
      <div className="bg-background/95 backdrop-blur-md border-b border-border sticky top-16 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
            {restaurant.logo
              ? <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover" />
              : <span className="font-bold text-muted-foreground text-sm">{restaurant.name[0]}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate">{restaurant.name}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin size={10} strokeWidth={2} />{restaurant.location}</span>
              <span className="flex items-center gap-1"><Phone size={10} strokeWidth={2} />{restaurant.phone}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-36">
        {/* Search */}
        <div className="py-4 relative">
          <Search size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl" />
        </div>

        {/* Category tabs */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 whitespace-nowrap" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all shrink-0 press-active ${activeCategory === 'all' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all shrink-0 press-active ${activeCategory === cat.id ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Menu groups */}
        {grouped.map(({ cat, items: groupItems }) => (
          <div key={cat?.id ?? 'all'} className="mb-8">
            {cat && (
              <h2 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-widest px-1">{cat.name}</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groupItems.map((item, i) => {
                const inCart = cart.find((c) => c.menuItemId === item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex gap-3 p-3 border border-border/60 rounded-2xl bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200 animate-fade-up stagger-${Math.min(i + 1, 9)}`}
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <span className="font-bold text-muted-foreground text-sm">{item.name[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="font-semibold text-sm leading-snug">{item.name}</p>
                        {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 text-pretty">{item.description}</p>}
                        <p className="text-primary font-bold mt-1.5 text-base">₹{item.price}</p>
                      </div>
                      {inCart ? (
                        <div className="flex items-center gap-2 mt-2">
                          <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg" onClick={() => removeItem(item.id)}>
                            <Minus size={12} strokeWidth={2} />
                          </Button>
                          <span className="text-sm font-bold w-5 text-center">{inCart.quantity}</span>
                          <Button size="icon" className="h-7 w-7 rounded-lg" onClick={() => addItem(item)}>
                            <Plus size={12} strokeWidth={2} />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" className="mt-2 h-7 text-xs gap-1 self-start rounded-lg press-active" onClick={() => addItem(item)}>
                          <Plus size={11} strokeWidth={2} /> Add
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground animate-fade-in">
            <UtensilsCrossed size={32} strokeWidth={1.5} className="mx-auto mb-2 opacity-40" />
            <p className="font-medium">No items found</p>
          </div>
        )}
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-4xl mx-auto animate-fade-up">
          <Button
            className="w-full gap-3 h-14 text-base rounded-2xl shadow-xl press-active animate-glow-pulse"
            onClick={() => navigate(`/cart?restaurant=${slug}`)}
          >
            <ShoppingCart size={18} strokeWidth={2} />
            <span className="flex-1 text-left">View Cart</span>
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 rounded-full px-2.5">{cartCount}</Badge>
            <span className="font-bold">₹{cartTotal.toFixed(0)}</span>
          </Button>
        </div>
      )}
    </PublicLayout>
  );
}
