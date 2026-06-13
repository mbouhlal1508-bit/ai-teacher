'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const payload = isRegister ? form : { email: form.email, password: form.password }
      const { data } = await api.post(endpoint, payload)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success(isRegister ? 'تم إنشاء الحساب بنجاح' : 'تم تسجيل الدخول')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-emerald-900 flex items-center justify-center p-6">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <GraduationCap className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">المعلم الذكي</h1>
          <p className="text-emerald-200/60 mt-2">منصة الأنشطة التعليمية الذكية</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <div className="flex mb-8 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-3 rounded-lg text-center transition-all ${!isRegister ? 'bg-white text-gray-900 font-semibold shadow-sm' : 'text-white/60 hover:text-white'}`}
            >
              تسجيل دخول
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-3 rounded-lg text-center transition-all ${isRegister ? 'bg-white text-gray-900 font-semibold shadow-sm' : 'text-white/60 hover:text-white'}`}
            >
              إنشاء حساب
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-white/80 text-sm mb-2 block">الاسم</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="الاسم الكامل"
                    required
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-white/80 text-sm mb-2 block">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="teacher@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-white/80 text-sm mb-2 block">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-12 pl-12 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? 'جاري التحميل...' : isRegister ? 'إنشاء حساب' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
