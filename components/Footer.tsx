'use client';

// Force Cache Busting - Timestamp: 2026-03-25 13:58
import React, { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FOOTER_CONFIG } from '@/lib/constants';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success('Subscription successful! Thank you.', {
          icon: '🎉',
          style: { background: '#2ea043', color: '#fff' }
        });
        setEmail('');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Subscription failed. Please try again.');
      }
    } catch (err) {
      toast.error('Connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#0b0d17] border-t border-white/5 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Section 1: About */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-[10px] uppercase tracking-[0.2em] italic">About Us</h3>
            <div className="h-28 overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-zinc-500 text-[11px] leading-relaxed uppercase tracking-widest font-medium">
                {FOOTER_CONFIG.ABOUT}
              </p>
            </div>
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 3px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.02);
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #FF42B0;
                border-radius: 10px;
              }
            `}</style>
            <div className="space-y-2 text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
              <div className="flex items-center gap-3">
                <span className="text-[#FF42B0] text-xs">📍</span>
                {FOOTER_CONFIG.CONTACT.ADDRESS}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#FF42B0] text-xs">📧</span>
                {FOOTER_CONFIG.CONTACT.EMAIL}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#FF42B0] text-xs">📞</span>
                {FOOTER_CONFIG.CONTACT.PHONE}
              </div>
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div className="space-y-4 lg:pl-12">
            <h3 className="text-white font-black text-[10px] uppercase tracking-[0.2em] italic text-zinc-400">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-zinc-600 hover:text-[#FF42B0] text-[10px] font-black uppercase tracking-widest transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/products" className="text-zinc-600 hover:text-[#FF42B0] text-[10px] font-black uppercase tracking-widest transition-colors">Products</Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-zinc-600 hover:text-[#FF42B0] text-[10px] font-black uppercase tracking-widest transition-colors">Marketplace</Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Newsletter */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-[10px] uppercase tracking-[0.2em] italic">Newsletter</h3>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border-b border-white/10 py-2 px-1 text-[10px] text-white focus:outline-none focus:border-[#FF42B0] transition-all placeholder:text-zinc-700 tracking-widest uppercase font-medium"
                  required
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-zinc-600 hover:text-[#FF42B0] disabled:opacity-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </form>

            <div className="flex gap-3 pt-2">
              {[
                { id: 'facebook', url: FOOTER_CONFIG.SOCIALS.FACEBOOK },
                { id: 'mail', url: FOOTER_CONFIG.SOCIALS.GMAIL },
                { id: 'youtube', url: FOOTER_CONFIG.SOCIALS.YOUTUBE },
                { id: 'instagram', url: FOOTER_CONFIG.SOCIALS.INSTAGRAM }
              ].map((social) => (
                <a 
                  key={social.id}
                  href={social.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-zinc-600 hover:text-white hover:border-[#FF42B0] hover:bg-[#FF42B0]/10 transition-all hover:scale-110 active:scale-95 group"
                >
                  {social.id === 'facebook' && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,104h32a8,8,0,0,1,0,16H136v40a8,8,0,0,1-16,0V144H104a8,8,0,0,1,0-16h16V104a32,32,0,0,1,32-32h24a8,8,0,0,1,0,16H152a16,16,0,0,0-16,16Z"></path></svg>}
                  {social.id === 'mail' && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z"></path></svg>}
                  {social.id === 'youtube' && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M234.44,69.53a32.91,32.91,0,0,0-23.23-23.23C190.64,40,128,40,128,40s-62.64,0-83.21,6.3a32.91,32.91,0,0,0-23.23,23.23C16,90.17,16,128,16,128s0,37.83,5.56,58.47a32.91,32.91,0,0,0,23.23,23.23c20.57,6.3,83.21,6.3,83.21,6.3s62.64,0,83.21-6.3a32.91,32.91,0,0,0,23.23-23.23C240,165.83,240,128,240,128S240,90.17,234.44,69.53ZM104,160V96l56,32Z"></path></svg>}
                  {social.id === 'instagram' && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM172,36H84A48.05,48.05,0,0,0,36,84v88a48.05,48.05,0,0,0,48,48h88a48.05,48.05,0,0,0,48-48V84A48.05,48.05,0,0,0,172,36Zm32,136a32,32,0,0,1-32,32H84a32,32,0,0,1-32-32V84A32,32,0,0,1,84,52h88a32,32,0,0,1,32,32ZM192,72a12,12,0,1,1-12-12A12,12,0,0,1,192,72Z"></path></svg>}
                </a>
              ))}
            </div>
          </div>

          {/* Section 4: Facebook Page Embed */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-[10px] uppercase tracking-[0.2em] italic text-zinc-400">Community</h3>
            <div className="bg-white rounded overflow-hidden shadow-2xl group cursor-pointer hover:scale-[1.01] transition-transform duration-300">
              <div className="p-3 flex items-center gap-3 border-b border-zinc-50">
                <div className="w-8 h-8 bg-zinc-900 rounded overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-[#FF42B0] flex items-center justify-center font-black italic text-white text-[8px]">MH</div>
                </div>
                <div>
                  <h4 className="text-zinc-900 font-black text-[10px] tracking-tight">Diecast Model VN</h4>
                  <p className="text-zinc-500 text-[8px] uppercase font-bold tracking-widest leading-none">12,4k followers</p>
                </div>
              </div>
              <div className="p-2 bg-zinc-50/50 flex justify-between items-center">
                <button className="flex items-center gap-1.5 bg-[#f0f2f5] px-2 py-1 rounded-sm text-[8px] font-bold text-[#1877f2] hover:bg-[#e4e6eb] transition-colors">
                  Follow
                </button>
                <button className="flex items-center gap-1.5 bg-[#f0f2f5] px-2 py-1 rounded-sm text-[8px] font-bold text-zinc-500 hover:bg-[#e4e6eb] transition-colors">
                  Share
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-zinc-700 uppercase tracking-[0.3em] font-black italic">
            © 2026 Diecast <span className="text-[#FF42B0]">Store</span> VN.
          </p>
          <div className="flex gap-6">
             <Link href="#" className="text-zinc-800 hover:text-[#FF42B0] text-[8px] font-black uppercase tracking-widest transition-colors">Privacy</Link>
             <Link href="#" className="text-zinc-800 hover:text-[#FF42B0] text-[8px] font-black uppercase tracking-widest transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
