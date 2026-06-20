import { LOGO_URL, settingsStore } from '@/store';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'h-7 w-7', md: 'h-9 w-9', lg: 'h-12 w-12' };
const textSizes = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' };

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const settings = settingsStore.get();
  const logoSrc = settings.logo || LOGO_URL;
  const siteName = settings.siteName || 'Saksham Digi QR Menu';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logoSrc} alt={siteName} className={`${sizes[size]} object-contain rounded`} />
      <span className={`font-bold text-primary ${textSizes[size]}`}>{siteName}</span>
    </div>
  );
}
