import { ReactNode } from 'react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import OfflineBanner from '@/components/common/OfflineBanner';

interface Props { children: ReactNode; showGetStarted?: boolean; }

export default function PublicLayout({ children, showGetStarted }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <OfflineBanner />
      <PublicHeader showGetStarted={showGetStarted} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
