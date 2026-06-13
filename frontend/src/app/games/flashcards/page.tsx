'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { RefreshCw, ChevronRight, ChevronLeft, Rotate3D } from 'lucide-react'
import api from '@/lib/api'
import { shuffle } from '@/lib/utils'
import type { FlashCard } from '@/types'

export default function FlashcardsGamePage() {
  return <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" /></div>}><FlashcardsContent /></Suspense>
}

function FlashcardsContent() {
  const searchParams = useSearchParams()
  const lessonId = searchParams.get('lesson_id')

  const [cards, setCards] = useState<FlashCard[]>([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (lessonId) {
          const { data } = await api.get(`/activities/lesson/${lessonId}`)
          const flash = data.find((a: any) => a.type === 'flashcards')
          if (flash) {
            setCards(shuffle(flash.json_data))
            return
          }
        }
        setCards(shuffle(sampleCards))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [lessonId])

  const next = () => {
    if (current < cards.length - 1) { setCurrent(c => c + 1); setFlipped(false) }
  }
  const prev = () => {
    if (current > 0) { setCurrent(c => c - 1); setFlipped(false) }
  }
  const reset = () => {
    setCurrent(0); setFlipped(false); setCards(shuffle(cards))
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" /></div>

  if (cards.length === 0) return <div className="game-container text-center text-gray-400"><p>لا توجد بطاقات</p></div>

  const card = cards[current]

  return (
    <div className="game-container">
      <h1 className="game-title">البطاقات التعليمية</h1>
      <p className="text-center text-gray-500 mb-8">انقر على البطاقة للتقليب</p>

      <div className="max-w-7xl mx-auto">
        <div className="text-center text-sm text-gray-400 mb-4">
          بطاقة {current + 1} من {cards.length}
        </div>

        <div className="perspective-1000 cursor-pointer" onClick={() => setFlipped(!flipped)}>
          <div className={`relative w-full h-96 transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-8 flex flex-col items-center justify-center backface-hidden shadow-xl">
              <Rotate3D className="w-6 h-6 text-primary-200 mb-4" />
              <p className="text-white text-[60px] font-bold text-center leading-relaxed">{card.front}</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180 shadow-xl">
              <p className="text-white text-sm opacity-80 mb-3">الجواب</p>
              <p className="text-white text-[60px] font-bold text-center leading-relaxed">{card.back}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8">
          <button onClick={prev} disabled={current === 0}
            className="w-12 h-12 bg-white rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:border-primary-300 disabled:opacity-30 transition-all">
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
          <button onClick={reset} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> خلط
          </button>
          <button onClick={next} disabled={current === cards.length - 1}
            className="w-12 h-12 bg-white rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:border-primary-300 disabled:opacity-30 transition-all">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  )
}

const sampleCards: FlashCard[] = [
  { front: 'ما هو الركن الأول من أركان الصلاة؟', back: 'النية' },
  { front: 'متى يجب الوضوء؟', back: 'عند إرادة الصلاة' },
  { front: 'ما معنى الطمأنينة في الصلاة؟', back: 'السكون والاستقرار' },
  { front: 'كم عدد أركان الصلاة؟', back: 'أربعة عشر ركناً' },
  { front: 'ما هو التشهد؟', back: 'التحيات لله والصلوات والطيبات' },
]
