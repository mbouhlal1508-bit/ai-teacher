'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, Edit3, Trash2, BookOpen } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import type { Lesson } from '@/types'

export default function LessonDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/lessons/${id}`)
      .then(({ data }) => setLesson(data))
      .catch(() => router.push('/lessons'))
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" /></div>
  if (!lesson) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
        <ArrowRight className="w-5 h-5" /> العودة
      </button>

      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-500">
              <span>{lesson.grade}</span>
              <span>|</span>
              <span>{lesson.subject}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/generator?lesson_id=${lesson.id}`} className="btn-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> توليد الأنشطة
            </Link>
          </div>
        </div>
      </div>

      {lesson.objectives && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">الأهداف التعليمية</h2>
          <p className="text-gray-600 whitespace-pre-line">{lesson.objectives}</p>
        </div>
      )}

      {lesson.content && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">محتوى الدرس</h2>
          <div className="text-gray-600 whitespace-pre-line leading-relaxed max-h-96 overflow-y-auto">
            {lesson.content}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">الأنشطة المولدة</h2>
        <ActivityList lessonId={lesson.id} />
      </div>
    </div>
  )
}

function ActivityList({ lessonId }: { lessonId: number }) {
  const [activities, setActivities] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])

  useEffect(() => {
    api.get(`/activities/lesson/${lessonId}`).then(({ data }) => setActivities(data)).catch(() => {})
    api.get(`/games/lesson/${lessonId}`).then(({ data }) => setGames(data)).catch(() => {})
  }, [lessonId])

  if (activities.length === 0 && games.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>لم يتم توليد أنشطة بعد</p>
        <Link href={`/generator?lesson_id=${lessonId}`} className="text-primary-600 hover:underline mt-2 inline-block">
          توليد الأنشطة الآن
        </Link>
      </div>
    )
  }

  const typeLabels: Record<string, string> = {
    mcq: 'اختيار متعدد', true_false: 'صح وخطأ', fill_blank: 'أكمل الفراغ',
    flashcards: 'بطاقات تعليمية', matching: 'مطابقة', ordering: 'ترتيب',
    crossword: 'كلمات متقاطعة', word_search: 'بحث عن الكلمات', question_bank: 'بنك أسئلة', lesson_plan: 'خطة درس'
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {activities.map((a) => (
        <div key={a.id} className="p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700">
          {typeLabels[a.type] || a.type}
        </div>
      ))}
      {games.map((g) => (
        <Link key={g.id} href={`/games/${g.game_type}?game_id=${g.id}`}
          className="p-3 bg-primary-50 rounded-xl text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors">
          🎮 {typeLabels[g.game_type] || g.game_type}
        </Link>
      ))}
    </div>
  )
}
