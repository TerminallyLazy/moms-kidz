"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const benefits = [
  "Free forever plan available",
  "No credit card required",
  "Cancel anytime",
  "24/7 community support",
  "Regular feature updates",
  "Privacy focused",
]

export function CTASection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800" />
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-600 to-pink-600 rounded-full blur-3xl"
        />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to start your
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}parenting journey?
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Join thousands of parents who are already tracking their children's growth
              and contributing to valuable research.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-col items-center gap-4"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300 md:grid-cols-3"
          >
            {benefits.map((benefit, index) => (
              <div key={benefit} className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{benefit}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-8 text-gray-500"
          >
            <div className="flex items-center gap-2">
              <img src="/logos/google-play.svg" alt="Google Play" className="h-8" />
              <span>Coming soon</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="/logos/app-store.svg" alt="App Store" className="h-8" />
              <span>Coming soon</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default CTASection