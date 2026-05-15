
import { Navbar } from "@/components/layout/Navbar";
import { ProfileOptimizerUI } from "@/components/profile/ProfileOptimizerUI";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <header className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-headline font-black text-primary">Your Spiritual Identity</h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed font-body">
            Use our AI-powered tools to express your faith authentically and attract matches who truly align with your journey.
          </p>
        </header>
        
        <ProfileOptimizerUI />
      </main>
    </div>
  );
}
