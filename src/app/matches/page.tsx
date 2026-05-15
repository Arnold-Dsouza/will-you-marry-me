
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, Search, Heart, MapPin, Church, Briefcase, GraduationCap, Ruler } from "lucide-react";
import Image from "next/image";

const matchData = [
  { 
    name: "Sarah Grace", age: 26, denomination: "Catholic", location: "Boston, MA", photoId: "10",
    occupation: "Pediatrician", education: "MD", height: "5'6\"", compatibility: 98
  },
  { 
    name: "Jonathan David", age: 31, denomination: "Baptist", location: "Atlanta, GA", photoId: "11",
    occupation: "Software Architect", education: "MSCS", height: "6'0\"", compatibility: 95
  },
  { 
    name: "Hannah Joy", age: 24, denomination: "Anglican", location: "London, UK", photoId: "12",
    occupation: "Graphic Designer", education: "BFA", height: "5'4\"", compatibility: 92
  },
  { 
    name: "Mark Peterson", age: 29, denomination: "Pentecostal", location: "Sydney, AU", photoId: "13",
    occupation: "Civil Engineer", education: "B.Eng", height: "5'11\"", compatibility: 89
  },
  { 
    name: "Elizabeth Rose", age: 27, denomination: "Presbyterian", location: "Edinburgh, SCT", photoId: "14",
    occupation: "Social Worker", education: "MSW", height: "5'7\"", compatibility: 88
  },
  { 
    name: "Samuel Paul", age: 33, denomination: "Methodist", location: "Toronto, CA", photoId: "15",
    occupation: "Corporate Lawyer", education: "JD", height: "6'2\"", compatibility: 85
  },
];

export default function MatchesPage() {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className={`lg:w-72 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Filters</h3>
                <Button variant="ghost" size="sm" className="text-primary h-8 px-2">Reset</Button>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Denomination</Label>
                <div className="space-y-2">
                  {["Catholic", "Baptist", "Pentecostal", "Anglican", "Orthodox"].map(d => (
                    <div key={d} className="flex items-center space-x-2">
                      <Checkbox id={d} />
                      <label htmlFor={d} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{d}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Education</Label>
                <Select>
                  <SelectTrigger className="w-full h-10 rounded-xl bg-muted/50 border-none">
                    <SelectValue placeholder="Select Degree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctorate">Doctorate</SelectItem>
                    <SelectItem value="masters">Masters</SelectItem>
                    <SelectItem value="bachelors">Bachelors</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Marital Status</Label>
                <div className="space-y-2">
                  {["Never Married", "Widowed", "Divorced"].map(s => (
                    <div key={s} className="flex items-center space-x-2">
                      <Checkbox id={s} />
                      <label htmlFor={s} className="text-sm font-medium leading-none">{s}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Photo Settings</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="with-photo" />
                  <label htmlFor="with-photo" className="text-sm font-medium">Visible to all</label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-headline font-bold">Discover Your Partner</h2>
                <p className="text-muted-foreground text-sm">Showing 1,240 verified Christian profiles</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="lg:hidden rounded-xl h-10" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="w-4 h-4 mr-2" /> Filters
                </Button>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[180px] h-10 rounded-xl bg-white border-muted shadow-sm">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest Members</SelectItem>
                    <SelectItem value="compatibility">Highest Compatibility</SelectItem>
                    <SelectItem value="active">Recently Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {matchData.map((match, idx) => (
                <Card key={idx} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group bg-white rounded-3xl">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={`https://picsum.photos/seed/profile_${match.photoId}/600/800`}
                      alt={match.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      data-ai-hint="portrait"
                    />
                    <div className="absolute top-4 right-4">
                      <Button size="icon" className="rounded-full bg-white/40 backdrop-blur-md border border-white/30 hover:bg-white text-white hover:text-primary transition-all">
                        <Heart className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-accent text-white border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider rounded-full shadow-lg">
                        {match.compatibility}% Compatible
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-headline font-bold">{match.name}, {match.age}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
                        <MapPin className="w-3 h-3" /> {match.location}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Church className="w-3.5 h-3.5 text-primary" />
                        <span className="truncate">{match.denomination}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="w-3.5 h-3.5 text-primary" />
                        <span className="truncate">{match.occupation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GraduationCap className="w-3.5 h-3.5 text-primary" />
                        <span className="truncate">{match.education}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Ruler className="w-3.5 h-3.5 text-primary" />
                        <span className="truncate">{match.height}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Button className="flex-grow rounded-xl bg-primary hover:bg-primary/90 shadow-md">
                        Express Interest
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-xl border-muted shrink-0">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="py-12 text-center">
              <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 px-12 h-14 rounded-full">
                Load More Intentional Matches
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
