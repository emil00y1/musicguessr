import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:py-32 md:px-6 flex items-center justify-center overflow-hidden bg-gradient-to-br from-background to-purple-50 dark:from-background dark:to-purple-950/20">
        <div className="absolute inset-0 bg-[size:20px_20px] bg-[linear-gradient(to_right,rgba(100,100,100,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,100,100,0.1)_1px,transparent_1px)] opacity-5"></div>
        <div className="container max-w-6xl mx-auto z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Test your music knowledge with <span className="text-purple-600 dark:text-purple-400">Hitster</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Place songs on a timeline based on their release year. How well do you know music history?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" asChild className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Link href="/sign-in">Play Now with Spotify</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#how-to-play">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-2xl">
              {/* Game preview/mockup */}
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="w-full max-w-md px-4">
                  {/* Timeline visualization */}
                  <div className="relative h-96">
                    {/* Initial year marker */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="bg-purple-600 text-white font-bold rounded-full h-16 w-16 flex items-center justify-center text-xl shadow-lg">
                        1985
                      </div>
                    </div>
                    
                    {/* Timeline line */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-700 transform -translate-y-1/2"></div>
                    
                    {/* Song cards (samples) */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md w-48 flex flex-col">
                        <div className="h-2 w-20 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-2 w-32 bg-gray-200 dark:bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-to-play" className="py-16 px-4 bg-muted/50">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start with a Year</h3>
              <p className="text-muted-foreground">Begin with a random year on your timeline as your anchor point.</p>
            </Card>
            <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Listen & Place</h3>
              <p className="text-muted-foreground">Hear a song snippet and place it on the timeline based on when you think it was released.</p>
            </Card>
            <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Build Your Timeline</h3>
              <p className="text-muted-foreground">As more songs appear, the challenge grows. How accurate is your music history knowledge?</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Game Modes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-2 bg-green-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Classic Mode</h3>
                <p className="text-muted-foreground mb-4">Create a perfect timeline with 10 songs. How close can you get to the actual release years?</p>
                <p className="text-sm text-muted-foreground">Bonus points for guessing artist and song names!</p>
              </div>
            </Card>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-2 bg-blue-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Infinite Mode</h3>
                <p className="text-muted-foreground mb-4">Keep playing until you make a mistake or decide to stop. How long can you last?</p>
                <p className="text-sm text-muted-foreground">Challenge yourself to beat your own high score!</p>
              </div>
            </Card>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-2 bg-purple-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Versus Friends</h3>
                <p className="text-muted-foreground mb-4">Compete against friends to see who has the best knowledge of music history.</p>
                <p className="text-sm text-muted-foreground">Compare scores and climb the leaderboard!</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-purple-600/10">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Test Your Music Knowledge?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sign in with your Spotify account to start playing and see how well you know your favorite music.
          </p>
          <Button size="lg" asChild className="bg-purple-600 hover:bg-purple-700 text-white">
            <Link href="/sign-in">Play Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}