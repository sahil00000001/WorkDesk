'use client'

import { motion } from 'framer-motion'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20"
      >
        <div className="mx-auto w-full max-w-sm">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 font-display text-3xl font-bold text-gray-900"
          >
            Employee Portal
          </motion.h1>
          {children}
        </div>
      </motion.div>

      {/* Right Side - Gradient */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block lg:w-1/2"
      >
        <div className="relative h-full w-full bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-white"
            >
              <h2 className="mb-4 text-4xl font-bold">Welcome Back!</h2>
              <p className="text-xl opacity-90">
                Modern employee management made simple
              </p>
            </motion.div>
          </div>
          {/* Animated circles */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -left-10 top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -right-10 bottom-20 h-80 w-80 rounded-full bg-white/10 blur-3xl"
          />
        </div>
      </motion.div>
    </div>
  )
}
