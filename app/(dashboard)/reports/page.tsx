'use client'

import { motion } from 'framer-motion'
import { BarChart3, Download } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
            <p className="text-gray-600">Analytics and insights</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Reports & Analytics Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            This feature is under development. You'll soon be able to:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              View attendance reports and trends
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Analyze leave patterns and usage
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Generate custom reports with filters
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Export data to CSV or PDF
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              View team performance metrics
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}
