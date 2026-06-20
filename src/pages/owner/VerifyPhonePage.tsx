import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Logo from '@/components/common/Logo';
import { ownerStore } from '@/store';
import { toast } from 'sonner';

function validatePhone(p: string) {
  const clean = p.replace(/\D/g, '');
  if (clean.length !== 10) return 'Phone must be 10 digits';
  if (clean === '1234567890' || clean === '0987654321') return 'Please enter a valid phone number';
  return '';
}

export default function VerifyPhonePage() {
  const navigate = useNavigate();
  const owner = ownerStore.getCurrent();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  if (!owner) {
    navigate('/owner/login');
    return null;
  }

  const handleSubmit = () => {
    const err = validatePhone(phone);
    if (err) { setError(err); return; }
    const updated = { ...owner, phone: phone.trim() };
    ownerStore.save(updated);
    ownerStore.setCurrent(updated);
    toast.success('Phone verified! Welcome aboard.');
    navigate('/owner/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-3" />
          <p className="text-muted-foreground text-sm">Almost there!</p>
        </div>
        <Card className="rounded-3xl border-border/60 shadow-xl">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-xl">Verify Phone Number</CardTitle>
            <CardDescription>We need your number to complete account setup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="phone" className="text-sm font-normal text-muted-foreground">Mobile Number</Label>
              <Input
                id="phone"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                maxLength={10}
                inputMode="numeric"
                className="mt-1 rounded-xl h-12 text-base"
              />
              {error && <p className="text-destructive text-xs mt-1.5 flex items-center gap-1">{error}</p>}
            </div>
            <Button className="w-full h-12 rounded-xl press-active" onClick={handleSubmit}>Verify &amp; Continue</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
