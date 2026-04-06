'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'

type ContactMode = 'email' | 'phone'

export default function AuthLoginPage() {
  const router = useRouter()
  const [next, setNext] = useState('/marketplace')

  const supabase = useMemo(() => createClient(), [])

  const [mode, setMode] = useState<ContactMode>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const n = params.get('next')
    if (n) setNext(n)
  }, [])

  const onSignIn = async () => {
    if (!password) return toast.error('Password required')

    setLoading(true)
    try {
      if (mode === 'email') {
        if (!email.trim() || !email.includes('@')) throw new Error('Email invalid')
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error
      } else {
        if (!phone.trim()) throw new Error('Phone required')
        const { error } = await supabase.auth.signInWithPassword({
          phone: phone.trim(),
          password,
        })
        if (error) throw error
      }

      router.replace(next)
    } catch (e: any) {
      toast.error(e?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0d17] py-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">SIGN IN</h1>
          <p className="text-zinc-500 text-sm font-medium">Email/Phone + password</p>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setMode('email')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              mode === 'email' ? 'bg-[#FF42B0] text-white border-[#FF42B0]' : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setMode('phone')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              mode === 'phone' ? 'bg-[#FF42B0] text-white border-[#FF42B0]' : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'
            }`}
          >
            Phone
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void onSignIn()
          }}
          className="mt-8 bg-zinc-950/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6"
        >
          {mode === 'email' ? (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email *</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-[#FF42B0] focus:outline-none transition-all placeholder:text-zinc-700 font-medium"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Phone / Zalo *</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0987654321"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-[#FF42B0] focus:outline-none transition-all placeholder:text-zinc-700 font-medium"
              />
            </div>
          )}

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

          <div className="flex flex-col items-center gap-3 pt-2">
            <Link
              href="/auth/register"
              className="text-[10px] font-black uppercase tracking-widest text-[#58a6ff] hover:text-white transition-colors"
            >
              Create account
            </Link>
            <a
              href="/api/auth/google"
              className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
            >
              Continue with Google
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

