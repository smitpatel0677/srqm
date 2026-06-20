import { useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import StarRating from '@/components/common/StarRating';
import { reviewStore, restaurantStore } from '@/store';
import { toast } from 'sonner';

export default function AdminReviewsPage() {
  const restaurants = restaurantStore.getAll();
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [reviews, setReviews] = useState(() => reviewStore.getAll());

  const refresh = useCallback(() => setReviews(reviewStore.getAll()), []);

  const deleteReview = (id: string) => {
    reviewStore.delete(id);
    refresh();
    toast.success('Review deleted');
  };

  const filtered = selectedRestaurant === 'all'
    ? reviews
    : reviews.filter((r) => r.restaurantId === selectedRestaurant);

  const getRestaurantName = (id: string) => restaurantStore.getById(id)?.name ?? 'Unknown';

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
          <SelectTrigger className="w-56 rounded-xl"><SelectValue placeholder="All Restaurants" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Restaurants</SelectItem>
            {restaurants.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl text-muted-foreground animate-fade-in">No reviews found.</div>
      ) : (
        <div className="space-y-3">
          {[...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((rev, i) => (
            <Card key={rev.id} className={`rounded-2xl border-border/60 animate-fade-up stagger-${Math.min(i + 1, 9)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-medium text-sm">{rev.reviewerName}</p>
                      <StarRating value={rev.rating} readonly size={13} />
                      <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{getRestaurantName(rev.restaurantId)}</span>
                    </div>
                    {rev.text && <p className="text-sm text-muted-foreground text-pretty">{rev.text}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(rev.createdAt).toLocaleString()}</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl text-destructive hover:text-destructive shrink-0">
                        <Trash2 size={14} strokeWidth={2} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-3xl">
                      <AlertDialogHeader><AlertDialogTitle>Delete Review?</AlertDialogTitle><AlertDialogDescription>This will permanently remove this review.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteReview(rev.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
