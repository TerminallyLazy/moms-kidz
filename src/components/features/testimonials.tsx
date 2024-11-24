"use client"

import Image from "next/image"

interface Testimonial {
  quote: string
  author: string
  role: string
  metric: string
  image: string
}

const testimonials: Testimonial[] = [
  {
    quote: "Moms Kidz has transformed how I track my children's development. The insights are invaluable!",
    author: "Sarah M.",
    role: "Mother of 2",
    metric: "Tracked 500+ milestones",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&auto=format&fit=crop&crop=face",
  },
  {
    quote: "The community support here is amazing. I've found lifelong friends who understand my journey.",
    author: "Maria L.",
    role: "New Mom",
    metric: "Connected with 50+ moms",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&auto=format&fit=crop&crop=face",
  },
  {
    quote: "The milestone tracking and insights have helped me understand my baby's development so much better.",
    author: "Jessica K.",
    role: "Mother of 1",
    metric: "Using MomsKidz for 8 months",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&auto=format&fit=crop&crop=face",
  },
]

export function Testimonials() {
  return (
    <section className="py-16 bg-white dark:bg-[#030712] relative overflow-hidden">
      {/* Ambient light effects - only visible in dark mode */}
      <div className="absolute inset-0 dark:block hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/3 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
      </div>
      <div className="container px-4 md:px-6 relative">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            What Our Community Says
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-xl max-w-2xl mx-auto">
            Real stories from real parents who have transformed their parenting journey
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg border bg-white dark:bg-gray-900 p-2
                        transition-all duration-300
                        shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] 
                        dark:shadow-[0_4px_20px_rgba(255,255,255,0.03)]
                        dark:border-slate-700/50
                        hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] 
                        dark:hover:shadow-[0_20px_40px_rgba(255,255,255,0.1),0_15px_20px_rgba(255,255,255,0.05)]
                        hover:translate-y-[-3px]
                        dark:bg-slate-800/50
                        dark:hover:bg-slate-800/70
                        dark:hover:border-slate-600/50"
            >
              <div className="flex h-full flex-col justify-between rounded-md p-6">
                <div className="flex flex-col items-center mb-4">
                  <div className="relative w-16 h-16 mb-3">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.author}
                      fill
                      className="rounded-full object-cover"
                      sizes="(max-width: 64px) 100vw, 64px"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-base text-gray-900 dark:text-white">{testimonial.author}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <blockquote className="text-gray-600 dark:text-gray-300 text-sm text-center mb-3 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <p className="text-xs text-purple-600 dark:text-purple-400 text-center font-medium">
                  {testimonial.metric}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
