'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { FileText, Clock, CheckCircle, XCircle, BarChart3, Loader2 } from 'lucide-react'

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeExam, setActiveExam] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get('/exams').then(({ data }) => setExams(data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const startExam = async (examId: number) => {
    const { data } = await api.get(`/exams/${examId}`)
    setActiveExam(data)
    setAnswers({})
    setResult(null)
  }

  const submitExam = async () => {
    if (!activeExam) return
    setSubmitting(true)
    try {
      const { data } = await api.post(`/exams/${activeExam.exam.id}/submit`, answers)
      setResult(data)
    } catch (e) {}
    setSubmitting(false)
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" /></div>

  if (result && activeExam) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="card text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-primary-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">نتيجة الاختبار</h2>
          <div className="text-6xl font-bold text-primary-600 mb-2">{result.percentage}%</div>
          <p className="text-gray-500">{result.score} من {result.total}</p>
          <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full" style={{ width: `${result.percentage}%` }} />
          </div>
          <button onClick={() => { setActiveExam(null); setResult(null) }}
            className="btn-primary mt-8">العودة</button>
        </div>
        <div className="space-y-3">
          {result.results?.map((r: any, i: number) => (
            <div key={i} className={`p-4 rounded-2xl border-2 ${r.is_correct ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-3">
                {r.is_correct ? <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                <div>
                  <p className="font-medium text-gray-900">{r.question}</p>
                  <p className="text-sm mt-1">
                    {!r.is_correct && <span className="text-red-600">إجابتك: {r.user_answer} | </span>}
                    <span className="text-emerald-600">الإجابة الصحيحة: {r.correct_answer}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activeExam) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{activeExam.exam.title}</h2>
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{activeExam.exam.time_limit_minutes} دقيقة</span>
          </div>
        </div>
        <div className="space-y-4">
          {activeExam.questions?.map((q: any, i: number) => (
            <div key={q.id} className="card">
              <p className="font-medium text-gray-900 mb-3">{i + 1}. {q.question_text}</p>
              {q.options && JSON.parse(q.options).map((opt: string, j: number) => (
                <label key={j} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name={`q_${q.id}`} value={opt}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))}
              {!q.options && (
                <input type="text" onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder="اكتب إجابتك..." className="input-field" />
              )}
            </div>
          ))}
        </div>
        <button onClick={submitExam} disabled={submitting}
          className="btn-primary w-full flex items-center justify-center gap-2">
          {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري التصحيح...</> : 'تأكيد وتسليم'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">الاختبارات</h1>
        <p className="text-gray-500 mt-1">الاختبارات الإلكترونية المولدة</p>
      </div>
      {exams.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
          <p>لا توجد اختبارات بعد</p>
          <p className="text-sm mt-1">قم بتوليد الأنشطة أولاً لإنشاء اختبار</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam: any) => (
            <div key={exam.id} className="card hover:shadow-lg transition-all cursor-pointer" onClick={() => startExam(exam.id)}>
              <FileText className="w-8 h-8 text-primary-600 mb-3" />
              <h3 className="font-bold text-gray-900">{exam.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <Clock className="w-4 h-4" /> {exam.time_limit_minutes} دقيقة
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
