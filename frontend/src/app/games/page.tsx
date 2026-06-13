'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Gamepad2, BookOpen, HelpCircle, Link2, ArrowUpDown,
  Layers, Grid3x3, Search, Sparkles
} from 'lucide-react'
import api from '@/lib/api'
import type { Lesson } from '@/types'

const gameTypes = [
  { id: 'mcq', name: 'الاختيار المتعدد', desc: 'واجهة تفاعلية تشبه Kahoot مع مؤقت ونقاط', color: 'from-blue-500 to-blue-600', icon: HelpCircle },
  { id: 'true_false', name: 'صح وخطأ', desc: 'حدد ما إذا كانت العبارة صحيحة أم خاطئة', color: 'from-orange-500 to-orange-600', icon: HelpCircle },
  { id: 'matching', name: 'المطابقة', desc: 'سحب وإفلات - وصل الزوج الصحيح', color: 'from-emerald-500 to-emerald-600', icon: Link2 },
  { id: 'ordering', name: 'الترتيب', desc: 'رتب الخطوات بالترتيب الصحيح', color: 'from-purple-500 to-purple-600', icon: ArrowUpDown },
  { id: 'flashcards', name: 'البطاقات التعليمية', desc: 'بطاقات تفاعلية تشبه Anki للتعلم', color: 'from-amber-500 to-amber-600', icon: Layers },
  { id: 'crossword', name: 'الكلمات المتقاطعة', desc: 'شبكة كلمات متقاطعة مع أدلة', color: 'from-rose-500 to-rose-600', icon: Grid3x3 },
  { id: 'wordsearch', name: 'بحث عن الكلمات', desc: 'ابحث عن الكلمات المخفية في الشبكة', color: 'from-cyan-500 to-cyan-600', icon: Search },
]

export default function GamesPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<string>('')

  useEffect(() => {
    api.get('/lessons').then(({ data }) => setLessons(data)).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">الألعاب التعليمية</h1>
        <p className="text-gray-500 mt-1">ألعاب تفاعلية لتقديم الأنشطة التعليمية</p>
      </div>

      <div className="card max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-2">اختر درساً</label>
        <select value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)}
          className="input-field">
          <option value="">جميع الدروس</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>{l.title} - {l.grade}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameTypes.map((game) => (
          <Link key={game.id} href={`/games/${game.id}${selectedLesson ? `?lesson_id=${selectedLesson}` : ''}`}>
            <div className="card hover:shadow-xl transition-all duration-300 group h-full">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform shadow-lg`}>
                <game.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{game.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{game.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
