"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, Phone, Video, MoreHorizontal, Loader2 } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function MessagesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // In a full app, we'd query messages between the current user and selected recipient
  const messagesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "messages"), orderBy("timestamp", "asc"));
  }, [db]);

  const { data: messages, loading } = useCollection(messagesQuery);

  const handleSendMessage = async () => {
    if (!user || !db || !newMessage.trim()) return;

    setIsSending(true);
    addDoc(collection(db, "messages"), {
      senderId: user.uid,
      senderName: user.displayName,
      text: newMessage,
      timestamp: serverTimestamp(),
      receiverId: "sarah_grace_sample" // Placeholder for MVP
    }).then(() => {
      setNewMessage("");
    }).catch(() => {
      toast({ title: "Failed to send", variant: "destructive" });
    }).finally(() => {
      setIsSending(false);
    });
  };

  const conversations = [
    { name: "Sarah Grace", lastMessage: messages[messages.length-1]?.text || "I really enjoyed what you shared!", time: "Active", active: true, unread: false },
    { name: "Elizabeth Rose", lastMessage: "Does Saturday work for coffee?", time: "1h ago", active: false, unread: false },
    { name: "Hannah Joy", lastMessage: "That church sounds wonderful.", time: "4h ago", active: false, unread: false },
  ];

  if (!user) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="p-12 text-center max-w-md border-none shadow-xl rounded-[2rem]">
            <h2 className="text-2xl font-headline font-bold mb-4">Messages are private</h2>
            <p className="text-muted-foreground mb-6">Please log in to your intentional account to view your conversations.</p>
            <Button className="rounded-full px-8">Log In Now</Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow flex container mx-auto px-4 py-8 gap-6 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10 h-12 rounded-full bg-white border-none shadow-sm" placeholder="Search conversations..." />
          </div>
          
          <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {conversations.map((chat, idx) => (
              <Card key={idx} className={`border-none cursor-pointer transition-all hover:bg-white shadow-none ${chat.active ? 'bg-white shadow-md' : 'bg-transparent'}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 relative">
                    {chat.name.charAt(0)}
                    {chat.unread && <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-white" />}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-sm truncate">{chat.name}</h4>
                      <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className={`text-xs truncate ${chat.unread ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <Card className="flex-grow hidden md:flex flex-col border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
          {/* Chat Header */}
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">S</div>
              <div>
                <h3 className="font-bold">Sarah Grace</h3>
                <p className="text-xs text-accent font-medium">Online now</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full"><Phone className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="rounded-full"><Video className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="w-4 h-4" /></Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-8 space-y-6">
            <div className="flex justify-center">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold bg-muted px-3 py-1 rounded-full">Conversation Started</span>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : (
              messages.map((msg: any, i: number) => (
                <div key={i} className={`flex gap-4 ${msg.senderId === user.uid ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 self-end ${msg.senderId === user.uid ? 'bg-accent' : 'bg-primary/10'}`} />
                  <div className={`max-w-md p-4 rounded-2xl ${
                    msg.senderId === user.uid 
                    ? 'rounded-br-none bg-primary text-primary-foreground' 
                    : 'rounded-bl-none bg-muted/30 text-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t bg-white">
            <form className="flex gap-4 items-center" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
              <Input 
                className="flex-grow h-12 rounded-full border-muted bg-muted/10 px-6" 
                placeholder="Write an intentional message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isSending}
              />
              <Button size="icon" className="h-12 w-12 rounded-full shadow-lg" type="submit" disabled={isSending || !newMessage.trim()}>
                {isSending ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
          </div>
        </Card>
      </main>
    </div>
  );
}
