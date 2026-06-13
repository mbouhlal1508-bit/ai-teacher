'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Timer, Trophy, Zap, RefreshCw, ArrowLeft, Check, X } from 'lucide-react'
import api from '@/lib/api'
import { shuffle } from '@/lib/utils'
import { playCorrect, playWrong, playVictory, playTick } from '@/lib/sounds'
import type { MCQ } from '@/types'

export default function MCQGamePage() {
  return <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" /></div>}><MCQContent /></Suspense>
}

function MCQContent() {
  const searchParams = useSearchParams()
  const lessonId = searchParams.get('lesson_id')
  const [questions, setQuestions] = useState<MCQ[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameOver, setGameOver] = useState(false)
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)

  const normalizeQuestions = (raw: any[]): MCQ[] =>
    raw.map((q: any) => ({
      question: q.question || '',
      choices: Array.isArray(q.choices) ? q.choices : typeof q.choices === 'string' ? q.choices.split(/[,\n]/).map((c: string) => c.trim()).filter(Boolean) : [],
      answer: q.answer || '',
    }))

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (lessonId) {
          const { data } = await api.get(`/activities/lesson/${lessonId}`)
          const mcq = data.find((a: any) => a.type === 'mcq')
          if (mcq && Array.isArray(mcq.json_data)) {
            setQuestions(shuffle(normalizeQuestions(mcq.json_data)))
            return
          }
        }
        const { data } = await api.get('/games/lesson/1')
        const game = data.find((g: any) => g.game_type === 'mcq')
        if (game && Array.isArray(game.config)) setQuestions(shuffle(normalizeQuestions(game.config)))
      } catch (e) {
        setQuestions(sampleQuestions)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [lessonId])

  useEffect(() => {
    if (timeLeft <= 0 || showResult || gameOver) return
    const timer = setTimeout(() => {
      setTimeLeft(t => t - 1)
      if (timeLeft <= 6 && timeLeft > 0) playTick()
    }, 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, showResult, gameOver])

  const handleAnswer = (choice: string) => {
    if (selected) return
    setSelected(choice)
    const isCorrect = choice === questions[currentQ].answer
    if (isCorrect) {
      playCorrect()
      const bonus = Math.ceil(timeLeft / 3)
      setScore(s => s + 10 + bonus)
      setStreak(s => s + 1)
    } else {
      playWrong()
      setStreak(0)
    }
    setShowResult(true)
  }

  const nextQuestion = () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ(c => c + 1)
      setSelected(null)
      setShowResult(false)
      setTimeLeft(30)
    } else {
      setGameOver(true)
      setTimeout(playVictory, 300)
    }
  }

  const reset = () => {
    setCurrentQ(0)
    setScore(0)
    setSelected(null)
    setShowResult(false)
    setTimeLeft(30)
    setGameOver(false)
    setStreak(0)
    setQuestions(shuffle(questions))
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" /></div>

  if (gameOver) {
    const pct = Math.round((score / (questions.length * 12)) * 100)
    return (
      <div className="game-container text-center">
        <div className="relative mb-8">
          <Trophy className="w-40 h-40 mx-auto text-amber-400 drop-shadow-xl animate-bounce" />
          <div className="absolute -top-2 -left-1/2 translate-x-1/2 text-6xl opacity-20 select-none">🏆</div>
        </div>
        <h2 className="game-title">انتهت اللعبة!</h2>
        <div className="text-6xl font-bold text-primary-600 mb-4">{score}</div>
        <p className="text-xl text-gray-600 mb-2">من أصل {questions.length * 12} نقطة</p>
        <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto mb-8 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <button onClick={reset} className="btn-primary flex items-center gap-2 mx-auto">
          <RefreshCw className="w-5 h-5" /> إعادة اللعبة
        </button>
      </div>
    )
  }

  if (questions.length === 0) {
    return <div className="game-container text-center text-gray-400">
      <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <p>لا توجد أسئلة متاحة لهذا الدرس</p>
    </div>
  }

  const q = questions[currentQ]
  return (
    <div className="game-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 px-5 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className={`flex items-center justify-center w-24 h-24 rounded-2xl border-4 font-bold text-4xl transition-colors duration-300 ${timeLeft <= 5 ? 'bg-red-50 border-red-400 text-red-600' : 'bg-primary-50 border-primary-300 text-primary-600'}`}>
            {timeLeft}
          </div>
          <div className="hidden sm:block text-xs text-gray-400">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-500' : 'bg-primary-500'}`}
                style={{ width: `${(timeLeft / 30) * 100}%` }} />
            </div>
            <span className="mt-1 block">ثوانٍ متبقية</span>
          </div>
          {streak >= 2 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-xl text-sm font-bold">
              <Zap className="w-4 h-4" /> x{streak}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 px-5 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-300">
            <Trophy className="w-12 h-12 text-amber-500 drop-shadow-sm" />
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">النقاط</div>
            <span className="font-bold text-3xl text-emerald-700">{score}</span>
          </div>
        </div>
      </div>

      <hr className="my-4 border-t-2 border-gray-300" />

      <div className="text-center mb-6">
        <span className="text-base text-gray-400 mb-2 block">سؤال {currentQ + 1} من {questions.length}</span>
        <h3 className="text-[60px] font-bold text-gray-900 leading-relaxed px-4">{q.question}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
        {q.choices.map((choice, i) => {
          let bg = 'bg-white hover:bg-gray-50 border-gray-200'
          let icon = null
          if (showResult) {
            if (choice === q.answer) { bg = 'bg-emerald-100 border-emerald-400'; icon = <Check className="w-6 h-6 text-emerald-600" /> }
            else if (choice === selected) { bg = 'bg-red-100 border-red-400'; icon = <X className="w-6 h-6 text-red-600" /> }
            else { bg = 'bg-gray-50 border-gray-100 opacity-50' }
          } else if (selected === choice) {
            bg = 'bg-primary-100 border-primary-400'
          }
          return (
            <button key={i} onClick={() => handleAnswer(choice)}
              disabled={showResult}
              className={`w-full py-5 px-8 rounded-2xl border-2 text-right text-[50px] font-medium transition-all duration-200 ${bg} ${!showResult ? 'hover:shadow-lg hover:-translate-y-1' : ''}`}>
              <div className="flex items-center justify-between gap-4">
                <span className="flex-1">{choice}</span>
                {icon}
              </div>
            </button>
          )
        })}
      </div>

      {showResult && (
        <div className="text-center mt-10">
          <button onClick={nextQuestion} className="btn-primary flex items-center gap-3 mx-auto text-xl py-4 px-10">
            {currentQ + 1 < questions.length ? <><ArrowLeft className="w-6 h-6" /> التالي</> : 'إظهار النتيجة'}
          </button>
        </div>
      )}
    </div>
  )
}

const sampleQuestions: MCQ[] = [
  { question: 'ما أول ركن من أركان الصلاة؟', choices: ['النية', 'الركوع', 'السجود', 'التشهد'], answer: 'النية' },
  { question: 'كم عدد أركان الصلاة؟', choices: ['أربعة عشر', 'ثلاثة عشر', 'اثنا عشر', 'أحد عشر'], answer: 'أربعة عشر' },
  { question: 'أركان الصلاة (أفعال) تنقسم إلى:', choices: ['أقوال وأفعال', 'أقوال فقط', 'أفعال فقط', 'لا شيء مما ذكر'], answer: 'أقوال وأفعال' },
  { question: 'من أركان الصلاة القولية:', choices: ['تكبيرة الإحرام', 'الركوع', 'السجود', 'القيام'], answer: 'تكبيرة الإحرام' },
  { question: 'الطمأنينة في الصلاة تعني:', choices: ['السكون والاستقرار', 'السرعة', 'الحركة', 'الكلام'], answer: 'السكون والاستقرار' },
]
