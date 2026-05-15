"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Heart, Sparkles, ShieldCheck, Users, Quote, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-couple");
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();

  const [searchParams, setSearchParams] = useState({
    gender: "bride",
    ageFrom: "22",
    ageTo: "30",
    denomination: "any",
    location: ""
  });

  const handleLogin = async () => {
    if (!auth) {
      toast({ variant: "destructive", title: "Configuration Error", description: "Firebase is not initialized." });
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Welcome!", description: "Successfully signed in with Google." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login failed", description: error.message });
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    router.push(`/matches?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Quick Search */}
        <section className="relative min-h-[85vh] flex items-center pt-20 pb-12">
          <div className="absolute inset-0 z-0">
             <Image
                src={heroImage?.imageUrl || "https://picsum.photos/seed/marry1/1200/800"}
                alt="Christian Couple"
                fill
                className="object-cover opacity-20"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
          </div>

          <div className="container mx-auto px-4 z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 mb-16">
              <h1 className="text-5xl md:text-7xl font-headline font-black text-primary leading-tight">
                Your God-Ordained <br />
                <span className="text-accent italic">Life Partner Awaits</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-body">
                The world's most trusted Christian matrimonial site. Find someone who shares your faith, values, and vision for a Christ-centered home.
              </p>
            </div>

            {/* Quick Search Widget */}
            <Card className="max-w-5xl mx-auto border-none shadow-2xl bg-white/80 backdrop-blur-xl p-2 rounded-[2rem]">
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2">Looking for</label>
                  <Select 
                    value={searchParams.gender} 
                    onValueChange={(val) => setSearchParams(p => ({ ...p, gender: val }))}
                  >
                    <SelectTrigger className="h-12 rounded-full bg-white border-muted">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bride">A Bride</SelectItem>
                      <SelectItem value="groom">A Groom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2">Age</label>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={searchParams.ageFrom} 
                      onValueChange={(val) => setSearchParams(p => ({ ...p, ageFrom: val }))}
                    >
                      <SelectTrigger className="h-12 rounded-full bg-white border-muted">
                        <SelectValue placeholder="From" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 33}, (_, i) => i + 18).map(age => (
                          <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground">to</span>
                    <Select 
                      value={searchParams.ageTo} 
                      onValueChange={(val) => setSearchParams(p => ({ ...p, ageTo: val }))}
                    >
                      <SelectTrigger className="h-12 rounded-full bg-white border-muted">
                        <SelectValue placeholder="To" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 33}, (_, i) => i + 18).map(age => (
                          <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2">Denomination</label>
                  <Select 
                    value={searchParams.denomination} 
                    onValueChange={(val) => setSearchParams(p => ({ ...p, denomination: val }))}
                  >
                    <SelectTrigger className="h-12 rounded-full bg-white border-muted">
                      <SelectValue placeholder="Religion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Denomination</SelectItem>
                      <SelectItem value="Catholic">Catholic</SelectItem>
                      <SelectItem value="Baptist">Baptist</SelectItem>
                      <SelectItem value="Pentecostal">Pentecostal</SelectItem>
                      <SelectItem value="Orthodox">Orthodox</SelectItem>
                      <SelectItem value="Anglican">Anglican</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2">Location</label>
                  <Input 
                    className="h-12 rounded-full bg-white border-muted" 
                    placeholder="City or Country" 
                    value={searchParams.location}
                    onChange={(e) => setSearchParams(p => ({ ...p, location: e.target.value }))}
                  />
                </div>

                <Button size="lg" className="h-12 rounded-full font-bold shadow-lg hover:shadow-xl transition-all" onClick={handleSearch}>
                  Search Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 bg-primary/5 border-y">
          <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-24">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg">100% Verified</p>
                <p className="text-xs text-muted-foreground">Mobile & ID Proof</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-bold text-lg">5M+ Members</p>
                <p className="text-xs text-muted-foreground">Global Community</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg">10k+ Success Stories</p>
                <p className="text-xs text-muted-foreground">Marriages every month</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-headline font-bold">Why Choose Us?</h2>
              <p className="text-muted-foreground">We provide a safe and intentional environment for Christian singles.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-500 group">
                <CardContent className="p-8 space-y-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold">AI Matching</h3>
                  <p className="text-muted-foreground leading-relaxed">Our GenAI technology understands spiritual depth, moving beyond basic demographics to find heart-level alignment.</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-500 group">
                <CardContent className="p-8 space-y-6">
                  <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold">Safe & Secure</h3>
                  <p className="text-muted-foreground leading-relaxed">Advanced privacy controls let you manage who sees your profile and photos. 24/7 moderation team.</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-500 group">
                <CardContent className="p-8 space-y-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold">Denomination Specific</h3>
                  <p className="text-muted-foreground leading-relaxed">Whether you are Catholic, Pentecostal, or Anglican, find matches within your specific faith community.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="py-24 bg-muted/30 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-headline font-bold">Successful Marriages</h2>
              <p className="text-muted-foreground">Join thousands of couples who found their God-ordained partner here.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <Card key={i} className="border-none shadow-xl bg-white overflow-hidden flex flex-col md:flex-row h-full">
                  <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto">
                    <Image
                      src={`https://picsum.photos/seed/success_${i}/600/800`}
                      alt="Success Story"
                      fill
                      className="object-cover"
                      data-ai-hint="happy couple"
                    />
                  </div>
                  <div className="p-8 md:w-1/2 flex flex-col justify-center space-y-4">
                    <Quote className="w-10 h-10 text-accent/20" />
                    <p className="italic text-lg text-muted-foreground leading-relaxed">
                      "We found each other through the AI Matching tool. It correctly identified our shared passion for missions and youth ministry."
                    </p>
                    <div>
                      <h4 className="font-bold text-xl">David & Sarah</h4>
                      <p className="text-sm text-accent font-medium">Married June 2023</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white" asChild>
                <Link href="/success-stories">Read More Stories</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Mobile App CTA */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-primary-foreground flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <div className="space-y-8 flex-1 z-10">
                <h2 className="text-4xl md:text-6xl font-headline font-bold">Find your partner on the go.</h2>
                <p className="text-xl opacity-80 leading-relaxed max-w-xl">
                  Download the "Will You Marry Me" app for a faster and smoother experience. Available on iOS and Android.
                </p>
                <div className="flex gap-4">
                  <Button variant="secondary" size="lg" className="h-14 rounded-full px-8" onClick={handleLogin}>App Store</Button>
                  <Button variant="secondary" size="lg" className="h-14 rounded-full px-8" onClick={handleLogin}>Google Play</Button>
                </div>
              </div>
              <div className="relative w-64 h-[500px] hidden lg:block z-10">
                <div className="absolute inset-0 bg-white/10 rounded-[3rem] border border-white/20 backdrop-blur-md rotate-6" />
                <div className="absolute inset-0 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-primary">
                  <Image src="https://picsum.photos/seed/phone1/400/800" alt="App interface" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <span className="font-headline text-2xl font-bold tracking-tight">Will You Marry Me</span>
            </Link>
            <p className="max-w-md text-primary-foreground/70 leading-relaxed">
              The world's premier platform for intentional Christian matrimonial services. Built on faith, secured by technology, and blessed by community.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-headline font-bold text-lg">Platform</h4>
            <ul className="space-y-2 opacity-70">
              <li><Link href="/matches">Search Matches</Link></li>
              <li><Link href="/soulmate">AI Soulmate Tool</Link></li>
              <li><Link href="/pricing">Membership Plans</Link></li>
              <li><Link href="/success-stories">Success Stories</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-headline font-bold text-lg">Support</h4>
            <ul className="space-y-2 opacity-70">
              <li><Link href="/help">Help Center</Link></li>
              <li><Link href="/safety">Safety & Privacy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-20 pt-8 border-t border-white/10 text-center opacity-50 text-sm">
          © {new Date().getFullYear()} Will You Marry Me Matrimony. Dedicated to God's Glory.
        </div>
      </footer>
    </div>
  );
}
