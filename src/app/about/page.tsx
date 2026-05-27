"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-headline font-bold">About Will You Marry Me</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none p-6">
            <p>
              Will You Marry Me is an intentional, values-first matchmaking community built to help Christian singles
              find life-long partners who share their faith and vision for a Christ-centered home.
            </p>
            <p>
              We emphasize spiritual compatibility, verified profiles, and thoughtful introductions. Our team combines
              human moderation with AI-powered tools to help you present your authentic self and find better matches.
            </p>
            <h4>Community Guidelines</h4>
            <ul>
              <li>Treat others with respect and kindness.</li>
              <li>Keep profile information honest and up-to-date.</li>
              <li>Use the platform to pursue meaningful, faith-centered relationships.</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
