import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, QrCode, ShoppingCart, Bell, BarChart2, Star, FileText, Download, Store, Moon, ArrowRight, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PublicLayout from '@/components/layouts/PublicLayout';
import StarRating from '@/components/common/StarRating';
import { restaurantStore, reviewStore, settingsStore } from '@/store';
import { LOGO_URL } from '@/store';

const features = [
  { icon: QrCode, title: 'QR Menu Generator', desc: 'Instant QR codes for tables. Customers scan & order — no app required.' },
  { icon: ShoppingCart, title: 'Digital Ordering', desc: 'Customers add items to cart and place orders from their phone.' },
  { icon: Bell, title: 'Live Order Alerts', desc: 'Real-time notifications with sound when new orders arrive.' },
  { icon: BarChart2, title: 'Revenue Analytics', desc: 'Track daily, monthly, lifetime earnings and best-selling items.' },
  { icon: Star, title: 'Ratings & Reviews', desc: 'Collect customer feedback and build your online reputation.' },
  { icon: FileText, title: 'PDF Receipts', desc: 'Auto-generate and print order receipts in one click.' },
  { icon: Download, title: 'QR Download', desc: 'Download QR code as PNG or PDF. Print and place on tables.' },
  { icon: Store, title: 'Multi-Restaurant', desc: 'Manage multiple branches from a single owner account.' },
  { icon: Moon, title: 'Dark Mode', desc: 'Full dark and light theme support for comfortable use anytime.' },
];

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: '',
    highlight: false,
    features: ['1 Restaurant', '20 Menu Items', 'QR Code Generation & Download', 'Customer Digital Ordering', 'Live Order Tracking', 'Daily & Monthly Earnings View', 'Customer Ratings & Reviews', 'PDF Receipt per Order'],
  },
  {
    name: 'Basic',
    price: '₹29',
    period: '/month',
    highlight: true,
    features: ['Up to 5 Restaurants', 'Unlimited Menu Items', 'Monthly Analytics Dashboard', 'Best Selling Items Report', 'Menu Categories Management', 'Order History & Filters'],
  },
  {
    name: 'Premium',
    price: '₹49',
    period: '/month',
    highlight: false,
    features: ['Unlimited Restaurants', 'Unlimited Menu Items', 'Lifetime Analytics', 'Popular Categories Insights', 'Most Active Hours Report', 'Custom Restaurant Theme Color'],
  },
];

// Animated counter hook
function useCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

function StatCounter({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const count = useCounter(value);
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-bold text-primary">{count}{suffix}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const settings = settingsStore.get();

  const allRestaurants = restaurantStore.getAll().filter((r) => !r.suspended);
  const topRestaurants = [...allRestaurants]
    .map((r) => {
      const reviews = reviewStore.getByRestaurant(r.id);
      const avg = reviews.length ? reviews.reduce((s, v) => s + v.rating, 0) / reviews.length : 0;
      return { ...r, avgRating: avg, reviewCount: reviews.length };
    })
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/restaurants${search ? `?q=${encodeURIComponent(search)}` : ''}`);
  };

  const handlePlanClick = (planName: string) => {
    if (planName === 'Free') { navigate('/owner/login'); return; }
    const phone = settings.supportPhone || '9876543210';
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(`I would like to purchase ${planName} plan`)}`, '_blank');
  };

  return (
    <PublicLayout>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/8 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-accent/8 rounded-full blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 md:py-28 text-center">
          <Badge variant="secondary" className="mb-5 rounded-full px-4 py-1 gap-1.5 animate-fade-in">
            <Zap size={12} strokeWidth={2} className="text-primary" /> Digital Menu Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-5 text-balance animate-fade-up leading-tight">
            Turn Your Menu Into a<br />
            <span className="gradient-text">Digital Experience</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8 text-pretty animate-fade-up stagger-2">
            Create QR menus, accept orders, track revenue — all in one place. No app needed for customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up stagger-3">
            <Button size="lg" onClick={() => navigate('/owner/login')} className="rounded-xl h-12 px-6 gap-2 press-active animate-glow-pulse">
              Get Started Free <ArrowRight size={16} strokeWidth={2} />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/restaurants')} className="rounded-xl h-12 px-6">
              Browse Restaurants
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card/60">
        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-3 gap-6 divide-x divide-border">
          <StatCounter value={allRestaurants.length || 12} label="Restaurants" suffix="+" />
          <StatCounter value={500} label="Orders Processed" suffix="+" />
          <StatCounter value={8} label="Cities Active" suffix="+" />
        </div>
      </section>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-xl md:text-2xl font-bold mb-5 text-center text-balance">Find a Restaurant Near You</h2>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search size={16} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl h-11"
            />
          </div>
          <Button type="submit" className="rounded-xl h-11 px-5 press-active">Search</Button>
        </form>
      </section>

      {/* ── Featured Restaurants ────────────────────────────────────────── */}
      {topRestaurants.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Top Rated Restaurants</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/restaurants')} className="gap-1 text-primary rounded-xl">
              View all <ArrowRight size={14} strokeWidth={2} />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRestaurants.map((r, i) => (
              <Card
                key={r.id}
                className={`h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer rounded-2xl border-border/60 animate-fade-up stagger-${Math.min(i + 1, 9)}`}
                onClick={() => navigate(`/r/${r.slug}`)}
              >
                <CardContent className="p-4 flex gap-4 items-start">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                    {r.logo
                      ? <img src={r.logo} alt={r.name} className="w-full h-full object-cover" />
                      : <span className="text-xl font-bold text-muted-foreground">{r.name[0]}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{r.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{r.location}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StarRating value={Math.round(r.avgRating)} readonly size={13} />
                      <span className="text-xs text-muted-foreground">({r.reviewCount})</span>
                    </div>
                  </div>
                  <ArrowRight size={14} strokeWidth={2} className="text-muted-foreground shrink-0 mt-1" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="bg-card border-y border-border py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-balance">Everything You Need</h2>
            <p className="text-muted-foreground text-pretty">Powerful features to grow your restaurant business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className={`feature-card animate-fade-up stagger-${Math.min(i + 1, 9)}`}>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon size={20} strokeWidth={2} className="text-primary" />
                </div>
                <p className="font-semibold mb-1">{title}</p>
                <p className="text-sm text-muted-foreground text-pretty">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-balance">Simple, Honest Pricing</h2>
          <p className="text-muted-foreground text-pretty">Start free, upgrade when you need more</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <Card
              key={plan.name}
              className={`h-full flex flex-col rounded-3xl transition-all duration-200 hover:shadow-lg animate-fade-up stagger-${i + 1} ${
                plan.highlight
                  ? 'border-primary shadow-lg ring-2 ring-primary/30 scale-[1.02]'
                  : 'border-border/60'
              }`}
            >
              <CardContent className="p-6 flex flex-col flex-1">
                {plan.highlight && (
                  <Badge className="self-start mb-3 rounded-full bg-primary text-primary-foreground">Most Popular</Badge>
                )}
                <p className="text-lg font-bold">{plan.name} Plan</p>
                <div className="mt-2 mb-5 flex items-end gap-1">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm items-start">
                      <Check size={14} strokeWidth={2.5} className="text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlight ? 'default' : 'outline'}
                  className="w-full rounded-xl press-active"
                  onClick={() => handlePlanClick(plan.name)}
                >
                  {plan.name === 'Free' ? 'Get Started Free' : `Get ${plan.name} — ${plan.price}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <img src={LOGO_URL} alt="Saksham Digi QR Menu" className="h-14 mx-auto mb-5 object-contain" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-balance">Ready to go digital?</h2>
          <p className="mb-7 opacity-85 text-pretty">Join restaurants across India using Saksham Digi QR Menu.</p>
          <Button
            size="lg"
            variant="ghost"
            className="border border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground/10 rounded-xl h-12 px-8 press-active"
            onClick={() => navigate('/owner/login')}
          >
            Start for Free <ArrowRight size={16} strokeWidth={2} />
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
