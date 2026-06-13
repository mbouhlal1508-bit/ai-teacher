'use client'
import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Sparkles, Upload, FileText, BookOpen, Target, Edit3,
  Check, X, AlertCircle, Loader2
} from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import type { GeneratedActivities } from '@/types'

const activityLabels = [
  { id: 'mcq', label: 'اختيار متعدد', icon: '📝' },
  { id: 'true_false', label: 'صح وخطأ', icon: '✓✗' },
  { id: 'fill_blank', label: 'أكمل الفراغ', icon: '___' },
  { id: 'matching', label: 'مطابقة', icon: '🔗' },
  { id: 'ordering', label: 'ترتيب', icon: '🔢' },
  { id: 'flashcards', label: 'بطاقات تعليمية', icon: '🃏' },
  { id: 'crossword', label: 'كلمات متقاطعة', icon: '🔤' },
  { id: 'word_search', label: 'بحث عن الكلمات', icon: '🔍' },
  { id: 'question_bank', label: 'بنك أسئلة', icon: '🏦' },
  { id: 'lesson_plan', label: 'خطة درس', icon: '📋' },
]

export default function GeneratorPage() {
  const searchParams = useSearchParams()
  const lessonIdParam = searchParams.get('lesson_id')
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [grade, setGrade] = useState('')
  const [objectives, setObjectives] = useState('')
  const [content, setContent] = useState('')
  const [importMode, setImportMode] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<GeneratedActivities | null>(null)
  const [activeTab, setActiveTab] = useState('mcq')
  const [editMode, setEditMode] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const handleGenerate = async () => {
    if (importMode && !file) {
      toast.error('الرجاء اختيار ملف للاستيراد')
      return
    }
    if (!importMode && (!title || !content)) {
      toast.error('الرجاء إدخال عنوان الدرس والمحتوى')
      return
    }

    setGenerating(true)
    try {
      if (importMode && file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', title)
        formData.append('grade', grade)
        const { data } = await api.post('/generator/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setResult(data.data)
        toast.success('تم استيراد الملف وتوليد الأنشطة بنجاح!')
      } else if (lessonIdParam) {
        const formData = new FormData()
        formData.append('lesson_id', lessonIdParam)
        const { data } = await api.post('/generator/generate', formData)
        setResult(data.data)
        toast.success('تم توليد الأنشطة بنجاح!')
      } else {
        const formData = new FormData()
        formData.append('title', title)
        formData.append('grade', grade)
        formData.append('objectives', objectives)
        formData.append('content', content)
        const { data } = await api.post('/generator/generate-from-text', formData)
        setResult(data.data)
        toast.success('تم توليد الأنشطة بنجاح!')
      }
      setEditMode(false)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'فشل التوليد')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Toaster position="top-center" />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">مولد الأنشطة التعليمية</h1>
        <p className="text-gray-500 mt-2">أدخل محتوى درسك ليصمم الذكاء الاصطناعي جميع الأنشطة</p>
      </div>

      {!result ? (
        <div className="card max-w-3xl mx-auto">
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setImportMode(false)}
              className={`flex-1 py-3 rounded-lg text-center transition-all ${!importMode ? 'bg-white shadow-sm font-semibold' : 'text-gray-500'}`}
            >
              <FileText className="w-4 h-4 inline ml-1" /> إدخال يدوي
            </button>
            <button
              onClick={() => setImportMode(true)}
              className={`flex-1 py-3 rounded-lg text-center transition-all ${importMode ? 'bg-white shadow-sm font-semibold' : 'text-gray-500'}`}
            >
              <Upload className="w-4 h-4 inline ml-1" /> استيراد ملف
            </button>
          </div>

          {importMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رفع ملف (PDF, Word, TXT)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-primary-400 cursor-pointer transition-colors"
                >
                  <Upload className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">انقر لاختيار ملف أو اسحب الملف هنا</p>
                  <p className="text-xs text-gray-400 mt-1">يدعم PDF, DOCX, TXT</p>
                  <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} hidden />
                </div>
                {file && (
                  <div className="mt-3 flex items-center gap-2 p-3 bg-primary-50 rounded-xl text-sm text-primary-700">
                    <FileText className="w-4 h-4" /> {file.name}
                  </div>
                )}
              </div>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان الدرس (اختياري - سيتم استخراجه تلقائياً)" className="input-field" />
              <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)}
                placeholder="المرحلة الدراسية (اختياري)" className="input-field" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الدرس</label>
                <div className="relative">
                  <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: أركان الصلاة" className="input-field pr-12" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المرحلة الدراسية</label>
                <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)}
                  placeholder="مثال: الصف التاسع" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الأهداف التعليمية</label>
                <div className="relative">
                  <Target className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
                  <textarea value={objectives} onChange={(e) => setObjectives(e.target.value)}
                    placeholder="أن يعدد المتعلم أركان الصلاة&#10;أن يميز بين الركن والواجب"
                    className="input-field pr-12 min-h-[100px]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">محتوى الدرس</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder="الصق محتوى الدرس كاملاً هنا..."
                  className="input-field min-h-[300px] font-sans leading-relaxed" />
              </div>
            </div>
          )}

          <div className="mt-6">
            <button onClick={handleGenerate} disabled={generating}
              className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-4">
              {generating ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> جاري التوليد...</>
              ) : (
                <><Sparkles className="w-6 h-6" /> Generate Activities</>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{result.lesson}</h2>
              <p className="text-gray-500">تم توليد جميع الأنشطة بنجاح</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditMode(!editMode)}
                className="btn-secondary flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> {editMode ? 'إنهاء التعديل' : 'تعديل'}
              </button>
              <button onClick={() => setResult(null)}
                className="btn-secondary flex items-center gap-2">
                <X className="w-4 h-4" /> جديد
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {activityLabels.map((a) => (
              <button key={a.id}
                onClick={() => setActiveTab(a.id)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${activeTab === a.id ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>

          <div className="card">
            <ActivityViewer type={activeTab} data={result} editMode={editMode} />
          </div>
        </div>
      )}
    </div>
  )
}

function ActivityViewer({ type, data, editMode }: { type: string; data: GeneratedActivities; editMode: boolean }) {
  const items = (data as any)[type] || []

  const renderMCQ = () => (
    <div className="space-y-6">
      {items.map((q: any, i: number) => (
        <div key={i} className="p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-start justify-between mb-3">
            <span className="text-sm font-bold text-primary-600">سؤال {i + 1}</span>
            {editMode && <button className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>}
          </div>
          <p className="font-medium text-gray-900 mb-3">{q.question}</p>
          <div className="space-y-2">
            {q.choices?.map((c: string, j: number) => (
              <div key={j} className={`p-3 rounded-xl text-sm ${c === q.answer ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-white text-gray-700 border border-gray-200'}`}>
                {c === q.answer && <Check className="w-4 h-4 inline ml-2 text-emerald-600" />}
                {c}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const renderFlashcards = () => (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map((card: any, i: number) => (
        <div key={i} className="bg-gradient-to-br from-primary-50 to-emerald-50 rounded-2xl p-6 border border-primary-100">
          <div className="text-xs text-primary-500 mb-2">الوجه الأمامي</div>
          <p className="font-bold text-gray-900 mb-4">{card.front}</p>
          <div className="border-t border-primary-200 pt-4">
            <div className="text-xs text-emerald-500 mb-2">الوجه الخلفي</div>
            <p className="text-gray-700">{card.back}</p>
          </div>
        </div>
      ))}
    </div>
  )

  const renderMatching = () => (
    <div className="space-y-3">
      {items.map((pair: any, i: number) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
          <div className="flex-1 p-3 bg-white rounded-xl text-center font-bold text-primary-700 border-2 border-primary-200">
            {pair.left}
          </div>
          <div className="text-gray-300">⟷</div>
          <div className="flex-1 p-3 bg-white rounded-xl text-center font-bold text-emerald-700 border-2 border-emerald-200">
            {pair.right}
          </div>
        </div>
      ))}
    </div>
  )

  const renderOrdering = () => (
    <div className="space-y-3">
      {items.map((step: string, i: number) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
          <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold">
            {i + 1}
          </div>
          <p className="font-medium text-gray-900">{step}</p>
        </div>
      ))}
    </div>
  )

  const renderCrossword = () => (
    <div className="space-y-3">
      {items.map((item: any, i: number) => (
        <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
          <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-bold">
            {i + 1}
          </div>
          <div>
            <p className="font-bold text-gray-900">{item.word}</p>
            <p className="text-sm text-gray-500 mt-1">{item.clue}</p>
          </div>
        </div>
      ))}
    </div>
  )

  const renderWordSearch = () => (
    <div className="flex flex-wrap gap-2">
      {items.map((item: any, i: number) => (
        <div key={i} className="px-4 py-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-sm font-medium">
          {item.term || item.word}
        </div>
      ))}
    </div>
  )

  const renderLessonPlan = () => {
    const plan = items
    if (!plan || !plan.steps) return <p className="text-gray-400">لا توجد خطة درس</p>
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-500">العنوان</span>
            <p className="font-bold">{plan.title}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-500">المرحلة</span>
            <p className="font-bold">{plan.grade}</p>
          </div>
        </div>
        {plan.objectives && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">الأهداف</h4>
            <ul className="space-y-1">
              {plan.objectives.map((o: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-gray-700"><Check className="w-4 h-4 text-emerald-500" />{o}</li>
              ))}
            </ul>
          </div>
        )}
        {plan.steps && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">خطوات الدرس</h4>
            <div className="space-y-3">
              {plan.steps.map((s: any, i: number) => (
                <div key={i} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center font-bold text-sm">{s.order}</div>
                  <div className="flex-1">
                    <p className="font-medium">{s.activity}</p>
                    <p className="text-sm text-gray-400">{s.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderQuestionBank = () => (
    <div className="space-y-4">
      {items.map((q: any, i: number) => (
        <div key={i} className="p-4 bg-gray-50 rounded-2xl border-r-4 border-primary-400">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600">{q.type}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' : q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
              {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'}
            </span>
          </div>
          <p className="font-medium text-gray-900">{q.question}</p>
          {q.options && (
            <div className="mt-2 space-y-1">
              {q.options.map((o: string, j: number) => (
                <p key={j} className={`text-sm ${o === q.answer ? 'text-emerald-700 font-medium' : 'text-gray-600'}`}>• {o}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const renderers: Record<string, () => JSX.Element> = {
    mcq: renderMCQ,
    true_false: renderMCQ,
    fill_blank: () => <div className="space-y-4">{items.map((fb: any, i: number) => (
      <div key={i} className="p-4 bg-gray-50 rounded-2xl">
        <p className="text-gray-900">{fb.sentence.replace('...', <span className="text-primary-600 font-bold">___</span>)}</p>
        <p className="text-sm text-emerald-600 mt-2">الإجابة: {fb.answer}</p>
      </div>
    ))}</div>,
    flashcards: renderFlashcards,
    matching: renderMatching,
    ordering: renderOrdering,
    crossword: renderCrossword,
    word_search: renderWordSearch,
    question_bank: renderQuestionBank,
    lesson_plan: renderLessonPlan,
  }

  return (renderers[type] || (() => <p>عرض غير متاح</p>))()
}
