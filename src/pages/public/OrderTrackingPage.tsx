import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Package, Download, Phone, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/components/layouts/PublicLayout';
import StarRating from '@/components/common/StarRating';
import { orderStore, restaurantStore, reviewStore, uuid, LOGO_URL } from '@/store';
import { toast } from 'sonner';
import type { Order } from '@/types';
import jsPDF from 'jspdf';

type StatusKey = Order['status'];

const STEPS: { key: StatusKey; label: string; desc: string; icon: typeof Clock }[] = [
  { key: 'pending', label: 'Order Placed', desc: 'Waiting for restaurant confirmation', icon: Clock },
  { key: 'accepted', label: 'Accepted', desc: 'Restaurant is preparing your order', icon: CheckCircle },
  { key: 'completed', label: 'Completed', desc: 'Your order is ready', icon: Package },
];

const STEP_ORDER: StatusKey[] = ['pending', 'accepted', 'completed'];

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(() => orderStore.getById(orderId!) ?? null);
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const prevStatus = useRef(order?.status);

  useEffect(() => {
    const interval = setInterval(() => {
      const fresh = orderStore.getById(orderId!);
      if (fresh) {
        setOrder({ ...fresh });
        if (prevStatus.current !== fresh.status) {
          prevStatus.current = fresh.status;
          if (fresh.status === 'completed' && !fresh.reviewSubmitted) {
            setTimeout(() => setShowReview(true), 800);
          }
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [orderId]);

  const submitReview = () => {
    if (!order) return;
    const restaurant = restaurantStore.getById(order.restaurantId);
    if (!restaurant) return;
    reviewStore.save({
      id: uuid(),
      restaurantId: order.restaurantId,
      orderId: order.id,
      reviewerName: order.customerName,
      rating: reviewRating,
      text: reviewText,
      createdAt: new Date().toISOString(),
    });
    orderStore.save({ ...order, reviewSubmitted: true });
    setOrder({ ...order, reviewSubmitted: true });
    setShowReview(false);
    toast.success('Thank you for your review!');
  };

  const downloadBill = async () => {
    if (!order) return;
    const restaurant = restaurantStore.getById(order.restaurantId);
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });
    const w = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    let y = 10;

    // ── Header background strip ───────────────────────────────────────
    doc.setFillColor(11, 17, 32); // dark navy #0B1120
    doc.rect(0, 0, w, 42, 'F');

    // ── Logo (restaurant logo or SQRM brand logo) ─────────────────────
    const logoSrc = restaurant?.logo || LOGO_URL;
    let logoLoaded = false;

    if (logoSrc) {
      try {
        // If base64 data URL — use directly
        if (logoSrc.startsWith('data:image')) {
          const ext = logoSrc.startsWith('data:image/png') ? 'PNG' : 'JPEG';
          doc.addImage(logoSrc, ext, w / 2 - 14, y, 28, 28);
          logoLoaded = true;
        } else {
          // Remote URL — fetch and convert to base64
          const resp = await fetch(logoSrc, { mode: 'no-cors' });
          const blob = await resp.blob();
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          const ext = base64.startsWith('data:image/png') ? 'PNG' : 'JPEG';
          doc.addImage(base64, ext, w / 2 - 14, y, 28, 28);
          logoLoaded = true;
        }
      } catch {
        logoLoaded = false;
      }
    }

    if (!logoLoaded) {
      // Initials circle fallback
      doc.setFillColor(249, 115, 22); // orange
      doc.circle(w / 2, y + 14, 14, 'F');
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      const initial = (restaurant?.name || 'R')[0].toUpperCase();
      doc.text(initial, w / 2, y + 19, { align: 'center' });
    }

    y += 32;

    // ── Restaurant name in header ────────────────────────────────────
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text((restaurant?.name || 'Restaurant').toUpperCase(), w / 2, y, { align: 'center' });
    y += 5.5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    const headerMeta = [restaurant?.location, restaurant?.phone].filter(Boolean).join('  ·  ');
    if (headerMeta) { doc.text(headerMeta, w / 2, y, { align: 'center' }); }
    y += 12;

    // ── BILL / TAX INVOICE title ──────────────────────────────────────
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(249, 115, 22); // orange accent
    doc.text('BILL / TAX INVOICE', w / 2, y, { align: 'center' });
    y += 8;

    // ── Divider ──────────────────────────────────────────────────────
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(10, y, w - 10, y);
    y += 7;

    // ── Order meta — 2-column grid ────────────────────────────────────
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    const metaRows: [string, string][] = [
      ['Order ID', `#${order.id.slice(0, 8).toUpperCase()}`],
      ['Date', new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })],
      ['Customer', order.customerName],
      ['Payment', order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'],
    ];

    for (const [label, value] of metaRows) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(label, 12, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(value, w - 12, y, { align: 'right' });
      y += 6;
    }

    y += 3;

    // ── Items table header ────────────────────────────────────────────
    doc.setFillColor(245, 245, 245);
    doc.rect(10, y - 3, w - 20, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text('ITEM', 14, y + 2);
    doc.text('QTY', w * 0.62, y + 2, { align: 'center' });
    doc.text('AMOUNT', w - 12, y + 2, { align: 'right' });
    y += 9;

    // ── Items rows ───────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const amount = `\u20B9${(item.price * item.quantity).toFixed(2)}`;
      if (i % 2 === 0) {
        doc.setFillColor(252, 252, 252);
        doc.rect(10, y - 4, w - 20, 7, 'F');
      }
      doc.setTextColor(30, 30, 30);
      doc.text(item.name, 14, y);
      doc.setTextColor(80, 80, 80);
      doc.text(`x${item.quantity}`, w * 0.62, y, { align: 'center' });
      doc.setTextColor(30, 30, 30);
      doc.text(amount, w - 12, y, { align: 'right' });
      y += 7;
    }

    // ── Total bar ────────────────────────────────────────────────────
    y += 2;
    doc.setFillColor(11, 17, 32);
    doc.rect(10, y - 3, w - 20, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL', 14, y + 4);
    doc.setTextColor(249, 115, 22);
    doc.text(`\u20B9${order.total.toFixed(2)}`, w - 12, y + 4, { align: 'right' });
    y += 16;

    // ── Thank you note ───────────────────────────────────────────────
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Thank you for dining with us!', w / 2, y, { align: 'center' });
    y += 6;

    // ── Footer ───────────────────────────────────────────────────────
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    const disclaimer = 'This is a digital receipt generated by Saksham Digi QR Menu. For official billing, please ask the restaurant for a formal invoice.';
    const lines = doc.splitTextToSize(disclaimer, w - 24);
    doc.text(lines, w / 2, y, { align: 'center' });

    const footerY = pageH - 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text('Powered by Saksham Digi QR Menu · sqrm.srpdigitalstudios.qzz.io', w / 2, footerY, { align: 'center' });

    doc.save(`SQRM-Bill-${order.id.slice(0, 8).toUpperCase()}.pdf`);
  };

  if (!order) {
    return (
      <PublicLayout>
        <div className="text-center py-20 text-muted-foreground">
          <p className="font-medium">Order not found.</p>
          <Button variant="link" className="mt-2" onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </PublicLayout>
    );
  }

  const restaurant = restaurantStore.getById(order.restaurantId);
  const currentStepIndex = order.status === 'rejected' ? -1 : STEP_ORDER.indexOf(order.status);

  return (
    <PublicLayout>
      <div className="max-w-lg mx-auto px-4 py-8 animate-fade-up">
        <h1 className="text-2xl font-bold mb-1">Order Status</h1>
        <p className="text-muted-foreground text-sm mb-7">
          #{order.id.slice(0, 8).toUpperCase()} {restaurant && <>• <span className="text-foreground font-medium">{restaurant.name}</span></>}
        </p>

        {/* Status timeline */}
        {order.status !== 'rejected' ? (
          <Card className="mb-6 rounded-2xl border-border/60">
            <CardContent className="p-5">
              <div className="space-y-0">
                {STEPS.map(({ key, label, desc, icon: Icon }, idx) => {
                  const done = currentStepIndex >= idx;
                  const active = currentStepIndex === idx;
                  return (
                    <div key={key} className="flex gap-4 items-start">
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${done ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'} ${active ? 'ring-4 ring-primary/20' : ''}`}>
                          <Icon size={16} strokeWidth={2} />
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div className={`w-0.5 h-8 mt-1 rounded transition-all duration-500 ${currentStepIndex > idx ? 'bg-primary' : 'bg-border'}`} />
                        )}
                      </div>
                      <div className={`pt-1.5 pb-5 last:pb-0 ${active ? '' : 'opacity-70'}`}>
                        <p className={`text-sm font-semibold ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                        {active && order.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Waiting...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {order.status === 'completed' && (
                <Button className="w-full mt-4 gap-2 rounded-xl press-active" onClick={downloadBill}>
                  <Download size={15} strokeWidth={2} /> Download PDF Bill
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 rounded-2xl border-destructive/40 bg-destructive/5">
            <CardContent className="p-5 flex gap-3">
              <XCircle size={22} strokeWidth={1.5} className="text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Order Rejected</p>
                <p className="text-sm text-muted-foreground mt-0.5">{order.rejectionReason || 'No reason provided'}</p>
                {restaurant?.phone && (
                  <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1 mt-2 text-sm text-primary hover:underline">
                    <Phone size={13} strokeWidth={2} /> {restaurant.phone}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order summary */}
        <Card className="rounded-2xl border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.menuItemId} className="flex justify-between items-center px-4 py-3 text-sm">
                  <span className="text-foreground">
                    {item.name} <span className="text-muted-foreground text-xs">x{item.quantity}</span>
                  </span>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center px-4 py-3.5 bg-muted/50 rounded-b-2xl font-bold">
                <span>Total</span>
                <span className="text-primary text-lg">₹{order.total.toFixed(0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle>How was your experience?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-2">
              <p className="text-muted-foreground text-sm">Rate {restaurant?.name}</p>
              <StarRating value={reviewRating} onChange={setReviewRating} size={36} />
            </div>
            <Textarea
              placeholder="Write a review (optional)..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
              className="rounded-xl"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowReview(false)}>Skip</Button>
              <Button className="flex-1 gap-2 rounded-xl press-active" onClick={submitReview}>
                <Star size={14} strokeWidth={2} /> Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
