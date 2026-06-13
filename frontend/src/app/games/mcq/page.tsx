'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Timer, Trophy, Zap, RefreshCw, ArrowRight, Check, X } from 'lucide-react'
import api from '@/lib/api'
import { shuffle } from '@/lib/utils'
import type { MCQ } from '@/types'

export default function MCQGamePage() {
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

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (lessonId) {
          const { data } = await api.get(`/activities/lesson/${lessonId}`)
          const mcq = data.find((a: any) => a.type === 'mcq')
          if (mcq) {
            setQuestions(shuffle(mcq.json_data))
            return
          }
        }
        const { data } = await api.get('/games/lesson/1')
        const game = data.find((g: any) => g.game_type === 'mcq')
        if (game) setQuestions(shuffle(game.config))
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
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, showResult, gameOver])

  const handleAnswer = (choice: string) => {
    if (selected) return
    setSelected(choice)
    const isCorrect = choice === questions[currentQ].answer
    if (isCorrect) {
      const bonus = Math.ceil(timeLeft / 3)
      setScore(s => s + 10 + bonus)
      setStreak(s => s + 1)
    } else {
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
        <Trophy className="w-24 h-24 mx-auto text-amber-400 mb-6" />
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-xl">
            <Timer className="w-5 h-5 text-primary-600" />
            <span className="font-bold text-primary-600">{timeLeft}</span>
          </div>
          {streak >= 2 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-xl text-sm font-bold">
              <Zap className="w-4 h-4" /> x{streak}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl">
          <Trophy className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-emerald-600">{score}</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <span className="text-sm text-gray-400">سؤال {currentQ + 1} من {questions.length}</span>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">{q.question}</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {q.choices.map((choice, i) => {
          let bg = 'bg-white hover:bg-gray-50 border-gray-200'
          let icon = null
          if (showResult) {
            if (choice === q.answer) { bg = 'bg-emerald-100 border-emerald-400'; icon = <Check className="w-5 h-5 text-emerald-600" /> }
            else if (choice === selected) { bg = 'bg-red-100 border-red-400'; icon = <X className="w-5 h-5 text-red-600" /> }
            else { bg = 'bg-gray-50 border-gray-100 opacity-50' }
          } else if (selected === choice) {
            bg = 'bg-primary-100 border-primary-400'
          }
          return (
            <button key={i} onClick={() => handleAnswer(choice)}
              disabled={showResult}
              className={`p-5 rounded-2xl border-2 text-right text-lg font-medium transition-all duration-200 ${bg} ${!showResult ? 'hover:shadow-md hover:-translate-y-0.5' : ''}`}>
              <div className="flex items-center justify-between">
                <span>{choice}</span>
                {icon}
              </div>
            </button>
          )
        })}
      </div>

      {showResult && (
        <div className="text-center mt-8">
          <button onClick={nextQuestion} className="btn-primary flex items-center gap-2 mx-auto">
            {currentQ + 1 < questions.length ? <>التالي <ArrowRight className="w-5 h-5" /></> : 'إظهار النتيجة'}
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
