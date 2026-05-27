
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
  Handshake,
  LayoutGrid,
  List,
  SearchX
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
import { cn } from "@/lib/utils";

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

const getMatchPrimaryPhoto = (match: any) => match.galleryPhotos?.[0] || match.photoURL;

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [interestView, setInterestView] = useState<"received" | "sent">("received");
  const [filters, setFilters] = useState({
    gender: searchParams.get("gender") || "any",
    denomination: searchParams.get("denomination") || "any",
  });

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
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {user && !isProfileComplete && (
          <Card className="mb-8 border-none shadow-lg bg-primary text-primary-foreground overflow-hidden rounded-[2rem] relative">
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="flex-grow space-y-1">
                <h3 className="text-xl font-headline font-bold">Complete Your Spiritual Journey</h3>
                <p className="opacity-80 text-sm max-w-xl">A complete profile increases your chances of finding a God-ordained partner by 4x.</p>
                <div className="pt-2 w-full max-w-xs">
                   <Progress value={completion} className="h-1.5 bg-white/20" />
                   <p className="text-[10px] mt-1 font-bold">{completion}% Complete</p>
                </div>
              </div>
              <Button size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 font-bold px-8" asChild>
                <Link href="/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-72 space-y-6">
            <Card className="border-none shadow-sm rounded-[1.5rem] bg-white sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
                    <Church className="w-5 h-5 text-primary" /> Spiritual Filters
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Seeking</Label>
                      <Select value={filters.gender} onValueChange={(val) => setFilters(p => ({ ...p, gender: val }))}>
                        <SelectTrigger className="rounded-xl border-muted bg-muted/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Gender</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Denomination</Label>
                      <div className="space-y-2">
                        {["Catholic", "Baptist", "Pentecostal", "Anglican"].map(d => (
                          <div key={d} className="flex items-center space-x-3 group cursor-pointer" onClick={() => setFilters(p => ({ ...p, denomination: p.denomination === d ? "any" : d }))}>
                            <Checkbox id={d} checked={filters.denomination === d} />
                            <label htmlFor={d} className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors">{d}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-muted/50" />

                <div className="pt-2">
                  <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground hover:text-primary" onClick={() => setFilters({ gender: "any", denomination: "any" })}>
                    Reset All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-grow space-y-6">
            <Tabs defaultValue="discover" className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <TabsList className="bg-white border rounded-full p-1 h-12 shadow-sm">
                  <TabsTrigger value="discover" className="rounded-full px-8 data-[state=active]:bg-primary data-[state=active]:text-white">Discover</TabsTrigger>
                  <TabsTrigger value="interests" className="rounded-full px-8 data-[state=active]:bg-primary data-[state=active]:text-white relative">
                    Interests
                    {peopleWhoLikedMe.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                        {peopleWhoLikedMe.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 bg-white border rounded-full p-1 h-12 shadow-sm px-2">
                  <Button 
                    variant={viewMode === "grid" ? "secondary" : "ghost"} 
                    size="icon" 
                    className="rounded-full h-9 w-9" 
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={viewMode === "list" ? "secondary" : "ghost"} 
                    size="icon" 
                    className="rounded-full h-9 w-9" 
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <TabsContent value="discover" className="m-0 focus-visible:ring-0">
                {usersLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary/30" />
                    <p className="text-muted-foreground font-medium">Finding potential matches...</p>
                  </div>
                ) : filteredMatches.length > 0 ? (
                  <div className={cn(
                    "grid gap-6",
                    viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                  )}>
                    {filteredMatches.map((match: any) => (
                      <MatchCard 
                        key={match.uid} 
                        match={match} 
                        onInterest={() => handleExpressInterest(match)} 
                        onView={() => router.push(`/matches/${match.uid}`)} 
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="border-none shadow-sm rounded-[2rem] bg-white py-20 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                      <SearchX className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-2xl font-headline font-bold mb-2">No soulmates found</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">Try broadening your denomination or location filters to discover more people.</p>
                    <Button variant="outline" className="mt-8 rounded-full border-primary text-primary px-8" onClick={() => setFilters({ gender: "any", denomination: "any" })}>
                      Clear Filters
                    </Button>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="interests" className="m-0 focus-visible:ring-0">
                <div className="flex items-center gap-1 bg-white border rounded-full p-1 h-11 w-fit mb-6 shadow-sm">
                  <Button 
                    variant={interestView === "received" ? "secondary" : "ghost"} 
                    className="rounded-full h-9 px-6 text-xs font-bold"
                    onClick={() => setInterestView("received")}
                  >
                    Received
                  </Button>
                  <Button 
                    variant={interestView === "sent" ? "secondary" : "ghost"} 
                    className="rounded-full h-9 px-6 text-xs font-bold"
                    onClick={() => setInterestView("sent")}
                  >
                    Sent
                  </Button>
                </div>

                <div className={cn(
                  "grid gap-6",
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                )}>
                  {(interestView === "received" ? peopleWhoLikedMe : peopleILiked).map((match: any) => (
                    <MatchCard 
                      key={match.uid} 
                      match={match} 
                      isInterest={interestView === "received"} 
                      isSentInterest={interestView === "sent"} 
                      onView={() => router.push(`/matches/${match.uid}`)} 
                      viewMode={viewMode}
                    />
                  ))}
                  {(interestView === "received" ? peopleWhoLikedMe : peopleILiked).length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <Heart className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="text-muted-foreground">No {interestView} interests yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

    </div>
  );
}

function MatchCard({ match, onInterest, onView, isInterest, isSentInterest, viewMode }: any) {
  const safePhotoURL = getValidImageUrl(getMatchPrimaryPhoto(match), match.uid);
  
  if (viewMode === "list") {
    return (
      <Card className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white rounded-2xl flex flex-col sm:flex-row h-full">
        <div className="relative w-full sm:w-48 aspect-[4/5] sm:aspect-auto cursor-pointer" onClick={onView}>
          <Image src={safePhotoURL} alt="" fill className="object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
        </div>
        <CardContent className="p-6 flex-grow flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-headline font-bold text-primary group-hover:text-accent transition-colors">{match.displayName}, {match.age}</h3>
                <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
                  <MapPin className="w-3.5 h-3.5 text-accent" /> {match.location || 'Global'}
                </div>
              </div>
              <ShieldCheck className="w-6 h-6 text-accent" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-lg bg-muted text-[10px] py-1 font-bold text-primary"><Church className="w-3 h-3 mr-1" /> {match.denomination}</Badge>
              <Badge variant="secondary" className="rounded-lg bg-muted text-[10px] py-1 font-bold text-primary"><Briefcase className="w-3 h-3 mr-1" /> {match.occupation}</Badge>
            </div>

            <p className="text-sm text-muted-foreground italic line-clamp-2">"{match.bio || "Searching for a Christ-centered partner..."}"</p>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-grow rounded-xl h-10 text-xs font-bold" onClick={onView}>View Profile</Button>
            {!isInterest && !isSentInterest && (
              <Button className="flex-grow rounded-xl h-10 text-xs font-bold bg-primary shadow-sm" onClick={onInterest}>Express Interest</Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden group bg-white rounded-[2rem]">
      <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={onView}>
        <Image src={safePhotoURL} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
        {match.favoriteVerse && (
          <div className="absolute top-4 left-4 right-4">
            <Badge className="bg-white/90 text-primary text-[10px] font-bold shadow-sm max-w-full truncate rounded-lg border-none">
              <BookOpen className="w-2.5 h-2.5 mr-1" /> {match.favoriteVerse}
            </Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
          <Button variant="secondary" className="w-full rounded-xl font-bold bg-white text-primary">View Full Profile</Button>
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="cursor-pointer" onClick={onView}>
          <div className="flex items-center justify-between"><h3 className="text-xl font-headline font-bold">{match.displayName || 'Anonymous'}, {match.age || '??'}</h3><ShieldCheck className="w-5 h-5 text-accent" /></div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1"><MapPin className="w-3.5 h-3.5 text-accent" /> {match.location || 'Global'}</div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground border-y py-3 font-bold">
          <div className="flex items-center gap-1.5 shrink-0"><Church className="w-3.5 h-3.5 text-primary" /> {match.denomination || 'Christian'}</div>
          <div className="flex items-center gap-1.5 truncate"><Briefcase className="w-3.5 h-3.5 text-primary" /> {match.occupation || 'Professional'}</div>
        </div>
        <div className="pt-2">
          {isInterest || isSentInterest ? (
            <Button variant="outline" className="w-full rounded-xl border-primary text-primary font-bold h-11" onClick={onView}>View Details</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-grow rounded-xl border-primary text-primary h-11 text-xs font-bold" onClick={onView}>View</Button>
              <Button className="flex-grow rounded-xl bg-primary h-11 shadow-md font-bold text-xs" onClick={onInterest}>Express Interest</Button>
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
