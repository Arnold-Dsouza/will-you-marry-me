"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { addDoc, collection, doc, query, where } from "firebase/firestore";
import { 
  ArrowRight,
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Church,
  Flame,
  Heart,
  LayoutGrid,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  SearchX,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  X,
  List,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useDoc, useFirestore, useUser } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Match = {
  uid: string;
  displayName?: string;
  age?: number;
  gender?: string;
  location?: string;
  denomination?: string;
  occupation?: string;
  bio?: string;
  photoURL?: string;
  galleryPhotos?: string[];
  favoriteVerse?: string;
  createdAt?: string;
  viewedBy?: string[];
  shortlistedBy?: string[];
};

const getValidImageUrl = (url: string | undefined, uid: string) => {
  const fallback = `https://picsum.photos/seed/${uid}/900/1200`;
  if (!url) return fallback;
  try {
    const parsed = new URL(url);
    if (["http:", "https:", "data:"].includes(parsed.protocol)) return url;
  } catch {
    if (url.startsWith("data:image")) return url;
  }
  return fallback;
};

const getPrimaryPhoto = (match: Match) => match.galleryPhotos?.[0] || match.photoURL;

const categoryConfig = [
  { id: "all", title: "All Matches", hint: "Browse everyone in the pool", icon: Users },
  { id: "yourMatches", title: "Your Matches", hint: "Matches based on your preferences", icon: Sparkles },
  { id: "shortlistedByYou", title: "Shortlisted By You", hint: "Profiles you saved", icon: Star },
  { id: "viewedYou", title: "Viewed You", hint: "People who checked your profile", icon: EyeIcon },
  { id: "shortlistedYou", title: "Shortlisted You", hint: "Profiles that shortlisted you", icon: Heart },
  { id: "viewedByYou", title: "Viewed By You", hint: "Profiles you opened recently", icon: BookOpen },
  { id: "newlyJoined", title: "Newly Joined", hint: "Fresh profiles from the last 30 days", icon: Flame },
  { id: "nearby", title: "Nearby Matches", hint: "People close to your area", icon: MapPin },
] as const;

const quickChips = [
  { id: "withPhoto", label: "Profiles with photo" },
  { id: "notSeen", label: "Not seen" },
  { id: "mutual", label: "Mutual interest" },
];

function EyeIcon() {
  return <ShieldCheck className="h-4 w-4" />;
}

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [tab, setTab] = useState<"discover" | "interests">("discover");
  const [interestView, setInterestView] = useState<"received" | "sent">("received");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recommended" | "newest" | "age" | "name">("recommended");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [filters, setFilters] = useState({
    gender: searchParams.get("gender") || "any",
    denomination: searchParams.get("denomination") || "any",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/matches");
    }
  }, [authLoading, router, user]);
  const isAuthLocked = authLoading || !user;

  const usersQuery = useMemo(() => (db ? collection(db, "users") : null), [db]);
  const currentUserRef = useMemo(() => (db && user ? doc(db, "users", user.uid) : null), [db, user]);
  const receivedInterestsQuery = useMemo(
    () => (db && user ? query(collection(db, "interests"), where("receiverId", "==", user.uid)) : null),
    [db, user],
  );
  const sentInterestsQuery = useMemo(
    () => (db && user ? query(collection(db, "interests"), where("senderId", "==", user.uid)) : null),
    [db, user],
  );

  const { data: allUsers, loading: usersLoading } = useCollection(usersQuery);
  const { data: profile } = useDoc(currentUserRef);
  const { data: receivedInterests } = useCollection(receivedInterestsQuery);
  const { data: sentInterests } = useCollection(sentInterestsQuery);

  const completion = useMemo(() => {
    if (!profile) return 0;
    const fields = ["displayName", "age", "gender", "location", "denomination", "bio", "photoURL", "faithDetails", "favoriteVerse"];
    const filled = fields.filter((field) => profile[field] && profile[field] !== "" && profile[field] !== "any");
    return Math.round((filled.length / fields.length) * 100);
  }, [profile]);

  const isProfileComplete = completion >= 90;

  const peopleWhoLikedMe = useMemo(() => {
    if (!receivedInterests || !allUsers) return [];
    return receivedInterests
      .map((interest: any) => {
        const sender = allUsers.find((u: Match) => u.uid === interest.senderId);
        return sender ? { ...sender, interestId: interest.id, status: interest.status } : null;
      })
      .filter(Boolean) as Match[];
  }, [receivedInterests, allUsers]);

  const peopleILiked = useMemo(() => {
    if (!sentInterests || !allUsers) return [];
    return sentInterests
      .map((interest: any) => {
        const receiver = allUsers.find((u: Match) => u.uid === interest.receiverId);
        return receiver ? { ...receiver, interestId: interest.id, status: interest.status } : null;
      })
      .filter(Boolean) as Match[];
  }, [sentInterests, allUsers]);

  const baseMatches = useMemo(() => {
    if (!allUsers) return [];

    return allUsers.filter((match: Match) => {
      if (match.uid === user?.uid) return false;

      const alreadySent = sentInterests?.some((interest: any) => interest.receiverId === match.uid);
      if (alreadySent) return false;

      if (filters.gender !== "any" && match.gender !== filters.gender) return false;
      if (filters.denomination !== "any" && match.denomination !== filters.denomination) return false;

      const nameMatch = searchTerm.trim()
        ? `${match.displayName || ""} ${match.location || ""} ${match.denomination || ""} ${match.occupation || ""}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;

      return nameMatch;
    });
  }, [allUsers, user, filters, searchTerm, sentInterests]);

  const filteredMatches = useMemo(() => {
    let list = [...baseMatches];

    if (activeCategory === "newlyJoined") {
      list = list.filter((match) => {
        if (!match.createdAt) return true;
        const daysOld = (Date.now() - new Date(match.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysOld <= 30;
      });
    }

    if (activeCategory === "shortlistedByYou") {
      list = peopleILiked;
    }

    if (activeCategory === "viewedYou") {
      list = list.filter((match: Match) => match.viewedBy?.includes(user?.uid || ""));
    }

    if (activeCategory === "shortlistedYou") {
      list = peopleWhoLikedMe;
    }

    if (activeCategory === "viewedByYou") {
      list = list.filter((match: Match) => match.viewedBy?.includes(user?.uid || ""));
    }

    if (activeCategory === "nearby") {
      list = list.filter((match) => Boolean(match.location));
    }

    if (activeChips.includes("withPhoto")) {
      list = list.filter((match) => Boolean(match.galleryPhotos?.length || match.photoURL));
    }

    if (activeChips.includes("notSeen")) {
      list = list.filter((match) => !match.viewedBy?.includes(user?.uid || ""));
    }

    if (activeChips.includes("mutual")) {
      list = list.filter((match) => {
        const likedThem = sentInterests?.some((interest: any) => interest.receiverId === match.uid);
        const theyLiked = receivedInterests?.some((interest: any) => interest.senderId === match.uid);
        return likedThem && theyLiked;
      });
    }

    if (sortBy === "newest") {
      list.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
    }

    if (sortBy === "age") {
      list.sort((a, b) => (a.age || 0) - (b.age || 0));
    }

    if (sortBy === "name") {
      list.sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));
    }

    return list;
  }, [baseMatches, activeCategory, activeChips, sortBy, peopleILiked, peopleWhoLikedMe, receivedInterests, sentInterests, user?.uid]);

  const totalPages = Math.max(1, Math.ceil(filteredMatches.length / pageSize));
  const paginatedMatches = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return filteredMatches.slice(start, start + pageSize);
  }, [filteredMatches, page, totalPages]);

  const categoryCounts = useMemo(() => {
    return {
      all: baseMatches.length,
      yourMatches: baseMatches.length,
      shortlistedByYou: peopleILiked.length,
      viewedYou: peopleWhoLikedMe.filter((match: any) => match.viewedBy?.includes(user?.uid || "")).length,
      shortlistedYou: peopleWhoLikedMe.length,
      viewedByYou: baseMatches.filter((match: Match) => match.viewedBy?.includes(user?.uid || "")).length,
      newlyJoined: baseMatches.filter((match: Match) => {
        if (!match.createdAt) return false;
        const daysOld = (Date.now() - new Date(match.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysOld <= 30;
      }).length,
      nearby: baseMatches.filter((match: Match) => Boolean(match.location)).length,
    };
  }, [baseMatches, peopleILiked, peopleWhoLikedMe, user?.uid]);

  const handleExpressInterest = (match: Match) => {
    if (!user || !db) return;

    const interestData = {
      senderId: user.uid,
      senderName: user.displayName || "A Member",
      receiverId: match.uid,
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    addDoc(collection(db, "interests"), interestData).catch(async () => {
      errorEmitter.emit(
        "permission-error",
        new FirestorePermissionError({
          path: "interests",
          operation: "create",
          requestResourceData: interestData,
        }),
      );
    });

    toast({ title: "Interest sent", description: `We've notified ${match.displayName || "this member"}.` });
  };

  const resetAll = () => {
    setFilters({ gender: "any", denomination: "any" });
    setActiveCategory("all");
    setActiveChips([]);
    setSearchTerm("");
    setSortBy("recommended");
    setPage(1);
  };

  if (isAuthLocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#fff7f2_0%,#f8fafc_28%,#eef2f7_100%)]">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7f2_0%,#f8fafc_28%,#eef2f7_100%)] text-slate-900">
      <Navbar />

      <main className="mx-auto w-full max-w-[1600px] px-4 pb-12 pt-8 lg:px-6">
        <Card className="overflow-hidden border border-white/60 bg-gradient-to-br from-[#fffaf6] via-white to-[#f6f8ff] shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
          <CardContent className="grid gap-6 p-6 md:p-8 xl:grid-cols-[1.5fr_0.7fr] xl:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Curated for faith-centered matchmaking
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
                  Find someone who fits your values, pace, and future.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                  A cleaner, more modern matches experience with focused discovery, quicker filtering, and a more premium feel.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge className="rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-900">
                  <Users className="mr-2 h-4 w-4" /> {baseMatches.length} matches available
                </Badge>
                <Badge variant="secondary" className="rounded-full px-4 py-2">
                  <ShieldCheck className="mr-2 h-4 w-4 text-emerald-600" /> Verified profiles first
                </Badge>
                <Badge variant="secondary" className="rounded-full px-4 py-2">
                  <Heart className="mr-2 h-4 w-4 text-rose-500" /> {peopleWhoLikedMe.length} interests received
                </Badge>
              </div>

              {!isProfileComplete && (
                <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Your profile is {completion}% complete</p>
                      <p className="text-sm text-amber-800/80">Finish your profile to improve your match recommendations.</p>
                    </div>
                    <Button asChild className="rounded-full bg-amber-500 text-white hover:bg-amber-600">
                      <Link href="/profile">Complete profile</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Profile completion</span>
                  <span className="font-semibold text-slate-900">{completion}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-900" style={{ width: `${completion}%` }} />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Top visibility</span>
                  <span className="font-semibold text-slate-900">24h activity</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Fresh members</p>
                    <p className="text-xs text-slate-500">Newest profiles bubble up automatically</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="space-y-6 xl:sticky xl:top-24 xl:h-fit">
            <Card className="border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
              <CardHeader className="space-y-2 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <SlidersHorizontal className="h-5 w-5 text-slate-500" /> Discovery
                </CardTitle>
                <p className="text-sm text-slate-500">Choose a lane and refine it fast.</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {categoryConfig.map((item) => {
                  const Icon = item.icon;
                  const active = activeCategory === item.id;
                  return (
                    <button
                      key={item.id}
                      className={cn(
                        "group flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition-all",
                        active ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "border-transparent hover:border-slate-200 hover:bg-slate-50",
                      )}
                      onClick={() => {
                        setActiveCategory(item.id);
                        setPage(1);
                      }}
                    >
                      <span className={cn("mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl", active ? "bg-white/15" : "bg-slate-100 text-slate-600")}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1">
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-medium">{item.title}</span>
                          <span className={cn("text-xs", active ? "text-white/80" : "text-slate-400")}>{categoryCounts[item.id as keyof typeof categoryCounts] || 0}</span>
                        </span>
                        <span className={cn("mt-1 block text-xs leading-5", active ? "text-white/70" : "text-slate-500")}>{item.hint}</span>
                      </span>
                    </button>
                  );
                })}

                <Separator className="my-4" />

                <Button variant="ghost" className="w-full justify-start rounded-2xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900" onClick={resetAll}>
                  <X className="mr-2 h-4 w-4" /> Reset filters
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Spiritual filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Seeking</Label>
                  <Select value={filters.gender} onValueChange={(value) => { setFilters((prev) => ({ ...prev, gender: value })); setPage(1); }}>
                    <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50">
                      <SelectValue placeholder="Any gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any gender</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Denomination</Label>
                  <div className="space-y-2">
                    {["Catholic", "Baptist", "Pentecostal", "Anglican"].map((denomination) => (
                      <div
                        key={denomination}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 transition-colors",
                          filters.denomination === denomination ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 hover:bg-slate-50",
                        )}
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, denomination: prev.denomination === denomination ? "any" : denomination }));
                          setPage(1);
                        }}
                      >
                        <Checkbox checked={filters.denomination === denomination} />
                        <span className="text-sm font-medium">{denomination}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick chips</p>
                  <div className="flex flex-wrap gap-2">
                    {quickChips.map((chip) => {
                      const active = activeChips.includes(chip.id);
                      return (
                        <Button
                          key={chip.id}
                          variant={active ? "default" : "secondary"}
                          className={cn("rounded-full px-4 text-xs font-semibold", active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}
                          onClick={() => {
                            setPage(1);
                            setActiveChips((current) =>
                              current.includes(chip.id) ? current.filter((value) => value !== chip.id) : [...current, chip.id],
                            );
                          }}
                        >
                          {chip.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <section className="space-y-6">
            <Card className="border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by name, location, occupation, denomination"
                    className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={(value: any) => { setSortBy(value); setPage(1); }}>
                    <SelectTrigger className="h-12 w-[160px] rounded-2xl border-slate-200 bg-white">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="age">Age</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1">
                    <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-10 w-10 rounded-2xl" onClick={() => setViewMode("grid")}>
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="h-10 w-10 rounded-2xl" onClick={() => setViewMode("list")}>
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <Badge variant="secondary" className="rounded-full px-4 py-2">
                Showing <span className="mx-1 font-semibold text-slate-900">{filteredMatches.length}</span> results
              </Badge>
              <Badge variant="secondary" className="rounded-full px-4 py-2">Page {page} of {totalPages}</Badge>
              {activeChips.length > 0 && (
                <Badge className="rounded-full bg-slate-900 px-4 py-2 text-white">{activeChips.length} quick filters active</Badge>
              )}
            </div>

            <Tabs value={tab} onValueChange={(value) => setTab(value as "discover" | "interests")}> 
              <div className="mb-6 flex flex-col gap-4 rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
                <TabsList className="h-12 rounded-full bg-slate-100 p-1">
                  <TabsTrigger value="discover" className="rounded-full px-6 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                    Discover
                  </TabsTrigger>
                  <TabsTrigger value="interests" className="rounded-full px-6 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                    Interests
                    {peopleWhoLikedMe.length > 0 && (
                      <span className="ml-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {peopleWhoLikedMe.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <div className="flex flex-wrap gap-2">
                  {quickChips.map((chip) => {
                    const active = activeChips.includes(chip.id);
                    return (
                      <Button
                        key={chip.id}
                        variant={active ? "default" : "outline"}
                        className={cn("rounded-full", active ? "bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700")}
                        onClick={() => {
                          setPage(1);
                          setActiveChips((current) =>
                            current.includes(chip.id) ? current.filter((value) => value !== chip.id) : [...current, chip.id],
                          );
                        }}
                      >
                        {chip.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <TabsContent value="discover" className="m-0 space-y-6">
                {usersLoading ? (
                  <Card className="border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                    <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                      <Loader2 className="mb-4 h-10 w-10 animate-spin text-slate-400" />
                      <p className="text-lg font-medium text-slate-900">Finding matches...</p>
                      <p className="mt-2 text-sm text-slate-500">We’re organizing profiles by your filters and preferences.</p>
                    </CardContent>
                  </Card>
                ) : paginatedMatches.length > 0 ? (
                  <>
                    <div className={cn("grid gap-4", viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1")}>
                      {paginatedMatches.map((match: Match) => (
                        <MatchCard
                          key={match.uid}
                          match={match}
                          viewMode={viewMode}
                          onView={() => router.push(`/matches/${match.uid}`)}
                          onInterest={() => handleExpressInterest(match)}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-4">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 rounded-2xl border-slate-200 bg-white"
                        disabled={page === 1}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="inline-flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        {Array.from({ length: totalPages }).map((_, index) => {
                          const nextPage = index + 1;
                          const active = page === nextPage;
                          return (
                            <button
                              key={nextPage}
                              className={cn(
                                "px-4 py-2.5 text-sm font-medium transition-colors",
                                active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50",
                              )}
                              onClick={() => setPage(nextPage)}
                            >
                              {nextPage}
                            </button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 rounded-2xl border-slate-200 bg-white"
                        disabled={page >= totalPages}
                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <Card className="border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                    <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-100 text-slate-400">
                        <SearchX className="h-10 w-10" />
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-900">No matches found</h3>
                      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Try relaxing your denomination, gender, or quick filters. You can also reset everything and start fresh.
                      </p>
                      <Button className="mt-8 rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800" onClick={resetAll}>
                        Reset filters
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="interests" className="m-0 space-y-6">
                <Card className="border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                  <CardContent className="flex flex-wrap items-center gap-3 p-4">
                    <Button
                      variant={interestView === "received" ? "default" : "outline"}
                      className={cn("rounded-full px-5", interestView === "received" ? "bg-slate-900 text-white" : "border-slate-200")}
                      onClick={() => setInterestView("received")}
                    >
                      Received
                    </Button>
                    <Button
                      variant={interestView === "sent" ? "default" : "outline"}
                      className={cn("rounded-full px-5", interestView === "sent" ? "bg-slate-900 text-white" : "border-slate-200")}
                      onClick={() => setInterestView("sent")}
                    >
                      Sent
                    </Button>
                  </CardContent>
                </Card>

                <div className={cn("grid gap-5", viewMode === "grid" ? "grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2" : "grid-cols-1")}>
                  {(interestView === "received" ? peopleWhoLikedMe : peopleILiked).map((match) => (
                    <MatchCard
                      key={match.uid}
                      match={match}
                      viewMode={viewMode}
                      onView={() => router.push(`/matches/${match.uid}`)}
                      onInterest={() => handleExpressInterest(match)}
                      interestMode
                      interestDirection={interestView}
                    />
                  ))}

                  {(interestView === "received" ? peopleWhoLikedMe : peopleILiked).length === 0 && (
                    <Card className="border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur lg:col-span-2">
                      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <Heart className="mb-4 h-12 w-12 text-slate-300" />
                        <h3 className="text-xl font-semibold text-slate-900">No {interestView} interests yet</h3>
                        <p className="mt-2 text-sm text-slate-500">Once people start engaging with your profile, they’ll appear here.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </section>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:h-fit">
            <Card className="overflow-hidden border border-slate-200/80 bg-slate-900 text-white shadow-xl shadow-slate-900/10">
              <CardHeader className="space-y-3 pb-4">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                  <Sparkles className="h-4 w-4" /> Recommendation panel
                </div>
                <CardTitle className="text-2xl leading-tight text-white">Refine your search like a modern matchmaking app.</CardTitle>
                <p className="text-sm leading-6 text-white/70">
                  Use categories, chips, and sort to keep the page focused while still feeling premium and responsive.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Active category</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {categoryConfig.find((item) => item.id === activeCategory)?.title || "All Matches"}
                  </p>
                </div>

                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Quick filters</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeChips.length > 0 ? (
                      activeChips.map((chip) => (
                        <Badge key={chip} className="rounded-full bg-white/15 px-3 py-1 text-white hover:bg-white/15">
                          {quickChips.find((item) => item.id === chip)?.label || chip}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-white/60">No quick filters selected.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Shortcuts</p>
                  <div className="mt-3 space-y-2">
                    <Button asChild className="w-full justify-between rounded-2xl bg-white text-slate-900 hover:bg-white/90">
                      <Link href="/profile">
                        Edit profile
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-between rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                      <Link href="/profile/settings">
                        Settings
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Need a quick reset?</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800" onClick={resetAll}>
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

function MatchCard({
  match,
  viewMode,
  onView,
  onInterest,
  interestMode = false,
  interestDirection,
}: {
  match: Match;
  viewMode: "grid" | "list";
  onView: () => void;
  onInterest: () => void;
  interestMode?: boolean;
  interestDirection?: "received" | "sent";
}) {
  const primaryPhoto = getValidImageUrl(getPrimaryPhoto(match), match.uid);

  if (viewMode === "list") {
    return (
      <Card className="group overflow-hidden border border-slate-200/80 bg-white/90 transition-all hover:shadow-md">
        <div className="grid gap-0 md:grid-cols-[180px_minmax(0,1fr)]">
          <div className="relative min-h-[180px] cursor-pointer" onClick={onView}>
            <Image src={primaryPhoto} alt={match.displayName || "Match profile"} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            {match.favoriteVerse && (
              <Badge className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-900">
                <BookOpen className="mr-1 h-3.5 w-3.5 text-amber-500" /> {match.favoriteVerse}
              </Badge>
            )}
          </div>

          <CardContent className="flex h-full flex-col justify-between p-3 md:p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                      {match.displayName || "Anonymous"}, {match.age || "??"}
                    </h3>
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> {match.location || "Global"}
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full px-2 py-1 text-xs">
                  {interestMode ? (interestDirection === "received" ? "Interested" : "You liked") : "Live"}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full px-2 py-1 text-xs">
                  <Church className="mr-2 h-3.5 w-3.5" /> {match.denomination || "Christian"}
                </Badge>
                <Badge variant="secondary" className="rounded-full px-2 py-1 text-xs">
                  <Briefcase className="mr-2 h-3.5 w-3.5" /> {match.occupation || "Professional"}
                </Badge>
              </div>

              <p className="line-clamp-3 text-sm leading-5 text-slate-600">
                {match.bio || "Searching for a Christ-centered partner who values growth, purpose, and commitment."}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-sm text-slate-700" onClick={onView}>
                View
              </Button>
              {!interestMode && (
                <Button className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white hover:bg-slate-800" onClick={onInterest}>
                  Express
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-2xl flex flex-col h-full">
      <div className="relative aspect-[4/5] cursor-pointer overflow-hidden" onClick={onView}>
        <Image src={primaryPhoto} alt={match.displayName || "Match profile"} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute right-4 top-4">
          <Badge className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-900 shadow-sm">
            Verified
          </Badge>
        </div>

        {match.favoriteVerse && (
          <Badge className="absolute left-4 top-16 max-w-[calc(100%-2rem)] rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-900 shadow-sm">
            <BookOpen className="mr-1 h-3.5 w-3.5 text-amber-500" /> {match.favoriteVerse}
          </Badge>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">{match.displayName || "Anonymous"}</h3>
              <p className="mt-1 flex items-center gap-2 text-xs text-white/80">
                <MapPin className="h-4 w-4" /> {match.location || "Global"}
              </p>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
          </div>
        </div>
      </div>
      <CardContent className="flex-1 flex flex-col justify-between space-y-3 p-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full px-2 py-1 text-xs">
            <Church className="mr-2 h-3.5 w-3.5" /> {match.denomination || "Christian"}
          </Badge>
          <Badge variant="secondary" className="rounded-full px-2 py-1 text-xs">
            <Briefcase className="mr-2 h-3.5 w-3.5" /> {match.occupation || "Professional"}
          </Badge>
        </div>

        <p className="line-clamp-3 text-sm leading-5 text-slate-600">
          {match.bio || "Searching for a Christ-centered partner who values growth, purpose, and commitment."}
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" onClick={onView}>
            View
          </Button>
          {!interestMode && (
            <Button className="rounded-full bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800" onClick={onInterest}>
              Express
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>}>
      <MatchesContent />
    </Suspense>
  );
}
