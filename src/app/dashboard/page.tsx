"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";

const viewers = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  name: `Member ${i + 1}`,
  age: 28 + (i % 6),
  location: i % 2 === 0 ? "Mumbai" : "Bangalore",
  photo: `https://picsum.photos/seed/viewer${i}/400/400`,
  viewedOn: `2026-05-${10 + i}`,
}));

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const userDocRef = useMemo(() => (user && db ? doc(db, "users", user.uid) : null), [user, db]);
  const { data: profile } = useDoc(userDocRef);

  const displayName = profile?.displayName || user?.displayName || "Member";
  const memberId = profile?.memberId || (user ? `CHR${user.uid.slice(0, 6)}` : "-");
  const avatarSrc = profile?.galleryPhotos?.[0] || profile?.photoURL || user?.photoURL || "https://picsum.photos/seed/me/200/200";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6">

          {/* Left sidebar */}
          <aside className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                    <Image src={avatarSrc} alt="avatar" width={64} height={64} className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{displayName}</h3>
                    <p className="text-xs text-muted-foreground">Member ID: {memberId}</p>
                    <Badge className="mt-2 inline-block">{profile?.membershipType || 'Free member'}</Badge>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-sm font-semibold">Complete Your Profile</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: '52%' }} />
                    </div>
                    <span className="text-xs font-semibold">52%</span>
                  </div>
                  <Button className="mt-3 w-full rounded-full bg-primary text-primary-foreground">Verify Profile</Button>
                </div>

                <nav className="mt-4 space-y-2 text-sm">
                  <Link href="#" className="block rounded-md px-3 py-2 hover:bg-slate-50">Edit Profile</Link>
                  <Link href="#" className="block rounded-md px-3 py-2 hover:bg-slate-50">Edit Preferences</Link>
                  <Link href="#" className="block rounded-md px-3 py-2 hover:bg-slate-50">Verify Your Profile</Link>
                </nav>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold">Become a paid member</h4>
                <p className="text-sm text-muted-foreground mt-2">Unlock call/WhatsApp matches, unlimited messages, and priority placement.</p>
                <Button className="mt-4 w-full rounded-full bg-accent text-accent-foreground">See membership plans</Button>
              </CardContent>
            </Card>
          </aside>

          {/* Main content */}
          <section className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h1 className="text-2xl font-semibold">Dashboard</h1>
                      <p className="text-sm text-muted-foreground mt-1">Overview of your activity, membership and quick actions.</p>
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-lg border border-slate-200 p-4 bg-white">
                          <p className="text-sm text-muted-foreground">Matches available</p>
                          <p className="mt-2 text-xl font-bold">3</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 p-4 bg-white">
                          <p className="text-sm text-muted-foreground">Interests received</p>
                          <p className="mt-2 text-xl font-bold">0</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 p-4 bg-white">
                          <p className="text-sm text-muted-foreground">Profile views</p>
                          <p className="mt-2 text-xl font-bold">8</p>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <ShieldCheck className="w-10 h-10 text-emerald-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold">Shortcuts</h3>
                  <div className="mt-4 space-y-2">
                    <Link href="/profile" className="block rounded-full border px-4 py-2 text-center">Edit Profile</Link>
                    <Link href="/profile/settings" className="block rounded-full border px-4 py-2 text-center">Settings</Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Who Viewed You</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex gap-4 overflow-x-auto py-2">
                  {viewers.map((v) => (
                    <div key={v.id} className="w-40 shrink-0">
                      <div className="w-40 h-40 rounded-xl overflow-hidden bg-slate-100">
                        <Image src={v.photo} alt={v.name} width={160} height={160} className="object-cover" />
                      </div>
                      <div className="mt-2">
                        <p className="font-medium text-sm">{v.name}</p>
                        <p className="text-xs text-muted-foreground">{v.age} yrs • {v.location}</p>
                        <p className="text-xs text-muted-foreground">Viewed on {v.viewedOn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profiles You Viewed</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex gap-4 overflow-x-auto py-2">
                  {viewers.slice(0, 6).map((v) => (
                    <div key={v.id} className="w-32 shrink-0">
                      <div className="w-32 h-32 rounded-xl overflow-hidden bg-slate-100">
                        <Image src={v.photo} alt={v.name} width={128} height={128} className="object-cover" />
                      </div>
                      <p className="mt-2 text-sm">{v.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

        </div>
      </main>
    </div>
  );
}
