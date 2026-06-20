import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Logo from '@/components/common/Logo';
import { adminStore } from '@/store';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError('');
    setLoading(true);
    // Exact string match only — no bypass possible
    setTimeout(() => {
      if (adminStore.validate(email, password)) {
        adminStore.setSession(true);
        toast.success('Welcome, Admin!');
        navigate('/admin1/dashboard');
      } else {
        setError('Invalid email or password');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-3" />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            <ShieldCheck size={12} strokeWidth={2} /> Admin Panel
          </span>
        </div>
        <Card className="rounded-3xl border-border/60 shadow-xl">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-xl">Admin Sign In</CardTitle>
            <CardDescription>Restricted access. Authorized personnel only.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <Label htmlFor="aemail">Email</Label>
              <Input
                id="aemail"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 rounded-xl"
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="apass">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="apass"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="rounded-xl pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPwd(!showPwd)}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={15} strokeWidth={2} /> : <Eye size={15} strokeWidth={2} />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-destructive text-sm flex items-center gap-1.5 animate-fade-in">
                <ShieldCheck size={13} strokeWidth={2} /> {error}
              </p>
            )}
            <Button className="w-full h-11 rounded-xl press-active" onClick={handleLogin} disabled={loading}>
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : 'Sign In'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
