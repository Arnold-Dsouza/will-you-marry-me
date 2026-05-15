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
import { Filter, Heart, MapPin, Church, Briefcase, Loader2, UserPlus } from "lucide-react";
import Image from "next/image";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function MatchesPage() {
  const [showFilters, setShowFilters] = useState(false);
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

  const usersQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const { data: allMatches, loading } = useCollection(usersQuery);

  // Client-side filtering for simplicity in MVP
  const filteredMatches = useMemo(() => {
    if (!allMatches) return [];
    return allMatches.filter((m: any) => {
      if (m.uid === user?.uid) return false;
      if (filters.gender !== "any" && m.gender !== filters.gender) return false;
      if (filters.denomination !== "any" && m.denomination !== filters.denomination) return false;
      return true;
    });
  }, [allMatches, user, filters]);

  const handleExpressInterest = async (match: any) => {
    if (!user) {
      toast({ title: "Login required", description: "Please sign in to express interest.", variant: "destructive" });
      return;
    }
    if (!db) return;

    addDoc(collection(db, "interests"), {
      senderId: user.uid,
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

  const seedSampleData = async () => {
    if (!db) return;
    
    const samples = [
      { uid: "sample1", displayName: "Sarah Grace", age: 24, location: "Nashville, TN", denomination: "Baptist", occupation: "Nurse", gender: "bride", photoURL: "https://picsum.photos/seed/marry2/600/800" },
      { uid: "sample2", displayName: "Michael David", age: 29, location: "Dallas, TX", denomination: "Catholic", occupation: "Architect", gender: "groom", photoURL: "https://picsum.photos/seed/marry3/600/800" },
      { uid: "sample3", displayName: "Hannah Joy", age: 26, location: "Charlotte, NC", denomination: "Pentecostal", occupation: "Teacher", gender: "bride", photoURL: "https://picsum.photos/seed/marry4/600/800" },
      { uid: "sample4", displayName: "Joshua Paul", age: 31, location: "Atlanta, GA", denomination: "Anglican", occupation: "Doctor", gender: "groom", photoURL: "https://picsum.photos/seed/marry5/600/800" },
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
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className={`lg:w-72 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Filters</h3>
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

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Education</Label>
                <Select value={filters.education} onValueChange={(val) => setFilters(p => ({ ...p, education: val }))}>
                  <SelectTrigger className="w-full h-10 rounded-xl bg-muted/50 border-none">
                    <SelectValue placeholder="Select Degree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="doctorate">Doctorate</SelectItem>
                    <SelectItem value="masters">Masters</SelectItem>
                    <SelectItem value="bachelors">Bachelors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-headline font-bold">Discover Your Partner</h2>
                <p className="text-muted-foreground text-sm">
                  {loading ? "Searching profiles..." : `Showing ${filteredMatches?.length || 0} intentional profiles`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {user && (
                  <Button variant="outline" size="sm" onClick={seedSampleData} className="rounded-full">
                    <UserPlus className="w-4 h-4 mr-2" /> Add Samples
                  </Button>
                )}
                <Button variant="outline" className="lg:hidden rounded-xl h-10" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="w-4 h-4 mr-2" /> Filters
                </Button>
              </div>
            </header>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p>Loading spiritual matches...</p>
              </div>
            ) : filteredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMatches.map((match: any) => (
                  <Card key={match.uid} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group bg-white rounded-3xl">
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
                          Highly Compatible
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

                      <div className="pt-2 flex gap-2">
                        <Button className="flex-grow rounded-xl bg-primary hover:bg-primary/90 shadow-md" onClick={() => handleExpressInterest(match)}>
                          Express Interest
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-muted">
                <p className="text-muted-foreground mb-4">No matching members found. Try adjusting your filters or add samples.</p>
                <Button variant="outline" className="rounded-full" asChild>
                  <Link href="/profile">Complete Your Profile</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
