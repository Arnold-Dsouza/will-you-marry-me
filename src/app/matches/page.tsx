"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Filter, Heart, MapPin, Church, Briefcase, Loader2, UserPlus, MessageCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp, setDoc, doc, query, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function MatchesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  // Filters state
  const [filters, setFilters] = useState({
    gender: searchParams.get("gender") || "any",
    denomination: searchParams.get("denomination") || "any",
    education: "any",
  });

  // Queries
  const usersQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const receivedInterestsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "interests"), where("receiverId", "==", user.uid));
  }, [db, user]);

  const sentInterestsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "interests"), where("senderId", "==", user.uid));
  }, [db, user]);

  const { data: allUsers, loading: usersLoading } = useCollection(usersQuery);
  const { data: receivedInterests } = useCollection(receivedInterestsQuery);
  const { data: sentInterests } = useCollection(sentInterestsQuery);

  // Client-side filtering for Discover tab
  const filteredMatches = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter((m: any) => {
      if (m.uid === user?.uid) return false;
      // Filter out people we already sent interest to for the Discover tab
      const alreadySent = sentInterests?.some((i: any) => i.receiverId === m.uid);
      if (alreadySent) return false;

      if (filters.gender !== "any" && m.gender !== filters.gender) return false;
      if (filters.denomination !== "any" && m.denomination !== filters.denomination) return false;
      return true;
    });
  }, [allUsers, user, filters, sentInterests]);

  // Map interests to user profiles
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
    }).catch((e) => {
      toast({ title: "Error", description: "Could not send interest.", variant: "destructive" });
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
    toast({ title: "Samples added", description: "The match list is refreshing." });
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="discover" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-headline font-bold text-primary">Matrimonial Search</h2>
              <p className="text-muted-foreground text-sm">Find your intentional partner based on spiritual depth.</p>
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
                  <UserPlus className="w-4 h-4 mr-2" /> Add Samples
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className={`lg:w-72 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white p-6 rounded-3xl shadow-sm space-y-8 border">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Preferences</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary h-8 px-2"
                    onClick={() => setFilters({ gender: "any", denomination: "any", education: "any" })}
                  >
                    Reset
                  </Button>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Looking For</Label>
                  <Select value={filters.gender} onValueChange={(val) => setFilters(p => ({ ...p, gender: val }))}>
                    <SelectTrigger className="w-full h-10 rounded-xl bg-muted/50 border-none">
                      <SelectValue placeholder="Select Gender" />
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

            {/* Content Area */}
            <div className="flex-grow">
              <TabsContent value="discover" className="m-0">
                {usersLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p>Searching for God-ordained matches...</p>
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
                  <EmptyState 
                    title="No new profiles found" 
                    description="Try widening your search preferences or check back later for new intentional singles."
                    action={<Button variant="outline" className="rounded-full" onClick={() => setFilters({ gender: "any", denomination: "any", education: "any" })}>Reset Filters</Button>}
                  />
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
                  <EmptyState 
                    title="No interests yet" 
                    description="Incoming interest requests will appear here once someone views your profile."
                    action={<Button className="rounded-full" asChild><Link href="/profile">Enhance Your Profile</Link></Button>}
                  />
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
          <Button size="icon" className="rounded-full bg-white/40 backdrop-blur-md border border-white/30 hover:bg-white text-white hover:text-primary transition-all">
            <Heart className="w-5 h-5" />
          </Button>
        </div>
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-accent text-white border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider rounded-full shadow-lg">
            98% Compatibility
          </Badge>
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-headline font-bold">{match.displayName || 'Anonymous'}, {match.age || '25'}</h3>
          <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
            <MapPin className="w-3 h-3" /> {match.location || 'Global'}
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

        <p className="text-xs text-muted-foreground line-clamp-2 italic">
          "{match.bio || "Searching for a Christ-centered journey..."}"
        </p>

        <div className="pt-2 flex gap-2">
          {isInterest ? (
            <Button className="flex-grow rounded-xl bg-accent hover:bg-accent/90" onClick={onMessage}>
              <MessageCircle className="w-4 h-4 mr-2" /> Message Back
            </Button>
          ) : (
            <Button className="flex-grow rounded-xl bg-primary hover:bg-primary/90" onClick={onInterest}>
              Express Interest
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, description, action }: any) {
  return (
    <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-muted space-y-4 px-6">
      <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
        <ArrowRight className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-headline font-bold">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto text-sm">{description}</p>
      <div className="pt-4">{action}</div>
    </div>
  );
}
