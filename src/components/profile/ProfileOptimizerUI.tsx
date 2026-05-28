
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
import { Sparkles, Loader2, Save, User, Church, Briefcase, GraduationCap, Ruler, Heart, Star, UserCircle, Globe, Wallet, MapPin, Camera, Upload, BookOpen, Handshake, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const MAX_PROFILE_IMAGES = 10;

const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result as string);
  reader.onerror = () => reject(new Error("Failed to read image file"));
  reader.readAsDataURL(file);
});

export function ProfileOptimizerUI() {
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<AIProfileOptimizerOutput | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const basicSectionRef = useRef<HTMLDivElement>(null);
  const educationSectionRef = useRef<HTMLDivElement>(null);
  const familySectionRef = useRef<HTMLDivElement>(null);
  const hobbiesSectionRef = useRef<HTMLDivElement>(null);
  const partnerSectionRef = useRef<HTMLDivElement>(null);
  const locationSectionRef = useRef<HTMLDivElement>(null);
  const emailSectionRef = useRef<HTMLDivElement>(null);
  const contactSectionRef = useRef<HTMLDivElement>(null);
  const gallerySectionRef = useRef<HTMLDivElement>(null);
  const [openSection, setOpenSection] = useState<'basic' | 'education' | 'family' | 'hobbies' | 'partner' | 'location' | 'email' | 'contact' | 'gallery' | null>('basic');

  const userDocRef = useMemo(() => user && db ? doc(db, "users", user.uid) : null, [user, db]);
  const { data: profile } = useDoc(userDocRef);

  const [formData, setFormData] = useState({
    displayName: "",
    photoURL: "",
    galleryPhotos: [] as string[],
    dobDay: "",
    dobMonth: "",
    dobYear: "",
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
    highestEducation: "",
    college: "",
    educationDetails: "",
    employedIn: "Private",
    occupation: "",
    occupationDetail: "",
    annualIncome: "",
    annualIncomeCurrency: "India - Rs.",
    annualIncomeRange: "9 - 10 Lakhs",
    location: "",
    email: "",
    contactCountryCode: "+91 (India)",
    contactNumber: "",
    countryLivingIn: "",
    residingState: "",
    residingDistrict: "",
    citizenship: "",
    division: "",
    subcaste: "",
    weightKg: "",
    weightLbs: "",
    familyValue: "Moderate",
    familyType: "Nuclear",
    familyStatus: "Middle Class",
    nativePlace: "",
    religiousValues: "",
    fathersOccupation: "",
    mothersOccupation: "",
    noOfBrothers: "0",
    brothersMarried: "0",
    noOfSisters: "0",
    sistersMarried: "0",
    aboutMyFamily: "",
    hobbies: [] as string[],
    hobbiesOther: "",
    favoriteMusic: [] as string[],
    musicOther: "",
    sports: [] as string[],
    sportsOther: "",
    favoriteFood: [] as string[],
    foodOther: "",
    eatingHabits: "Non-Vegetarian",
    drinkingHabits: "No",
    smokingHabits: "No",
    partnerMaritalStatus: "Any",
    partnerHaveChildren: "Doesn't matter",
    partnerAgeRange: "Any",
    partnerHeight: "Any",
    partnerMotherTongue: "Any",
    partnerPhysicalStatus: "Any",
    partnerEatingHabits: "Doesn't matter",
    partnerDrinkingHabits: "Doesn't matter",
    partnerSmokingHabits: "Doesn't matter",
    partnerDenomination: "Any",
    partnerDivision: "Any",
    partnerEducation: "Any",
    partnerEmployedIn: "Any",
    partnerOccupation: "Any",
    partnerAnnualIncome: "Any",
    partnerCountry: "Any",
    rawBio: "",
    faithDetails: "",
    ministryInvolvement: "",
    favoriteVerse: "",
    personalityTraits: [] as string[],
    languagesKnown: [] as string[],
    targetAudienceDescription: "",
  });

  useEffect(() => {
    if (profile) {
      const galleryPhotos = profile.galleryPhotos || profile.images || [];
      const fallbackPrimary = profile.photoURL || user?.photoURL || "";
      const normalizedGallery = galleryPhotos.length > 0 ? galleryPhotos.slice(0, MAX_PROFILE_IMAGES) : (fallbackPrimary ? [fallbackPrimary] : []);

      setFormData({
        displayName: profile.displayName || user?.displayName || "",
        photoURL: normalizedGallery[0] || "",
        galleryPhotos: normalizedGallery,
        age: profile.age?.toString() || "",
        dobDay: profile.dobDay || "",
        dobMonth: profile.dobMonth || "",
        dobYear: profile.dobYear || "",
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
        highestEducation: profile.highestEducation || "",
        college: profile.college || "",
        educationDetails: profile.educationDetails || "",
        employedIn: profile.employedIn || "Private",
        occupation: profile.occupation || "",
        occupationDetail: profile.occupationDetail || "",
        annualIncome: profile.annualIncome || "",
        annualIncomeCurrency: profile.annualIncomeCurrency || "India - Rs.",
        annualIncomeRange: profile.annualIncomeRange || "9 - 10 Lakhs",
        location: profile.location || "",
        email: profile.email || user?.email || "",
        contactCountryCode: profile.contactCountryCode || "+91 (India)",
        contactNumber: profile.contactNumber || "",
        countryLivingIn: profile.countryLivingIn || "",
        residingState: profile.residingState || "",
        residingDistrict: profile.residingDistrict || "",
        citizenship: profile.citizenship || "",
        division: profile.division || "",
        subcaste: profile.subcaste || "",
        weightKg: profile.weightKg || "",
        weightLbs: profile.weightLbs || "",
        familyValue: profile.familyValue || "Moderate",
        familyType: profile.familyType || "Nuclear",
        familyStatus: profile.familyStatus || "Middle Class",
          nativePlace: profile.nativePlace || "",
          religiousValues: profile.religiousValues || "",
          fathersOccupation: profile.fathersOccupation || "",
          mothersOccupation: profile.mothersOccupation || "",
          noOfBrothers: profile.noOfBrothers?.toString() || "0",
          brothersMarried: profile.brothersMarried?.toString() || "0",
          noOfSisters: profile.noOfSisters?.toString() || "0",
          sistersMarried: profile.sistersMarried?.toString() || "0",
          aboutMyFamily: profile.aboutMyFamily || "",
          hobbies: profile.hobbies || [],
          hobbiesOther: profile.hobbiesOther || "",
          favoriteMusic: profile.favoriteMusic || [],
          musicOther: profile.musicOther || "",
          sports: profile.sports || [],
          sportsOther: profile.sportsOther || "",
          favoriteFood: profile.favoriteFood || [],
          foodOther: profile.foodOther || "",
        
        partnerMaritalStatus: profile.partnerMaritalStatus || "Any",
        partnerHaveChildren: profile.partnerHaveChildren || "Doesn't matter",
        partnerAgeRange: profile.partnerAgeRange || "Any",
        partnerHeight: profile.partnerHeight || "Any",
        partnerMotherTongue: profile.partnerMotherTongue || "Any",
        partnerPhysicalStatus: profile.partnerPhysicalStatus || "Any",
        partnerEatingHabits: profile.partnerEatingHabits || "Doesn't matter",
        partnerDrinkingHabits: profile.partnerDrinkingHabits || "Doesn't matter",
        partnerSmokingHabits: profile.partnerSmokingHabits || "Doesn't matter",
        partnerDenomination: profile.partnerDenomination || "Any",
        partnerDivision: profile.partnerDivision || "Any",
        partnerEducation: profile.partnerEducation || "Any",
        partnerEmployedIn: profile.partnerEmployedIn || "Any",
        partnerOccupation: profile.partnerOccupation || "Any",
        partnerAnnualIncome: profile.partnerAnnualIncome || "Any",
        partnerCountry: profile.partnerCountry || "Any",
        eatingHabits: profile.eatingHabits || "Non-Vegetarian",
        drinkingHabits: profile.drinkingHabits || "No",
        smokingHabits: profile.smokingHabits || "No",
        rawBio: profile.bio || "",
        faithDetails: profile.faithDetails || "",
        ministryInvolvement: profile.ministryInvolvement || "",
        favoriteVerse: profile.favoriteVerse || "",
        personalityTraits: profile.personalityTraits || [],
        languagesKnown: profile.languagesKnown || [],
        targetAudienceDescription: profile.targetAudienceDescription || "",
      });
    }
  }, [profile, user]);

  const completion = useMemo(() => {
    const criticalFields = ['displayName', 'age', 'gender', 'location', 'denomination', 'rawBio', 'faithDetails', 'favoriteVerse'];
    const filled = criticalFields.filter(f => formData[f as keyof typeof formData] && formData[f as keyof typeof formData] !== "" && formData[f as keyof typeof formData] !== "any");
    const photoBonus = formData.galleryPhotos.length > 0 ? 1 : 0;
    return Math.round(((filled.length + photoBonus) / (criticalFields.length + 1)) * 100);
  }, [formData]);

  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement | null>) => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openSectionAndScroll = (section: 'basic' | 'education' | 'family' | 'hobbies' | 'partner' | 'location' | 'email' | 'contact' | 'gallery', sectionRef: React.RefObject<HTMLDivElement | null>) => {
    setOpenSection(section);
    // allow layout to update before scrolling
    setTimeout(() => scrollToSection(sectionRef), 80);
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
    const updatedData = {
      ...formData,
      photoURL: formData.galleryPhotos[0] || formData.photoURL || "",
      galleryPhotos: formData.galleryPhotos.slice(0, MAX_PROFILE_IMAGES),
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const oversized = files.find(file => file.size > 2 * 1024 * 1024);
    if (oversized) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select images smaller than 2MB each."
      });
      e.target.value = "";
      return;
    }

    const remainingSlots = MAX_PROFILE_IMAGES - formData.galleryPhotos.length;
    if (remainingSlots <= 0) {
      toast({
        variant: "destructive",
        title: "Photo limit reached",
        description: "You can upload up to 10 photos. Remove one to add another."
      });
      e.target.value = "";
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);
    const newPhotos = await Promise.all(selectedFiles.map(readFileAsDataUrl));

    setFormData(prev => {
      const nextGallery = [...prev.galleryPhotos, ...newPhotos].slice(0, MAX_PROFILE_IMAGES);
      return {
        ...prev,
        galleryPhotos: nextGallery,
        photoURL: nextGallery[0] || prev.photoURL,
      };
    });

    toast({ title: "Photos added", description: "Save profile to keep the gallery." });
    e.target.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => {
      const nextGallery = prev.galleryPhotos.filter((_, currentIndex) => currentIndex !== index);
      return {
        ...prev,
        galleryPhotos: nextGallery,
        photoURL: nextGallery[0] || "",
      };
    });
  };

  const handleSetPrimaryPhoto = (index: number) => {
    setFormData(prev => {
      const nextGallery = [...prev.galleryPhotos];
      const [selectedPhoto] = nextGallery.splice(index, 1);
      if (!selectedPhoto) return prev;
      nextGallery.unshift(selectedPhoto);
      return {
        ...prev,
        galleryPhotos: nextGallery,
        photoURL: selectedPhoto,
      };
    });
  };

  const toggleHobby = (opt: string) => {
    setFormData(prev => {
      const next = { ...prev } as any;
      const set = new Set(next.hobbies || []);
      if (set.has(opt)) set.delete(opt); else set.add(opt);
      next.hobbies = Array.from(set);
      return next;
    });
  };

  const toggleMusic = (opt: string) => {
    setFormData(prev => {
      const next = { ...prev } as any;
      const set = new Set(next.favoriteMusic || []);
      if (set.has(opt)) set.delete(opt); else set.add(opt);
      next.favoriteMusic = Array.from(set);
      return next;
    });
  };

  const toggleSport = (opt: string) => {
    setFormData(prev => {
      const next = { ...prev } as any;
      const set = new Set(next.sports || []);
      if (set.has(opt)) set.delete(opt); else set.add(opt);
      next.sports = Array.from(set);
      return next;
    });
  };

  const toggleFood = (opt: string) => {
    setFormData(prev => {
      const next = { ...prev } as any;
      const set = new Set(next.favoriteFood || []);
      if (set.has(opt)) set.delete(opt); else set.add(opt);
      next.favoriteFood = Array.from(set);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7f2_0%,#f8fafc_28%,#eef2f7_100%)] text-slate-900">
      <div className="mx-auto w-full max-w-[1450px] px-3 py-4 lg:px-4">
        <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="space-y-4 lg:sticky lg:top-4 lg:h-fit">
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <div className="p-4">
                  <div className="relative h-48 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-100">
                    {formData.galleryPhotos[0] ? (
                      <Image src={formData.galleryPhotos[0]} alt="Primary profile" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <User className="h-16 w-16" />
                      </div>
                    )}
                  </div>
                  <Button type="button" className="mt-3 w-full rounded-full bg-slate-900 text-white hover:bg-slate-800" onClick={() => fileInputRef.current?.click()}>
                    Edit Photos
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                </div>
              </Card>

              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-3">
                  <CardTitle className="text-base font-semibold text-slate-900">Profile Info</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>Basic Information</span>
                      <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('basic', basicSectionRef)}>
                        <Edit className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>Education & Occupation</span>
                      <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('education', educationSectionRef)}>
                        <Edit className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>Family Details</span>
                      <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('family', familySectionRef)}>
                        <Edit className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>Hobbies & Interest</span>
                      <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('hobbies', hobbiesSectionRef)}>
                        <Edit className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>Partner Preference</span>
                      <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('partner', partnerSectionRef)}>
                        <Edit className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-3">
                  <CardTitle className="text-base font-semibold text-slate-900">Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>Location</span>
                      <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('location', locationSectionRef)}>
                        <Edit className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>E-mail</span>
                      <div>
                        <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('email', emailSectionRef)}>
                          <Edit className="h-4 w-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <span>Contact Number</span>
                      <div>
                        <button type="button" className="text-xs text-slate-400" onClick={() => openSectionAndScroll('contact', contactSectionRef)}>
                          <Edit className="h-4 w-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-3">
                  <CardTitle className="text-base font-semibold text-slate-900">Enhance Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Camera className="h-4 w-4 text-slate-400" />
                      <span>Photos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-rose-400 text-white px-2 py-0.5 text-xs">{formData.galleryPhotos.length}/{MAX_PROFILE_IMAGES}</Badge>
                      <button type="button" className="text-xs text-slate-400" onClick={() => fileInputRef.current?.click()}>add</button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-3">
                  <CardTitle className="text-base font-semibold text-slate-900">Trust Badge</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <div className="flex items-center gap-3"><Badge className="rounded-full bg-rose-400 px-2 py-1 text-[10px] font-semibold text-white">ID</Badge><span>Identity Badge</span></div>
                      <button type="button" className="text-xs text-slate-400">add</button>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700">
                      <div className="flex items-center gap-3"><Badge className="rounded-full bg-indigo-400 px-2 py-1 text-[10px] font-semibold text-white">PRO</Badge><span>Professional Badge</span></div>
                      <button type="button" className="text-xs text-slate-400">add</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

          <main className="space-y-4">
            <Card className="overflow-hidden rounded-[1.5rem] border border-white/60 bg-gradient-to-br from-[#fffaf6] via-white to-[#f6f8ff] shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
              <CardContent className="grid gap-6 p-5 md:p-6 xl:grid-cols-[1.4fr_0.6fr] xl:items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 shadow-sm">
                    <Sparkles className="h-4 w-4" />
                    Faith-centered profile editing
                  </div>
                  
                  <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Edit Profile</h1>
                    <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">Fields marked with * are mandatory. Keep your profile clear, warm, and easy to scan.</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Profile completion</span>
                      <span className="font-semibold text-slate-900">{completion}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-slate-900" style={{ width: `${completion}%` }} />
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>View</span>
                      <Button asChild variant="ghost" className="h-auto p-0 text-sky-600 hover:bg-transparent hover:text-sky-700">
                        <Link href={user?.uid ? `/matches/${user.uid}` : "/matches"}>Public profile</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {openSection === 'basic' && (
            <div ref={basicSectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-4 md:p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Profile created by <span className="text-rose-500">*</span></Label>
                      <Select value={formData.profileCreatedBy} onValueChange={(val) => setFormData((prev) => ({ ...prev, profileCreatedBy: val }))}>
                        <SelectTrigger className="h-10 rounded border-slate-300 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Self", "Friend", "Parent", "Sibling", "Relative"].map((value) => (
                            <SelectItem key={value} value={value}>{value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Name <span className="text-rose-500">*</span></Label>
                      <Input value={formData.displayName} onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))} className="h-10 rounded border-slate-300" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Date of Birth <span className="text-rose-500">*</span></Label>
                      <div className="flex gap-2">
                        <Select value={formData.dobDay} onValueChange={(val) => setFormData((prev) => ({ ...prev, dobDay: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Day" /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 31 }).map((_, i) => (
                              <SelectItem key={i+1} value={`${i+1}`}>{i+1}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={formData.dobMonth} onValueChange={(val) => setFormData((prev) => ({ ...prev, dobMonth: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Month" /></SelectTrigger>
                          <SelectContent>
                            {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, idx) => (
                              <SelectItem key={m} value={`${idx+1}`}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={formData.dobYear} onValueChange={(val) => setFormData((prev) => ({ ...prev, dobYear: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Year" /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 80 }).map((_, i) => {
                              const year = new Date().getFullYear() - i - 18;
                              return <SelectItem key={year} value={`${year}`}>{year}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Marital status <span className="text-rose-500">*</span></Label>
                      <div className="flex flex-wrap gap-3">
                        {['Unmarried','Widow / Widower','Divorced','Separated'].map((m) => (
                          <button key={m} type="button" onClick={() => setFormData(p => ({ ...p, maritalStatus: m }))} className={formData.maritalStatus === m ? 'rounded-full bg-slate-900 text-white px-4 py-2 text-sm' : 'rounded-full border border-slate-200 px-4 py-2 text-sm'}>{m}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Height <span className="text-rose-500">*</span></Label>
                      <Select value={formData.height} onValueChange={(val) => setFormData((prev) => ({ ...prev, height: val }))}>
                        <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Select height" /></SelectTrigger>
                        <SelectContent>
                          {['4\'6"','4\'8"','4\'10"','5\'0"','5\'2"','5\'4"','5\'6"','5\'8"','5\'10"','6\'0"','6\'2"'].map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Weight</Label>
                      <div className="flex gap-2">
                        <Input placeholder="-- Kgs --" value={formData.weightKg} onChange={(e) => setFormData(prev => ({ ...prev, weightKg: e.target.value }))} className="h-10 rounded border-slate-300" />
                        <span className="self-center text-sm text-slate-400">OR</span>
                        <Input placeholder="-- Lbs --" value={formData.weightLbs} onChange={(e) => setFormData(prev => ({ ...prev, weightLbs: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Physical Status <span className="text-rose-500">*</span></Label>
                      <div className="flex gap-3">
                        {['Normal','Physically Challenged'].map(s => (
                          <button key={s} type="button" onClick={() => setFormData(prev => ({ ...prev, physicalStatus: s }))} className={formData.physicalStatus===s? 'rounded-full bg-slate-900 text-white px-4 py-2 text-sm' : 'rounded-full border border-slate-200 px-4 py-2 text-sm'}>{s}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Denomination <span className="text-rose-500">*</span></Label>
                      <Select value={formData.denomination} onValueChange={(val) => setFormData((prev) => ({ ...prev, denomination: val }))}>
                        <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
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
                      <Label className="text-sm font-semibold text-slate-700">Division</Label>
                      <Input value={formData.division} onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))} className="h-10 rounded border-slate-300" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Subcaste</Label>
                      <Input value={formData.subcaste} onChange={(e) => setFormData(prev => ({ ...prev, subcaste: e.target.value }))} className="h-10 rounded border-slate-300" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Mother tongue</Label>
                      <Select value={formData.motherTongue} onValueChange={(val) => setFormData((prev) => ({ ...prev, motherTongue: val }))}>
                        <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Select language" /></SelectTrigger>
                        <SelectContent>
                          {['English','Hindi','Bengali','Gujarati','Assamese','Kannada','Malayalam','Tamil','Telugu'].map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Languages Known</Label>
                      <div className="flex gap-3">
                        <div className="w-1/2">
                          <div className="h-36 overflow-auto rounded border border-slate-200 bg-white p-2 text-sm">
                            {['Assamese','Bengali','English','Gujarati','Hindi','Kannada','Malayalam','Marathi','Odia','Punjabi'].map(lang => (
                              <div key={lang} className="flex items-center gap-2 py-1">
                                <input type="checkbox" checked={formData.languagesKnown.includes(lang)} onChange={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    languagesKnown: prev.languagesKnown.includes(lang) ? prev.languagesKnown.filter(l => l !== lang) : [...prev.languagesKnown, lang]
                                  }));
                                }} />
                                <span className="text-sm">{lang}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="w-1/2">
                          <div className="h-36 overflow-auto rounded border border-slate-200 bg-white p-2 text-sm">
                            {formData.languagesKnown.length === 0 ? <div className="text-slate-400">No languages selected</div> : formData.languagesKnown.map(l => <div key={l} className="flex items-center justify-between py-1"><span>{l}</span><button type="button" onClick={() => setFormData(prev => ({ ...prev, languagesKnown: prev.languagesKnown.filter(x => x !== l) }))} className="text-xs text-rose-500">remove</button></div>)}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">Double click on the values to select / deselect (or use the checkboxes)</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Eating Habits</Label>
                      <div className="flex gap-3">
                        {['Vegetarian','Non-vegetarian','Eggetarian','Vegan'].map(e => (
                          <button key={e} type="button" className={formData.eatingHabits===e? 'rounded-full bg-slate-900 text-white px-4 py-2 text-sm' : 'rounded-full border border-slate-200 px-4 py-2 text-sm'} onClick={() => setFormData(prev=>({...prev,eatingHabits:e}))}>{e}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Smoking Habits</Label>
                      <div className="flex gap-3">
                        {['Non-smoker','Light / Social smoker','Regular smoker'].map(s => (
                          <button key={s} type="button" className={formData.smokingHabits===s? 'rounded-full bg-slate-900 text-white px-3 py-2 text-sm' : 'rounded-full border border-slate-200 px-3 py-2 text-sm'} onClick={() => setFormData(prev=>({...prev,smokingHabits:s}))}>{s}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Drinking Habits</Label>
                      <div className="flex gap-3">
                        {['Non-drinker','Light / Social drinker','Regular drinker'].map(d => (
                          <button key={d} type="button" className={formData.drinkingHabits===d? 'rounded-full bg-slate-900 text-white px-3 py-2 text-sm' : 'rounded-full border border-slate-200 px-3 py-2 text-sm'} onClick={() => setFormData(prev=>({...prev,drinkingHabits:d}))}>{d}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">About Me <span className="text-rose-500">*</span></Label>
                      <Textarea value={formData.rawBio} onChange={(e)=>setFormData(prev=>({...prev,rawBio:e.target.value}))} className="min-h-[120px] rounded border-slate-300 bg-white resize-none p-3" />
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Min. 50 characters</span>
                        <span>{formData.rawBio.length} Characters typed</span>
                      </div>
                      <div className="pt-2">
                        <Button className="rounded-full bg-rose-500 text-white px-4 py-2" onClick={()=>handleSaveProfile()} disabled={saving}>Save</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'education' && (
            <div ref={educationSectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Education & Occupation</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="rounded bg-slate-50 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Highest Education <span className="text-rose-500">*</span></Label>
                        <Select value={formData.highestEducation} onValueChange={(val) => setFormData(prev => ({ ...prev, highestEducation: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {['High School','Higher Secondary','Diploma','Bachelor\'s','Master\'s','PhD','Other'].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">College / Institution</Label>
                        <Input placeholder="Search for College / Institution" value={formData.college} onChange={(e) => setFormData(prev => ({ ...prev, college: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-semibold text-slate-700">Education in Detail</Label>
                        <Input value={formData.educationDetails} onChange={(e) => setFormData(prev => ({ ...prev, educationDetails: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-semibold text-slate-700">Employed In <span className="text-rose-500">*</span></Label>
                        <div className="flex flex-wrap gap-3">
                          {['Government','Defence','Private','Business','Self Employed','Not Working'].map(opt => (
                            <button key={opt} type="button" onClick={() => setFormData(prev => ({ ...prev, employedIn: opt }))} className={formData.employedIn===opt? 'rounded-full bg-slate-900 text-white px-4 py-2 text-sm' : 'rounded-full border border-slate-200 px-4 py-2 text-sm'}>{opt}</button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Occupation <span className="text-rose-500">*</span></Label>
                        <Select value={formData.occupation} onValueChange={(val) => setFormData(prev => ({ ...prev, occupation: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Select occupation" /></SelectTrigger>
                          <SelectContent>
                            {['BPO / KPO / ITes Professional','Engineer','Teacher','Doctor','Manager','Other'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Occupation in Detail</Label>
                        <Input value={formData.occupationDetail} onChange={(e) => setFormData(prev => ({ ...prev, occupationDetail: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-semibold text-slate-700">Annual Income <span className="text-rose-500">*</span></Label>
                        <div className="flex gap-2">
                          <Select value={formData.annualIncomeCurrency} onValueChange={(val) => setFormData(prev => ({ ...prev, annualIncomeCurrency: val }))}>
                            <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="India - Rs.">India - Rs.</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={formData.annualIncomeRange} onValueChange={(val) => setFormData(prev => ({ ...prev, annualIncomeRange: val }))}>
                            <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Select range" /></SelectTrigger>
                            <SelectContent>
                              {['Below 1 Lakh','1 - 3 Lakhs','3 - 5 Lakhs','5 - 7 Lakhs','7 - 9 Lakhs','9 - 10 Lakhs','10 - 15 Lakhs','15+ Lakhs'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button className="rounded-full bg-emerald-400 text-white px-4 py-2" onClick={() => handleSaveProfile()} disabled={saving}>Save</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'family' && (
            <div ref={familySectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Family Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-4 md:p-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Family Value <span className="text-rose-500">*</span></Label>
                      <div className="flex items-center gap-3">
                        {['Orthodox','Traditional','Moderate','Liberal'].map(opt => (
                          <button key={opt} type="button" onClick={() => setFormData(prev => ({ ...prev, familyValue: opt }))} className={formData.familyValue===opt? 'rounded-full bg-slate-900 text-white px-3 py-1 text-sm' : 'rounded-full border border-slate-200 px-3 py-1 text-sm'}>{opt}</button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Family Type <span className="text-rose-500">*</span></Label>
                        <div className="flex items-center gap-3">
                          {['Joint family','Nuclear family'].map(opt => (
                            <button key={opt} type="button" onClick={() => setFormData(prev => ({ ...prev, familyType: opt }))} className={formData.familyType===opt? 'rounded-full bg-slate-900 text-white px-3 py-1 text-sm' : 'rounded-full border border-slate-200 px-3 py-1 text-sm'}>{opt}</button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Family Status <span className="text-rose-500">*</span></Label>
                        <div className="flex items-center gap-3">
                          {['Middle class','Upper middle class','Rich / Affluent'].map(opt => (
                            <button key={opt} type="button" onClick={() => setFormData(prev => ({ ...prev, familyStatus: opt }))} className={formData.familyStatus===opt? 'rounded-full bg-slate-900 text-white px-3 py-1 text-sm' : 'rounded-full border border-slate-200 px-3 py-1 text-sm'}>{opt}</button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Native Place</Label>
                        <Input value={formData.nativePlace} onChange={(e) => setFormData(prev => ({ ...prev, nativePlace: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Religious values</Label>
                        <Select value={formData.religiousValues} onValueChange={(val) => setFormData(prev => ({ ...prev, religiousValues: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {['Sunday Church Goer','Occasional','Not religious'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Father's Occupation</Label>
                        <Input value={formData.fathersOccupation} onChange={(e) => setFormData(prev => ({ ...prev, fathersOccupation: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Mother's Occupation</Label>
                        <Input value={formData.mothersOccupation} onChange={(e) => setFormData(prev => ({ ...prev, mothersOccupation: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">No. of Brothers</Label>
                        <Select value={formData.noOfBrothers} onValueChange={(val) => setFormData(prev => ({ ...prev, noOfBrothers: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 11 }).map((_, i) => <SelectItem key={i} value={`${i}`}>{i}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Brothers Married</Label>
                        <Select value={formData.brothersMarried} onValueChange={(val) => setFormData(prev => ({ ...prev, brothersMarried: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['None','1','2','3+'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">No. of Sisters</Label>
                        <Select value={formData.noOfSisters} onValueChange={(val) => setFormData(prev => ({ ...prev, noOfSisters: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 11 }).map((_, i) => <SelectItem key={i} value={`${i}`}>{i}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Sisters Married</Label>
                        <Select value={formData.sistersMarried} onValueChange={(val) => setFormData(prev => ({ ...prev, sistersMarried: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['None','1','2','3+'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">About My Family</Label>
                      <Textarea value={formData.aboutMyFamily} onChange={(e) => setFormData(prev => ({ ...prev, aboutMyFamily: e.target.value }))} className="min-h-[100px]" />
                    </div>

                    <div className="pt-2">
                      <Button className="rounded-full bg-emerald-400 text-white px-4 py-2" onClick={() => handleSaveProfile()} disabled={saving}>Save</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'hobbies' && (
            <div ref={hobbiesSectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Hobbies & Interest</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-4 md:p-6">
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">What are your Hobbies and Interest?</Label>
                      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                        {['Art / Handicraft','Cooking','Dancing','Gardening / landscaping','Nature','Painting','Pets','Photography','Playing musical instruments','Puzzles','Internet Surfing','Listening to Music','Movies','Travelling'].map(opt => (
                          <label key={opt} className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={formData.hobbies.includes(opt)} onChange={() => toggleHobby(opt)} />
                            <span className="ml-1">{opt}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Input placeholder="Enter Your Other Hobbies Here. Eg: Adventure, Farming etc..." value={formData.hobbiesOther} onChange={(e) => setFormData(prev => ({ ...prev, hobbiesOther: e.target.value }))} />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Your favourite music</Label>
                      <div className="mt-3 flex gap-3 flex-wrap">
                        {['Film songs','Indian/ Classical Music','Western Music'].map(opt => (
                          <label key={opt} className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={formData.favoriteMusic.includes(opt)} onChange={() => toggleMusic(opt)} />
                            <span className="ml-1">{opt}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Input placeholder="Enter Your Other Music Interests. Eg: Fusion, Blues etc..." value={formData.musicOther} onChange={(e) => setFormData(prev => ({ ...prev, musicOther: e.target.value }))} />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Sports you like</Label>
                      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                        {['Badminton','Carrom','Chess','Cricket','Football','Jogging','Swimming'].map(opt => (
                          <label key={opt} className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={formData.sports.includes(opt)} onChange={() => toggleSport(opt)} />
                            <span className="ml-1">{opt}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Input placeholder="Enter Other Interested Sports. Eg: Martial arts, Kabaddi etc..." value={formData.sportsOther} onChange={(e) => setFormData(prev => ({ ...prev, sportsOther: e.target.value }))} />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Your favourite food</Label>
                      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                        {['Arabic','Bengali','Chinese','Continental','Fast food','Gujarati','Italian','Konkan','Mexican','Moghlai','Punjabi','Rajasthani','South Indian','Spanish','Sushi'].map(opt => (
                          <label key={opt} className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={formData.favoriteFood.includes(opt)} onChange={() => toggleFood(opt)} />
                            <span className="ml-1">{opt}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Input placeholder="Enter Your Other Favourite Food Here. Eg: Thai etc..." value={formData.foodOther} onChange={(e) => setFormData(prev => ({ ...prev, foodOther: e.target.value }))} />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button className="rounded-full bg-emerald-400 text-white px-4 py-2" onClick={() => handleSaveProfile()} disabled={saving}>Save</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'partner' && (
            <div ref={partnerSectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Partner Preference</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-4 md:p-6">
                  <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Marital Status</Label>
                        <Select value={formData.partnerMaritalStatus} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerMaritalStatus: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Any','Never Married','Divorced','Widowed'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Have Children</Label>
                        <Select value={formData.partnerHaveChildren} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerHaveChildren: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Doesn't matter","No","Yes"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Age</Label>
                        <Select value={formData.partnerAgeRange} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerAgeRange: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Any','18-24','25-30','31-35','36-40','41-45','46+'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Height</Label>
                        <Select value={formData.partnerHeight} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerHeight: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Any','4 ft 6 in to 5 ft','5 ft to 5 ft 6 in','5 ft 6 in to 6 ft','6 ft+'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Mother Tongue</Label>
                        <Input value={formData.partnerMotherTongue} onChange={(e) => setFormData(prev => ({ ...prev, partnerMotherTongue: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Physical Status</Label>
                        <Select value={formData.partnerPhysicalStatus} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerPhysicalStatus: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Any','Normal','Physically Challenged'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Eating Habits</Label>
                        <Select value={formData.partnerEatingHabits} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerEatingHabits: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Doesn\'t matter','Vegetarian','Non-Vegetarian','Eggetarian'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Drinking Habits</Label>
                        <Select value={formData.partnerDrinkingHabits} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerDrinkingHabits: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Doesn\'t matter','No','Yes','Occasionally'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Smoking Habits</Label>
                        <Select value={formData.partnerSmokingHabits} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerSmokingHabits: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Doesn\'t matter','No','Yes','Occasionally'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Denomination</Label>
                        <Input value={formData.partnerDenomination} onChange={(e) => setFormData(prev => ({ ...prev, partnerDenomination: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Division</Label>
                        <Input value={formData.partnerDivision} onChange={(e) => setFormData(prev => ({ ...prev, partnerDivision: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Education</Label>
                        <Select value={formData.partnerEducation} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerEducation: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Any','High School','Bachelor\'s','Master\'s','PhD'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Employed In</Label>
                        <Select value={formData.partnerEmployedIn} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerEmployedIn: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Any','Private','Government','Self Employed','Business','Not Working'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Occupation</Label>
                        <Input value={formData.partnerOccupation} onChange={(e) => setFormData(prev => ({ ...prev, partnerOccupation: e.target.value }))} className="h-10 rounded border-slate-300" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Annual Income</Label>
                        <Select value={formData.partnerAnnualIncome} onValueChange={(val) => setFormData(prev => ({ ...prev, partnerAnnualIncome: val }))}>
                          <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Any','Below 1 Lakh','1 - 3 Lakhs','3 - 5 Lakhs','5 - 7 Lakhs','7 - 9 Lakhs','9 - 10 Lakhs','10+ Lakhs'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Country</Label>
                      <Input value={formData.partnerCountry} onChange={(e) => setFormData(prev => ({ ...prev, partnerCountry: e.target.value }))} className="h-10 rounded border-slate-300" />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button className="rounded-full bg-emerald-400 text-white px-4 py-2" onClick={() => handleSaveProfile()} disabled={saving}>Save</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'location' && (
            <div ref={locationSectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-4 md:p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Country Living In <span className="text-rose-500">*</span></Label>
                      <Select value={formData.countryLivingIn} onValueChange={(val) => setFormData(prev => ({ ...prev, countryLivingIn: val }))}>
                        <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['India','USA','UK','Canada','Australia'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Residing State <span className="text-rose-500">*</span></Label>
                      <Input value={formData.residingState} onChange={(e) => setFormData(prev => ({ ...prev, residingState: e.target.value }))} className="h-10 rounded border-slate-300" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Residing District / City <span className="text-rose-500">*</span></Label>
                      <Input value={formData.residingDistrict} onChange={(e) => setFormData(prev => ({ ...prev, residingDistrict: e.target.value }))} className="h-10 rounded border-slate-300" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Citizenship <span className="text-rose-500">*</span></Label>
                      <Select value={formData.citizenship} onValueChange={(val) => setFormData(prev => ({ ...prev, citizenship: val }))}>
                        <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['India','USA','UK','Canada','Australia'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button className="rounded-full bg-emerald-400 text-white px-4 py-2" onClick={() => handleSaveProfile()} disabled={saving}>Save</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'email' && (
            <div ref={emailSectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">E-mail</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-4 md:p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">E-mail <span className="text-rose-500">*</span></Label>
                      <Input value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="h-10 rounded border-slate-300" />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button className="rounded-full bg-emerald-400 text-white px-4 py-2" onClick={() => handleSaveProfile()} disabled={saving}>Save</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'contact' && (
            <div ref={contactSectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Mobile Number</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-4 md:p-6">
                  <div className="grid gap-4 md:grid-cols-3 items-end">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Country Code</Label>
                      <Select value={formData.contactCountryCode} onValueChange={(val) => setFormData(prev => ({ ...prev, contactCountryCode: val }))}>
                        <SelectTrigger className="h-10 rounded border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['+91 (India)','+1 (USA)','+44 (UK)'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Mobile Number <span className="text-rose-500">*</span></Label>
                      <Input value={formData.contactNumber} onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))} className="h-10 rounded border-slate-300" />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button className="rounded-full bg-emerald-400 text-white px-4 py-2" onClick={() => handleSaveProfile()} disabled={saving}>Save</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {openSection === 'gallery' && (
            <div ref={gallerySectionRef}>
              <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900">Photo Gallery</CardTitle>
                      <CardDescription className="text-sm text-slate-500">Upload up to 10 photos. Put your clearest portrait first.</CardDescription>
                    </div>
                    <Badge className="rounded-none bg-rose-400 px-3 py-1 text-xs font-semibold text-white">{formData.galleryPhotos.length}/10</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 md:p-6">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {formData.galleryPhotos.map((photo, index) => (
                      <div key={`${photo}-${index}`} className="group relative aspect-[4/5] cursor-pointer overflow-hidden border border-slate-200 bg-slate-100" onClick={() => handleSetPrimaryPhoto(index)}>
                        <Image src={photo} alt={`Profile photo ${index + 1}`} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                        {index === 0 && <Badge className="absolute left-2 top-2 rounded-none bg-white px-2 py-1 text-[10px] font-semibold text-slate-900">Primary</Badge>}
                        <div className="absolute inset-x-0 bottom-0 flex gap-2 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button type="button" size="sm" variant="secondary" className="h-8 flex-1 rounded-none text-[10px] font-semibold" onClick={(event) => { event.stopPropagation(); handleSetPrimaryPhoto(index); }}>
                            Set Main
                          </Button>
                          <Button type="button" size="sm" variant="destructive" className="h-8 rounded-none text-[10px] font-semibold" onClick={(event) => { event.stopPropagation(); handleRemovePhoto(index); }}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}

                    {Array.from({ length: Math.max(0, MAX_PROFILE_IMAGES - formData.galleryPhotos.length) }).map((_, index) => (
                      <button
                        key={`empty-${index}`}
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex aspect-[4/5] flex-col items-center justify-center gap-2 border border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-slate-500 hover:text-slate-600"
                      >
                        <Camera className="h-6 w-6" />
                        <span className="text-xs font-semibold uppercase tracking-[0.18em]">Add Photo</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            
          </main>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Profile completeness: {completion}%</span>
            <span>{formData.galleryPhotos.length} of {MAX_PROFILE_IMAGES} photos uploaded</span>
          </div>
        </div>
      </div>
    </div>
  );
}
