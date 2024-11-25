"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    quote: "Mom's Kidz has been a game-changer for tracking my baby's development. The insights and community support are invaluable!",
    author: "Sarah Johnson",
    role: "Mother of 2",
    avatar: "/testimonials/sarah.jpg",
    rating: 5,
  },
  {
    quote: "As a first-time dad, this app has helped me understand and track my child's milestones. The achievement system makes it fun!",
    author: "Michael Chen",
    role: "New Parent",
    avatar: "/testimonials/michael.jpg",
    rating: 5,
  },
  {
    quote: "The research contribution aspect makes me feel like we're part of something bigger while tracking our twins' growth.",
    author: "Emily Rodriguez",
    role: "Twin Mom",
    avatar: "/testimonials/emily.jpg",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-purple-50 dark:bg-gray-900">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Loved by parents
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {" "}worldwide
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Join thousands of parents who trust Mom's Kidz to track their parenting journey.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="h-full p-8 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
                <div className="flex gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  "{testimonial.quote}"
                </blockquote>

                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                    <AvatarFallback>
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold dark:text-white">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <Avatar key={i} className="border-2 border-white dark:border-gray-800">
                  <AvatarImage src={`/testimonials/user-${i + 1}.jpg`} />
                  <AvatarFallback>U{i + 1}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="text-2xl font-bold">Join 50,000+ parents</div>
            <p className="text-gray-500 dark:text-gray-400">
              Start tracking your parenting journey today
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default TestimonialsSection