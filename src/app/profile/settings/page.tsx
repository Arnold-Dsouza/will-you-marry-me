"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/firebase/auth/use-user";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";

type Settings = {
  visibility?: boolean;
  ageMin?: number;
  ageMax?: number;
  distanceKm?: number;
  allowMessagesFromAnyone?: boolean;
  emailNotifications?: boolean;
  photoVisibility?: "public" | "private";
  religionPreference?: string | null;
};

export default function ProfileSettingsPage() {
  const { user, profile } = useUser();
  const uid = user?.uid;
  const { toast } = useToast();

  const [settings, setSettings] = useState<Settings>({
    visibility: true,
    ageMin: 18,
    ageMax: 40,
    distanceKm: 50,
    allowMessagesFromAnyone: false,
    emailNotifications: true,
    photoVisibility: "public",
    religionPreference: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.settings) setSettings((s) => ({ ...s, ...(profile.settings as Settings) }));
  }, [profile]);

  async function handleSave() {
    if (!uid) return toast({ title: "Not signed in", description: "Sign in before saving settings." });
    setSaving(true);
    try {
      await setDoc(doc(db, "users", uid), { settings }, { merge: true });
      toast({ title: "Saved", description: "Your settings have been saved." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Unable to save settings." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <section className="space-y-2">
              <Label>Profile visibility</Label>
              <div className="flex items-center gap-4">
                <Switch
                  checked={!!settings.visibility}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, visibility: Boolean(v) }))}
                />
                <span className="text-sm text-muted-foreground">Allow your profile to appear in searches and suggestions</span>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age minimum</Label>
                <Input
                  type="number"
                  value={settings.ageMin}
                  onChange={(e) => setSettings((s) => ({ ...s, ageMin: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Age maximum</Label>
                <Input
                  type="number"
                  value={settings.ageMax}
                  onChange={(e) => setSettings((s) => ({ ...s, ageMax: Number(e.target.value) }))}
                />
              </div>
            </section>

            <section>
              <Label>Search distance (km)</Label>
              <Input
                type="number"
                value={settings.distanceKm}
                onChange={(e) => setSettings((s) => ({ ...s, distanceKm: Number(e.target.value) }))}
              />
            </section>

            <section>
              <Label>Religion preference</Label>
              <Input
                placeholder="e.g., Evangelical, Anglican, No preference"
                value={settings.religionPreference ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, religionPreference: e.target.value || null }))}
              />
            </section>

            <section className="space-y-2">
              <Label>Messaging</Label>
              <div className="flex items-center gap-4">
                <Switch
                  checked={!!settings.allowMessagesFromAnyone}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, allowMessagesFromAnyone: Boolean(v) }))}
                />
                <span className="text-sm text-muted-foreground">Allow messages from anyone (otherwise mutual matches only)</span>
              </div>
            </section>

            <section className="space-y-2">
              <Label>Notifications</Label>
              <div className="flex items-center gap-4">
                <Switch
                  checked={!!settings.emailNotifications}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, emailNotifications: Boolean(v) }))}
                />
                <span className="text-sm text-muted-foreground">Email notifications for new interests and messages</span>
              </div>
            </section>

            <section>
              <Label>Photo visibility</Label>
              <div className="flex gap-3 mt-2">
                <Button
                  variant={settings.photoVisibility === "public" ? "default" : "ghost"}
                  onClick={() => setSettings((s) => ({ ...s, photoVisibility: "public" }))}
                >
                  Public
                </Button>
                <Button
                  variant={settings.photoVisibility === "private" ? "default" : "ghost"}
                  onClick={() => setSettings((s) => ({ ...s, photoVisibility: "private" }))}
                >
                  Private
                </Button>
              </div>
            </section>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save settings"}</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
