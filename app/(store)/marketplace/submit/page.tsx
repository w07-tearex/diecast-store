'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { formatVNDInput, parseVNDInput } from '@/lib/utils';

export default function SubmitListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    condition: 'new',
    description: '',
    sellerName: '',
    sellerPhone: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) toast.error(`${file.name} is too large (> 5MB)`);
      return isLt5M;
    });

    if (imageFiles.length + validFiles.length > 8) {
        toast.error('Limit 8 images per listing');
        return;
    }

    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setImageFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
        toast.error('Please upload at least one image');
        return;
    }

    setLoading(true);
    const toastId = toast.loading(`Uploading listing with ${imageFiles.length} images...`);

    try {
      const data = new FormData();
      // Gửi nhiều file cùng lúc qua chung một key 'files'
      imageFiles.forEach(file => data.append('files', file));
      data.append('title', formData.title);
      data.append('price', formData.price);
      data.append('condition', formData.condition);
      data.append('description', formData.description);
      data.append('sellerName', formData.sellerName);
      data.append('sellerPhone', formData.sellerPhone);

      const response = await fetch('/api/marketplace', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Submission failed');

      toast.success('Album uploaded! Sent for review.', { id: toastId });
      router.push('/marketplace');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during submission', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d17] py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter italic">SUBMIT <span className="text-[#FF42B0]">ALBUM</span></h1>
          <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">A picture is worth a thousand collectors. Upload up to 8 shots.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-950/50 border border-white/5 rounded-3xl p-10 backdrop-blur-3xl space-y-8 shadow-2xl">
          {/* MULTI IMAGE UPLOAD SECTION */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block pl-2 italic">Product Gallery ({imageFiles.length}/8) *</label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {previewUrls.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl bg-zinc-900 overflow-hidden border border-white/10 group shadow-lg">
                  <img src={url} className="w-full h-full object-cover p-1" alt="Preview" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-2xl"
                  >
                   <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  {i === 0 && <span className="absolute bottom-2 left-2 bg-zinc-950/80 backdrop-blur-[1px] text-[7px] text-zinc-400 font-black px-2 py-0.5 rounded-md border border-white/10 uppercase tracking-widest">Main</span>}
                </div>
              ))}
              
              {imageFiles.length < 8 && (
                <button 
                  type="button"
                  onClick={() => document.getElementById('image-input')?.click()}
                  className="aspect-square border-2 border-dashed border-zinc-800 rounded-xl hover:border-[#FF42B0]/40 transition-all flex flex-col items-center justify-center gap-2 group bg-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-600 group-hover:bg-[#FF42B0] group-hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Add Photo</span>
                </button>
              )}
            </div>
            
            <input 
              id="image-input" 
              type="file" 
              multiple
              accept="image/*" 
              onChange={handleImageChange} 
              className="hidden" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block pl-2">Product Title *</label>
              <input 
                required
                type="text" 
                placeholder="Ex: Tarmac Works Porsche 718"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-[#FF42B0]/40 transition-all font-medium"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block pl-2">Price (VND) *</label>
              <input 
                required
                type="text" 
                placeholder="Ex: 30,000"
                value={formatVNDInput(formData.price)}
                onChange={(e) => setFormData({...formData, price: parseVNDInput(e.target.value)})}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-[#FF42B0]/40 transition-all font-black italic tracking-tighter"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block pl-2 italic">Condition Select *</label>
            <div className="grid grid-cols-3 gap-3">
                {['new', 'used', 'damaged'].map((cond) => (
                    <button
                        key={cond}
                        type="button"
                        onClick={() => setFormData({...formData, condition: cond})}
                        className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                            formData.condition === cond ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 text-zinc-500 border-white/5'
                        }`}
                    >
                        {cond}
                    </button>
                ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block pl-2">Description (Optional)</label>
            <textarea 
              rows={4}
              placeholder="Tell collectors about the condition, rarity or included accessories..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-[#FF42B0]/40 transition-all font-light leading-relaxed"
            />
          </div>

          <div className="pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block pl-2">Your Display Name *</label>
              <input 
                required
                type="text" 
                placeholder="Your name"
                value={formData.sellerName}
                onChange={(e) => setFormData({...formData, sellerName: e.target.value})}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-[#FF42B0]/40 transition-all font-medium"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block pl-2">Phone / Zalo *</label>
              <input 
                required
                type="text" 
                placeholder="Ex: 0987654321"
                value={formData.sellerPhone}
                onChange={(e) => setFormData({...formData, sellerPhone: e.target.value})}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-[#FF42B0]/40 transition-all font-black font-mono tracking-widest"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] italic text-xs transition-all shadow-2xl ${
                loading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-[#FF42B0] hover:bg-[#E52292] text-white hover:scale-[1.03] active:scale-95 shadow-[0_20px_40px_-10px_rgba(255,66,176,0.3)]'
            }`}
          >
            {loading ? 'UPLOADING ALBUM...' : 'TRANSMIT COLLECTOR LISTING'}
          </button>
        </form>
      </div>
    </div>
  );
}
