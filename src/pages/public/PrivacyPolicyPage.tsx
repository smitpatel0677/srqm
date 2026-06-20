import PublicLayout from '@/components/layouts/PublicLayout';

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-12 prose prose-sm dark:prose-invert">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <p>Saksham Digi QR Menu ("we", "our", "the platform") collects information necessary to provide digital menu and ordering services. This includes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Restaurant owner information: name, email address, phone number</li>
              <li>Restaurant data: name, location, contact details, menu items and images</li>
              <li>Customer order data: name, phone number, ordered items, payment preference</li>
              <li>Customer reviews and ratings submitted after orders</li>
              <li>Usage data stored locally in your browser's localStorage</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To create and manage restaurant digital menus</li>
              <li>To process customer orders and track order status</li>
              <li>To generate QR codes and PDF receipts</li>
              <li>To display customer reviews on restaurant profiles</li>
              <li>To send plan upgrade inquiries via WhatsApp</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">3. Data Storage</h2>
            <p>All data on this platform is stored locally in your browser's localStorage. We do not transmit your data to any external servers (except WhatsApp links for plan upgrades). Data is stored on your device and may be cleared when you clear browser data.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">4. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. Order information is shared with the relevant restaurant owner to fulfill your order.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">5. Your Rights</h2>
            <p>You may delete your account and all associated data at any time from the Profile settings. Restaurant owners may delete their restaurants to remove all associated data.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">6. Contact</h2>
            <p>For privacy concerns, contact us at <a href="mailto:support@sqrm.in" className="text-primary underline">support@sqrm.in</a></p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
