'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, BookOpen, Clock, GraduationCap, MoreVertical } from 'lucide-react'
import api from '@/lib/api'
import type { Lesson } from '@/types'

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/lessons')
      .then(({ data }) => setLessons(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = lessons.filter(l =>
    l.title.includes(search) || l.grade.includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الدروس</h1>
          <p className="text-gray-500 mt-1">إدارة وتحرير دروسك</p>
        </div>
        <Link href="/generator" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          درس جديد
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="البحث في الدروس..."
          className="input-field pr-12"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">لم يتم العثور على دروس</p>
          <Link href="/generator" className="text-primary-600 hover:underline mt-2 inline-block">
            ابدأ بإنشاء درسك الأول
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((lesson) => (
            <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
              <div className="card hover:shadow-lg transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6 text-primary-600" />
                  </div>
                  <button className="text-gray-300 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <GraduationCap className="w-4 h-4" />
                  <span>{lesson.grade}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(lesson.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
