import { Link } from 'react-router-dom';
import { Sun, Moon, Menu, X, Download, UtensilsCrossed } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import Logo from '@/components/common/Logo';

interface PublicHeaderProps {
  showGetStarted?: boolean;
}

export default function PublicHeader({ showGetStarted = true }: PublicHeaderProps) {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    (installPrompt as BeforeInstallPromptEvent).prompt?.();
    setInstallPrompt(null);
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-200 ${scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="shrink-0">
          <Logo size="sm" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/restaurants" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
            <span className="flex items-center gap-1.5"><UtensilsCrossed size={14} strokeWidth={2} /> Restaurants</span>
          </Link>
          {installPrompt && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={handleInstall}>
              <Download size={14} strokeWidth={2} /> Install App
            </Button>
          )}
          <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
          </Button>
          {showGetStarted && (
            <Button asChild size="sm" className="rounded-xl ml-1 animate-glow-pulse press-active">
              <Link to="/owner/login">Get Started Free</Link>
            </Button>
          )}
        </nav>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-1">
          {installPrompt && (
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={handleInstall} aria-label="Install app">
              <Download size={16} strokeWidth={2} />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={toggle}>
            {theme === 'dark' ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 flex flex-col gap-2 animate-slide-down">
          <Link
            to="/restaurants"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <UtensilsCrossed size={14} strokeWidth={2} /> Browse Restaurants
          </Link>
          {showGetStarted && (
            <Button asChild size="sm" className="w-full rounded-xl press-active" onClick={() => setMobileOpen(false)}>
              <Link to="/owner/login">Get Started Free</Link>
            </Button>
          )}
        </div>
      )}
    </header>
  );
}

// Typed for TypeScript
interface BeforeInstallPromptEvent extends Event {
  prompt?: () => void;
}
