'use client'
import Link from 'next/link'
import { GraduationCap, Sparkles, Gamepad2, BookOpen, ArrowLeft, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-emerald-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-10 h-10 text-emerald-400" />
              <span className="text-2xl font-bold text-white">المعلم الذكي</span>
            </div>
            <div className="flex gap-4">
              <Link href="/auth" className="text-white/80 hover:text-white px-6 py-2 transition-colors">
                تسجيل الدخول
              </Link>
              <Link
                href="/auth?register=true"
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-xl transition-all"
              >
                إنشاء حساب
              </Link>
            </div>
          </nav>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm mb-6">
                منصة الأنشطة التعليمية الذكية
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                منصة توليد الأنشطة التعليمية
                <span className="text-emerald-400"> بالذكاء الاصطناعي</span>
              </h1>
              <p className="text-emerald-100/80 text-lg mb-8 leading-relaxed">
                أدخل محتوى درسك، ودع الذكاء الاصطناعي يصمم لك عشرات الأنشطة والألعاب
                التعليمية التفاعلية في ثوانٍ.
              </p>
              <div className="flex flex-wrap gap-4 mb-12">
                <Link
                  href="/generator"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-xl hover:shadow-2xl"
                >
                  <Sparkles className="w-6 h-6" />
                  ابدأ بتوليد الأنشطة
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <Link
                  href="/lessons"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl text-lg transition-all backdrop-blur-sm"
                >
                  <BookOpen className="w-6 h-6" />
                  استعرض الدروس
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { num: '١١', label: 'نوع نشاط' },
                  { num: '٥٠٠+', label: 'قالب جاهز' },
                  { num: '٥', label: 'صيغ تصدير' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-3xl font-bold text-emerald-400">{s.num}</div>
                    <div className="text-emerald-100/60 text-sm">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-2xl opacity-20" />
                <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                  <div className="space-y-4">
                    {[
                      'أسئلة اختيار متعدد',
                      'بطاقات تعليمية',
                      'ألعاب مطابقة',
                      'كلمات متقاطعة',
                      'خطة درس كاملة',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 text-white text-lg">
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Gamepad2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-white font-semibold">أركان الصلاة - ألعاب تفاعلية</span>
                    </div>
                    <div className="flex gap-2">
                      {['Kahoot', 'Matching', 'Flashcards'].map((tag) => (
                        <span key={tag} className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
