"use client";

import { useState, useEffect } from "react";
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
import { Heart, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/profile");
    }
  }, [user, authLoading, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
        toast({ title: "Account created!", description: "Welcome to Will You Marry Me." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back!", description: "You have successfully logged in." });
      }
      router.push("/profile");
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: isSignUp ? "Sign up failed" : "Login failed", 
        description: error.message 
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
      toast({ title: "Success!", description: "Signed in with Google." });
      router.push("/profile");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Google login failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-none">
          
          {/* Visual Side */}
          <div className="relative hidden md:block bg-primary overflow-hidden">
            <Image 
              src="https://picsum.photos/seed/login-church/800/1200" 
              alt="Church Marriage" 
              fill 
              className="object-cover opacity-60 mix-blend-overlay"
              data-ai-hint="church marriage"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
            <div className="absolute bottom-12 left-12 right-12 text-white space-y-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <h2 className="text-4xl font-headline font-bold leading-tight">
                Start Your God-Ordained Journey Today.
              </h2>
              <p className="text-lg opacity-90 font-body">
                Join 5 million intentional Christian singles looking for a Christ-centered home.
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="p-8 md:p-16 flex flex-col justify-center">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="p-0 space-y-2 mb-8">
                <CardTitle className="text-3xl font-headline font-bold text-primary">
                  {isSignUp ? "Create intentional account" : "Welcome back"}
                </CardTitle>
                <CardDescription className="text-base">
                  {isSignUp 
                    ? "Begin your search for a life partner with faith at the center." 
                    : "Log in to continue your intentional conversations."}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0 space-y-6">
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        className="h-12 rounded-xl bg-muted/30 border-none"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        className="pl-11 h-12 rounded-xl bg-muted/30 border-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Password</Label>
                      {!isSignUp && (
                        <Button variant="link" className="text-xs p-0 h-auto text-muted-foreground">
                          Forgot Password?
                        </Button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-11 h-12 rounded-xl bg-muted/30 border-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl font-bold text-base shadow-lg transition-all hover:scale-[1.02]"
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
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-muted-foreground font-bold">Or continue with</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl font-bold border-muted-foreground/20 hover:bg-muted/10"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <Image 
                    src="https://images.unsplash.com/gh/nextauthjs/next-auth/main/packages/next-auth/provider-logos/google.svg" 
                    alt="Google" 
                    width={20} 
                    height={20} 
                    className="mr-3"
                  />
                  Sign in with Google
                </Button>
              </CardContent>

              <CardFooter className="p-0 pt-8 justify-center">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Don't have an account yet?"}
                  <button 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="ml-2 text-primary font-bold hover:underline"
                  >
                    {isSignUp ? "Sign In" : "Register Free"}
                  </button>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
