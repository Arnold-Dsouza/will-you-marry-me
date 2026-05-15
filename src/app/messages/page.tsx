
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, Phone, Video, MoreHorizontal } from "lucide-react";

const conversations = [
  { name: "Sarah Grace", lastMessage: "I really enjoyed what you shared about your mission trip!", time: "2m ago", active: true, unread: true },
  { name: "Elizabeth Rose", lastMessage: "Does Saturday work for a coffee meet?", time: "1h ago", active: false, unread: false },
  { name: "Hannah Joy", lastMessage: "That church sounds wonderful.", time: "4h ago", active: false, unread: false },
  { name: "Rachel Adams", lastMessage: "God bless you too!", time: "Yesterday", active: false, unread: false },
];

export default function MessagesPage() {
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
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold bg-muted px-3 py-1 rounded-full">Today</span>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 shrink-0 self-end" />
              <div className="max-w-md p-4 rounded-2xl rounded-bl-none bg-muted/30 text-sm leading-relaxed">
                Hi there! I saw your profile and noticed we both serve in the youth ministry. How long have you been doing that?
              </div>
            </div>

            <div className="flex gap-4 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-accent shrink-0 self-end" />
              <div className="max-w-md p-4 rounded-2xl rounded-br-none bg-primary text-primary-foreground text-sm leading-relaxed">
                Hello Sarah! Yes, it's been about 3 years now. It's such a blessing to work with the teens. What about you?
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 shrink-0 self-end" />
              <div className="max-w-md p-4 rounded-2xl rounded-bl-none bg-muted/30 text-sm leading-relaxed">
                I really enjoyed what you shared about your mission trip! It sounds like a life-changing experience.
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t bg-white">
            <div className="flex gap-4 items-center">
              <Input className="flex-grow h-12 rounded-full border-muted bg-muted/10 px-6" placeholder="Write an intentional message..." />
              <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
