'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { formatVNDInput, parseVNDInput } from '@/lib/utils';

function supabaseErrorMessage(err: unknown, fallback = 'Failed to update product.'): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    const msg = (err as { message: string }).message;
    if ('details' in err && typeof (err as { details: unknown }).details === 'string' && (err as { details: string }).details) {
      return `${msg} — ${(err as { details: string }).details}`;
    }
    return msg;
  }
  return fallback;
}

export default function EditProductContent({ id }: { id: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Tarmac Works',
    price: '',
    description: '',
    stock: '0',
    condition: 'new',
  });

  const [existingMainImage, setExistingMainImage] = useState<string>('');
  const [existingGallery, setExistingGallery] = useState<string[]>([]);

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);

  async function fetchProduct(productId: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      if (data) {
        const cond =
          (typeof data.product_condition === 'string' && data.product_condition) ||
          (typeof data.condition === 'string' && data.condition) ||
          'new';
        setFormData({
          name: (data.name as string) || '',
          brand: (data.brand as string) || 'Tarmac Works',
          price: ((data.price as number) || 0).toString(),
          description: (data.description as string) || '',
          stock: ((data.stock as number) || 0).toString(),
          condition: cond,
        });
        setExistingMainImage((data.image_url as string) || '');
        setExistingGallery((data.gallery_urls as string[]) || []);
      }
    } catch (err: unknown) {
      toast.error(supabaseErrorMessage(err, 'Failed to load product data'));
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    void fetchProduct(id);
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'price') {
      const numericValue = parseVNDInput(value);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImage(e.target.files[0]);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setGalleryImages(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeExistingGalleryImage = (index: number) => {
    setExistingGallery(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mainImageUrl = existingMainImage;
      const galleryUrls: string[] = [...existingGallery];

      if (mainImage) {
        const fileExt = mainImage.name.split('.').pop();
        const fileName = `products/main-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('diecast-images').upload(fileName, mainImage);
        if (uploadError) throw new Error(`Upload main image failed: ${uploadError.message}`);
        mainImageUrl = supabase.storage.from('diecast-images').getPublicUrl(fileName).data.publicUrl;
      }

      if (galleryImages.length > 0) {
        for (const [index, file] of galleryImages.entries()) {
          const fileExt = file.name.split('.').pop();
          const fileName = `products/gallery-${index}-${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('diecast-images').upload(fileName, file);
          if (uploadError) throw new Error(`Upload gallery image failed: ${uploadError.message}`);
          galleryUrls.push(supabase.storage.from('diecast-images').getPublicUrl(fileName).data.publicUrl);
        }
      }

      const { error: dbError } = await supabase
        .from('products')
        .update({
          name: formData.name,
          brand: formData.brand,
          price: parseFloat(formData.price || '0'),
          description: formData.description,
          stock: parseInt(formData.stock || '0', 10),
          product_condition: formData.condition,
          image_url: mainImageUrl,
          gallery_urls: galleryUrls,
        })
        .eq('id', id);

      if (dbError) throw dbError;

      toast.success('Product updated successfully!', { style: { background: '#2ea043', color: '#fff' } });
      router.push('/admin/products');
      router.refresh();

    } catch (error: unknown) {
      console.error(error);
      toast.error(supabaseErrorMessage(error, 'Failed to update product.'), { style: { background: '#e5534b', color: '#fff' } });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-10 text-center text-gray-500 animate-pulse">Loading product data...</div>;
  }

  return (
    <div className="max-w-3xl border border-[#30363d] rounded-xl bg-[#161b22] text-white">
      <div className="p-6 border-b border-[#30363d]">
        <h1 className="text-xl font-bold">Edit Product (ID: {id})</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-300 uppercase tracking-widest font-gaming text-[10px]">Product Name *</label>
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 uppercase tracking-widest font-gaming text-[10px]">Brand</label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
            >
              {['Tarmac Works', 'Inno64', 'MiniGT', 'AutoArt', 'Star Race', 'Ignition Model', 'Time Micro', 'Cool Car'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 uppercase tracking-widest font-gaming text-[10px]">Condition *</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
            >
              <option value="new">NEW (Mới — seal/box)</option>
              <option value="used_like_new">USED: Like New (Như mới)</option>
              <option value="used_lightly_played">USED: Lightly Played (Trầy nhẹ)</option>
              <option value="used_heavily_played">USED: Heavily Played (Trầy nhiều)</option>
              <option value="used_damaged">USED: Damaged (Hỏng)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 uppercase tracking-widest font-gaming text-[10px]">Price (VND) *</label>
            <input
              required
              type="text"
              name="price"
              value={formatVNDInput(formData.price)}
              onChange={handleChange}
              placeholder="e.g., 30,000"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 uppercase tracking-widest font-gaming text-[10px]"> Stock *</label>
            <input
              required
              type="number"
              min="0"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-300">Thumb Image (Leave blank if you want to keep the current one)</label>
            {existingMainImage && !mainImage && (
              <div className="mb-2 w-20 h-20 relative rounded overflow-hidden border border-[#30363d]">
                <Image src={existingMainImage} alt="Current" fill className="object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageChange}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#30363d] file:text-white hover:file:bg-[#3c444d]"
            />
          </div>

          <div className="space-y-4 col-span-2">
            <label className="text-sm font-medium text-gray-300">Gallery Images</label>

            {existingGallery.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mb-4">
                {existingGallery.map((url, idx) => (
                  <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden border border-[#30363d] bg-[#0d1117]">
                    <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingGalleryImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      title="Remove from database"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {galleryImages.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mb-4 border-t border-white/5 pt-4">
                {galleryImages.map((file, idx) => (
                  <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden border border-blue-500/30 bg-[#0d1117]">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="New preview"
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[8px] font-bold text-blue-400 bg-black/60 px-1 py-0.5 rounded uppercase">NEW</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewGalleryImage(idx)}
                      className="absolute top-1 right-1 bg-zinc-700 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative group/upload">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="w-full bg-[#0d1117] border-2 border-dashed border-[#30363d] group-hover/upload:border-[#58a6ff] rounded-xl py-8 flex flex-col items-center justify-center transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-gray-500 group-hover/upload:text-[#58a6ff] mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                <span className="text-sm font-medium text-gray-400 group-hover/upload:text-gray-300">Choose New Gallery Images</span>
                <span className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest">Supports multiple files</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-300"> Description </label>
            <textarea
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#30363d] flex justify-end gap-3">
          <Link href="/admin/products" className="px-5 py-2 rounded-md font-medium text-sm text-gray-300 hover:text-white hover:bg-[#30363d] transition-colors border border-transparent">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-md font-medium text-sm text-white bg-[#2ea043] hover:bg-[#2c974b] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? 'Updating...' : '💾 UPDATE PRODUCT'}
          </button>
        </div>
      </form>
    </div>
  );
}
