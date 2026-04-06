'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function StorefrontLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return toast.error('Email invalid')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error
        
        toast.success('Welcome back!')
        router.push('/')
        router.refresh()
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        })
        if (error) throw error
        
        if (data.session) {
          toast.success('Account created!')
          router.push('/')
          router.refresh()
        } else {
          toast.success('Check your email to confirm your account!', { duration: 6000 })
        }
      }
    } catch (e: any) {
      if (e.message.includes('rate limit')) {
        toast.error('Too many attempts. Please try again in 15-30 minutes.')
      } else {
        toast.error(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0d17] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center space-y-6">
            <Link href="/" className="inline-block transform hover:scale-105 transition-transform duration-300">
                <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
                <span className="text-[#FF42B0]">DIECAST</span><br/>STORE
                </h1>
            </Link>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest italic font-gaming">
              {isLogin ? 'AUTHENTICATION' : 'REGISTRATION'}
            </h2>
            <div className="h-[2px] w-12 bg-[#FF42B0] mx-auto"></div>
          </div>
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] max-w-[200px] mx-auto">
            {isLogin ? 'Secure terminal access for elite collectors' : 'Initiate membership in the global diecast network'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="bg-zinc-950/50 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden group">
          {/* Decorative glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF42B0]/5 rounded-full blur-[80px] group-hover:bg-[#FF42B0]/10 transition-colors duration-500"></div>
          
          <div className="space-y-5 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Universal Node (Email)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="node@example.com"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-[#FF42B0] focus:ring-1 focus:ring-[#FF42B0]/30 focus:outline-none transition-all placeholder:text-zinc-800 font-medium text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Secure Key (Password)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-[#FF42B0] focus:ring-1 focus:ring-[#FF42B0]/30 focus:outline-none transition-all placeholder:text-zinc-800 font-medium text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 rounded-2xl bg-[#FF42B0] text-white font-black uppercase tracking-[0.4em] transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 shadow-[0_20px_50px_-15px_rgba(255,66,176,0.4)] text-[10px] btn-glossy relative z-10 font-gaming"
          >
            {loading ? 'SYNCING...' : (isLogin ? 'UPLINK' : 'INITIALIZE')}
          </button>

          <div className="text-center pt-2 relative z-10">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-zinc-600 text-[9px] font-black uppercase tracking-widest hover:text-[#FF42B0] transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <span className="w-1.5 h-[1px] bg-zinc-800 flex-shrink-0"></span>
              {isLogin ? "NEW COLLECTOR? REGISTER" : "EXISTING NODE? LOGIN"}
              <span className="w-1.5 h-[1px] bg-zinc-800 flex-shrink-0"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
