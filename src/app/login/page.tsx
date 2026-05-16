"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth, useUser } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile 
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Heart, Mail, Lock, Loader2, ArrowRight, User, AlertTriangle } from "lucide-react";
import Image from "next/image";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const mode = searchParams.get("mode");
    setIsSignUp(mode === "signup");
  }, [searchParams]);

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/profile");
    }
  }, [user, authLoading, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Firebase not initialized",
        description: "Credentials missing in src/firebase/config.ts",
      });
      return;
    }

    if (isSignUp && !displayName) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter your full name.",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        toast({ title: "Account created!", description: "Welcome to Will You Marry Me." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back!", description: "Logged in successfully." });
      }
      router.push("/profile");
    } catch (error: any) {
      console.error("Auth error:", error);
      let errorMsg = error.message;
      if (error.code === 'auth/operation-not-allowed') {
        errorMsg = "Enable this method in Firebase Console > Authentication.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMsg = "Email already in use. Try logging in.";
      } else if (error.code === 'auth/weak-password') {
        errorMsg = "Password must be at least 6 characters.";
      }
      
      toast({ 
        variant: "destructive", 
        title: "Authentication Failed", 
        description: errorMsg 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/profile");
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Google Login Failed", 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!auth) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md bg-white rounded-3xl shadow-xl">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Configuration Error</h2>
        <p className="text-sm text-muted-foreground">Check your Firebase API keys.</p>
        <Button variant="outline" className="rounded-full" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-none">
      {/* Hero Visual */}
      <div className="relative hidden md:block bg-primary overflow-hidden">
        <Image 
          src="https://picsum.photos/seed/marry-login/800/1200" 
          alt="Matrimony" 
          fill 
          className="object-cover opacity-50"
          data-ai-hint="wedding couple"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <Heart className="w-12 h-12 mb-6 fill-current" />
          <h2 className="text-4xl font-headline font-bold mb-4">Start Your God-Ordained Journey.</h2>
          <p className="text-lg opacity-90">Find someone who shares your heart for the Lord.</p>
        </div>
      </div>

      {/* Auth Form */}
      <div className="p-8 md:p-16 flex flex-col justify-center bg-background/50">
        <div className="max-w-sm mx-auto w-full space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold text-primary">
              {isSignUp ? "Join Our Community" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp ? "Create an intentional account today." : "Log in to continue your search."}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    placeholder="Enter your name" 
                    className="pl-10 h-11 rounded-xl"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10 h-11 rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-11 rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 rounded-xl font-bold shadow-md"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isSignUp ? "Sign Up Now" : "Sign In"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-11 rounded-xl font-bold"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Image 
              src="https://images.unsplash.com/gh/nextauthjs/next-auth/main/packages/next-auth/provider-logos/google.svg" 
              alt="Google" width={18} height={18} className="mr-2" 
            />
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button 
              onClick={() => router.push(`/login?mode=${isSignUp ? 'login' : 'signup'}`)}
              className="ml-1 text-primary font-bold hover:underline"
            >
              {isSignUp ? "Sign In" : "Register Free"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4">
        <Suspense fallback={<Loader2 className="animate-spin" />}>
          <LoginContent />
        </Suspense>
      </main>
    </div>
  );
}
