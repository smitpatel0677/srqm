import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, ArrowLeft, Star, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PublicLayout from '@/components/layouts/PublicLayout';
import StarRating from '@/components/common/StarRating';
import { restaurantStore, reviewStore } from '@/store';

export default function RestaurantProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [ratingFilter, setRatingFilter] = useState(0);

  const restaurant = restaurantStore.getBySlug(slug!);
  const reviews = useMemo(() => restaurant ? reviewStore.getByRestaurant(restaurant.id) : [], [restaurant]);

  if (!restaurant) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <UtensilsCrossed size={40} strokeWidth={1.5} className="mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-xl font-semibold">Restaurant not found</p>
          <Button className="mt-4 rounded-xl" onClick={() => navigate('/restaurants')}>Browse Restaurants</Button>
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

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const filteredReviews = ratingFilter === 0 ? reviews : reviews.filter((r) => r.rating === ratingFilter);

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        <Button variant="ghost" size="sm" className="gap-2 mb-5 -ml-2 rounded-xl" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} strokeWidth={2} /> Back
        </Button>

        {/* Restaurant header card */}
        <Card className="mb-7 rounded-3xl border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex gap-5 items-start flex-wrap">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                {restaurant.logo
                  ? <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover" />
                  : <span className="text-3xl font-bold text-muted-foreground">{restaurant.name[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-balance">{restaurant.name}</h1>
                <div className="flex items-center gap-1 text-muted-foreground mt-1.5">
                  <MapPin size={13} strokeWidth={2} className="shrink-0" />
                  <span className="text-sm">{restaurant.location}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                  <Phone size={13} strokeWidth={2} className="shrink-0" />
                  <span className="text-sm">{restaurant.phone}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <StarRating value={Math.round(avgRating)} readonly size={16} />
                  <span className="text-sm text-muted-foreground">
                    {avgRating > 0 ? avgRating.toFixed(1) : '—'} ({reviews.length} reviews)
                  </span>
                </div>
              </div>
              <Button className="rounded-xl press-active shrink-0" onClick={() => navigate(`/m/${restaurant.slug}`)}>
                View Menu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-bold">Customer Reviews</h2>
          {/* Rating filter chips */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setRatingFilter(0)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${ratingFilter === 0 ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-transparent hover:border-border'}`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((n) => (
              <button
                key={n}
                onClick={() => setRatingFilter(n)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-0.5 ${ratingFilter === n ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-transparent hover:border-border'}`}
              >
                {n}<Star size={9} fill="currentColor" strokeWidth={0} className="mt-px" />
              </button>
            ))}
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-2xl animate-fade-in">
            <p className="font-medium">No reviews yet{ratingFilter !== 0 ? ' for this rating' : ''}</p>
            <p className="text-sm mt-1 text-muted-foreground">Be the first to review after ordering</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...filteredReviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((rev, i) => (
              <Card key={rev.id} className={`rounded-2xl border-border/60 animate-fade-up stagger-${Math.min(i + 1, 9)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {rev.reviewerName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{rev.reviewerName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <StarRating value={rev.rating} readonly size={14} />
                  </div>
                  {rev.text && <p className="text-sm text-muted-foreground mt-2.5 text-pretty pl-11">{rev.text}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
