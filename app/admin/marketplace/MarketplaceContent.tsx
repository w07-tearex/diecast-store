'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { formatVND } from '@/lib/utils';

type MarketItemRow = {
  id: string
  title?: string
  price?: number
  status?: string
  condition?: string
  seller_name?: string
  seller_phone?: string
  image_urls?: string[]
}

export default function MarketplaceContent() {
  const [items, setItems] = useState<MarketItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('market_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch {
      toast.error('Gặp lỗi khi tải dữ liệu Ký Gửi.');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('market_items')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      toast.success('Đã cập nhật trạng thái!', { style: { background: '#2ea043', color: '#fff' }});
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update status'
      toast.error(message);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const { error } = await supabase.from('market_items').delete().eq('id', itemToDelete);
      if (error) throw error;
      
      setItems(prev => prev.filter(item => item.id !== itemToDelete));
      toast.success('Đã xóa thành công.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      toast.error(message);
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">🏷️ P2P Marketplace Moderation</h1>
          <p className="text-sm text-gray-400 mt-1">Review and moderate user-submitted marketplace listings.</p>
        </div>
        <button 
          onClick={() => fetchItems()} 
          className="px-4 py-2 border border-[#30363d] rounded-md text-sm font-medium text-gray-300 hover:bg-[#30363d] hover:text-white transition-colors uppercase tracking-widest font-gaming"
        >
          REFRESH DATA
        </button>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-xl overflow-x-auto overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#1f242b] border-b border-[#30363d]">
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider font-gaming">Product Intel</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider font-gaming">Seller Profile</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider font-gaming">Condition</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider font-gaming text-center">Mod Status</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right font-gaming">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363d]">
            {loading ? (
               <tr><td colSpan={5} className="p-8 text-center text-gray-500 animate-pulse font-gaming text-[10px] uppercase tracking-widest">Awaiting Uplink...</td></tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  <p className="font-gaming text-[10px] uppercase tracking-widest">No listings detected.</p>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-[#1f242b]/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#0d1117] border border-[#30363d] overflow-hidden flex-shrink-0 relative">
                        {item.image_urls && item.image_urls.length > 0 ? (
                          <Image
                            src={item.image_urls[0]}
                            alt={item.title || 'Listing'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-600 font-gaming">MISSING</div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-200 line-clamp-1 font-tech uppercase">{item.title}</div>
                        <div className="text-sm font-black text-[#FF42B0] font-tech italic">{formatVND(item.price)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="text-gray-300 font-bold font-tech uppercase text-xs">{item.seller_name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{item.seller_phone}</div>
                  </td>
                  <td className="p-4 text-gray-400 capitalize whitespace-nowrap text-xs font-gaming lowercase">{item.condition}</td>
                  <td className="p-4 text-center">
                    <select
                      className={`text-[9px] font-black rounded px-2.5 py-1.5 focus:outline-none uppercase tracking-widest appearance-none cursor-pointer border whitespace-nowrap font-gaming ${
                        item.status === 'pending' ? 'bg-[#d29922]/20 text-[#d29922] border-[#d29922]/30' :
                        item.status === 'approved' ? 'bg-[#2ea043]/20 text-[#3fb950] border-[#2ea043]/30' :
                        'bg-[#e5534b]/20 text-[#ff7b72] border-[#e5534b]/30'
                      }`}
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                    >
                      <option value="pending" className="bg-[#161b22] text-[#d29922]">PENDING</option>
                      <option value="approved" className="bg-[#161b22] text-[#3fb950]">APPROVED</option>
                      <option value="sold" className="bg-[#161b22] text-[#ff7b72]">SOLD</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setItemToDelete(item.id)}
                      className="p-2 text-gray-500 hover:text-[#ff7b72] hover:bg-[#e5534b]/10 rounded transition-colors"
                      title="Wipe Listing"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-[1px] px-4">
          <div className="bg-[#161b22] border-2 border-red-500/20 rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 italic tracking-tighter uppercase font-tech">Wipe Asset?</h3>
            <p className="text-sm text-gray-500 mb-8 font-gaming lowercase">
              this marketplace listing will be permanently purged from all secure channels
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={confirmDelete}
                className="px-6 py-3.5 rounded-2xl font-black text-[10px] text-white bg-red-600 hover:bg-red-500 shadow-[0_10px_20px_-5px_rgba(220,38,38,0.3)] transition-all uppercase tracking-widest font-gaming btn-glossy"
              >
                YES
              </button>
              <button 
                onClick={() => setItemToDelete(null)}
                className="px-6 py-3.5 rounded-2xl font-black text-[10px] text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all uppercase tracking-widest font-gaming btn-glossy"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
