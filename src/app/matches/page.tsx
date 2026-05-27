
"use client";

import { useState, useMemo, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  MapPin, 
  Church, 
  Briefcase, 
  Loader2, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  GraduationCap, 
  ShieldCheck,
  Globe,
  BookOpen,
  Handshake
} from "lucide-react";
import Image from "next/image";
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { collection, query, where, doc, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const getValidImageUrl = (url: string | undefined, uid: string) => {
  const fallback = `https://picsum.photos/seed/${uid}/600/800`;
  if (!url) return fallback;
  try {
    const parsed = new URL(url);
    if (['http:', 'https:', 'data:'].includes(parsed.protocol)) {
      return url;
    }
  } catch (e) {
    if (url.startsWith('data:image')) return url;
  }
  return fallback;
};

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [interestView, setInterestView] = useState<"received" | "sent">("received");
  const [filters, setFilters] = useState({
    gender: searchParams.get("gender") || "any",
    denomination: searchParams.get("denomination") || "any",
  });

  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

  const usersQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const currentUserRef = useMemo(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: allUsers, loading: usersLoading } = useCollection(usersQuery);
  const { data: profile } = useDoc(currentUserRef);

  const receivedInterestsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "interests"), where("receiverId", "==", user.uid));
  }, [db, user]);

  const sentInterestsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "interests"), where("senderId", "==", user.uid));
  }, [db, user]);

  const { data: receivedInterests } = useCollection(receivedInterestsQuery);
  const { data: sentInterests } = useCollection(sentInterestsQuery);

  const completion = useMemo(() => {
    if (!profile) return 0;
    const fields = ['displayName', 'age', 'gender', 'location', 'denomination', 'bio', 'photoURL', 'faithDetails', 'favoriteVerse'];
    const filled = fields.filter(f => profile[f] && profile[f] !== "" && profile[f] !== "any");
    return Math.round((filled.length / fields.length) * 100);
  }, [profile]);

  const isProfileComplete = completion >= 90;

  const filteredMatches = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter((m: any) => {
      if (m.uid === user?.uid) return false;
      const alreadySent = sentInterests?.some((i: any) => i.receiverId === m.uid);
      if (alreadySent) return false;
      if (filters.gender !== "any" && m.gender !== filters.gender) return false;
      if (filters.denomination !== "any" && m.denomination !== filters.denomination) return false;
      return true;
    });
  }, [allUsers, user, filters, sentInterests]);

  const peopleWhoLikedMe = useMemo(() => {
    if (!receivedInterests || !allUsers) return [];
    return receivedInterests.map((interest: any) => {
      const sender = allUsers.find((u: any) => u.uid === interest.senderId);
      return sender ? { ...sender, interestId: interest.id, status: interest.status, interestTimestamp: interest.timestamp } : null;
    }).filter(Boolean);
  }, [receivedInterests, allUsers]);

  const peopleILiked = useMemo(() => {
    if (!sentInterests || !allUsers) return [];
    return sentInterests.map((interest: any) => {
      const receiver = allUsers.find((u: any) => u.uid === interest.receiverId);
      return receiver ? { ...receiver, interestId: interest.id, status: interest.status, interestTimestamp: interest.timestamp } : null;
    }).filter(Boolean);
  }, [sentInterests, allUsers]);

  const handleExpressInterest = (match: any) => {
    if (!user || !db) return;
    const interestData = {
      senderId: user.uid,
      senderName: user.displayName || "A Member",
      receiverId: match.uid,
      timestamp: new Date().toISOString(),
      status: "pending"
    };
    addDoc(collection(db, "interests"), interestData).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'interests', operation: 'create', requestResourceData: interestData }));
    });
    toast({ title: "Interest Expressed!", description: `We've notified ${match.displayName}.` });
    setSelectedMatch(null);
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {user && !isProfileComplete && (
          <Card className="mb-12 border-none shadow-xl bg-primary text-primary-foreground overflow-hidden rounded-[2.5rem] relative">
            <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center shrink-0"><Sparkles className="w-10 h-10 text-white" /></div>
              <div className="flex-grow space-y-2 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-headline font-bold">Find Your Soulmate Match</h3>
                <p className="opacity-80 max-w-xl">Deep spiritual alignment is the foundation of a God-ordained marriage. Complete your spiritual details to find your perfect match.</p>
                <div className="pt-4 max-w-md mx-auto md:mx-0">
                   <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold uppercase tracking-widest">Spiritual Profile Depth</span><span className="text-xs font-bold">{completion}%</span></div>
                   <Progress value={completion} className="h-2 bg-white/20" />
                </div>
              </div>
              <Button size="lg" className="rounded-full h-14 px-8 bg-white text-primary hover:bg-white/90 font-bold shadow-2xl" asChild>
                <Link href="/profile">Deepen Profile <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-headline font-bold text-primary">Soulmate Search</h2>
            <p className="text-muted-foreground text-sm">Discover members who share your heart for the Lord.</p>
          </div>
          <Tabs defaultValue="discover" className="h-12">
            <TabsList className="bg-white p-1 rounded-full shadow-sm border h-12">
              <TabsTrigger value="discover" className="rounded-full px-6">Discover</TabsTrigger>
              <TabsTrigger value="interests" className="rounded-full px-6 relative">
                Interests {peopleWhoLikedMe.length > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full text-[10px] flex items-center justify-center text-white">{peopleWhoLikedMe.length}</span>}
              </TabsTrigger>
            </TabsList>
            <div className="mt-8 flex flex-col lg:flex-row gap-8">
              <aside className="lg:w-72 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm space-y-8 border">
                  <h3 className="font-bold text-lg">Spiritual Filters</h3>
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Looking For</Label>
                    <Select value={filters.gender} onValueChange={(val) => setFilters(p => ({ ...p, gender: val }))}>
                      <SelectTrigger className="rounded-xl border-none bg-muted/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Denomination</Label>
                    <div className="space-y-2">
                      {["Catholic", "Baptist", "Pentecostal", "Anglican"].map(d => (
                        <div key={d} className="flex items-center space-x-2">
                          <Checkbox id={d} checked={filters.denomination === d} onCheckedChange={() => setFilters(p => ({ ...p, denomination: p.denomination === d ? "any" : d }))} />
                          <label htmlFor={d} className="text-sm cursor-pointer">{d}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
              <div className="flex-grow">
                <TabsContent value="discover" className="m-0">
                  {usersLoading ? <div className="text-center py-20"><Loader2 className="animate-spin mx-auto w-10 h-10" /></div> : filteredMatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredMatches.map((match: any) => <MatchCard key={match.uid} match={match} onInterest={() => handleExpressInterest(match)} onView={() => setSelectedMatch(match)} />)}
                    </div>
                  ) : <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed"><h3 className="text-xl font-bold">No matches found</h3><p className="text-muted-foreground">Try widening your filters.</p></div>}
                </TabsContent>
                <TabsContent value="interests" className="m-0">
                  <div className="flex gap-2 mb-6">
                    <Button variant={interestView === "received" ? "secondary" : "ghost"} onClick={() => setInterestView("received")} className="rounded-xl">Received</Button>
                    <Button variant={interestView === "sent" ? "secondary" : "ghost"} onClick={() => setInterestView("sent")} className="rounded-xl">Sent</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {(interestView === "received" ? peopleWhoLikedMe : peopleILiked).map((match: any) => <MatchCard key={match.uid} match={match} isInterest={interestView === "received"} isSentInterest={interestView === "sent"} onView={() => setSelectedMatch(match)} />)}
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </main>

      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-[2.5rem] border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedMatch?.displayName || "Member"}'s Profile</DialogTitle>
            <DialogDescription>Full spiritual identity details.</DialogDescription>
          </DialogHeader>
          {selectedMatch && (
            <div className="flex flex-col">
              <div className="relative h-64 md:h-80">
                <Image src={getValidImageUrl(selectedMatch.photoURL, selectedMatch.uid)} alt="" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8 text-white">
                  <div>
                    <h2 className="text-4xl font-headline font-bold">{selectedMatch.displayName}, {selectedMatch.age}</h2>
                    <p className="flex items-center gap-2 opacity-80 mt-1"><MapPin className="w-4 h-4" /> {selectedMatch.location || "Global"}</p>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-10">
                <section className="space-y-4">
                  <h3 className="text-xl font-headline font-bold text-primary flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /> Spiritual Bio</h3>
                  <p className="text-muted-foreground italic text-lg leading-relaxed">"{selectedMatch.bio || "Seeking a partner who shares a passion for the Lord."}"</p>
                </section>
                <Separator />
                <div className="grid md:grid-cols-2 gap-10">
                  <section className="space-y-4">
                    <h3 className="font-headline font-bold text-primary flex items-center gap-2"><Church className="w-5 h-5" /> Faith Journey</h3>
                    <div className="bg-muted/30 p-5 rounded-2xl space-y-4">
                      <div><Label className="text-xs uppercase font-bold text-muted-foreground">Favorite Bible Verse</Label><p className="font-medium flex items-center gap-2"><BookOpen className="w-4 h-4 text-accent" /> {selectedMatch.favoriteVerse || "Awaiting detail..."}</p></div>
                      <div><Label className="text-xs uppercase font-bold text-muted-foreground">Ministry Involvement</Label><p className="text-sm flex items-center gap-2"><Handshake className="w-4 h-4 text-accent" /> {selectedMatch.ministryInvolvement || "Active in local community"}</p></div>
                      <div><Label className="text-xs uppercase font-bold text-muted-foreground">Denomination</Label><p className="text-sm font-medium">{selectedMatch.denomination || "Christian"}</p></div>
                    </div>
                  </section>
                  <section className="space-y-4">
                    <h3 className="font-headline font-bold text-primary flex items-center gap-2"><Briefcase className="w-5 h-5" /> Life & Professional</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3"><GraduationCap className="w-5 h-5 text-accent" /> <div><p className="text-sm font-bold">{selectedMatch.education || "University Graduate"}</p><p className="text-xs text-muted-foreground">Education</p></div></div>
                      <div className="flex items-center gap-3"><Briefcase className="w-5 h-5 text-accent" /> <div><p className="text-sm font-bold">{selectedMatch.occupation || "Professional"}</p><p className="text-xs text-muted-foreground">Work</p></div></div>
                      <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-accent" /> <div><p className="text-sm font-bold">{selectedMatch.maritalStatus || "Single"}</p><p className="text-xs text-muted-foreground">Marital Status</p></div></div>
                    </div>
                  </section>
                </div>
                <div className="flex flex-col md:flex-row gap-4 pt-6">
                  <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl bg-primary" onClick={() => handleExpressInterest(selectedMatch)}><Heart className="w-5 h-5 mr-2" /> Express Interest</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MatchCard({ match, onInterest, onView, isInterest, isSentInterest }: any) {
  const safePhotoURL = getValidImageUrl(match.photoURL, match.uid);
  return (
    <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group bg-white rounded-[2rem]">
      <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={onView}>
        <Image src={safePhotoURL} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
        {match.favoriteVerse && <div className="absolute top-4 left-4 right-4"><Badge className="bg-white/90 text-primary text-[10px] font-bold shadow-sm max-w-full truncate rounded-lg border-none"><BookOpen className="w-2.5 h-2.5 mr-1" /> {match.favoriteVerse}</Badge></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
          <Button variant="secondary" className="w-full rounded-xl font-bold bg-white text-primary">View Full Profile</Button>
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="cursor-pointer" onClick={onView}>
          <div className="flex items-center justify-between"><h3 className="text-xl font-headline font-bold">{match.displayName || 'Anonymous'}, {match.age || '??'}</h3><ShieldCheck className="w-5 h-5 text-accent" /></div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1"><MapPin className="w-3 h-3 text-accent" /> {match.location || 'Global'}</div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-y py-3">
          <div className="flex items-center gap-1.5"><Church className="w-3.5 h-3.5 text-primary" /> {match.denomination || 'Christian'}</div>
          <div className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-primary" /> {match.occupation || 'Professional'}</div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 italic leading-relaxed">"{match.bio || "Searching for a Christ-centered partner..."}"</p>
        <div className="pt-2">
          {isInterest || isSentInterest ? (
            <Button variant="outline" className="w-full rounded-xl border-primary text-primary font-bold h-11" onClick={onView}>View Details</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-grow rounded-xl border-primary text-primary h-11" onClick={onView}>View</Button>
              <Button className="flex-grow rounded-xl bg-primary h-11 shadow-md font-bold" onClick={onInterest}>Interest</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MatchesPage() {
  return <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>}><MatchesContent /></Suspense>;
}
