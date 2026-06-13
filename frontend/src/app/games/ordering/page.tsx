'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { RefreshCw, Check, ArrowUp, ArrowDown } from 'lucide-react'
import api from '@/lib/api'
import { shuffle } from '@/lib/utils'
import { playCorrect, playWrong, playVictory } from '@/lib/sounds'

export default function OrderingGamePage() {
  const searchParams = useSearchParams()
  const lessonId = searchParams.get('lesson_id')

  const [correctOrder, setCorrectOrder] = useState<string[]>([])
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [checking, setChecking] = useState(false)
  const [wrong, setWrong] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (lessonId) {
          const { data } = await api.get(`/activities/lesson/${lessonId}`)
          const order = data.find((a: any) => a.type === 'ordering')
          if (order) {
            setCorrectOrder(order.json_data)
            setItems(shuffle([...order.json_data]))
            return
          }
        }
        setCorrectOrder(sampleOrder)
        setItems(shuffle([...sampleOrder]))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [lessonId])

  const moveUp = (index: number) => {
    if (index === 0 || completed) return
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
    setItems(newItems)
    setCompleted(false)
    setWrong(false)
  }

  const moveDown = (index: number) => {
    if (index === items.length - 1 || completed) return
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    setItems(newItems)
    setCompleted(false)
    setWrong(false)
  }

  const checkOrder = () => {
    setChecking(true)
    const correct = items.every((item, i) => item === correctOrder[i])
    if (correct) {
      playCorrect()
      setTimeout(playVictory, 300)
      setCompleted(true)
      setWrong(false)
    } else {
      playWrong()
      setWrong(true)
      setTimeout(() => setWrong(false), 1500)
    }
    setChecking(false)
  }

  const reset = () => {
    setItems(shuffle([...correctOrder]))
    setCompleted(false)
    setWrong(false)
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" /></div>

  if (completed) {
    return (
      <div className="game-container text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="game-title">ترتيب صحيح! أحسنت</h2>
        <button onClick={reset} className="btn-primary flex items-center gap-2 mx-auto">
          <RefreshCw className="w-5 h-5" /> إعادة اللعبة
        </button>
      </div>
    )
  }

  return (
    <div className="game-container">
      <h1 className="game-title">لعبة الترتيب</h1>
      <p className="text-center text-gray-500 mb-8">رتب العناصر بالترتيب الصحيح باستخدام أزرار الأسهم</p>

      <div className="max-w-lg mx-auto space-y-3">
        {items.map((item, i) => (
          <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all
            ${wrong ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200 hover:border-primary-300'}`}>
            <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center font-bold">
              {i + 1}
            </div>
            <div className="flex-1 font-medium text-gray-900 text-[50px]">{item}</div>
            <div className="flex flex-col gap-1">
              <button onClick={() => moveUp(i)} disabled={i === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button onClick={() => moveDown(i)} disabled={i === items.length - 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors">
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button onClick={checkOrder} disabled={checking} className="btn-primary flex items-center gap-2 mx-auto">
          <Check className="w-5 h-5" /> تحقق من الترتيب
        </button>
      </div>
    </div>
  )
}

const sampleOrder = [
  'تكبيرة الإحرام',
  'قراءة الفاتحة',
  'الركوع',
  'الرفع من الركوع',
  'السجود',
  'الجلوس بين السجدتين',
  'السجود الثاني',
  'التشهد الأخير',
  'التسليم',
]
