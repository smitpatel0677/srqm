import PublicLayout from '@/components/layouts/PublicLayout';

export default function CookiePolicyPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">1. What Are Cookies</h2>
            <p>Cookies are small data files stored on your device. Saksham Digi QR Menu uses browser localStorage (similar to cookies) to store application data locally on your device.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">2. How We Use localStorage</h2>
            <p>We use localStorage to store:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-foreground">sqrm_theme</strong> – Your dark/light theme preference</li>
              <li><strong className="text-foreground">sqrm_current_owner</strong> – Your logged-in owner session</li>
              <li><strong className="text-foreground">sqrm_restaurants</strong> – Restaurant data you create</li>
              <li><strong className="text-foreground">sqrm_menu_items</strong> – Menu items for your restaurants</li>
              <li><strong className="text-foreground">sqrm_orders</strong> – Customer order records</li>
              <li><strong className="text-foreground">sqrm_reviews</strong> – Customer reviews</li>
              <li><strong className="text-foreground">sqrm_cart</strong> – Current shopping cart contents</li>
              <li><strong className="text-foreground">sqrm_settings</strong> – Site configuration settings</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">3. Essential vs Optional</h2>
            <p>All localStorage items used by Saksham Digi QR Menu are essential for the platform to function. Without them, features like ordering, menus, and owner panels would not work.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">4. Third-Party Cookies</h2>
            <p>We do not use third-party tracking cookies or analytics cookies. We do not integrate advertising networks.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">5. Managing Storage</h2>
            <p>You can clear all stored data by clearing your browser's localStorage through your browser settings. Note that this will log you out and remove all locally stored data.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">6. Contact</h2>
            <p>For questions about this policy: <a href="mailto:support@sqrm.in" className="text-primary underline">support@sqrm.in</a></p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
