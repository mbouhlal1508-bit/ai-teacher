'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart3, BookOpen, Gamepad2, Sparkles, TrendingUp, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import type { DashboardData } from '@/types'

export default function ReportsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/dashboard').then(({ data }) => setData(data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">التقارير</h1>
        <p className="text-gray-500 mt-1">إحصائيات وتحليلات أدائك</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-600" /> نظرة عامة
          </h2>
          <div className="space-y-4">
            <StatBar label="الدروس" value={data?.lessons_count ?? 0} max={Math.max(data?.lessons_count ?? 0, 10)} color="bg-blue-500" />
            <StatBar label="الأنشطة" value={data?.activities_count ?? 0} max={Math.max(data?.activities_count ?? 0, 10)} color="bg-emerald-500" />
            <StatBar label="الألعاب" value={data?.games_count ?? 0} max={Math.max(data?.games_count ?? 0, 10)} color="bg-purple-500" />
            <StatBar label="الاختبارات" value={data?.exams_count ?? 0} max={Math.max(data?.exams_count ?? 0, 10)} color="bg-amber-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">آخر الدروس</h2>
            <Link href="/lessons" className="text-primary-600 text-sm flex items-center gap-1 hover:underline">
              عرض الكل <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          {data?.recent_lessons?.length ? (
            <div className="space-y-3">
              {data.recent_lessons.map((lesson, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-primary-600" />
                    <span className="font-medium text-gray-900">{lesson.title}</span>
                  </div>
                  <span className="text-sm text-gray-400">{lesson.grade}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">لا توجد دروس بعد</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-bold text-gray-900">{value}</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
