'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { formatVNDInput, parseVNDInput } from '@/lib/utils';

export default function NewProductContent() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    brand: 'Tarmac Works',
    price: '',
    description: '',
    stock: '0',
    condition: 'new',
  });
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);

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
      setGalleryImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mainImageUrl = '';
      const galleryUrls: string[] = [];

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

      const { error: dbError } = await supabase.from('products').insert({
        name: formData.name,
        brand: formData.brand,
        price: parseFloat(formData.price || '0'),
        description: formData.description,
        stock: parseInt(formData.stock || '0', 10),
        product_condition: formData.condition,
        image_url: mainImageUrl,
        gallery_urls: galleryUrls,
      });

      if (dbError) throw dbError;

      toast.success('Product saved successfully!', { style: { background: '#2ea043', color: '#fff' } });
      router.push('/admin/products');
      router.refresh();

    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Failed to save product.'
      toast.error(message, { style: { background: '#e5534b', color: '#fff' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl border border-[#30363d] rounded-xl bg-[#161b22] text-white">
      <div className="p-6 border-b border-[#30363d]">
        <h1 className="text-xl font-bold">Thêm Sản Phẩm Mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-300 uppercase tracking-widest font-gaming text-[10px]">Tên sản phẩm *</label>
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Tarmac Works Porsche 911"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 uppercase tracking-widest font-gaming text-[10px]">Hãng sản xuất</label>
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
            <label className="text-sm font-medium text-gray-300 uppercase tracking-widest font-gaming text-[10px]">Tình trạng (Condition) *</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#58a6ff]"
            >
              <option value="new">NEW (Mới - Box/Seal)</option>
              <option value="used_like_new">USED: Like New (Như mới)</option>
              <option value="used_lightly_played">USED: Lightly Played (Trầy nhẹ)</option>
              <option value="used_heavily_played">USED: Heavily Played (Trầy nhiều)</option>
              <option value="used_damaged">USED: Damaged (Hỏng)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 uppercase tracking-widest font-gaming text-[10px]">Giá (VND) *</label>
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
            <label className="text-sm font-medium text-gray-300 uppercase tracking-widest font-gaming text-[10px]">Tồn kho (Stock) *</label>
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
            <label className="text-sm font-medium text-gray-300">Ảnh đại diện (Main Image)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageChange}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#30363d] file:text-white hover:file:bg-[#3c444d]"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-300">Thư viện ảnh (Gallery) - Chọn nhiều ảnh cùng lúc</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#30363d] file:text-white hover:file:bg-[#3c444d]"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-300">Mô tả chi tiết</label>
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
            Hủy Bỏ
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-md font-medium text-sm text-white bg-[#2ea043] hover:bg-[#2c974b] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? 'Đang lưu & Upload ảnh...' : '💾 LƯU SẢN PHẨM'}
          </button>
        </div>
      </form>
    </div>
  );
}
