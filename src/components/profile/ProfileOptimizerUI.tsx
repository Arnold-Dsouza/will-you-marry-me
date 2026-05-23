
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
import { Sparkles, Loader2, Save, User, Church, Briefcase, GraduationCap, Ruler, Heart, Star, UserCircle, Globe, Wallet, MapPin, Camera, Upload, BookOpen, Handshake } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export function ProfileOptimizerUI() {
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<AIProfileOptimizerOutput | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userDocRef = useMemo(() => user && db ? doc(db, "users", user.uid) : null, [user, db]);
  const { data: profile } = useDoc(userDocRef);

  const [formData, setFormData] = useState({
    displayName: "",
    photoURL: "",
    age: "",
    gender: "Female",
    profileCreatedBy: "Self",
    maritalStatus: "Never Married",
    motherTongue: "",
    height: "",
    physicalStatus: "Normal",
    denomination: "any",
    diocese: "",
    parish: "",
    education: "",
    employedIn: "Private",
    occupation: "",
    annualIncome: "",
    location: "",
    familyValue: "Moderate",
    familyType: "Nuclear",
    familyStatus: "Middle Class",
    eatingHabits: "Non-Vegetarian",
    drinkingHabits: "No",
    smokingHabits: "No",
    rawBio: "",
    faithDetails: "",
    ministryInvolvement: "",
    favoriteVerse: "",
    personalityTraits: [] as string[],
    targetAudienceDescription: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || user?.displayName || "",
        photoURL: profile.photoURL || user?.photoURL || "",
        age: profile.age?.toString() || "",
        gender: profile.gender || "Female",
        profileCreatedBy: profile.profileCreatedBy || "Self",
        maritalStatus: profile.maritalStatus || "Never Married",
        motherTongue: profile.motherTongue || "",
        height: profile.height || "",
        physicalStatus: profile.physicalStatus || "Normal",
        denomination: profile.denomination || "any",
        diocese: profile.diocese || "",
        parish: profile.parish || "",
        education: profile.education || "",
        employedIn: profile.employedIn || "Private",
        occupation: profile.occupation || "",
        annualIncome: profile.annualIncome || "",
        location: profile.location || "",
        familyValue: profile.familyValue || "Moderate",
        familyType: profile.familyType || "Nuclear",
        familyStatus: profile.familyStatus || "Middle Class",
        eatingHabits: profile.eatingHabits || "Non-Vegetarian",
        drinkingHabits: profile.drinkingHabits || "No",
        smokingHabits: profile.smokingHabits || "No",
        rawBio: profile.bio || "",
        faithDetails: profile.faithDetails || "",
        ministryInvolvement: profile.ministryInvolvement || "",
        favoriteVerse: profile.favoriteVerse || "",
        personalityTraits: profile.personalityTraits || [],
        targetAudienceDescription: profile.targetAudienceDescription || "",
      });
    }
  }, [profile, user]);

  const completion = useMemo(() => {
    const criticalFields = ['displayName', 'age', 'gender', 'location', 'denomination', 'rawBio', 'photoURL', 'faithDetails', 'favoriteVerse'];
    const filled = criticalFields.filter(f => formData[f as keyof typeof formData] && formData[f as keyof typeof formData] !== "" && formData[f as keyof typeof formData] !== "any");
    return Math.round((filled.length / criticalFields.length) * 100);
  }, [formData]);

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
    const updatedData = {
      ...formData,
      uid: user.uid,
      email: user.email,
      age: parseInt(formData.age) || 0,
      bio: bioToSave || formData.rawBio,
      updatedAt: serverTimestamp(),
    };

    setDoc(doc(db, "users", user.uid), updatedData, { merge: true })
      .then(() => {
        toast({ title: "Profile Saved", description: "Your spiritual identity has been updated." });
        if (bioToSave) {
          setFormData(prev => ({ ...prev, rawBio: bioToSave }));
        }
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: `users/${user.uid}`,
          operation: 'update',
          requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 2MB."
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoURL: reader.result as string }));
        toast({ title: "Photo Ready", description: "Save profile to keep the photo." });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-12">
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
                 <h2 className="text-2xl font-headline font-bold">Soulmate Match Strength</h2>
                 <p className="text-muted-foreground text-sm">Deepen your profile to find a God-ordained partner.</p>
               </div>
               <Badge className={`${completion === 100 ? 'bg-green-500' : 'bg-primary'} text-white px-4 py-1.5 rounded-full font-bold`}>
                 {completion === 100 ? 'Spiritually Ready' : 'In Preparation'}
               </Badge>
             </div>
             <Progress value={completion} className="h-3 bg-muted" />
           </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem]">
            <CardHeader className="bg-primary/5 pb-8">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="relative group w-32 h-32">
                  <div className="w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-white shadow-lg relative">
                    {formData.photoURL ? (
                      <Image src={formData.photoURL} alt="Profile" fill className="object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground" />
                    )}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <Camera className="w-6 h-6" />
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div className="flex-grow space-y-2 text-center md:text-left">
                  <CardTitle className="text-3xl font-headline font-bold">Soulmate Identity</CardTitle>
                  <CardDescription>Present your authentic self to the community.</CardDescription>
                  <Button variant="outline" size="sm" className="rounded-full gap-2 mt-2" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4" /> Change Portrait
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={formData.displayName} onChange={(e) => setFormData(p => ({ ...p, displayName: e.target.value }))} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={formData.age} onChange={(e) => setFormData(p => ({ ...p, age: e.target.value }))} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(val) => setFormData(p => ({ ...p, gender: val }))}>
                  <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="City, State" value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label>Marital Status</Label>
                <Select value={formData.maritalStatus} onValueChange={(val) => setFormData(p => ({ ...p, maritalStatus: val }))}>
                  <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Never Married", "Widowed", "Divorced", "Awaiting Divorce"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mother Tongue</Label>
                <Input value={formData.motherTongue} onChange={(e) => setFormData(p => ({ ...p, motherTongue: e.target.value }))} className="rounded-xl h-12" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-2xl font-headline font-bold flex items-center gap-2"><Church className="w-6 h-6 text-primary" /> Spiritual Depth</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Denomination</Label>
                  <Select value={formData.denomination} onValueChange={(val) => setFormData(p => ({ ...p, denomination: val }))}>
                    <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
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
                  <Label className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Favorite Bible Verse</Label>
                  <Input placeholder="e.g., Philippians 4:13" value={formData.favoriteVerse} onChange={(e) => setFormData(p => ({ ...p, favoriteVerse: e.target.value }))} className="rounded-xl h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Handshake className="w-4 h-4 text-primary" /> Ministry Involvement</Label>
                <Textarea 
                  placeholder="How do you serve in your local church?" 
                  className="min-h-[100px] rounded-2xl resize-none" 
                  value={formData.ministryInvolvement} 
                  onChange={(e) => setFormData(p => ({ ...p, ministryInvolvement: e.target.value }))} 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-2xl font-headline font-bold flex items-center gap-2"><Briefcase className="w-6 h-6 text-primary" /> Life & Career</CardTitle>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label>Education</Label><Input value={formData.education} onChange={(e) => setFormData(p => ({ ...p, education: e.target.value }))} className="rounded-xl h-12" /></div>
              <div className="space-y-2"><Label>Occupation</Label><Input value={formData.occupation} onChange={(e) => setFormData(p => ({ ...p, occupation: e.target.value }))} className="rounded-xl h-12" /></div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 sticky top-24">
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem]">
            <div className="h-2 bg-gradient-to-r from-primary to-accent" />
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                Soulmate AI Assistant
              </CardTitle>
              <CardDescription>Let AI help you find the right words.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Bio Draft</Label>
                <Textarea
                  placeholder="Share your heart and vision..."
                  className="min-h-[150px] rounded-2xl p-4 bg-muted/20 border-none resize-none"
                  value={formData.rawBio}
                  onChange={(e) => setFormData(prev => ({ ...prev, rawBio: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Faith Journey</Label>
                <Textarea
                  placeholder="How has God transformed your life?"
                  className="min-h-[100px] rounded-2xl p-4 bg-muted/20 border-none resize-none text-xs"
                  value={formData.faithDetails}
                  onChange={(e) => setFormData(prev => ({ ...prev, faithDetails: e.target.value }))}
                />
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => handleSaveProfile()} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save
                </Button>
                <Button className="flex-1 h-12 rounded-xl shadow-lg" onClick={handleOptimize} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Optimize
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className="border-2 border-accent/20 bg-accent/5 rounded-[2.5rem] animate-in slide-in-from-right-4 duration-500">
              <CardContent className="p-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-3">Refined Spiritual Bio</h4>
                <p className="text-sm italic font-body text-foreground/80 leading-relaxed">"{result.optimizedBio}"</p>
                <Button size="sm" className="w-full mt-6 rounded-full bg-accent shadow-md" onClick={() => handleSaveProfile(result.optimizedBio)} disabled={saving}>
                  Apply AI Bio
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
