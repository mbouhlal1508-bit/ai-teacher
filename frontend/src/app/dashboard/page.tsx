'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen, Sparkles, Gamepad2, FileText, TrendingUp, Clock,
  GraduationCap, ArrowLeft
} from 'lucide-react'
import api from '@/lib/api'
import type { DashboardData } from '@/types'

const statCards = [
  { key: 'lessons_count', label: 'الدروس', icon: BookOpen, color: 'from-blue-500 to-blue-600', href: '/lessons' },
  { key: 'activities_count', label: 'الأنشطة', icon: Sparkles, color: 'from-emerald-500 to-emerald-600', href: '/generator' },
  { key: 'games_count', label: 'الألعاب', icon: Gamepad2, color: 'from-purple-500 to-purple-600', href: '/games' },
  { key: 'exams_count', label: 'الاختبارات', icon: FileText, color: 'from-amber-500 to-amber-600', href: '/exams' },
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-500 mt-1">مرحباً بك في منصة المعلم الذكي</p>
        </div>
        <Link href="/generator" className="btn-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          درس جديد
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          const raw = data?.[card.key as keyof DashboardData]
          const value = typeof raw === 'number' ? raw : 0
          return (
            <Link key={card.key} href={card.href}>
              <div className="card hover:shadow-lg transition-all duration-200 group cursor-pointer">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                <div className="text-gray-500 mt-1">{card.label}</div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">آخر الدروس</h2>
            <Link href="/lessons" className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1">
              عرض الكل <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          {data?.recent_lessons?.length ? (
            <div className="space-y-3">
              {data.recent_lessons.map((lesson) => (
                <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-primary-600" />
                      <div>
                        <div className="font-medium text-gray-900">{lesson.title}</div>
                        <div className="text-sm text-gray-500">{lesson.grade}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(lesson.created_at).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد دروس بعد</p>
              <Link href="/generator" className="text-primary-600 hover:underline mt-2 inline-block">
                ابدأ بإنشاء درسك الأول
              </Link>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">نظرة سريعة</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'إجمالي الدروس', value: data?.lessons_count ?? 0, color: 'bg-blue-500' },
              { label: 'إجمالي الأنشطة', value: data?.activities_count ?? 0, color: 'bg-emerald-500' },
              { label: 'إجمالي الألعاب', value: data?.games_count ?? 0, color: 'bg-purple-500' },
              { label: 'إجمالي الاختبارات', value: data?.exams_count ?? 0, color: 'bg-amber-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="flex-1 text-gray-600">{item.label}</span>
                <span className="font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-gradient-to-br from-primary-50 to-emerald-50 rounded-2xl">
            <p className="text-sm text-primary-800 font-medium">نصيحة اليوم</p>
            <p className="text-sm text-primary-600 mt-1">
              يمكنك استيراد ملف PDF للكتاب المدرسي وسيقوم الذكاء الاصطناعي باستخراج المحتوى
              وتوليد جميع الأنشطة تلقائياً!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
