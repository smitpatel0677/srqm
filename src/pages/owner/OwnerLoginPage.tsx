import { useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Logo from '@/components/common/Logo';
import { ownerStore, uuid } from '@/store';
import { toast } from 'sonner';

// ── Replace this with your real Google OAuth Client ID ──────────────────────
// Get it from: https://console.cloud.google.com/ → APIs & Services → Credentials
// Add Authorized redirect URI: https://sqrm.srpdigitalstudios.qzz.io/owner/login
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
// ─────────────────────────────────────────────────────────────────────────────

/** Decode a Google JWT credential and return { name, email, picture } */
function decodeGoogleJwt(token: string): { name: string; email: string; picture?: string } | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return { name: decoded.name || decoded.email, email: decoded.email, picture: decoded.picture };
  } catch {
    return null;
  }
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (resp: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
    handleGoogleCredential?: (resp: { credential: string }) => void;
  }
}

export default function OwnerLoginPage() {
  const navigate = useNavigate();

  const handleCredential = useCallback(
    (resp: { credential: string }) => {
      const profile = decodeGoogleJwt(resp.credential);
      if (!profile) {
        toast.error('Google sign-in failed. Please try again.');
        return;
      }

      const existing = ownerStore.getByEmail(profile.email);
      if (existing) {
        ownerStore.setCurrent(existing);
        toast.success(`Welcome back, ${existing.name || existing.email}!`);
        navigate('/owner/dashboard');
      } else {
        const newOwner = {
          id: uuid(),
          email: profile.email,
          name: profile.name,
          phone: '',
          plan: 'free' as const,
          createdAt: new Date().toISOString(),
        };
        ownerStore.save(newOwner);
        ownerStore.setCurrent(newOwner);
        toast.success('Account created! Please verify your phone.');
        navigate('/owner/verify-phone');
      }
    },
    [navigate]
  );

  useEffect(() => {
    // Attach callback globally so the GSI script can call it
    window.handleGoogleCredential = handleCredential;

    // Load Google Identity Services script if not already loaded
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGSI();
      document.head.appendChild(script);
    } else {
      // Script already loaded — init immediately
      initGSI();
    }

    function initGSI() {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the official Google button inside our container
      const btn = document.getElementById('google-signin-btn');
      if (btn) {
        window.google.accounts.id.renderButton(btn, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
          shape: 'rectangular',
        });
      }
    }

    return () => {
      window.handleGoogleCredential = undefined;
    };
  }, [handleCredential]);

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient px-4">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-3" />
          <p className="text-muted-foreground text-sm">Owner Portal</p>
        </div>

        <Card className="rounded-3xl border-border/60 shadow-xl">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-xl">Sign In to Your Account</CardTitle>
            <CardDescription className="text-balance">
              Manage your restaurants, menus, and orders
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5 flex flex-col items-center gap-4">
            {/* Google Identity Services renders the official button here */}
            <div id="google-signin-btn" className="w-full flex justify-center min-h-[44px]" />

            {/* Fallback notice if GSI hasn't loaded yet */}
            <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-xs">
              The Google sign-in button will appear above once the page finishes loading.
              <br />
              If it doesn't appear, make sure your{' '}
              <code className="font-mono bg-muted px-1 rounded">GOOGLE_CLIENT_ID</code> is set in{' '}
              <code className="font-mono bg-muted px-1 rounded">OwnerLoginPage.tsx</code>.
            </p>

            <div className="w-full border-t border-border/40 pt-3">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                By continuing you agree to our{' '}
                <Link to="/privacy-policy" className="underline hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Want to browse restaurants?{' '}
          <Link to="/restaurants" className="text-primary hover:underline">
            View all
          </Link>
        </p>
      </div>
    </div>
  );
}
