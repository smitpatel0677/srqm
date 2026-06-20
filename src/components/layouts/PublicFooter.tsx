import { Link } from 'react-router-dom';
import Logo from '@/components/common/Logo';
import { settingsStore } from '@/store';

export default function PublicFooter() {
  const settings = settingsStore.get();
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Logo size="sm" />
            <p className="text-xs text-muted-foreground mt-2 max-w-xs text-pretty">
              Digital QR menus for restaurants. Scan, order, enjoy.
            </p>
          </div>
          <div className="grid grid-cols-2 md:flex gap-x-8 gap-y-2 text-sm">
            <Link to="/restaurants" className="text-muted-foreground hover:text-foreground transition-colors">Restaurants</Link>
            <Link to="/owner/login" className="text-muted-foreground hover:text-foreground transition-colors">For Owners</Link>
            <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/cookie-policy" className="text-muted-foreground hover:text-foreground transition-colors">Cookies</Link>
            {settings.supportEmail && (
              <a href={`mailto:${settings.supportEmail}`} className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            )}
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Saksham Digi QR Menu. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Made with ♥ by SRP Digital Studios</p>
        </div>
      </div>
    </footer>
  );
}
