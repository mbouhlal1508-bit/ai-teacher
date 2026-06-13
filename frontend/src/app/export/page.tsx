'use client'
import { useState, useEffect } from 'react'
import { Download, FileText, FileSpreadsheet, Presentation, FileCode, ExternalLink } from 'lucide-react'
import api from '@/lib/api'
import type { Lesson } from '@/types'

const formats = [
  { id: 'word', name: 'Word', desc: 'مستند Word احترافي', icon: FileText, color: 'from-blue-500 to-blue-600' },
  { id: 'pptx', name: 'PowerPoint', desc: 'عرض تقديمي', icon: Presentation, color: 'from-orange-500 to-orange-600' },
  { id: 'pdf', name: 'PDF', desc: 'مستند نصي', icon: FileText, color: 'from-red-500 to-red-600' },
  { id: 'moodle', name: 'Moodle', desc: 'XML متوافق مع Moodle', icon: FileCode, color: 'from-emerald-500 to-emerald-600' },
  { id: 'google_forms', name: 'Google Forms', desc: 'JSON لاستيراد النماذج', icon: ExternalLink, color: 'from-purple-500 to-purple-600' },
]

export default function ExportPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState('')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    api.get('/lessons').then(({ data }) => setLessons(data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleExport = async (format: string) => {
    if (!selectedLesson) return
    setExporting(true)
    try {
      const { data, headers } = await api.get(`/export/${selectedLesson}?format=${format}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([data]))
      const a = document.createElement('a')
      const contentDisposition = headers?.['content-disposition']
      const filename = contentDisposition?.match(/filename="?(.+?)"?$/) 
        ? contentDisposition.match(/filename="?(.+?)"?$/)[1]
        : `export.${format === 'pptx' ? 'pptx' : format === 'word' ? 'docx' : format === 'pdf' ? 'txt' : format === 'moodle' ? 'xml' : 'json'}`
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('فشل التصدير')
    }
    setExporting(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">مركز التصدير</h1>
        <p className="text-gray-500 mt-1">صدّر أنشطتك التعليمية بصيغ متعددة</p>
      </div>

      <div className="card max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">اختر الدرس</label>
        <select value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)}
          className="input-field">
          <option value="">-- اختر درساً --</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>{l.title} - {l.grade}</option>
          ))}
        </select>
      </div>

      {selectedLesson ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formats.map((fmt) => {
            const Icon = fmt.icon
            return (
              <button key={fmt.id} onClick={() => handleExport(fmt.id)} disabled={exporting}
                className="card hover:shadow-xl transition-all text-right group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${fmt.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{fmt.name}</h3>
                <p className="text-sm text-gray-500">{fmt.desc}</p>
                <div className="mt-4 flex items-center gap-2 text-primary-600 text-sm font-medium">
                  <Download className="w-4 h-4" />
                  <span>تصدير</span>
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <Download className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>اختر درساً لبدء التصدير</p>
        </div>
      )}
    </div>
  )
}
