'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Profile = {
  id: string;
  full_name: string | null;
  role: string;
  updated_at: string;
}

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.replace('/login');
        return;
      }

      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }
      setLoading(false);
    };

    fetchUserData();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0d17] flex items-center justify-center">
        <div className="text-zinc-500 font-mono text-xs uppercase animate-pulse">Scanning Bio-Data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d17] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Base
          </Link>
          <button 
            onClick={handleSignOut}
            className="text-red-500/60 hover:text-red-500 transition-colors text-xs font-black uppercase tracking-widest px-4 py-2 border border-red-500/20 rounded-lg hover:bg-red-500/5"
          >
            Terminal Shutdown
          </button>
        </div>

        <div className="bg-zinc-950/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Background Decorative element */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>

          <div className="relative z-10 space-y-8">
            <div className="space-y-1">
              <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">Identity Profile</h1>
              <p className="text-[#FF42B0] text-xs font-black uppercase tracking-widest">Secure Uplink Established</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Universal ID</label>
                <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-zinc-400 font-mono text-sm break-all">
                  {user?.id}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Email Node</label>
                <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-bold">
                  {user?.email}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">System Role</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                  <span className={`w-2 h-2 rounded-full ${profile?.role === 'admin' ? 'bg-[#FF42B0] shadow-[0_0_10px_#FF42B0]' : 'bg-blue-500'}`}></span>
                  <span className="text-white font-black uppercase tracking-wider text-sm">{profile?.role}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Last Matrix Update</label>
                <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-zinc-300 font-medium text-sm">
                  {profile ? new Date(profile.updated_at).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>

            {profile?.role === 'admin' && (
              <div className="pt-8 border-t border-white/5">
                <Link 
                  href="/admin/products"
                  className="inline-flex items-center gap-3 bg-[#FF42B0] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_-5px_rgba(255,66,176,0.3)] btn-glossy"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Access Command Center
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
