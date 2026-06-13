'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { RefreshCw, Check } from 'lucide-react'
import api from '@/lib/api'
import type { WordSearchItem } from '@/types'
import WordSearchGrid from './components/WordSearchGrid'

export default function WordSearchGamePage() {
  const searchParams = useSearchParams()
  const lessonId = searchParams.get('lesson_id')

  const [words, setWords] = useState<WordSearchItem[]>([])
  const [found, setFound] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (lessonId) {
          const { data } = await api.get(`/activities/lesson/${lessonId}`)
          const ws = data.find((a: any) => a.type === 'word_search')
          if (ws) { setWords(ws.json_data); return }
        }
        setWords(sampleWords)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [lessonId])

  const handleFound = (index: number) => {
    setFound(prev => new Set(prev).add(index))
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" /></div>

  const allFound = found.size === words.length

  if (allFound) {
    return (
      <div className="game-container text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="game-title">أحسنت! وجدت جميع الكلمات</h2>
        <button onClick={() => { setFound(new Set()); setWords([...sampleWords]) }}
          className="btn-primary flex items-center gap-2 mx-auto">
          <RefreshCw className="w-5 h-5" /> إعادة
        </button>
      </div>
    )
  }

  return (
    <div className="game-container">
      <h1 className="game-title">بحث عن الكلمات</h1>
      <p className="text-center text-gray-500 mb-8">ابحث عن الكلمات المخفية في الشبكة</p>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <WordSearchGrid words={words.map(w => w.term || w.word)} onFound={handleFound} />
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">الكلمات المطلوبة</h3>
          {words.map((item, i) => (
            <div key={i}
              className={`p-3 rounded-2xl border-2 transition-all ${found.has(i) ? 'bg-emerald-50 border-emerald-300 opacity-60 line-through' : 'bg-white border-gray-200'}`}>
              <p className={`font-medium ${found.has(i) ? 'text-emerald-700' : 'text-gray-900'}`}>
                {found.has(i) && <Check className="w-4 h-4 inline ml-2 text-emerald-500" />}
                {item.term || item.word}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const sampleWords: WordSearchItem[] = [
  { word: 'نية', term: 'نية' },
  { word: 'ركوع', term: 'ركوع' },
  { word: 'سجود', term: 'سجود' },
  { word: 'طهارة', term: 'طهارة' },
  { word: 'تشهد', term: 'تشهد' },
  { word: 'وضوء', term: 'وضوء' },
  { word: 'إحرام', term: 'إحرام' },
  { word: 'قيام', term: 'قيام' },
  { word: 'تسليم', term: 'تسليم' },
  { word: 'فاتحة', term: 'فاتحة' },
]
