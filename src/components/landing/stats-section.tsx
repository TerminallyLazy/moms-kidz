"use client"

import { motion } from "framer-motion"
import { Icons } from "@/components/ui/icons"

const stats = [
  {
    value: "50K+",
    label: "Active Parents",
    description: "Tracking their children's growth",
    icon: Icons.users,
    color: "from-blue-500 to-cyan-500",
  },
  {
    value: "2M+",
    label: "Activities Logged",
    description: "Helping understand patterns",
    icon: Icons.calendar,
    color: "from-purple-500 to-indigo-500",
  },
  {
    value: "250K+",
    label: "Milestones",
    description: "Celebrated and shared",
    icon: Icons.award,
    color: "from-pink-500 to-rose-500",
  },
  {
    value: "10+",
    label: "Research Studies",
    description: "Contributing to child development",
    icon: Icons.research,
    color: "from-green-500 to-emerald-500",
  },
]

export function StatsSection() {
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
            Trusted by parents
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {" "}worldwide
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Join our growing community of parents making a difference.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                  '--tw-gradient-from': stat.color.split(' ')[0].split('-')[1],
                  '--tw-gradient-to': stat.color.split(' ')[2],
                }}
              />
              <div className="relative p-8 rounded-2xl border bg-white dark:bg-gray-900 dark:border-gray-800 transition-transform duration-500 group-hover:-translate-y-1">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="font-semibold">{stat.label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.description}
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
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-gray-800">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-sm text-purple-600 dark:text-purple-400">
              Live activity tracking in progress
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default StatsSection