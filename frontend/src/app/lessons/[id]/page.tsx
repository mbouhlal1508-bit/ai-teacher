'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, Edit3, Trash2, BookOpen, Plus, X } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import type { Lesson } from '@/types'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'

export default function LessonDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [editingActivity, setEditingActivity] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    api.get(`/lessons/${id}`)
      .then(({ data }) => setLesson(data))
      .catch(() => router.push('/lessons'))
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" /></div>
  if (!lesson) return null

  return (
    <>
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <ArrowRight className="w-5 h-5" /> العودة
        </button>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-gray-500">
                <span>{lesson.grade}</span>
                <span>|</span>
                <span>{lesson.subject}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/generator?lesson_id=${lesson.id}`} className="btn-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> توليد الأنشطة
              </Link>
            </div>
          </div>
        </div>

        {lesson.objectives && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">الأهداف التعليمية</h2>
            <p className="text-gray-600 whitespace-pre-line">{lesson.objectives}</p>
          </div>
        )}

        {lesson.content && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">محتوى الدرس</h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed max-h-96 overflow-y-auto">
              {lesson.content}
            </div>
          </div>
        )}

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">الأنشطة</h2>
            <button onClick={() => { setEditingActivity(null); setShowManualEntry(true) }}
              className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
              <Plus className="w-4 h-4" /> إضافة نشاط يدوي
            </button>
          </div>
          <ActivityList lessonId={lesson.id} refreshKey={refreshKey}
          onEdit={(a) => { setEditingActivity(a); setShowManualEntry(true) }}
          onDelete={() => setRefreshKey(k => k + 1)} />
        </div>
      </div>

      {showManualEntry && (
        <ManualEntryModal
          lessonId={lesson.id}
          activity={editingActivity}
          onClose={() => { setShowManualEntry(false); setEditingActivity(null); setRefreshKey(k => k + 1) }}
        />
      )}
    </>
  )
}

function ActivityList({ lessonId, refreshKey, onEdit, onDelete }: { lessonId: number; refreshKey: number; onEdit: (a: any) => void; onDelete: () => void }) {
  const [activities, setActivities] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])

  useEffect(() => {
    api.get(`/activities/lesson/${lessonId}`).then(({ data }) => setActivities(data)).catch(() => {})
    api.get(`/games/lesson/${lessonId}`).then(({ data }) => setGames(data)).catch(() => {})
  }, [lessonId, refreshKey])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا النشاط؟')) return
    try {
      await api.delete(`/activities/${id}`)
      toast.success('تم حذف النشاط')
      onDelete()
    } catch { toast.error('فشل الحذف') }
  }

  if (activities.length === 0 && games.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>لم يتم توليد أنشطة بعد</p>
        <Link href={`/generator?lesson_id=${lessonId}`} className="text-primary-600 hover:underline mt-2 inline-block">
          توليد الأنشطة الآن
        </Link>
      </div>
    )
  }

  const gameTypes = new Set(['mcq', 'matching', 'ordering', 'flashcards', 'crossword', 'word_search', 'true_false'])

  const typeLabels: Record<string, string> = {
    mcq: 'اختيار متعدد', true_false: 'صح وخطأ', fill_blank: 'أكمل الفراغ',
    flashcards: 'بطاقات تعليمية', matching: 'مطابقة', ordering: 'ترتيب',
    crossword: 'كلمات متقاطعة', word_search: 'بحث عن الكلمات', question_bank: 'بنك أسئلة', lesson_plan: 'خطة درس'
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {activities.map((a) => {
        const isGame = gameTypes.has(a.type)
        const content = (
          <div className={`relative group p-3 rounded-xl text-sm font-medium ${isGame ? 'bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors' : 'bg-gray-50 text-gray-700'}`}>
            <div className="flex items-center justify-between">
              <span>{isGame ? '🎮 ' : '📄 '}{typeLabels[a.type] || a.type}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(a) }}
                  className="p-1.5 rounded-lg hover:bg-primary-200 text-primary-600">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(a.id) }}
                  className="p-1.5 rounded-lg hover:bg-red-100 text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )
        return isGame
          ? <Link key={a.id} href={`/games/${a.type}?lesson_id=${lessonId}`}>{content}</Link>
          : <div key={a.id}>{content}</div>
      })}
      {games.map((g) => (
        <Link key={g.id} href={`/games/${g.game_type}?lesson_id=${lessonId}`}
          className="p-3 bg-purple-50 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors">
          🎮 {typeLabels[g.game_type] || g.game_type}
        </Link>
      ))}
    </div>
  )
}


const activityTypes = [
  { value: 'mcq', label: 'اختيار متعدد', hint: '[{"question":"...","choices":["أ","ب","ج","د"],"answer":"أ"}]' },
  { value: 'true_false', label: 'صح وخطأ', hint: '[{"question":"...","answer":true,"explanation":"..."}]' },
  { value: 'fill_blank', label: 'أكمل الفراغ', hint: '[{"sentence":"...","answer":"..."}]' },
  { value: 'flashcards', label: 'بطاقات تعليمية', hint: '[{"front":"...","back":"..."}]' },
  { value: 'matching', label: 'مطابقة', hint: '[{"left":"...","right":"..."}]' },
  { value: 'ordering', label: 'ترتيب', hint: '["خطوة 1","خطوة 2","خطوة 3"]' },
  { value: 'crossword', label: 'كلمات متقاطعة', hint: '[{"word":"...","clue":"..."}]' },
  { value: 'word_search', label: 'بحث عن الكلمات', hint: '[{"word":"...","term":"..."}]' },
  { value: 'question_bank', label: 'بنك أسئلة', hint: '[{"type":"mcq","question":"...","options":[],"answer":"...","difficulty":"medium"}]' },
]

function ManualEntryModal({ lessonId, activity, onClose }: { lessonId: number; activity: any; onClose: () => void }) {
  const [type, setType] = useState('mcq')
  const [jsonData, setJsonData] = useState('')
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [parseError, setParseError] = useState('')
  const [simpleMode, setSimpleMode] = useState(true)
  const [mcqQuestions, setMcqQuestions] = useState([{ question: '', choices: ['', '', '', ''], answer: '' }])
  const [matchingPairs, setMatchingPairs] = useState([{ left: '', right: '' }])
  const [tfItems, setTfItems] = useState([{ question: '', answer: 'true', explanation: '' }])
  const [fillItems, setFillItems] = useState([{ sentence: '', answer: '' }])
  const [flashcardItems, setFlashcardItems] = useState([{ front: '', back: '' }])
  const [orderingItems, setOrderingItems] = useState([{ step: '' }])
  const [crosswordItems, setCrosswordItems] = useState([{ word: '', clue: '' }])
  const [wordSearchItems, setWordSearchItems] = useState([{ word: '', term: '' }])

  const selectedType = activityTypes.find(t => t.value === type)
  const hasSimpleForm = type !== 'question_bank'
  const isEditing = !!activity

  useEffect(() => {
    if (!activity) return
    setType(activity.type)
    const data = activity.json_data
    setJsonData(JSON.stringify(data, null, 2))
    setPreview(data)
    if (activity.type === 'mcq' && Array.isArray(data)) {
      setMcqQuestions(data.map((q: any) => ({
        question: q.question || '',
        choices: q.choices?.length ? q.choices : ['', '', '', ''],
        answer: q.answer || '',
      })))
    } else if (activity.type === 'matching' && Array.isArray(data)) {
      setMatchingPairs(data.map((p: any) => ({ left: p.left || '', right: p.right || '' })))
    } else if (activity.type === 'true_false' && Array.isArray(data)) {
      setTfItems(data.map((q: any) => ({ question: q.question || '', answer: q.answer ? 'true' : 'false', explanation: q.explanation || '' })))
    } else if (activity.type === 'fill_blank' && Array.isArray(data)) {
      setFillItems(data.map((q: any) => ({ sentence: q.sentence || '', answer: q.answer || '' })))
    } else if (activity.type === 'flashcards' && Array.isArray(data)) {
      setFlashcardItems(data.map((q: any) => ({ front: q.front || '', back: q.back || '' })))
    } else if (activity.type === 'ordering' && Array.isArray(data)) {
      setOrderingItems(data.map((s: string) => ({ step: s })))
    } else if ((activity.type === 'crossword' || activity.type === 'word_search') && Array.isArray(data)) {
      const items = data.map((q: any) => ({ word: q.word || '', clue: q.clue || '', term: q.term || '' }))
      if (activity.type === 'crossword') setCrosswordItems(items)
      else setWordSearchItems(items)
    }
  }, [activity])

  const buildJsonFromMcq = () => {
    const items = mcqQuestions.filter(q => q.question.trim()).map(q => ({
      question: q.question,
      choices: q.choices.filter(c => c.trim()),
      answer: q.answer,
    }))
    setJsonData(JSON.stringify(items, null, 2)); setPreview(items); setParseError('')
    return items
  }
  const buildJsonFromMatching = () => {
    const items = matchingPairs.filter(p => p.left.trim() && p.right.trim()).map(p => ({ left: p.left, right: p.right }))
    setJsonData(JSON.stringify(items, null, 2)); setPreview(items); setParseError('')
    return items
  }
  const buildJsonFromTf = () => {
    const items = tfItems.filter(q => q.question.trim()).map(q => ({ question: q.question, answer: q.answer === 'true', explanation: q.explanation || undefined }))
    setJsonData(JSON.stringify(items, null, 2)); setPreview(items); setParseError('')
    return items
  }
  const buildJsonFromFill = () => {
    const items = fillItems.filter(q => q.sentence.trim()).map(q => ({ sentence: q.sentence, answer: q.answer }))
    setJsonData(JSON.stringify(items, null, 2)); setPreview(items); setParseError('')
    return items
  }
  const buildJsonFromFlashcards = () => {
    const items = flashcardItems.filter(q => q.front.trim()).map(q => ({ front: q.front, back: q.back }))
    setJsonData(JSON.stringify(items, null, 2)); setPreview(items); setParseError('')
    return items
  }
  const buildJsonFromOrdering = () => {
    const items = orderingItems.filter(s => s.step.trim()).map(s => s.step.trim())
    setJsonData(JSON.stringify(items, null, 2)); setPreview(items); setParseError('')
    return items
  }
  const buildJsonFromCrossword = () => {
    const items = crosswordItems.filter(q => q.word.trim()).map(q => ({ word: q.word, clue: q.clue }))
    setJsonData(JSON.stringify(items, null, 2)); setPreview(items); setParseError('')
    return items
  }
  const buildJsonFromWordSearch = () => {
    const items = wordSearchItems.filter(q => q.word.trim()).map(q => ({ word: q.word, term: q.term }))
    setJsonData(JSON.stringify(items, null, 2)); setPreview(items); setParseError('')
    return items
  }

  const handleSave = async () => {
    let parsed: any
    if (!simpleMode || type === 'question_bank') {
      try {
        parsed = JSON.parse(jsonData)
        if (!Array.isArray(parsed)) { toast.error('البيانات يجب أن تكون مصفوفة [{...}]'); return }
      } catch (e: any) {
        toast.error(`JSON غير صحيح: ${e.message}`); return
      }
    } else if (type === 'mcq') { parsed = buildJsonFromMcq(); if (parsed.length === 0) { toast.error('أدخل سؤالاً واحداً على الأقل'); return } }
    else if (type === 'matching') { parsed = buildJsonFromMatching(); if (parsed.length === 0) { toast.error('أدخل زوجاً واحداً على الأقل'); return } }
    else if (type === 'true_false') { parsed = buildJsonFromTf(); if (parsed.length === 0) { toast.error('أدخل سؤالاً واحداً على الأقل'); return } }
    else if (type === 'fill_blank') { parsed = buildJsonFromFill(); if (parsed.length === 0) { toast.error('أدخل جملة واحدة على الأقل'); return } }
    else if (type === 'flashcards') { parsed = buildJsonFromFlashcards(); if (parsed.length === 0) { toast.error('أدخل بطاقة واحدة على الأقل'); return } }
    else if (type === 'ordering') { parsed = buildJsonFromOrdering(); if (parsed.length === 0) { toast.error('أدخل خطوة واحدة على الأقل'); return } }
    else if (type === 'crossword') { parsed = buildJsonFromCrossword(); if (parsed.length === 0) { toast.error('أدخل كلمة واحدة على الأقل'); return } }
    else if (type === 'word_search') { parsed = buildJsonFromWordSearch(); if (parsed.length === 0) { toast.error('أدخل كلمة واحدة على الأقل'); return } }

    setSaving(true)
    try {
      if (isEditing) {
        await api.put(`/activities/${activity.id}`, { json_data: parsed })
        toast.success('تم تعديل النشاط بنجاح')
      } else {
        await api.post('/activities/manual', { lesson_id: lessonId, type, title: selectedType?.label || type, json_data: parsed })
        toast.success('تم إضافة النشاط بنجاح')
      }
      onClose()
    } catch (err: any) {
      const detail = err.response?.data?.detail
      toast.error(Array.isArray(detail) ? detail.map((d: any) => d.msg).join('، ') : detail || 'فشل الحفظ')
    } finally { setSaving(false) }
  }

  const fillExample = () => {
    const examples: Record<string, string> = {
      mcq: '[{"question":"ما معنى الإيمان؟","choices":["التصديق بالقلب","العمل بالجوارح","قول اللسان","جميع ما سبق"],"answer":"جميع ما سبق"}]',
      true_false: '[{"question":"الإيمان يزيد بالطاعات","answer":true,"explanation":"الإيمان يزيد بالطاعة وينقص بالمعصية"}]',
      fill_blank: '[{"sentence":"أركان الإسلام ...","answer":"خمسة"}]',
      flashcards: '[{"front":"ما هي أركان الإسلام؟","back":"خمسة أركان"}]',
      matching: '[{"left":"الصلاة","right":"ركن من أركان الإسلام"}]',
      ordering: '["النية","الوضوء","الصلاة"]',
    }
    const example = examples[type] || ''
    setJsonData(example); setPreview(null); setParseError('')
  }

  const simpleForm = () => {
    const items = (arr: any[], fields: string[], label: string, addFn: () => void, setFn: (v: any[]) => void) => (
      <div className="space-y-4">
        <p className="text-sm text-gray-500">{label}</p>
        {arr.map((item, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-2xl space-y-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-primary-600">{i + 1}</span>
              {arr.length > 1 && (
                <button onClick={() => setFn(arr.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-sm">حذف</button>
              )}
            </div>
            <div className={`flex gap-3 ${fields.length === 1 ? '' : 'flex-wrap'}`}>
              {fields.map(f => (
                <input key={f} value={(item as any)[f]} onChange={e => {
                  const copy = [...arr]; copy[i] = { ...copy[i], [f]: e.target.value }; setFn(copy)
                }} placeholder={f} className="input-field flex-1" />
              ))}
            </div>
          </div>
        ))}
        <button onClick={addFn} className="btn-secondary w-full flex items-center justify-center gap-2 py-3">
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </div>
    )

    switch (type) {
      case 'mcq':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">أدخل الأسئلة مع الخيارات والإجابة الصحيحة:</p>
            {mcqQuestions.map((q, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-2xl space-y-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary-600">سؤال {i + 1}</span>
                  {mcqQuestions.length > 1 && (
                    <button onClick={() => setMcqQuestions(mcqQuestions.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-sm">حذف</button>
                  )}
                </div>
                <input value={q.question} onChange={e => { const c = [...mcqQuestions]; c[i] = { ...c[i], question: e.target.value }; setMcqQuestions(c) }}
                  placeholder="نص السؤال" className="input-field" />
                <div className="grid grid-cols-2 gap-2">
                  {q.choices.map((c, j) => (
                    <input key={j} value={c} onChange={e => {
                      const copy = [...mcqQuestions]; const ch = [...copy[i].choices]; ch[j] = e.target.value; copy[i] = { ...copy[i], choices: ch }; setMcqQuestions(copy)
                    }} placeholder={`خيار ${j + 1}`} className="input-field text-sm" />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">الإجابة الصحيحة:</span>
                  <select value={q.answer} onChange={e => { const c = [...mcqQuestions]; c[i] = { ...c[i], answer: e.target.value }; setMcqQuestions(c) }}
                    className="input-field w-auto">
                    <option value="">اختر...</option>
                    {q.choices.filter(c => c.trim()).map((c, j) => (<option key={j} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>
            ))}
            <button onClick={() => setMcqQuestions([...mcqQuestions, { question: '', choices: ['', '', '', ''], answer: '' }])}
              className="btn-secondary w-full flex items-center justify-center gap-2 py-3">
              <Plus className="w-4 h-4" /> إضافة سؤال آخر
            </button>
          </div>
        )
      case 'matching':
        return items(matchingPairs, ['left', 'right'], 'أدخل أزواج المطابقة (يمين ← يسار):',
          () => setMatchingPairs([...matchingPairs, { left: '', right: '' }]), setMatchingPairs)
      case 'true_false':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">أدخل أسئلة صح وخطأ:</p>
            {tfItems.map((q, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-2xl space-y-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary-600">سؤال {i + 1}</span>
                  {tfItems.length > 1 && (
                    <button onClick={() => setTfItems(tfItems.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-sm">حذف</button>
                  )}
                </div>
                <input value={q.question} onChange={e => { const c = [...tfItems]; c[i] = { ...c[i], question: e.target.value }; setTfItems(c) }}
                  placeholder="نص السؤال" className="input-field" />
                <div className="flex gap-3">
                  <select value={q.answer} onChange={e => { const c = [...tfItems]; c[i] = { ...c[i], answer: e.target.value }; setTfItems(c) }}
                    className="input-field w-auto">
                    <option value="true">صح</option>
                    <option value="false">خطأ</option>
                  </select>
                  <input value={q.explanation} onChange={e => { const c = [...tfItems]; c[i] = { ...c[i], explanation: e.target.value }; setTfItems(c) }}
                    placeholder="شرح (اختياري)" className="input-field flex-1" />
                </div>
              </div>
            ))}
            <button onClick={() => setTfItems([...tfItems, { question: '', answer: 'true', explanation: '' }])}
              className="btn-secondary w-full flex items-center justify-center gap-2 py-3">
              <Plus className="w-4 h-4" /> إضافة سؤال آخر
            </button>
          </div>
        )
      case 'fill_blank':
        return items(fillItems, ['sentence', 'answer'], 'أدخل الجمل مع الإجابة المفقودة:',
          () => setFillItems([...fillItems, { sentence: '', answer: '' }]), setFillItems)
      case 'flashcards':
        return items(flashcardItems, ['front', 'back'], 'أدخل البطاقات (الوجه الأمامي ← الخلفي):',
          () => setFlashcardItems([...flashcardItems, { front: '', back: '' }]), setFlashcardItems)
      case 'ordering':
        return items(orderingItems, ['step'], 'أدخل الخطوات بالترتيب:',
          () => setOrderingItems([...orderingItems, { step: '' }]), setOrderingItems)
      case 'crossword':
        return items(crosswordItems, ['word', 'clue'], 'أدخل الكلمات مع التلميحات:',
          () => setCrosswordItems([...crosswordItems, { word: '', clue: '' }]), setCrosswordItems)
      case 'word_search':
        return items(wordSearchItems, ['word', 'term'], 'أدخل الكلمات مع المصطلحات:',
          () => setWordSearchItems([...wordSearchItems, { word: '', term: '' }]), setWordSearchItems)
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'تعديل النشاط' : 'إضافة نشاط يدوي'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع النشاط</label>
            <select value={type} onChange={e => { setType(e.target.value); setJsonData(''); setPreview(null); setParseError(''); setSimpleMode(true) }}
              className="input-field">
              {activityTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {hasSimpleForm && (
            <div className="flex gap-2 mb-2">
              <button onClick={() => setSimpleMode(true)}
                className={`flex-1 py-2 rounded-xl text-sm transition-all ${simpleMode ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>
                إدخال بسيط
              </button>
              <button onClick={() => setSimpleMode(false)}
                className={`flex-1 py-2 rounded-xl text-sm transition-all ${!simpleMode ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>
                JSON متقدم
              </button>
            </div>
          )}

          {simpleMode && hasSimpleForm ? simpleForm() : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البيانات (JSON)
                <button onClick={fillExample} className="mr-3 text-xs text-emerald-600 hover:underline">مثال جاهز</button>
              </label>
              <textarea value={jsonData} onChange={e => {
                const val = e.target.value; setJsonData(val)
                try { setPreview(JSON.parse(val)); setParseError('') }
                catch (ex: any) { setPreview(null); setParseError(val ? ex.message : '') }
              }} placeholder={selectedType?.hint}
                className="input-field min-h-[200px] font-mono text-sm leading-relaxed ltr text-left" dir="ltr" />
            </div>
          )}

          {parseError && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">⚠ {parseError}</div>}
          {preview && !simpleMode && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-xs text-green-600 mb-2">✓ JSON صحيح</p>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap" dir="ltr">{JSON.stringify(preview, null, 2)}</pre>
            </div>
          )}
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? 'جاري الحفظ...' : isEditing ? 'تحديث النشاط' : 'حفظ النشاط'}
          </button>
          <button onClick={onClose} className="btn-secondary px-6">إلغاء</button>
        </div>
      </div>
    </div>
  )
}
