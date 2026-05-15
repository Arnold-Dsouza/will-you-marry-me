
import { Navbar } from "@/components/layout/Navbar";
import { SoulmateToolUI } from "@/components/matching/SoulmateToolUI";

export default function SoulmatePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <header className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-bold text-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            AI-POWERED MATCHMAKING
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-black text-primary leading-tight">
            Find Your <span className="text-accent italic">Perfect</span> Match
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Our AI analyzes spiritual maturity, core values, and life vision to suggest partners who are truly meant for you.
          </p>
        </header>
        
        <SoulmateToolUI />
      </main>
    </div>
  );
}
