import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { settingsStore, fileToBase64, LOGO_URL } from '@/store';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(() => settingsStore.get());
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    const b64 = await fileToBase64(file);
    setSettings((s) => ({ ...s, logo: b64 }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      settingsStore.set(settings);
      toast.success('Settings saved successfully');
      setSaving(false);
    }, 400);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>

      <div className="space-y-5">
        <Card className="rounded-2xl border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base">Branding</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div>
              <Label className="text-sm font-normal text-muted-foreground">Site Logo</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden">
                  <img src={settings.logo || LOGO_URL} alt="logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => fileRef.current?.click()}>
                    <Upload size={13} strokeWidth={2} className="mr-1.5" /> Upload Logo
                  </Button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  <p className="text-xs text-muted-foreground mt-1.5">Stored locally in browser</p>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="sname" className="text-sm font-normal text-muted-foreground">Site Name</Label>
              <Input id="sname" value={settings.siteName} onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))} className="mt-1 rounded-xl" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base">Support Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div>
              <Label htmlFor="sphone" className="text-sm font-normal text-muted-foreground">Support Phone (for WhatsApp plan upgrades)</Label>
              <Input id="sphone" placeholder="10-digit mobile number" value={settings.supportPhone} onChange={(e) => setSettings((s) => ({ ...s, supportPhone: e.target.value }))} className="mt-1 rounded-xl" maxLength={10} />
            </div>
            <div>
              <Label htmlFor="semail" className="text-sm font-normal text-muted-foreground">Support Email</Label>
              <Input id="semail" type="email" placeholder="support@sqrm.in" value={settings.supportEmail} onChange={(e) => setSettings((s) => ({ ...s, supportEmail: e.target.value }))} className="mt-1 rounded-xl" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base">Maintenance Mode</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Enable Maintenance Mode</p>
                <p className="text-xs text-muted-foreground mt-0.5">Shows maintenance message to all non-admin visitors</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(v) => setSettings((s) => ({ ...s, maintenanceMode: v }))}
              />
            </div>
            {settings.maintenanceMode && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-sm text-yellow-700 dark:text-yellow-400 animate-fade-in">
                Maintenance mode is ON. Visitors will see the maintenance page.
              </div>
            )}
          </CardContent>
        </Card>

        <Button className="w-full h-11 rounded-xl press-active" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
