
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Heart, User, Search, MessageCircle, Sparkles, Star, ScrollText, LogOut } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { name: "Matches", href: "/matches", icon: Search },
  { name: "Soulmate AI", href: "/soulmate", icon: Sparkles },
  { name: "Success Stories", href: "/success-stories", icon: ScrollText },
  { name: "Pricing", href: "/pricing", icon: Star },
  { name: "Messages", href: "/messages", icon: MessageCircle },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Welcome back!", description: "Successfully logged in with Google." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login failed", description: error.message });
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    toast({ title: "Logged out", description: "Come back soon!" });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform shadow-lg">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight text-primary">
            Will You Marry Me
          </span>
        </Link>

        <div className="hidden xl:flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-bold transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="rounded-full px-6 font-bold hidden sm:flex" onClick={handleLogin}>
                Login
              </Button>
              <Button size="sm" className="rounded-full px-6 shadow-lg font-bold bg-accent hover:bg-accent/90" onClick={handleLogin}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
