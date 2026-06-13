'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { RefreshCw, Check, Shuffle } from 'lucide-react'
import api from '@/lib/api'
import { shuffle } from '@/lib/utils'
import { playCorrect, playWrong, playVictory } from '@/lib/sounds'
import type { MatchingPair } from '@/types'

export default function MatchingGamePage() {
  const searchParams = useSearchParams()
  const lessonId = searchParams.get('lesson_id')

  const [pairs, setPairs] = useState<MatchingPair[]>([])
  const [leftItems, setLeftItems] = useState<{ id: number; text: string }[]>([])
  const [rightItems, setRightItems] = useState<{ id: number; text: string }[]>([])
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [matched, setMatched] = useState<number[]>([])
  const [wrongAttempt, setWrongAttempt] = useState(false)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (lessonId) {
          const { data } = await api.get(`/activities/lesson/${lessonId}`)
          const match = data.find((a: any) => a.type === 'matching')
          if (match) {
            const raw = typeof match.json_data === 'string' ? JSON.parse(match.json_data) : match.json_data
            setPairs(raw)
            initGame(raw)
            return
          }
        }
        initGame(samplePairs)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [lessonId])

  const initGame = (data: MatchingPair[]) => {
    setPairs(data)
    setLeftItems(shuffle(data.map((p, i) => ({ id: i, text: p.left }))))
    setRightItems(shuffle(data.map((p, i) => ({ id: i, text: p.right }))))
    setMatched([])
    setSelectedLeft(null)
    setCompleted(false)
  }

  const handleLeftClick = (id: number) => {
    if (matched.includes(id) || completed) return
    setSelectedLeft(id)
    setWrongAttempt(false)
  }

  const handleRightClick = (id: number) => {
    if (selectedLeft === null || matched.includes(id) || completed) return
    if (selectedLeft === id) {
      setMatched(m => [...m, id])
      setSelectedLeft(null)
      playCorrect()
      if (matched.length + 1 === pairs.length) { setTimeout(playVictory, 300); setCompleted(true) }
    } else {
      playWrong()
      setWrongAttempt(true)
      setTimeout(() => {
        setSelectedLeft(null)
        setWrongAttempt(false)
      }, 600)
    }
  }

  const reset = () => initGame(pairs)

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" /></div>

  if (completed) {
    return (
      <div className="game-container text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="game-title">أحسنت! جميع الأزواج صحيحة</h2>
        <button onClick={reset} className="btn-primary flex items-center gap-2 mx-auto">
          <RefreshCw className="w-5 h-5" /> إعادة اللعبة
        </button>
      </div>
    )
  }

  return (
    <div className="game-container">
      <h1 className="game-title">لعبة المطابقة</h1>
      <p className="text-center text-gray-500 mb-8">اختر عنصراً من اليمين ثم اختر نظيره من اليسار</p>

      <div className="flex justify-center gap-8 lg:gap-16">
        <div className="space-y-3">
          {leftItems.map((item) => (
            <button key={item.id} onClick={() => handleLeftClick(item.id)}
              disabled={matched.includes(item.id) || completed}
              className={`w-72 lg:w-96 p-6 rounded-2xl text-right font-medium transition-all text-[50px] ${matched.includes(item.id) ? 'bg-emerald-100 border-2 border-emerald-400 opacity-60 line-through text-emerald-700' : selectedLeft === item.id ? 'bg-primary-100 border-2 border-primary-500 shadow-md scale-105 text-primary-700' : wrongAttempt && selectedLeft === item.id ? 'bg-red-100 border-2 border-red-400 text-red-700' : 'bg-white border-2 border-gray-200 hover:border-primary-300 hover:shadow-md text-gray-900'}`}>
              {item.text}
            </button>
          ))}
        </div>

        <div className="flex items-center text-4xl text-gray-300">⟷</div>

        <div className="space-y-3">
          {rightItems.map((item) => (
            <button key={item.id} onClick={() => handleRightClick(item.id)}
              disabled={matched.includes(item.id) || completed}
              className={`w-72 lg:w-96 p-6 rounded-2xl text-right font-medium transition-all text-[50px] ${matched.includes(item.id) ? 'bg-emerald-100 border-2 border-emerald-400 opacity-60 text-emerald-700' : selectedLeft !== null && !matched.includes(item.id) ? 'bg-amber-50 border-2 border-amber-300 hover:bg-amber-100 hover:shadow-md cursor-pointer text-amber-800' : 'bg-white border-2 border-gray-200 text-gray-900'}`}>
              {item.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const samplePairs: MatchingPair[] = [
  { left: 'الركوع', right: 'الانحناء تعظيماً لله' },
  { left: 'السجود', right: 'وضع الجبهة على الأرض' },
  { left: 'تكبيرة الإحرام', right: 'قول الله أكبر' },
  { left: 'التشهد', right: 'التحيات لله والصلوات' },
  { left: 'القيام', right: 'الوقوف في الصلاة' },
]
