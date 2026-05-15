
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, Star, Shield, MessageCircle, Heart } from "lucide-react";

const plans = [
  {
    name: "Standard",
    price: "0",
    description: "Basic features to explore",
    features: [
      "Create profile",
      "Upload 5 photos",
      "View limited matches",
      "Express interest (5/day)",
    ],
    buttonText: "Join for Free",
    variant: "outline"
  },
  {
    name: "Gold",
    price: "29",
    description: "Most popular for intentional dating",
    features: [
      "Unlimited matches",
      "AI Soulmate Tool usage",
      "Send messages",
      "Priority customer support",
      "See who viewed your profile",
    ],
    buttonText: "Go Gold",
    variant: "default",
    popular: true
  },
  {
    name: "Platinum",
    price: "59",
    description: "Maximum visibility and coaching",
    features: [
      "All Gold features",
      "Top placement in searches",
      "AI Profile optimization",
      "Personalized match alerts",
      "Dedicated relationship manager",
    ],
    buttonText: "Get Platinum",
    variant: "accent"
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <header className="text-center max-w-2xl mx-auto mb-20 space-y-6">
          <h1 className="text-5xl md:text-7xl font-headline font-black text-primary">Membership Plans</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Choose the right plan to find your life partner. Every membership supports our community mission.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <Card key={idx} className={cn(
              "border-none shadow-xl flex flex-col relative overflow-hidden rounded-[2.5rem]",
              plan.popular ? "scale-105 ring-2 ring-primary z-10" : "bg-white"
            )}>
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-6 py-1 rounded-bl-2xl font-bold text-xs">
                  MOST POPULAR
                </div>
              )}
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-headline font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-black text-primary">${plan.price}</span>
                  <span className="text-muted-foreground font-medium">/month</span>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-grow space-y-4">
                <div className="h-px bg-muted mb-6" />
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="p-8">
                <Button className={cn(
                  "w-full h-12 rounded-full font-bold shadow-lg",
                  plan.variant === "accent" ? "bg-accent hover:bg-accent/90" : ""
                )} variant={plan.variant as any}>
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Shield, title: "Verified Profiles", desc: "Every profile is manually screened" },
            { icon: MessageCircle, title: "Secure Chat", desc: "Built-in safe messaging system" },
            { icon: Star, title: "AI Optimized", desc: "Advanced spiritual compatibility" },
            { icon: Heart, title: "Faith First", desc: "Values-based matching algorithms" },
          ].map((benefit, bIdx) => (
            <div key={bIdx} className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary">
                <benefit.icon className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg">{benefit.title}</h4>
              <p className="text-xs text-muted-foreground">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
