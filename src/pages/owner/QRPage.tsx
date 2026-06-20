import { useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { restaurantStore, ownerStore, LOGO_URL, settingsStore } from '@/store';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function QRPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const owner = ownerStore.getCurrent();
  const restaurant = id ? restaurantStore.getById(id) : null;
  const qrRef = useRef<HTMLDivElement>(null);
  const settings = settingsStore.get();

  if (!owner || !restaurant) { navigate('/owner/dashboard'); return null; }

  const menuUrl = `${window.location.origin}/m/${restaurant.slug}`;
  const siteName = settings.siteName || 'Saksham Digi QR Menu';

  const downloadPNG = useCallback(async () => {
    if (!qrRef.current) return;
    const canvas = await html2canvas(qrRef.current, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
    const link = document.createElement('a');
    link.download = `qr-${restaurant.slug}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [restaurant.slug]);

  const downloadPDF = useCallback(async () => {
    if (!qrRef.current) return;
    const canvas = await html2canvas(qrRef.current, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ unit: 'mm', format: [100, 120] });
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height / canvas.width) * w;
    pdf.addImage(img, 'PNG', 0, 0, w, h);
    pdf.save(`qr-${restaurant.slug}.pdf`);
  }, [restaurant.slug]);

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <Button variant="ghost" size="sm" className="gap-2 mb-4 -ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft size={14} strokeWidth={2} /> Back
      </Button>
      <h1 className="text-2xl font-bold mb-6">QR Code</h1>

      {/* Branded QR card */}
      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-0">
          <div ref={qrRef} className="flex flex-col items-center p-6 bg-white text-gray-900">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <img
                src={restaurant.logo || LOGO_URL}
                alt={restaurant.name}
                className="h-10 w-10 object-contain rounded"
                crossOrigin="anonymous"
              />
              <div>
                <p className="font-bold text-lg leading-tight">{restaurant.name}</p>
                <p className="text-gray-500 text-xs">{restaurant.location}</p>
              </div>
            </div>

            {/* QR */}
            <div className="p-3 border-2 border-gray-200 rounded-lg my-2">
              <QRCodeSVG value={menuUrl} size={200} />
            </div>

            <p className="text-gray-500 text-xs mt-2">Scan to view menu & order</p>
            <p className="text-gray-400 text-xs">{restaurant.phone}</p>

            {/* Footer branding */}
            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 w-full justify-center">
              <img src={LOGO_URL} alt={siteName} className="h-5 w-5 object-contain" crossOrigin="anonymous" />
              <span className="text-gray-400 text-xs">By {siteName}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="gap-2" onClick={downloadPNG}>
          <Download size={15} strokeWidth={2} /> Download PNG
        </Button>
        <Button className="gap-2" onClick={downloadPDF}>
          <Download size={15} strokeWidth={2} /> Download PDF
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Menu URL: <a href={menuUrl} target="_blank" rel="noreferrer" className="text-primary underline break-all">{menuUrl}</a>
      </p>
    </div>
  );
}
