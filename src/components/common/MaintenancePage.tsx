import Logo from './Logo';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-6 p-8 text-center">
      <Logo size="lg" />
      <div className="max-w-md">
        <h1 className="text-2xl font-bold mb-3">Under Maintenance</h1>
        <p className="text-muted-foreground text-lg">
          We Are Doing Maintenance For Your Experience. It Won't Take That Long.
        </p>
      </div>
    </div>
  );
}
