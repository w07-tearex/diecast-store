'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function WithdrawListingButton({
  listingId,
  disabled,
}: {
  listingId: string
  disabled?: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onWithdraw = async () => {
    if (disabled || loading) return

    const ok = window.confirm('Withdraw this listing?')
    if (!ok) return

    setLoading(true)
    try {
      const res = await fetch(`/api/marketplace/${listingId}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Withdraw failed')

      toast.success('Listing withdrawn.')
      router.refresh()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Withdraw failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onWithdraw()}
      disabled={disabled || loading}
      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
        disabled || loading
          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          : 'bg-red-600 hover:bg-red-500 text-white'
      }`}
    >
      {loading ? 'WITHDRAWING...' : 'WITHDRAW'}
    </button>
  )
}

