'use client'
import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tajawal } from 'next/font/google'
import {
  LayoutDashboard, BookOpen, Sparkles, Gamepad2, FileText,
  BarChart3, Download, GraduationCap, Menu, X, LogOut
} from 'lucide-react'
import './globals.css'

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
})

const navItems = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/lessons', label: 'الدروس', icon: BookOpen },
  { href: '/generator', label: 'مولد الأنشطة', icon: Sparkles },
  { href: '/games', label: 'الألعاب التعليمية', icon: Gamepad2 },
  { href: '/exams', label: 'الاختبارات', icon: FileText },
  { href: '/reports', label: 'التقارير', icon: BarChart3 },
  { href: '/export', label: 'مركز التصدير', icon: Download },
]

export default function RootLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  if (pathname === '/') {
    return (
      <html lang="ar" dir="rtl" className={tajawal.variable}>
        <body>{children}</body>
      </html>
    )
  }

  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body>
        <div className="min-h-screen bg-gray-50 flex">
          <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-72 bg-white border-l border-gray-200 
            transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
            lg:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col`}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <GraduationCamp className="w-8 h-8 text-primary-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">المعلم الذكي</h1>
                  <p className="text-xs text-gray-500">AI Teacher Platform</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = pathname?.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${active
                        ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-gray-100">
              <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200">
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </aside>

          <div className="flex-1 flex flex-col min-h-screen">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between lg:justify-end">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">أهلاً، أستاذ</span>
                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary-600" />
                </div>
              </div>
            </header>
            <main className="flex-1 p-6 overflow-y-auto">
              {children}
            </main>
          </div>

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
      </body>
    </html>
  )
}

function GraduationCamp(props: any) {
  return <GraduationCap {...props} />
}
