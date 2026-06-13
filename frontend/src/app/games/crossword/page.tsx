'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { RefreshCw, Check } from 'lucide-react'
import api from '@/lib/api'
import { playCorrect, playVictory } from '@/lib/sounds'
import type { CrosswordItem } from '@/types'
import CrosswordGrid from './components/CrosswordGrid'

export default function CrosswordGamePage() {
  const searchParams = useSearchParams()
  const lessonId = searchParams.get('lesson_id')

  const [words, setWords] = useState<CrosswordItem[]>([])
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (lessonId) {
          const { data } = await api.get(`/activities/lesson/${lessonId}`)
          const cw = data.find((a: any) => a.type === 'crossword')
          if (cw) { setWords(cw.json_data); return }
        }
        setWords(sampleCrossword)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [lessonId])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" /></div>

  if (completed) {
    return (
      <div className="game-container text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="game-title">أحسنت! أكملت الكلمات المتقاطعة</h2>
        <button onClick={() => { setCompleted(false); setWords([...sampleCrossword]) }}
          className="btn-primary flex items-center gap-2 mx-auto">
          <RefreshCw className="w-5 h-5" /> إعادة
        </button>
      </div>
    )
  }

  return (
    <div className="game-container">
      <h1 className="game-title">الكلمات المتقاطعة</h1>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div>
          <CrosswordGrid words={words} onComplete={() => { playVictory(); setCompleted(true) }} onCellCorrect={playCorrect} />
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">الأدلة</h3>
          {words.map((item, i) => (
            <div key={i} className="p-4 bg-white rounded-2xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm text-gray-500">تلميح</p>
                  <p className="font-medium text-gray-900 text-[50px]">{item.clue}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const sampleCrossword: CrosswordItem[] = [
  { word: 'نية', clue: 'أول ركن من أركان الصلاة' },
  { word: 'ركوع', clue: 'الانحناء تعظيماً لله' },
  { word: 'سجود', clue: 'وضع الجبهة على الأرض' },
  { word: 'طهارة', clue: 'شرط لصحة الصلاة' },
  { word: 'تشهد', clue: 'التحيات لله' },
  { word: 'وضوء', clue: 'غسل الأعضاء قبل الصلاة' },
]
