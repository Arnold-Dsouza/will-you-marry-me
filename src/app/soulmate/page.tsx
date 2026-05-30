
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { SoulmateToolUI } from "@/components/matching/SoulmateToolUI";
import { Sparkles, Heart, Shield, Star, Church } from "lucide-react";
import { useUser } from "@/firebase";
import { Loader2 } from "lucide-react";

export default function SoulmatePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/soulmate");
    }
  }, [authLoading, router, user]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <header className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 text-primary font-black text-sm mb-4 uppercase tracking-widest shadow-sm">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            AI Soulmate Finding Technology
          </div>
          <h1 className="text-5xl md:text-8xl font-headline font-black text-primary leading-tight">
            Find Your <span className="text-accent italic">God-Ordained</span> Soulmate
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-body">
            Moving beyond simple dating. Our Soulmate AI analyzes spiritual gifts, ministry vision, and prayer alignment to suggest partners who share your intentional journey with Christ.
          </p>
        </header>
        
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
          {[
            { icon: Shield, title: "Spiritual Safety", desc: "Verified Christian profiles focused on intentional marriage." },
            { icon: Church, title: "Ministry Vision", desc: "Alignment in how you serve the body of Christ." },
            { icon: Heart, title: "Heart Resonance", desc: "Matching based on shared core values and prayer life." },
            { icon: Star, title: "AI Precision", desc: "Advanced LLMs that understand spiritual depth." },
          ].map((benefit, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group border-none">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <benefit.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-headline font-bold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </section>

        <SoulmateToolUI />

        <section className="mt-32 text-center bg-accent/5 rounded-[4rem] p-12 md:p-24 border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-headline font-bold">"Whoso findeth a wife findeth a good thing, and obtaineth favour of the Lord."</h2>
            <p className="text-lg text-muted-foreground italic">— Proverbs 18:22</p>
          </div>
        </section>
      </main>
    </div>
  );
}
