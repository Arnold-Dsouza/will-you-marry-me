
"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, Phone, Video, MoreHorizontal, Loader2, MessageSquare } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function MessagesContent() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId");

  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Set active user from URL if provided
  useEffect(() => {
    if (initialUserId) {
      setActiveUserId(initialUserId);
    }
  }, [initialUserId]);

  // Fetch all users to build the conversation list
  const usersQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);
  const { data: allUsers } = useCollection(usersQuery);

  // Fetch all messages (client-side filter for simplicity in prototype)
  const messagesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "messages"), 
      orderBy("timestamp", "asc")
    );
  }, [db, user]);

  const { data: rawMessages, loading: messagesLoading } = useCollection(messagesQuery);

  // Filter messages between current user and active recipient
  const filteredMessages = useMemo(() => {
    if (!rawMessages || !user || !activeUserId) return [];
    return rawMessages.filter((m: any) => 
      (m.senderId === user.uid && m.receiverId === activeUserId) ||
      (m.senderId === activeUserId && m.receiverId === user.uid)
    );
  }, [rawMessages, user, activeUserId]);

  // Active recipient details
  const activeUser = useMemo(() => {
    return allUsers?.find((u: any) => u.uid === activeUserId);
  }, [allUsers, activeUserId]);

  const handleSendMessage = async () => {
    if (!user || !db || !activeUserId || !newMessage.trim()) return;

    setIsSending(true);
    addDoc(collection(db, "messages"), {
      senderId: user.uid,
      senderName: user.displayName || "Member",
      receiverId: activeUserId,
      text: newMessage,
      timestamp: serverTimestamp(),
    }).then(() => {
      setNewMessage("");
    }).catch((e) => {
      console.error(e);
      toast({ title: "Failed to send", variant: "destructive" });
    }).finally(() => {
      setIsSending(false);
    });
  };

  if (!user) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="p-12 text-center max-w-md border-none shadow-2xl rounded-[3rem]">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-headline font-bold mb-4">Messages are private</h2>
            <p className="text-muted-foreground mb-6">Please log in to your intentional account to view your conversations.</p>
            <Button className="rounded-full px-8 h-12" asChild><Link href="/login">Log In Now</Link></Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />
      
      <main className="flex-grow flex container mx-auto px-4 py-8 gap-6 overflow-hidden max-w-7xl">
        {/* Sidebar */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10 h-12 rounded-2xl bg-white border-none shadow-sm" placeholder="Search members..." />
          </div>
          
          <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {allUsers?.filter((u: any) => u.uid !== user.uid).map((u: any) => (
              <Card 
                key={u.uid} 
                onClick={() => setActiveUserId(u.uid)}
                className={`border-none cursor-pointer transition-all hover:bg-white/80 shadow-none ${activeUserId === u.uid ? 'bg-white shadow-md ring-1 ring-primary/20' : 'bg-transparent'}`}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 relative overflow-hidden">
                    {u.photoURL ? <Image src={u.photoURL} alt={u.displayName || ""} fill className="object-cover" /> : (u.displayName?.charAt(0) || "?")}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <h4 className="font-bold text-sm truncate">{u.displayName || 'Member'}</h4>
                    <p className="text-xs truncate text-muted-foreground">
                      {u.denomination || 'Christian'} • {u.location || 'Global'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <Card className="flex-grow hidden md:flex flex-col border-none shadow-2xl bg-white overflow-hidden rounded-[3rem]">
          {activeUserId ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b flex items-center justify-between bg-white/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary overflow-hidden">
                    {activeUser?.photoURL ? <Image src={activeUser.photoURL} alt="" fill className="object-cover" /> : (activeUser?.displayName?.charAt(0) || "U")}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{activeUser?.displayName || 'Member'}</h3>
                    <p className="text-xs text-accent font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      Ready to connect
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10"><Phone className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10"><Video className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10"><MoreHorizontal className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-muted/5">
                <div className="flex justify-center">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold bg-muted/50 px-4 py-1.5 rounded-full">
                    Conversation with {activeUser?.displayName || 'Member'}
                  </span>
                </div>
                
                {messagesLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
                ) : filteredMessages.length > 0 ? (
                  filteredMessages.map((msg: any, i: number) => (
                    <div key={i} className={`flex gap-3 ${msg.senderId === user.uid ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full shrink-0 self-end overflow-hidden ${msg.senderId === user.uid ? 'bg-accent' : 'bg-primary/10'}`}>
                         {msg.senderId === user.uid && user.photoURL && <Image src={user.photoURL} alt="" width={32} height={32} />}
                         {msg.senderId !== user.uid && activeUser?.photoURL && <Image src={activeUser.photoURL} alt="" width={32} height={32} />}
                      </div>
                      <div className={`max-w-[70%] p-4 rounded-[1.5rem] shadow-sm ${
                        msg.senderId === user.uid 
                        ? 'rounded-br-none bg-primary text-primary-foreground' 
                        : 'rounded-bl-none bg-white text-sm border'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-muted-foreground space-y-4">
                    <MessageSquare className="w-12 h-12 mx-auto opacity-20" />
                    <p className="text-sm italic">"Let your speech always be with grace..."</p>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t bg-white">
                <form className="flex gap-4 items-center" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                  <Input 
                    className="flex-grow h-14 rounded-2xl border-muted bg-muted/10 px-6 focus-visible:ring-primary shadow-none" 
                    placeholder="Write an intentional message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isSending}
                  />
                  <Button size="icon" className="h-14 w-14 rounded-2xl shadow-xl hover:scale-105 transition-all" type="submit" disabled={isSending || !newMessage.trim()}>
                    {isSending ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-muted-foreground opacity-20" />
              </div>
              <h3 className="text-2xl font-headline font-bold">Select a member to start a conversation</h3>
              <p className="text-muted-foreground max-w-sm">Select one of our intentional community members from the sidebar to begin your journey together.</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}
