import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, UtensilsCrossed, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PublicLayout from '@/components/layouts/PublicLayout';
import StarRating from '@/components/common/StarRating';
import { restaurantStore, reviewStore } from '@/store';

const RATING_CHIPS = ['All', '5★', '4★+', '3★+'];

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [locationFilter, setLocationFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');

  const restaurants = restaurantStore.getAll().filter((r) => !r.suspended);

  const enriched = useMemo(() =>
    restaurants.map((r) => {
      const reviews = reviewStore.getByRestaurant(r.id);
      const avg = reviews.length ? reviews.reduce((s, v) => s + v.rating, 0) / reviews.length : 0;
      return { ...r, avgRating: avg, reviewCount: reviews.length };
    }), []);

  const locations = useMemo(() => ['All', ...new Set(restaurants.map((r) => r.location).filter(Boolean))], [restaurants]);

  const filtered = useMemo(() =>
    enriched.filter((r) => {
      const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase());
      const matchLoc = locationFilter === 'All' || r.location === locationFilter;
      const minRating = ratingFilter === '5★' ? 5 : ratingFilter === '4★+' ? 4 : ratingFilter === '3★+' ? 3 : 0;
      const matchRating = Math.round(r.avgRating) >= minRating;
      return matchSearch && matchLoc && matchRating;
    }), [enriched, search, locationFilter, ratingFilter]);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-7 animate-fade-up">
          <h1 className="text-2xl md:text-3xl font-bold text-balance">Browse Restaurants</h1>
          <p className="text-muted-foreground text-sm mt-1">{restaurants.length} restaurants available</p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mb-5 animate-fade-up stagger-1">
          <Search size={16} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl h-11"
          />
        </div>

        {/* Filter chips — Location */}
        {locations.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-3 animate-fade-up stagger-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
              <MapPin size={11} strokeWidth={2} /> City:
            </span>
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setLocationFilter(loc)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  locationFilter === loc
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-secondary-foreground border-transparent hover:border-border'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        )}

        {/* Filter chips — Rating */}
        <div className="flex flex-wrap gap-2 mb-7 animate-fade-up stagger-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">Rating:</span>
          {RATING_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setRatingFilter(chip)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                ratingFilter === chip
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-secondary-foreground border-transparent hover:border-border'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground animate-fade-in">
            <UtensilsCrossed size={40} strokeWidth={1.5} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No restaurants found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r, i) => (
              <Card
                key={r.id}
                className={`h-full cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 rounded-2xl border-border/60 animate-fade-up stagger-${Math.min(i + 1, 9)}`}
                onClick={() => navigate(`/r/${r.slug}`)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                      {r.logo
                        ? <img src={r.logo} alt={r.name} className="w-full h-full object-cover" />
                        : <span className="text-2xl font-bold text-muted-foreground">{r.name[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{r.name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                        <MapPin size={12} strokeWidth={2} className="shrink-0" />
                        <span className="truncate">{r.location}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <StarRating value={Math.round(r.avgRating)} readonly size={13} />
                        <span className="text-xs text-muted-foreground">
                          {r.avgRating > 0 ? r.avgRating.toFixed(1) : 'No reviews'} ({r.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1 h-8 text-xs rounded-xl press-active"
                      onClick={(e) => { e.stopPropagation(); navigate(`/m/${r.slug}`); }}
                    >
                      View Menu
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs px-3 rounded-xl"
                      onClick={(e) => { e.stopPropagation(); navigate(`/r/${r.slug}`); }}
                    >
                      <ArrowRight size={12} strokeWidth={2} />
                    </Button>
                  </div>
                  {r.avgRating >= 4.5 && (
                    <Badge className="mt-2 text-xs rounded-full bg-accent text-accent-foreground">Top Rated</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
