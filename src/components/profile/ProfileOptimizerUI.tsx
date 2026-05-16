
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { optimizeProfile, AIProfileOptimizerOutput } from "@/ai/flows/ai-profile-optimizer";
import { Sparkles, Loader2, CheckCircle2, Save, User, MapPin, Church, Briefcase, GraduationCap, Ruler, Heart, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import Image from "next/image";

export function ProfileOptimizerUI() {
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<AIProfileOptimizerOutput | null>(null);
  const { toast } = useToast();

  const userDocRef = user && db ? doc(db, "users", user.uid) : null;
  const { data: profile } = useDoc(userDocRef);

  const [formData, setFormData] = useState({
    displayName: "",
    photoURL: "",
    age: "",
    gender: "bride",
    denomination: "any",
    occupation: "",
    education: "",
    height: "",
    location: "",
    maritalStatus: "never_married",
    rawBio: "",
    faithDetails: "",
    personalityTraits: [] as string[],
    targetAudienceDescription: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || user?.displayName || "",
        photoURL: profile.photoURL || user?.photoURL || "",
        age: profile.age?.toString() || "",
        gender: profile.gender || "bride",
        denomination: profile.denomination || "any",
        occupation: profile.occupation || "",
        education: profile.education || "",
        height: profile.height || "",
        location: profile.location || "",
        maritalStatus: profile.maritalStatus || "never_married",
        rawBio: profile.bio || "",
        faithDetails: profile.faithDetails || "",
        personalityTraits: profile.personalityTraits || [],
        targetAudienceDescription: profile.targetAudienceDescription || "",
      });
    }
  }, [profile, user]);

  const completion = useMemo(() => {
    const fields = ['displayName', 'age', 'gender', 'location', 'denomination', 'rawBio', 'photoURL', 'faithDetails'];
    const filled = fields.filter(f => formData[f as keyof typeof formData] && formData[f as keyof typeof formData] !== "" && formData[f as keyof typeof formData] !== "any");
    return Math.round((filled.length / fields.length) * 100);
  }, [formData]);

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
        description: "Please fill in your bio and faith details to use the AI assistant.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const output = await optimizeProfile({
        rawBio: formData.rawBio,
        faithDetails: formData.faithDetails,
        personalityTraits: formData.personalityTraits,
        targetAudienceDescription: formData.targetAudienceDescription
      });
      setResult(output);
      toast({
        title: "Profile Optimized!",
        description: "We've generated a spiritually grounded bio for you.",
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "AI service is temporarily unavailable.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (bioToSave?: string) => {
    if (!user || !db) {
      toast({ title: "Please log in", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const updatedData = {
        ...formData,
        uid: user.uid,
        email: user.email,
        age: parseInt(formData.age) || 0,
        bio: bioToSave || formData.rawBio,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, "users", user.uid), updatedData, { merge: true });
      toast({ title: "Profile Saved", description: "Your spiritual identity has been updated." });
      if (bioToSave) {
        setFormData(prev => ({ ...prev, rawBio: bioToSave }));
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save failed", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Progress Section */}
      <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem]">
        <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
           <div className="relative shrink-0">
             <div className="w-24 h-24 rounded-full border-4 border-muted flex items-center justify-center bg-white shadow-inner">
               <span className="text-2xl font-black text-primary">{completion}%</span>
             </div>
             <div className="absolute -top-2 -right-2 bg-accent text-white p-2 rounded-xl shadow-lg">
               <Star className="w-4 h-4 fill-current" />
             </div>
           </div>
           <div className="flex-grow space-y-4">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h2 className="text-2xl font-headline font-bold">Profile Strength</h2>
                 <p className="text-muted-foreground text-sm">Fill in your spiritual story to attract intentional matches.</p>
               </div>
               <Badge className={`${completion === 100 ? 'bg-green-500' : 'bg-primary'} text-white px-4 py-1.5 rounded-full font-bold`}>
                 {completion === 100 ? 'Match Ready' : 'In Progress'}
               </Badge>
             </div>
             <Progress value={completion} className="h-3 bg-muted" />
             <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground opacity-60">
                <span className={formData.displayName ? "text-green-500" : ""}>• Name</span>
                <span className={formData.photoURL ? "text-green-500" : ""}>• Photo</span>
                <span className={formData.rawBio ? "text-green-500" : ""}>• Bio</span>
                <span className={formData.faithDetails ? "text-green-500" : ""}>• Faith Journey</span>
                <span className={formData.location ? "text-green-500" : ""}>• Location</span>
             </div>
           </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem]">
            <CardHeader className="bg-primary/5 pb-8">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="relative group w-32 h-32">
                  <div className="w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {formData.photoURL ? (
                      <Image src={formData.photoURL} alt="Profile" fill className="object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                     <span className="text-white text-[10px] font-bold">CHANGE</span>
                  </div>
                </div>
                <div className="flex-grow space-y-2 text-center md:text-left">
                  <CardTitle className="text-3xl font-headline font-bold">Basic Information</CardTitle>
                  <CardDescription>These details help us find the most compatible matches for your journey.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Display Name</Label>
                  <Input 
                    placeholder="Full Name" 
                    value={formData.displayName} 
                    onChange={(e) => setFormData(p => ({ ...p, displayName: e.target.value }))}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Profile Photo URL</Label>
                  <Input 
                    placeholder="https://..." 
                    value={formData.photoURL} 
                    onChange={(e) => setFormData(p => ({ ...p, photoURL: e.target.value }))}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">Age</Label>
                  <Input 
                    type="number" 
                    placeholder="25" 
                    value={formData.age} 
                    onChange={(e) => setFormData(p => ({ ...p, age: e.target.value }))}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">Gender / Identity</Label>
                  <Select value={formData.gender} onValueChange={(val) => setFormData(p => ({ ...p, gender: val }))}>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bride">Seeking a Groom (I am a Bride)</SelectItem>
                      <SelectItem value="groom">Seeking a Bride (I am a Groom)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Location</Label>
                  <Input 
                    placeholder="City, State, Country" 
                    value={formData.location} 
                    onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Church className="w-4 h-4 text-primary" /> Denomination</Label>
                  <Select value={formData.denomination} onValueChange={(val) => setFormData(p => ({ ...p, denomination: val }))}>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Interdenominational</SelectItem>
                      <SelectItem value="Catholic">Catholic</SelectItem>
                      <SelectItem value="Baptist">Baptist</SelectItem>
                      <SelectItem value="Pentecostal">Pentecostal</SelectItem>
                      <SelectItem value="Anglican">Anglican</SelectItem>
                      <SelectItem value="Orthodox">Orthodox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> Occupation</Label>
                  <Input 
                    placeholder="Software Engineer" 
                    value={formData.occupation} 
                    onChange={(e) => setFormData(p => ({ ...p, occupation: e.target.value }))}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> Education</Label>
                  <Input 
                    placeholder="Master's Degree" 
                    value={formData.education} 
                    onChange={(e) => setFormData(p => ({ ...p, education: e.target.value }))}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Ruler className="w-4 h-4 text-primary" /> Height</Label>
                  <Input 
                    placeholder="e.g. 5 ft 10 in" 
                    value={formData.height} 
                    onChange={(e) => setFormData(p => ({ ...p, height: e.target.value }))}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Heart className="w-4 h-4 text-primary" /> Marital Status</Label>
                  <Select value={formData.maritalStatus} onValueChange={(val) => setFormData(p => ({ ...p, maritalStatus: val }))}>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never_married">Never Married</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                      <SelectItem value="divorced">Divorced (Annuled)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-headline font-bold">Personal Traits & Values</Label>
                  <span className="text-xs text-muted-foreground">{formData.personalityTraits.length} selected</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.personalityTraits.map(trait => (
                    <Badge key={trait} variant="secondary" className="px-4 py-2 text-sm rounded-full bg-accent/10 text-accent hover:bg-accent/20 border-none transition-all group">
                      {trait}
                      <button onClick={() => handleRemoveTrait(trait)} className="ml-2 opacity-50 group-hover:opacity-100 transition-opacity">×</button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a trait (e.g. Prayerful, Adventurous, Family-oriented)"
                    value={traitInput}
                    onChange={(e) => setTraitInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTrait())}
                    className="rounded-xl h-12"
                  />
                  <Button onClick={handleAddTrait} variant="outline" className="rounded-xl h-12 px-6">Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-2xl font-headline font-bold">Your Spiritual Story</CardTitle>
              <CardDescription>Tell us about your walk with God and what you seek in a partner.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Faith Journey & Church Involvement</Label>
                <Textarea
                  placeholder="Describe your relationship with Christ, your church home, and any ministries you're involved in..."
                  className="min-h-[150px] rounded-2xl p-4 bg-muted/20 border-none resize-none"
                  value={formData.faithDetails}
                  onChange={(e) => setFormData(prev => ({ ...prev, faithDetails: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Who are you looking for?</Label>
                <Textarea
                  placeholder="What qualities and values are non-negotiable for you in a spouse?"
                  className="min-h-[120px] rounded-2xl p-4 bg-muted/20 border-none resize-none"
                  value={formData.targetAudienceDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudienceDescription: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Bio Assistant */}
        <div className="space-y-8 sticky top-24">
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem]">
            <div className="h-2 bg-gradient-to-r from-primary to-accent" />
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                AI Bio Assistant
              </CardTitle>
              <CardDescription>
                Draft your bio below, and our AI will polish it to reflect your heart and faith.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Bio Draft</Label>
                <Textarea
                  placeholder="Type your current bio or a rough draft here..."
                  className="min-h-[150px] rounded-2xl p-4 bg-muted/20 border-none resize-none"
                  value={formData.rawBio}
                  onChange={(e) => setFormData(prev => ({ ...prev, rawBio: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  className="flex-1 h-12 rounded-xl font-bold border-primary text-primary hover:bg-primary/5"
                  onClick={() => handleSaveProfile()}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save
                </Button>
                <Button 
                  className="flex-1 h-12 rounded-xl font-bold shadow-lg" 
                  onClick={handleOptimize}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Optimize
                </Button>
              </div>
            </CardContent>
          </Card>

          {result ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              <Card className="border-2 border-accent/20 bg-accent/5 shadow-none overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-accent/10 border-b border-accent/10">
                  <CardTitle className="text-lg font-headline text-accent flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Suggested Bio
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm leading-relaxed text-foreground italic whitespace-pre-wrap font-body">
                    "{result.optimizedBio}"
                  </p>
                  <div className="mt-6 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="rounded-full text-accent hover:bg-accent/10" onClick={() => {
                      navigator.clipboard.writeText(result.optimizedBio);
                      toast({ title: "Copied to clipboard" });
                    }}>
                      Copy
                    </Button>
                    <Button size="sm" className="rounded-full bg-accent hover:bg-accent/90" onClick={() => handleSaveProfile(result.optimizedBio)} disabled={saving}>
                      {saving ? "Saving..." : "Apply this Bio"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[2rem]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Improvement Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.improvementSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex gap-3 p-3 rounded-xl bg-muted/40 text-xs">
                      <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold">
                        {idx + 1}
                      </div>
                      {suggestion}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-40 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/10">
              <Sparkles className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-sm font-bold uppercase tracking-widest opacity-40">AI Preview Ready</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
