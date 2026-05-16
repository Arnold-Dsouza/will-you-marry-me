
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Heart, User, Search, MessageCircle, Sparkles, Star, ScrollText, LogOut, Menu } from "lucide-react";
import { useAuth, useUser, useFirestore, useDoc } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  const db = useFirestore();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch the user's custom profile from Firestore for the photo
  const userDocRef = useMemo(() => {
    if (!user || !db) return null;
    return doc(db, "users", user.uid);
  }, [user, db]);

  const { data: profile } = useDoc(userDocRef);

  // Sync user profile to Firestore on login if it doesn't exist
  useEffect(() => {
    async function syncProfile() {
      if (user && db) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          setDoc(docRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            updatedAt: serverTimestamp(),
            gender: "any",
            denomination: "any",
            bio: "Excited to join this intentional community!"
          }, { merge: true });
        }
      }
    }
    syncProfile();
  }, [user, db]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: "Logged out", description: "Come back soon!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Logout failed", description: error.message });
    }
  };

  const displayPhoto = profile?.photoURL || user?.photoURL;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden rounded-full">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
               <div className="p-6 border-b bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary fill-current" />
                    <span className="font-headline text-xl font-bold text-primary">Menu</span>
                  </div>
               </div>
               <div className="flex flex-col py-4">
                 {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-4 px-6 py-4 font-bold text-sm hover:bg-primary/5",
                          pathname === item.href ? "text-primary bg-primary/5" : "text-muted-foreground"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                 })}
               </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform shadow-lg">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <span className="font-headline text-xl font-bold tracking-tight text-primary hidden sm:inline">
              Will You Marry Me
            </span>
          </Link>
        </div>

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
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="rounded-full gap-2 font-bold hover:bg-primary/5 p-1 pr-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20 relative">
                    {displayPhoto ? (
                      <Image 
                        src={displayPhoto} 
                        alt="Profile" 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <span className="hidden md:inline">{user.displayName?.split(' ')[0] || "Profile"}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full px-3 sm:px-6 font-bold flex">
                  Login
                </Button>
              </Link>
              <Link href="/login?mode=signup">
                <Button size="sm" className="rounded-full px-4 sm:px-6 shadow-lg font-bold bg-accent hover:bg-accent/90">
                  Join
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
