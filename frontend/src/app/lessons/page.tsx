'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, BookOpen, Clock, GraduationCap, MoreVertical, ChevronDown } from 'lucide-react'
import api from '@/lib/api'
import type { Lesson } from '@/types'

const gradeOrder = ['السابع', 'السابع الأساسي', 'الصف السابع', 'Grade 7',
  'الثامن', 'الثامن الأساسي', 'الصف الثامن', 'Grade 8',
  'التاسع', 'التاسع الأساسي', 'الصف التاسع', 'Grade 9']

const gradeLabels = ['الصف السابع', 'الصف الثامن', 'الصف التاسع']

function detectGrade(grade: string): string {
  const g = grade.trim()
  if (/سابع|7/.test(g)) return 'الصف السابع'
  if (/ثامن|8/.test(g)) return 'الصف الثامن'
  if (/تاسع|9/.test(g)) return 'الصف التاسع'
  return g
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    api.get('/lessons')
      .then(({ data }) => setLessons(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const grouped = useMemo(() => {
    const filtered = lessons.filter(l =>
      l.title.includes(search) || l.grade.includes(search)
    )
    const groups: Record<string, Lesson[]> = {}
    const others: Lesson[] = []
    for (const lesson of filtered) {
      const g = detectGrade(lesson.grade)
      if (gradeLabels.includes(g)) {
        ;(groups[g] ??= []).push(lesson)
      } else {
        others.push(lesson)
      }
    }
    if (others.length) groups['دروس أخرى'] = others
    return groups
  }, [lessons, search])

  const toggleGrade = (g: string) => setCollapsed(prev => ({ ...prev, [g]: !prev[g] }))

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
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">لم يتم العثور على دروس</p>
          <Link href="/generator" className="text-primary-600 hover:underline mt-2 inline-block">
            ابدأ بإنشاء درسك الأول
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {gradeLabels.map((grade) => {
            const items = grouped[grade]
            if (!items) return null
            const isCollapsed = collapsed[grade]
            const gradeColors: Record<string, string> = {
              'الصف السابع': 'from-blue-500 to-blue-600',
              'الصف الثامن': 'from-emerald-500 to-emerald-600',
              'الصف التاسع': 'from-purple-500 to-purple-600',
            }
            return (
              <section key={grade}>
                <button onClick={() => toggleGrade(grade)}
                  className="flex items-center gap-3 w-full text-right mb-4 group">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradeColors[grade]} flex items-center justify-center shadow-md`}>
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 flex-1">{grade}</h2>
                  <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{items.length}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                </button>
                {!isCollapsed && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((lesson) => (
                      <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                        <div className="card hover:shadow-lg transition-all duration-200 group border-r-4 border-r-transparent hover:border-r-primary-500">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradeColors[grade]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <button className="text-gray-300 hover:text-gray-600">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 mb-2 leading-relaxed">{lesson.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(lesson.created_at).toLocaleDateString('ar-SA')}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
          {grouped['دروس أخرى'] && (
            <section>
              <button onClick={() => toggleGrade('دروس أخرى')}
                className="flex items-center gap-3 w-full text-right mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 flex-1">دروس أخرى</h2>
                <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{grouped['دروس أخرى'].length}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${collapsed['دروس أخرى'] ? '-rotate-90' : ''}`} />
              </button>
              {!collapsed['دروس أخرى'] && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped['دروس أخرى'].map((lesson) => (
                    <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                      <div className="card hover:shadow-lg transition-all duration-200 group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <button className="text-gray-300 hover:text-gray-600">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">{lesson.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(lesson.created_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
