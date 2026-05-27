"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { addDoc, collection, doc } from "firebase/firestore";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  Church,
  GraduationCap,
  Globe,
  Handshake,
  Heart,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const getValidImageUrl = (url: string | undefined, uid: string) => {
  const fallback = `https://picsum.photos/seed/${uid}/1200/1600`;
  if (!url) return fallback;
  try {
    const parsed = new URL(url);
    if (["http:", "https:", "data:"].includes(parsed.protocol)) {
      return url;
    }
  } catch {
    if (url.startsWith("data:image")) return url;
  }
  return fallback;
};

const getProfileImages = (profile: any, uid: string) => {
  const images = profile?.galleryPhotos?.length ? profile.galleryPhotos : profile?.photoURL ? [profile.photoURL] : [];
  const fallback = `https://picsum.photos/seed/${uid}/1200/1600`;
  return images.length > 0 ? images : [fallback];
};

const MAX_PROFILE_IMAGES = 10;

export default function MatchProfilePage() {
  const params = useParams<{ uid: string }>();
  const uid = Array.isArray(params.uid) ? params.uid[0] : params.uid;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const profileRef = useMemo(() => {
    if (!db || !uid) return null;
    return doc(db, "users", uid);
  }, [db, uid]);

  const { data: profile, loading } = useDoc(profileRef);

  const galleryPhotos = getProfileImages(profile, uid || "profile");
  const photoURL = getValidImageUrl(galleryPhotos[0], uid || "profile");

  const handleExpressInterest = async () => {
    if (!user || !db || !profile || !uid || user.uid === uid) return;

    const interestData = {
      senderId: user.uid,
      senderName: user.displayName || "A Member",
      receiverId: uid,
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    try {
      await addDoc(collection(db, "interests"), interestData);
      toast({ title: "Interest Expressed!", description: `We've notified ${profile.displayName || "this member"}.` });
    } catch {
      errorEmitter.emit("permission-error", new FirestorePermissionError({ path: "interests", operation: "create", requestResourceData: interestData }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-6">
          <Button asChild variant="ghost" className="rounded-full gap-2 pl-2 pr-4 text-muted-foreground hover:text-primary">
            <Link href="/matches">
              <ArrowLeft className="w-4 h-4" /> Back to Matches
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : !profile ? (
          <Card className="border-none shadow-sm rounded-[2rem] bg-white py-20 text-center">
            <CardContent className="space-y-4">
              <ShieldCheck className="w-12 h-12 text-muted-foreground/40 mx-auto" />
              <h1 className="text-3xl font-headline font-bold">Profile not found</h1>
              <p className="text-muted-foreground max-w-md mx-auto">This profile may no longer be available.</p>
              <Button asChild className="rounded-full mt-4">
                <Link href="/matches">Return to Matches</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem]">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4 p-4 md:p-6">
                <div className="relative min-h-[24rem] lg:min-h-[34rem] rounded-[2rem] overflow-hidden">
                  <Image src={photoURL} alt={profile.displayName || "Profile photo"} fill className="object-cover" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-8 md:p-10 text-white space-y-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] font-bold opacity-80">
                      <Sparkles className="w-4 h-4 text-accent" /> Full Profile
                    </div>
                    <div>
                      <h1 className="text-4xl md:text-6xl font-headline font-black leading-tight">{profile.displayName || "Member"}</h1>
                      <p className="mt-2 flex items-center gap-2 text-white/80 font-medium">
                        <MapPin className="w-4 h-4 text-accent" /> {profile.location || "Global"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {galleryPhotos.slice(0, MAX_PROFILE_IMAGES).map((image, index) => (
                    <div key={`${image}-${index}`} className="relative aspect-[4/5] rounded-2xl overflow-hidden border bg-muted">
                      <Image src={getValidImageUrl(image, uid || "profile")} alt={`${profile.displayName || "Profile"} photo ${index + 1}`} fill className="object-cover" />
                      {index === 0 && (
                        <Badge className="absolute left-2 top-2 bg-white text-primary rounded-full font-bold">Primary</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 md:p-10 space-y-8">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Profile Overview</p>
                    <h2 className="text-2xl md:text-3xl font-headline font-bold mt-1">{profile.displayName || "Member"}, {profile.age || "?"}</h2>
                  </div>
                  <Badge className="rounded-full px-4 py-1.5 bg-primary text-white font-bold">{profile.denomination || "Christian"}</Badge>
                </div>

                <section className="space-y-4">
                  <h3 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" /> Spiritual Vision
                  </h3>
                  <p className="text-foreground italic text-lg leading-relaxed font-body">"{profile.bio || "Seeking a partner who shares a passion for the Lord."}"</p>
                </section>

                <Separator />

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-headline font-bold text-primary flex items-center gap-2"><Church className="w-5 h-5" /> Faith Journey</h3>
                    <div className="bg-muted/30 p-5 rounded-2xl space-y-4 border">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Favorite Bible Verse</Label>
                        <p className="font-bold flex items-center gap-2 text-primary"><BookOpen className="w-4 h-4 text-accent shrink-0" /> {profile.favoriteVerse || "Awaiting detail..."}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Ministry Involvement</Label>
                        <p className="text-sm flex items-center gap-2 leading-relaxed"><Handshake className="w-4 h-4 text-accent shrink-0" /> {profile.ministryInvolvement || "Active in local community"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-headline font-bold text-primary flex items-center gap-2"><Briefcase className="w-5 h-5" /> Life & Professional</h3>
                    <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0"><GraduationCap className="w-5 h-5" /></div>
                        <div><p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Education</p><p className="text-sm font-bold">{profile.education || "Not specified"}</p></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0"><Briefcase className="w-5 h-5" /></div>
                        <div><p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Profession</p><p className="text-sm font-bold">{profile.occupation || "Professional"}</p></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0"><Globe className="w-5 h-5" /></div>
                        <div><p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Marital Status</p><p className="text-sm font-bold">{profile.maritalStatus || "Single"}</p></div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button
                    className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-xl bg-primary"
                    onClick={handleExpressInterest}
                    disabled={!user || user.uid === uid}
                  >
                    <Heart className="w-6 h-6 mr-2 fill-current" /> Express Interest
                  </Button>
                  <Button asChild variant="outline" className="flex-1 h-14 rounded-2xl text-lg font-bold">
                    <Link href="/matches">Close Profile</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}