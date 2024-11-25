"use client"

import { motion } from "framer-motion"
import { Icons } from "@/components/ui/icons"

const features = [
  {
    title: "Activity Tracking",
    description: "Record daily activities, moods, and milestones with smart insights and weather integration.",
    icon: Icons.calendar,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Digital Library",
    description: "Store and organize all your care logs, medical records, and important documents in one secure place.",
    icon: Icons.book,
    color: "from-purple-500 to-indigo-500",
  },
  {
    title: "Community Support",
    description: "Connect with other parents, share experiences, and get advice from a supportive community.",
    icon: Icons.users,
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Research Impact",
    description: "Contribute to valuable pediatric research while tracking your child's development.",
    icon: Icons.research,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Achievements",
    description: "Earn points and unlock achievements as you track progress and reach parenting milestones.",
    icon: Icons.award,
    color: "from-yellow-500 to-orange-500",
  },
  {
    title: "Smart Insights",
    description: "Get personalized insights and recommendations based on your child's unique patterns.",
    icon: Icons.chart,
    color: "from-purple-500 to-pink-500",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Everything you need to track your
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {" "}parenting journey
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Powerful features to help you track, celebrate, and share every moment.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="relative group"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                  '--tw-gradient-from': feature.color.split(' ')[0].split('-')[1],
                  '--tw-gradient-to': feature.color.split(' ')[2],
                }}
              />
              <div className="relative p-8 rounded-2xl border bg-white dark:bg-gray-900 dark:border-gray-800 transition-transform duration-500 group-hover:-translate-y-1">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color}`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesSection