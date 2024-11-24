import { AnimatedCard } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Calendar, Heart, MessageCircle, Sparkles, Sun, Users } from "lucide-react";
import { InteractionProvider } from "@/components/interaction-tracker";
import { HomeData } from "./_components/home-data";
import { HomeFeatures } from "./_components/home-features";

const features = [
{
  title: "Care Log",
  description: "Track daily activities, moods, and milestones with smart insights and weather integration.",
  icon: Calendar,
  metrics: "Join 50,000+ moms tracking 2M+ moments",
},
// ... rest of the features array
];

const testimonials = [
{
  quote: "Moms Kidz has transformed how I track my children's development. The insights are invaluable!",
  author: "Sarah M.",
  role: "Mother of 2",
  metric: "Tracked 500+ milestones",
},
// ... rest of the testimonials array
];

export default function Home() {
  return (
    <main>
      <HomeFeatures />
    </main>
  )
}