'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type AdminStatus = {
  hasAdmin: boolean
  isAdmin: boolean
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [next, setNext] = useState('/admin/products')

  const supabase = useMemo(() => createClient(), [])

  const [status, setStatus] = useState<AdminStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const n = params.get('next')
    if (n) setNext(n)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/admin/status')
        const json = (await res.json()) as AdminStatus
        if (cancelled) return
        setStatus(json)
        if (json?.isAdmin) router.replace(next)
      } catch {
        if (cancelled) return
        setStatus({ hasAdmin: false, isAdmin: false })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [next, router])

  const onAdminLogin = async () => {
    if (!email.trim() || !email.includes('@')) return toast.error('Email invalid')
    if (!password) return toast.error('Password required')

    setLoading(true)
    try {
      const loginEmail = email.trim()

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      })

      if (loginError) {
        // Handle common Supabase Auth errors
        if (loginError.message.includes('rate limit')) {
          throw new Error('Too many attempts. Please wait 15-30 minutes before trying again (Supabase 429).')
        }
        if (loginError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials.')
        }
        if (loginError.message.includes('Email not confirmed')) {
          throw new Error('Email chưa được xác nhận! Hãy check hộp thư hoặc vào Supabase SQL Editor để xác nhận thủ công tài khoản này.')
        }
        throw loginError
      }

      if (data?.user) {
        // Successful login, middleware will handle the role redirection
        // But we can check here for better UX
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profile?.role === 'admin') {
          toast.success('Admin access granted')
          router.replace(next)
          router.refresh()
        } else {
          // If not an admin, they shouldn't be here
          await supabase.auth.signOut()
          throw new Error('You do not have administrative privileges.')
        }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Login failed'
      toast.error(message, { duration: 5000 })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !status) {
    return (
      <div className="min-h-screen bg-[#0b0d17] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#FF42B0] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Loading admin access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0d17] py-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">ADMIN</h1>
          <p className="text-zinc-500 text-sm font-medium">
            Đăng nhập quản trị hệ thống
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void onAdminLogin()
          }}
          className="mt-10 bg-zinc-950/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email *</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-[#FF42B0] focus:outline-none transition-all placeholder:text-zinc-700 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-[#FF42B0] focus:outline-none transition-all placeholder:text-zinc-700 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-7 rounded-2xl bg-gradient-to-r from-[#FF42B0] to-[#FF42B0] text-white font-black uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 shadow-[0_20px_50px_-15px_rgba(255,66,176,0.4)] btn-glossy font-gaming text-xs"
          >
            {loading ? 'PLEASE WAIT...' : 'SIGN IN'}
          </button>

        </form>
      </div>
    </div>
  )
}

