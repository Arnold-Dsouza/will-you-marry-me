
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, Heart, Calendar } from "lucide-react";
import Image from "next/image";

const stories = [
  {
    couple: "Michael & Rebecca",
    date: "August 2024",
    story: "We met on our first day using the platform. Rebecca lived 200 miles away, but our spiritual alignment was so strong that the distance felt small. We are now happily married and serving in our local church together.",
    photoId: "6",
  },
  {
    couple: "Stephen & Sarah",
    date: "December 2023",
    story: "The AI Soulmate tool suggested us to each other. We were both skeptical at first, but our first conversation lasted four hours! God truly used this platform to bring us together.",
    photoId: "7",
  },
  {
    couple: "David & Martha",
    date: "October 2023",
    story: "We both had specific prayer requests about our future spouse. This platform helped us find each other based on those deep values rather than just superficial details.",
    photoId: "8",
  },
  {
    couple: "Peter & Elizabeth",
    date: "June 2023",
    story: "After years of praying, God opened the door through 'Will You Marry Me'. We found each other across different denominations but with the same core heart for the Lord.",
    photoId: "9",
  }
];

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <header className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-bold text-sm mb-4">
            <Heart className="w-4 h-4 fill-current" />
            10,000+ MARRIAGES BLESSED
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-black text-primary">Success Stories</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Beautiful beginnings that started right here. Read how God orchestrated these meetings through our platform.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-12 max-w-5xl mx-auto">
          {stories.map((story, idx) => (
            <Card key={idx} className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem] group">
              <div className="flex flex-col md:flex-row h-full">
                <div className="relative w-full md:w-2/5 aspect-[4/3] md:aspect-auto overflow-hidden">
                  <Image
                    src={`https://picsum.photos/seed/story_${story.photoId}/800/800`}
                    alt={story.couple}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    data-ai-hint="happy couple"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                </div>
                <div className="p-10 md:w-3/5 flex flex-col justify-center space-y-6">
                  <Quote className="w-12 h-12 text-accent/10 -ml-2" />
                  <p className="text-xl text-foreground font-body leading-relaxed">
                    "{story.story}"
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-muted">
                    <div>
                      <h3 className="text-2xl font-headline font-bold text-primary">{story.couple}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Married {story.date}
                      </div>
                    </div>
                    <Button variant="ghost" className="text-accent font-bold rounded-full h-12 px-6 hover:bg-accent/5">
                      Watch Video →
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center space-y-8 bg-primary rounded-[3rem] p-16 text-primary-foreground">
          <h2 className="text-4xl font-headline font-bold">Are you next?</h2>
          <p className="text-lg opacity-80 max-w-xl mx-auto">
            Your story is waiting to be written. Join our community of intentional Christian singles today.
          </p>
          <Button size="lg" className="h-14 px-12 rounded-full font-bold bg-white text-primary hover:bg-white/90 shadow-2xl">
            Start Your Journey
          </Button>
        </div>
      </main>
    </div>
  );
}
