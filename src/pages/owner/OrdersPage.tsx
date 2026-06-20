import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Package, Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ownerStore, restaurantStore, orderStore, getOwnerPlan, planHas } from '@/store';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@/types';

const statusColor: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  accepted: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30',
  rejected: 'bg-destructive/10 text-destructive border-destructive/30',
  completed: 'bg-primary/10 text-primary border-primary/30',
};

// Play ding — try /ding.mp3 first, fallback to Web Audio API tone
function playDing() {
  const audio = new Audio('/ding.mp3');
  audio.play().catch(() => {
    // Web Audio API fallback — pleasant 880Hz tone
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  });
}

export default function OrdersPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const owner = ownerStore.getCurrent();
  const restaurant = id ? restaurantStore.getById(id) : null;
  const plan = owner ? getOwnerPlan(owner) : 'free';
  const canFilter = planHas(plan, 'orderFilter');

  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; orderId: string }>({ open: false, orderId: '' });
  const [rejectReason, setRejectReason] = useState('');
  const prevCount = useRef(0);

  const refresh = useCallback(() => {
    if (!id) return;
    const fresh = orderStore.getByRestaurant(id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const newPending = fresh.filter((o) => o.status === 'pending').length;
    if (prevCount.current > 0 && newPending > prevCount.current) {
      toast.info('New order received!', { icon: <Bell size={16} strokeWidth={2} /> });
      playDing();
    }
    prevCount.current = newPending;
    setOrders(fresh);
  }, [id]);

  useEffect(() => {
    if (!owner || !restaurant) { navigate('/owner/dashboard'); return; }
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [owner, restaurant, navigate, refresh, location.key]);

  const updateStatus = (orderId: string, status: OrderStatus, reason?: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    orderStore.save({ ...order, status, rejectionReason: reason, updatedAt: new Date().toISOString() });
    refresh();
    toast.success(`Order marked as ${status}`);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) { toast.error('Please enter a rejection reason'); return; }
    updateStatus(rejectDialog.orderId, 'rejected', rejectReason);
    setRejectDialog({ open: false, orderId: '' });
    setRejectReason('');
  };

  const filtered = canFilter && filter !== 'all'
    ? orders.filter((o) => o.status === filter)
    : orders;

  if (!restaurant) return null;

  const pending = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-up">
      <Button variant="ghost" size="sm" className="gap-2 mb-3 -ml-2 rounded-xl" onClick={() => navigate(-1)}>
        <ArrowLeft size={14} strokeWidth={2} /> Back
      </Button>
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Orders
            {pending > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold animate-badge-bounce">
                {pending}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">{restaurant.name}</p>
        </div>
        {canFilter ? (
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36 rounded-xl"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-xl border border-input bg-background px-3 py-1.5 text-sm font-medium opacity-50 cursor-not-allowed select-none">
            Filter (Basic+)
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl animate-fade-in">
          <Clock size={40} strokeWidth={1.5} className="mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground font-medium">No orders yet</p>
          <p className="text-sm text-muted-foreground mt-1">Orders appear here in real-time</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => (
            <Card
              key={order.id}
              className={`rounded-2xl border-border/60 hover:shadow-md transition-all duration-200 animate-fade-up stagger-${Math.min(i + 1, 9)} ${order.status === 'pending' ? 'ring-1 ring-yellow-500/30' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <Badge variant="outline" className={`text-xs border capitalize rounded-full ${statusColor[order.status]}`}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm mt-0.5 font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerPhone} · {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="font-bold text-primary shrink-0 text-lg">₹{order.total.toFixed(0)}</p>
                </div>

                <div className="bg-muted/50 rounded-xl p-3 mb-3 text-sm space-y-1.5">
                  {order.items.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between text-sm">
                      <span>{item.name} <span className="text-muted-foreground text-xs">x{item.quantity}</span></span>
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  Payment: <span className="font-medium text-foreground">{order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online'}</span>
                </p>

                {order.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1.5 flex-1 h-9 rounded-xl press-active" onClick={() => updateStatus(order.id, 'accepted')}>
                      <CheckCircle size={13} strokeWidth={2} /> Accept
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1.5 flex-1 h-9 rounded-xl press-active" onClick={() => { setRejectDialog({ open: true, orderId: order.id }); setRejectReason(''); }}>
                      <XCircle size={13} strokeWidth={2} /> Reject
                    </Button>
                  </div>
                )}
                {order.status === 'accepted' && (
                  <Button size="sm" className="gap-1.5 h-9 w-full rounded-xl press-active" onClick={() => updateStatus(order.id, 'completed')}>
                    <Package size={13} strokeWidth={2} /> Mark as Completed
                  </Button>
                )}
                {order.status === 'rejected' && order.rejectionReason && (
                  <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">Reason: {order.rejectionReason}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={rejectDialog.open} onOpenChange={(o) => setRejectDialog((p) => ({ ...p, open: o }))}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-3xl">
          <DialogHeader><DialogTitle>Reject Order</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">The customer will see this reason.</p>
            <Textarea
              placeholder="e.g. Item unavailable, kitchen closed..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="rounded-xl"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setRejectDialog({ open: false, orderId: '' })}>Cancel</Button>
              <Button variant="destructive" className="flex-1 rounded-xl press-active" onClick={handleReject}>Reject Order</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
