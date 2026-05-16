
"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { MapPin, Church, Briefcase, Loader2, UserPlus, MessageCircle, ArrowRight, Sparkles, UserCheck, Heart } from "lucide-react";
import Image from "next/image";
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { collection, addDoc, serverTimestamp, setDoc, doc, query, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function MatchesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

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

  const handleExpressInterest = async (match: any) => {
    if (!user) {
      toast({ title: "Login required", description: "Please sign in to express interest.", variant: "destructive" });
      return;
    }
    if (!db) return;

    addDoc(collection(db, "interests"), {
      senderId: user.uid,
      senderName: user.displayName || "A Member",
      receiverId: match.uid,
      timestamp: serverTimestamp(),
      status: "pending"
    }).then(() => {
      toast({
        title: "Interest Expressed!",
        description: `We've notified ${match.displayName || 'this member'} of your interest.`,
      });
    });
  };

  const handleStartChat = (match: any) => {
    router.push(`/messages?userId=${match.uid}`);
  };

  const seedSampleData = async () => {
    if (!db) return;
    
    const samples = [
      { uid: "sample1", displayName: "Sarah Grace", age: 24, location: "Nashville, TN", denomination: "Baptist", occupation: "Nurse", gender: "bride", photoURL: "https://picsum.photos/seed/marry2/600/800", bio: "A daughter of the King seeking a partner who loves the Word." },
      { uid: "sample2", displayName: "Michael David", age: 29, location: "Dallas, TX", denomination: "Catholic", occupation: "Architect", gender: "groom", photoURL: "https://picsum.photos/seed/marry3/600/800", bio: "Faith, family, and football. Seeking my partner in ministry." },
      { uid: "sample3", displayName: "Hannah Joy", age: 26, location: "Charlotte, NC", denomination: "Pentecostal", occupation: "Teacher", gender: "bride", photoURL: "https://picsum.photos/seed/marry4/600/800", bio: "Lover of worship and missions. Ready for a Christ-centered home." },
      { uid: "sample4", displayName: "Joshua Paul", age: 31, location: "Atlanta, GA", denomination: "Anglican", occupation: "Doctor", gender: "groom", photoURL: "https://picsum.photos/seed/marry5/600/800", bio: "Committed to service and tradition. Seeking a virtuous woman." },
    ];

    for (const s of samples) {
      setDoc(doc(db, "users", s.uid), s, { merge: true });
    }
    toast({ title: "Samples added", description: "The community is growing!" });
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
            
            <TabsList className="bg-white p-1 rounded-full shadow-sm border h-12">
              <TabsTrigger value="discover" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Discover</TabsTrigger>
              <TabsTrigger value="received" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white relative">
                Interests Received
                {peopleWhoLikedMe.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-white">
                    {peopleWhoLikedMe.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              {user && (
                <Button variant="outline" size="sm" onClick={seedSampleData} className="rounded-full h-10 px-4">
                  <UserPlus className="w-4 h-4 mr-2" /> Seed community
                </Button>
              )}
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
                      <SelectItem value="bride">A Bride</SelectItem>
                      <SelectItem value="groom">A Groom</SelectItem>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredMatches.map((match: any) => (
                      <MatchCard 
                        key={match.uid} 
                        match={match} 
                        onInterest={() => handleExpressInterest(match)} 
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No matches found" description="Try widening your filters to see more intentional community members." />
                )}
              </TabsContent>

              <TabsContent value="received" className="m-0">
                {peopleWhoLikedMe.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {peopleWhoLikedMe.map((match: any) => (
                      <MatchCard 
                        key={match.uid} 
                        match={match} 
                        isInterest 
                        onMessage={() => handleStartChat(match)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No interest yet" description="New interests will appear here once other members view your profile." />
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

function MatchCard({ match, onInterest, onMessage, isInterest }: any) {
  return (
    <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group bg-white rounded-[2rem]">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={match.photoURL || `https://picsum.photos/seed/${match.uid}/600/800`}
          alt={match.displayName || "Member"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          data-ai-hint="member portrait"
        />
        <div className="absolute top-4 right-4">
          <Button size="icon" className="rounded-full bg-white/40 backdrop-blur-md border border-white/30 hover:bg-white text-white hover:text-primary">
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-headline font-bold">{match.displayName || 'Anonymous'}, {match.age || '??'}</h3>
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

        <div className="pt-2 flex gap-2">
          {isInterest ? (
            <Button className="flex-grow rounded-xl bg-accent hover:bg-accent/90 shadow-md" onClick={onMessage}>
              <MessageCircle className="w-4 h-4 mr-2" /> Message Back
            </Button>
          ) : (
            <Button className="flex-grow rounded-xl bg-primary hover:bg-primary/90 shadow-md" onClick={onInterest}>
              Express Interest
            </Button>
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
