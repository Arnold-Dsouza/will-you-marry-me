
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
  MessageCircle, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  GraduationCap, 
  Info,
  User as UserIcon,
  ShieldCheck,
  Globe,
  LayoutGrid,
  Rows,
  Send
} from "lucide-react";
import Image from "next/image";
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { collection, query, where, doc, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Helper to validate URLs to prevent next/image crashes
const getValidImageUrl = (url: string | undefined, uid: string) => {
  const fallback = `https://picsum.photos/seed/${uid}/600/800`;
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return fallback;
};

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<"grid" | "tile">("grid");
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
    const fields = ['displayName', 'age', 'gender', 'location', 'denomination', 'bio', 'photoURL', 'faithDetails'];
    const filled = fields.filter(f => profile[f] && profile[f] !== "" && profile[f] !== "any");
    return Math.round((filled.length / fields.length) * 100);
  }, [profile]);

  const isProfileComplete = completion >= 100;

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
      return sender ? { ...sender, interestId: interest.id, status: interest.status } : null;
    }).filter(Boolean);
  }, [receivedInterests, allUsers]);

  const peopleILiked = useMemo(() => {
    if (!sentInterests || !allUsers) return [];
    return sentInterests.map((interest: any) => {
      const receiver = allUsers.find((u: any) => u.uid === interest.receiverId);
      return receiver ? { ...receiver, interestId: interest.id, status: interest.status } : null;
    }).filter(Boolean);
  }, [sentInterests, allUsers]);

  const handleExpressInterest = (match: any) => {
    if (!user) {
      toast({ title: "Login required", description: "Please sign in to express interest.", variant: "destructive" });
      return;
    }
    if (!db) return;

    const interestData = {
      senderId: user.uid,
      senderName: user.displayName || "A Member",
      receiverId: match.uid,
      timestamp: new Date().toISOString(),
      status: "pending"
    };

    addDoc(collection(db, "interests"), interestData)
      .then(() => {
        toast({
          title: "Interest Expressed!",
          description: `We've notified ${match.displayName || 'this member'} of your interest.`,
        });
        setSelectedMatch(null);
      });
  };

  const handleStartChat = (match: any) => {
    router.push(`/messages?userId=${match.uid}`);
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {user && !isProfileComplete && (
          <Card className="mb-12 border-none shadow-xl bg-primary text-primary-foreground overflow-hidden rounded-[2.5rem] relative">
            <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center shrink-0">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="flex-grow space-y-2 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-headline font-bold">Complete Your Spiritual Identity</h3>
                <p className="opacity-80 max-w-xl">
                  Profiles with 100% completion receive 5x more intentional interest. Make yourself visible to find your God-ordained partner.
                </p>
                <div className="pt-4 max-w-md mx-auto md:mx-0">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-xs font-bold uppercase tracking-widest">Profile Strength</span>
                     <span className="text-xs font-bold">{completion}%</span>
                   </div>
                   <Progress value={completion} className="h-2 bg-white/20" />
                </div>
              </div>
              <Button size="lg" className="rounded-full h-14 px-8 bg-white text-primary hover:bg-white/90 font-bold shadow-2xl" asChild>
                <Link href="/profile">Finish Profile <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="discover" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-headline font-bold text-primary">Matrimonial Search</h2>
              <p className="text-muted-foreground text-sm">Find partners who share your vision for a Christ-centered life.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex bg-white p-1 rounded-xl shadow-sm border">
                <Button 
                  variant={viewMode === "grid" ? "secondary" : "ghost"} 
                  size="icon" 
                  className="rounded-lg"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === "tile" ? "secondary" : "ghost"} 
                  size="icon" 
                  className="rounded-lg"
                  onClick={() => setViewMode("tile")}
                >
                  <Rows className="w-4 h-4" />
                </Button>
              </div>

              <TabsList className="bg-white p-1 rounded-full shadow-sm border h-12">
                <TabsTrigger value="discover" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Discover</TabsTrigger>
                <TabsTrigger value="interests" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white relative">
                  Interests
                  {peopleWhoLikedMe.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow-lg animate-bounce">
                      {peopleWhoLikedMe.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-72 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm space-y-8 border">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={() => setFilters({ gender: "any", denomination: "any" })}>Reset</Button>
                </div>
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Looking For</Label>
                  <Select value={filters.gender} onValueChange={(val) => setFilters(p => ({ ...p, gender: val }))}>
                    <SelectTrigger className="w-full h-10 rounded-xl bg-muted/50 border-none">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Denomination</Label>
                  <div className="space-y-2">
                    {["Catholic", "Baptist", "Pentecostal", "Anglican", "Orthodox"].map(d => (
                      <div key={d} className="flex items-center space-x-2">
                        <Checkbox 
                          id={d} 
                          checked={filters.denomination === d}
                          onCheckedChange={() => setFilters(p => ({ ...p, denomination: p.denomination === d ? "any" : d }))}
                        />
                        <label htmlFor={d} className="text-sm font-medium leading-none cursor-pointer">{d}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-grow">
              <TabsContent value="discover" className="m-0">
                {usersLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p>Scanning the community...</p>
                  </div>
                ) : filteredMatches.length > 0 ? (
                  <div className={cn(
                    "grid gap-6",
                    viewMode === "grid" 
                      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                      : "grid-cols-1"
                  )}>
                    {filteredMatches.map((match: any) => (
                      <MatchCard 
                        key={match.uid} 
                        match={match} 
                        viewMode={viewMode}
                        onView={() => setSelectedMatch(match)}
                        onInterest={() => handleExpressInterest(match)} 
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No matches found" description="Try widening your filters to see more intentional community members." />
                )}
              </TabsContent>

              <TabsContent value="interests" className="m-0">
                <div className="mb-6 flex gap-2 p-1 bg-white rounded-2xl w-fit shadow-sm border">
                   <Button 
                    variant={interestView === "received" ? "secondary" : "ghost"} 
                    className="rounded-xl h-10 px-6 font-bold"
                    onClick={() => setInterestView("received")}
                   >
                     Received ({peopleWhoLikedMe.length})
                   </Button>
                   <Button 
                    variant={interestView === "sent" ? "secondary" : "ghost"} 
                    className="rounded-xl h-10 px-6 font-bold"
                    onClick={() => setInterestView("sent")}
                   >
                     Sent ({peopleILiked.length})
                   </Button>
                </div>

                {interestView === "received" ? (
                  peopleWhoLikedMe.length > 0 ? (
                    <div className={cn(
                      "grid gap-6",
                      viewMode === "grid" 
                        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                        : "grid-cols-1"
                    )}>
                      {peopleWhoLikedMe.map((match: any) => (
                        <MatchCard 
                          key={match.uid} 
                          match={match} 
                          viewMode={viewMode}
                          isInterest 
                          onView={() => setSelectedMatch(match)}
                          onMessage={() => handleStartChat(match)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="No interest yet" description="New interests will appear here once other members view your profile." />
                  )
                ) : (
                  peopleILiked.length > 0 ? (
                    <div className={cn(
                      "grid gap-6",
                      viewMode === "grid" 
                        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                        : "grid-cols-1"
                    )}>
                      {peopleILiked.map((match: any) => (
                        <MatchCard 
                          key={match.uid} 
                          match={match} 
                          viewMode={viewMode}
                          isSentInterest
                          onView={() => setSelectedMatch(match)}
                          onMessage={() => handleStartChat(match)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="No sent interests" description="Profiles you've expressed interest in will appear here." />
                  )
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>

      <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && setSelectedMatch(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-[2.5rem] border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedMatch?.displayName || "Profile"}'s Spiritual Identity</DialogTitle>
            <DialogDescription>Full profile details and faith journey.</DialogDescription>
          </DialogHeader>
          {selectedMatch && (
            <div className="flex flex-col">
              <div className="relative h-64 md:h-80 w-full">
                <Image
                  src={getValidImageUrl(selectedMatch.photoURL, selectedMatch.uid)}
                  alt={selectedMatch.displayName || ""}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-8 right-8 text-white">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <Badge className="bg-accent text-white border-none rounded-full px-4">
                      {selectedMatch.denomination || "Christian"}
                    </Badge>
                    <Badge className="bg-primary/80 backdrop-blur-md text-white border-none rounded-full px-4">
                      {selectedMatch.maritalStatus || "Single"}
                    </Badge>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-headline font-bold">
                    {selectedMatch.displayName}, {selectedMatch.age}
                  </h2>
                  <p className="flex items-center gap-2 opacity-80 mt-1">
                    <MapPin className="w-4 h-4" /> {selectedMatch.location || "Global"}
                  </p>
                </div>
              </div>

              <div className="p-8 md:p-10 space-y-10">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Info className="w-5 h-5" />
                    <h3 className="text-xl font-headline font-bold">About Me</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic text-lg">
                    "{selectedMatch.bio || "Seeking a partner who shares a passion for the Lord and building a Christ-centered home."}"
                  </p>
                </section>

                <Separator />

                <div className="grid md:grid-cols-2 gap-10">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Church className="w-5 h-5" />
                      <h3 className="font-headline font-bold">Faith & Spiritual Life</h3>
                    </div>
                    <div className="space-y-3 bg-muted/30 p-5 rounded-2xl">
                      <div className="text-sm">
                        <span className="font-bold block text-primary/70 mb-1">Faith Journey</span>
                        <p className="text-muted-foreground leading-relaxed">
                          {selectedMatch.faithDetails || "Currently growing in a personal walk with Christ and active in the local church community."}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                         <div>
                           <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Denomination</span>
                           <p className="text-sm font-medium">{selectedMatch.denomination || "N/A"}</p>
                         </div>
                         <div>
                           <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Parish</span>
                           <p className="text-sm font-medium">{selectedMatch.parish || "N/A"}</p>
                         </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Briefcase className="w-5 h-5" />
                      <h3 className="font-headline font-bold">Professional & Background</h3>
                    </div>
                    <div className="grid gap-4">
                      <div className="flex items-start gap-3">
                        <GraduationCap className="w-5 h-5 text-accent mt-0.5" />
                        <div>
                          <p className="text-sm font-bold">{selectedMatch.education || "University Graduate"}</p>
                          <p className="text-xs text-muted-foreground">Education Background</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Briefcase className="w-5 h-5 text-accent mt-0.5" />
                        <div>
                          <p className="text-sm font-bold">{selectedMatch.occupation || "Professional"}</p>
                          <p className="text-xs text-muted-foreground">Work & Career</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-accent mt-0.5" />
                        <div>
                          <p className="text-sm font-bold">{selectedMatch.motherTongue || "English"}</p>
                          <p className="text-xs text-muted-foreground">Mother Tongue</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <Separator />

                <div className="flex flex-col md:flex-row gap-4 pt-4">
                  <Button 
                    className="flex-grow h-14 rounded-2xl text-lg font-bold shadow-xl bg-primary hover:bg-primary/90"
                    onClick={() => handleExpressInterest(selectedMatch)}
                  >
                    <Heart className="w-5 h-5 mr-2" /> Express Intentional Interest
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-14 rounded-2xl px-8 border-primary text-primary font-bold"
                    onClick={() => handleStartChat(selectedMatch)}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" /> Send Private Message
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MatchCard({ match, onInterest, onMessage, onView, isInterest, isSentInterest, viewMode }: any) {
  const isTile = viewMode === "tile";
  const safePhotoURL = getValidImageUrl(match.photoURL, match.uid);

  if (isTile) {
    return (
      <Card className="border-none shadow-sm hover:shadow-md transition-all flex items-center p-3 rounded-2xl bg-white group">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden cursor-pointer shrink-0" onClick={onView}>
          <Image src={safePhotoURL} alt="" fill className="object-cover" />
        </div>
        <div className="ml-4 flex-grow cursor-pointer" onClick={onView}>
           <h3 className="font-bold text-sm">{match.displayName || 'Member'}, {match.age || '??'}</h3>
           <p className="text-xs text-muted-foreground truncate max-w-[200px]">{match.denomination || 'Christian'} • {match.location || 'Global'}</p>
        </div>
        <div className="flex items-center gap-2 px-2">
           {isInterest || isSentInterest ? (
             <Button size="sm" className="rounded-full h-8 px-4" onClick={onMessage}>Message</Button>
           ) : (
             <>
               <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground" onClick={onView}><Info className="w-4 h-4" /></Button>
               <Button size="sm" className="rounded-full h-8 px-4" onClick={onInterest}>Interest</Button>
             </>
           )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group bg-white rounded-[2rem]">
      <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={onView}>
        <Image
          src={safePhotoURL}
          alt={match.displayName || "Member"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4">
          <Badge className={cn(
            "rounded-full px-3 py-1 border-none shadow-lg",
            isInterest ? "bg-accent text-white" : isSentInterest ? "bg-primary text-white" : "bg-white/40 backdrop-blur-md text-white"
          )}>
            {isInterest ? "Interested in you" : isSentInterest ? "Interest Sent" : <Heart className="w-4 h-4" />}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
          <Button variant="secondary" className="w-full rounded-xl font-bold bg-white/90 backdrop-blur-sm text-primary">
            <UserIcon className="w-4 h-4 mr-2" /> View Full Profile
          </Button>
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="cursor-pointer" onClick={onView}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-headline font-bold">{match.displayName || 'Anonymous'}, {match.age || '??'}</h3>
            <ShieldCheck className="w-5 h-5 text-accent" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
            <MapPin className="w-3 h-3 text-accent" /> {match.location || 'Global'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Church className="w-3.5 h-3.5 text-primary" />
            <span className="truncate">{match.denomination || 'Christian'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="w-3.5 h-3.5 text-primary" />
            <span className="truncate">{match.occupation || 'Professional'}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 italic leading-relaxed">
          "{match.bio || "Searching for a Christ-centered partner..."}"
        </p>

        <div className="pt-2 flex flex-col gap-2">
          {isInterest ? (
            <Button className="w-full rounded-xl bg-accent hover:bg-accent/90 shadow-md font-bold" onClick={onMessage}>
              <MessageCircle className="w-4 h-4 mr-2" /> Message Back
            </Button>
          ) : isSentInterest ? (
            <Button variant="outline" className="w-full rounded-xl border-primary text-primary font-bold h-11" onClick={onMessage}>
              <Send className="w-4 h-4 mr-2" /> Continue Chat
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-grow rounded-xl border-primary text-primary font-bold h-11" onClick={onView}>
                View Profile
              </Button>
              <Button className="flex-grow rounded-xl bg-primary hover:bg-primary/90 shadow-md font-bold h-11" onClick={onInterest}>
                Interest
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, description }: any) {
  return (
    <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed space-y-4 px-6">
      <h3 className="text-xl font-headline font-bold">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto text-sm">{description}</p>
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>}>
      <MatchesContent />
    </Suspense>
  );
}
