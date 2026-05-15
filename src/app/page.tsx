
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Heart, Sparkles, ShieldCheck, Users } from "lucide-react";

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-couple");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[90vh] flex items-center overflow-hidden">
          <div className="container mx-auto px-4 z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <h1 className="text-6xl md:text-8xl font-headline font-black text-primary leading-tight">
                Faith First, <br />
                <span className="text-accent italic">Always.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-body">
                The modern space for intentional Christian singles to find their God-ordained partner. 
                Experience a platform designed with sacred elegance and 21st-century technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                  Get Started Free
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full">
                  How it Works
                </Button>
              </div>
            </div>
            
            <div className="relative h-[600px] hidden md:block animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="absolute inset-0 bg-primary/10 rounded-[4rem] -rotate-3 transform -z-10" />
              <div className="absolute inset-0 bg-accent/5 rounded-[4rem] rotate-3 transform -z-10" />
              <div className="relative h-full w-full rounded-[3.5rem] overflow-hidden shadow-2xl">
                <Image
                  src={heroImage?.imageUrl || "https://picsum.photos/seed/marry1/800/1000"}
                  alt={heroImage?.description || "Happy Couple"}
                  fill
                  className="object-cover"
                  priority
                  data-ai-hint="happy couple"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Asymmetrical Grid */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-headline font-bold">A Higher Standard</h2>
              <p className="text-muted-foreground">We've reimagined the matrimonial experience with premium tools built for your journey.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <Card className="md:col-span-8 bg-primary text-primary-foreground border-none overflow-hidden group">
                <CardContent className="p-12 flex flex-col justify-between h-full space-y-8">
                  <div className="space-y-4">
                    <Sparkles className="w-12 h-12 text-accent" />
                    <h3 className="text-4xl font-headline font-bold">AI-Powered Soulmate Matching</h3>
                    <p className="text-lg opacity-80 max-w-md">Our GenAI technology understands spiritual depth, moving beyond basic demographics to find true heart-level alignment.</p>
                  </div>
                  <Link href="/soulmate" className="inline-flex items-center font-bold hover:underline decoration-accent underline-offset-8">
                    Try the Matching Tool →
                  </Link>
                </CardContent>
              </Card>

              <Card className="md:col-span-4 bg-white border-none shadow-sm hover:shadow-md transition-all group">
                <CardContent className="p-10 space-y-6">
                  <ShieldCheck className="w-10 h-10 text-primary" />
                  <h3 className="text-2xl font-headline font-bold">Verified Profiles</h3>
                  <p className="text-muted-foreground">Every member is verified for authenticity, ensuring a community of genuine, faith-driven individuals.</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-4 bg-white border-none shadow-sm hover:shadow-md transition-all group">
                <CardContent className="p-10 space-y-6">
                  <Users className="w-10 h-10 text-accent" />
                  <h3 className="text-2xl font-headline font-bold">Denominational Filters</h3>
                  <p className="text-muted-foreground">Find someone who shares your specific traditions, from Anglican to Pentecostal and everything in between.</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-8 bg-accent text-white border-none shadow-lg group">
                <CardContent className="p-12 flex items-center justify-between gap-8 h-full">
                  <div className="space-y-4">
                    <h3 className="text-4xl font-headline font-bold">AI Profile Optimizer</h3>
                    <p className="text-lg opacity-90 max-w-md">Let our AI help you craft a bio that truly reflects your faith journey and unique personality traits.</p>
                  </div>
                  <div className="hidden lg:block w-32 h-32 bg-white/20 rounded-full blur-3xl" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Active Members Feed Preview */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-headline font-bold">Active This Week</h2>
                <p className="text-muted-foreground">The community is growing every day. See who's new.</p>
              </div>
              <Button variant="ghost" className="text-primary font-bold">View All Matches</Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3">
                    <Image
                      src={`https://picsum.photos/seed/marry_profile_${i}/400/500`}
                      alt={`Member portrait ${i}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      data-ai-hint="portrait"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm font-medium">Recently Active</p>
                    </div>
                  </div>
                  <h4 className="font-headline text-lg font-bold">Member Name</h4>
                  <p className="text-sm text-muted-foreground">Catholic • 28 • New York</p>
                </div>
              ))}
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
              Dedicated to helping intentional Christians find life-long partners built on the foundation of faith, values, and shared spiritual journeys.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-headline font-bold text-lg">Quick Links</h4>
            <ul className="space-y-2 opacity-70">
              <li><Link href="/matches">Discover</Link></li>
              <li><Link href="/soulmate">AI Matching</Link></li>
              <li><Link href="/events">Community Events</Link></li>
              <li><Link href="/pricing">Premium Plans</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-headline font-bold text-lg">Support</h4>
            <ul className="space-y-2 opacity-70">
              <li><Link href="/help">Help Center</Link></li>
              <li><Link href="/safety">Safety Tips</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-20 pt-8 border-t border-white/10 text-center opacity-50 text-sm">
          © {new Date().getFullYear()} Will You Marry Me. All rights reserved. Built with love and faith.
        </div>
      </footer>
    </div>
  );
}
