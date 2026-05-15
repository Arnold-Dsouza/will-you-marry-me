
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { optimizeProfile, AIProfileOptimizerOutput } from "@/ai/flows/ai-profile-optimizer";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ProfileOptimizerUI() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIProfileOptimizerOutput | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    rawBio: "",
    faithDetails: "",
    personalityTraits: [] as string[],
    targetAudienceDescription: "",
  });

  const [traitInput, setTraitInput] = useState("");

  const handleAddTrait = () => {
    if (traitInput.trim() && !formData.personalityTraits.includes(traitInput.trim())) {
      setFormData(prev => ({
        ...prev,
        personalityTraits: [...prev.personalityTraits, traitInput.trim()]
      }));
      setTraitInput("");
    }
  };

  const handleRemoveTrait = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personalityTraits: prev.personalityTraits.filter(t => t !== trait)
    }));
  };

  const handleOptimize = async () => {
    if (!formData.rawBio || !formData.faithDetails) {
      toast({
        title: "Missing Information",
        description: "Please fill in your current bio and faith details.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const output = await optimizeProfile(formData);
      setResult(output);
      toast({
        title: "Profile Optimized!",
        description: "Your bio has been updated with faith-filled insights.",
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Something went wrong while optimizing your profile.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <Card className="border-none shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            AI Bio Assistant
          </CardTitle>
          <CardDescription>
            Help our AI understand your heart, and we'll craft a bio that resonates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rawBio">Your Current Bio / Draft</Label>
            <Textarea
              id="rawBio"
              placeholder="Tell us a bit about yourself in your own words..."
              className="min-h-[120px] rounded-xl"
              value={formData.rawBio}
              onChange={(e) => setFormData(prev => ({ ...prev, rawBio: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faithDetails">Faith Journey & Church Involvement</Label>
            <Textarea
              id="faithDetails"
              placeholder="E.g. I grew up in a Presbyterian church, currently serve in the worship team..."
              className="min-h-[100px] rounded-xl"
              value={formData.faithDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, faithDetails: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Personality Traits</Label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {formData.personalityTraits.map(trait => (
                <Badge key={trait} variant="secondary" className="px-3 py-1 flex items-center gap-1">
                  {trait}
                  <button onClick={() => handleRemoveTrait(trait)} className="hover:text-destructive">×</button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add trait (e.g. Adventurous)"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={traitInput}
                onChange={(e) => setTraitInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTrait()}
              />
              <Button onClick={handleAddTrait} variant="outline" type="button">Add</Button>
            </div>
          </div>

          <Button 
            className="w-full h-12 rounded-xl text-lg font-bold" 
            onClick={handleOptimize}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Optimizing...</>
            ) : (
              "Optimize My Profile"
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6 h-full">
        {result ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <Card className="border-2 border-accent/20 bg-accent/5 shadow-none overflow-hidden">
              <CardHeader className="bg-accent/10 border-b border-accent/10">
                <CardTitle className="text-xl font-headline text-accent flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Your Optimized Bio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed text-foreground italic whitespace-pre-wrap">
                  "{result.optimizedBio}"
                </p>
                <div className="mt-6 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => {
                    navigator.clipboard.writeText(result.optimizedBio);
                    toast({ title: "Copied to clipboard" });
                  }}>
                    Copy to Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Suggestions for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.improvementSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="flex gap-3 p-3 rounded-lg bg-muted/30 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    {suggestion}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full min-h-[400px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/10">
            <Sparkles className="w-16 h-16 opacity-20 mb-4" />
            <p className="text-xl font-headline">Fill out the form to see the magic</p>
            <p className="max-w-xs text-sm">Your faith-first bio will appear here after optimization.</p>
          </div>
        )}
      </div>
    </div>
  );
}
