
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
import { Filter, Search, Heart, MapPin, Church } from "lucide-react";
import Image from "next/image";

const matchData = [
  { name: "Sarah Grace", age: 26, denomination: "Catholic", location: "Boston, MA", photoId: "10" },
  { name: "Jonathan David", age: 31, denomination: "Baptist", location: "Atlanta, GA", photoId: "11" },
  { name: "Hannah Joy", age: 24, denomination: "Anglican", location: "London, UK", photoId: "12" },
  { name: "Mark Peterson", age: 29, denomination: "Pentecostal", location: "Sydney, AU", photoId: "13" },
  { name: "Elizabeth Rose", age: 27, denomination: "Presbyterian", location: "Edinburgh, SCT", photoId: "14" },
  { name: "Samuel Paul", age: 33, denomination: "Methodist", location: "Toronto, CA", photoId: "15" },
];

export default function MatchesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Search & Filter Bar */}
      <section className="bg-white border-b py-6 sticky top-16 z-40">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10 h-12 rounded-full bg-muted/20 border-none w-full" placeholder="Search by name, location, or church..." />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Select>
              <SelectTrigger className="w-full md:w-[180px] h-12 rounded-full border-muted bg-white">
                <SelectValue placeholder="Denomination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="catholic">Catholic</SelectItem>
                <SelectItem value="baptist">Baptist</SelectItem>
                <SelectItem value="pentecostal">Pentecostal</SelectItem>
                <SelectItem value="anglican">Anglican</SelectItem>
                <SelectItem value="orthodox">Orthodox</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger className="w-full md:w-[150px] h-12 rounded-full border-muted bg-white">
                <SelectValue placeholder="Age Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="18-25">18 - 25</SelectItem>
                <SelectItem value="26-35">26 - 35</SelectItem>
                <SelectItem value="36-50">36 - 50</SelectItem>
                <SelectItem value="51+">51+</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="h-12 rounded-full px-6 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <header className="mb-12">
          <h2 className="text-3xl font-headline font-bold">Discover Your Partner</h2>
          <p className="text-muted-foreground">Showing verified profiles based on your spiritual preferences.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {matchData.map((match, idx) => (
            <Card key={idx} className="border-none shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer bg-white">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={`https://picsum.photos/seed/profile_${match.photoId}/600/750`}
                  alt={match.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  data-ai-hint="portrait"
                />
                <div className="absolute top-4 right-4">
                  <Button size="icon" className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white text-white hover:text-primary transition-all">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <h3 className="text-2xl font-headline font-bold">{match.name}, {match.age}</h3>
                    <div className="flex items-center gap-4 text-sm opacity-90">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {match.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-1.5 text-primary text-sm font-bold">
                  <Church className="w-4 h-4" /> {match.denomination}
                </div>
                <Badge variant="outline" className="rounded-full font-bold text-[10px] uppercase tracking-tighter border-primary/20 text-primary">
                  Highly Compatible
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 px-12 h-14 rounded-full">
            Load More Intentional Matches
          </Button>
        </div>
      </main>
    </div>
  );
}
