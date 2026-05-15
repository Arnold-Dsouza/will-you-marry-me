
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { soulmateMatchingTool, SoulmateMatchingToolOutput } from "@/ai/flows/soulmate-matching-tool";
import { Sparkles, Loader2, Heart, Shield, Home, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SoulmateToolUI() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SoulmateMatchingToolOutput | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    spiritualCompatibility: "",
    values: "",
    lifestylePreferences: "",
  });

  const handleMatch = async () => {
    if (!formData.spiritualCompatibility || !formData.values || !formData.lifestylePreferences) {
      toast({
        title: "Incomplete Details",
        description: "Please fill in all sections to find your best matches.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const output = await soulmateMatchingTool(formData);
      setResults(output);
      toast({
        title: "Matches Found!",
        description: "We've identified highly compatible profiles for you.",
      });
    } catch (error) {
      toast({
        title: "Matching Error",
        description: "We couldn't generate matches at this time.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <Shield className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="font-headline">Spiritual Alignment</CardTitle>
            <CardDescription>Tell us about your walk with God and church community.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Describe your faith journey..." 
              className="min-h-[120px] rounded-xl border-muted"
              value={formData.spiritualCompatibility}
              onChange={(e) => setFormData(p => ({ ...p, spiritualCompatibility: e.target.value }))}
            />
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <Heart className="w-8 h-8 text-accent mb-2" />
            <CardTitle className="font-headline">Core Values</CardTitle>
            <CardDescription>What qualities are non-negotiable in your future spouse?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="List your core values and partner criteria..." 
              className="min-h-[120px] rounded-xl border-muted"
              value={formData.values}
              onChange={(e) => setFormData(p => ({ ...p, values: e.target.value }))}
            />
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <Home className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="font-headline">Lifestyle & Goals</CardTitle>
            <CardDescription>Describe your daily life, career, and family aspirations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="What does your future home look like?" 
              className="min-h-[120px] rounded-xl border-muted"
              value={formData.lifestylePreferences}
              onChange={(e) => setFormData(p => ({ ...p, lifestylePreferences: e.target.value }))}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button 
          size="lg" 
          className="h-16 px-12 text-xl font-bold rounded-full shadow-2xl hover:scale-105 transition-all"
          onClick={handleMatch}
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Analyzing Spiritual Depth...</>
          ) : (
            <><Sparkles className="mr-2 h-6 w-6" /> Generate AI Matches</>
          )}
        </Button>
      </div>

      {results && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.suggestedPartners.map((partner, idx) => (
            <Card key={idx} className="border-none shadow-xl overflow-hidden group">
              <div className="h-2 bg-accent" />
              <CardHeader className="text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4 border-4 border-background shadow-inner">
                  <span className="text-4xl font-headline font-black text-primary/20">
                    {partner.name.charAt(0)}
                  </span>
                </div>
                <CardTitle className="text-2xl font-headline font-bold">{partner.name}</CardTitle>
                <div className="flex flex-col items-center gap-2 mt-2">
                  <div className="flex items-center gap-2 w-full max-w-[120px]">
                    <Progress value={partner.compatibilityScore} className="h-2" />
                    <span className="text-xs font-bold text-accent">{partner.compatibilityScore}%</span>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Compatibility Score</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/30">
                  <h4 className="text-sm font-bold text-primary mb-1 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Spiritual Reasoning
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {partner.reasoning}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">Profile Summary</h4>
                  <p className="text-sm text-muted-foreground">{partner.profileSummary}</p>
                </div>
                <Button className="w-full rounded-xl bg-accent hover:bg-accent/90">
                  View Full Bio
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
