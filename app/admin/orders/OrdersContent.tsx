'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { formatVND } from '@/lib/utils';

type OrderItemRow = {
  product_name: string
  quantity: number
  price: number
  image_url: string
}

type OrderRow = {
  id: string
  order_number: string
  total_amount: number
  status: string
  created_at: string
  customer_name: string
  shipping_address: string
  items?: OrderItemRow[]
}

export default function OrdersContent() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [orderToUpdateStatus, setOrderToUpdateStatus] = useState<{ id: string, current: string, next: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, items:order_items(*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch {
      toast.error('Supabase Cloud connection failed.', { style: { background: '#e5534b', color: '#fff' } });
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async () => {
    if (!orderToUpdateStatus) return;
    const { id, next } = orderToUpdateStatus;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to sync status');

      if (result.inventorySynced) {
        toast.success(`Inventory Synchronized: ${next === 'cancelled' ? 'Restocked' : 'Recalculated'}`, { icon: '🔄' });
      }

      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next } : o));
      toast.success(`Matrix Status: ${next.toUpperCase()}`, { style: { background: '#2ea043', color: '#fff' } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sync status'
      toast.error(message);
    } finally {
      setIsUpdating(false);
      setOrderToUpdateStatus(null);
    }
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderToDelete);
      if (error) throw error;

      setOrders(prev => prev.filter(o => o.id !== orderToDelete));
      toast.success('DELETED PERMANENTLY');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      toast.error(message);
    } finally {
      setOrderToDelete(null);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-[#d29922]/20 text-[#d29922] border-[#d29922]/30';
      case 'processing': return 'bg-[#58a6ff]/20 text-[#58a6ff] border-[#58a6ff]/30';
      case 'shipped': return 'bg-[#8b949e]/20 text-[#8b949e] border-[#8b949e]/30';
      case 'delivered': return 'bg-[#2ea043]/20 text-[#3fb950] border-[#2ea043]/30';
      case 'cancelled': return 'bg-[#e5534b]/20 text-[#ff7b72] border-[#e5534b]/30';
      default: return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-gray-400 font-bold tracking-widest text-sm animate-pulse">SECURE CHANNEL ACTIVE...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">📦 Orders (Live Inventory)</h1>
          <p className="text-sm text-gray-400 mt-1">Manage processing and automated restock logic</p>
        </div>
        <button
          onClick={() => fetchOrders()}
          className="px-4 py-2 border border-[#30363d] rounded-md text-sm font-medium text-gray-300 hover:bg-[#30363d] hover:text-white transition-colors"
        >
          FORCE REFRESH
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#161b22] border border-dashed border-[#30363d] rounded-xl p-12 text-center">
          <p className="text-gray-500 font-medium">No orders found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col">

              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#FF42B0]">{order.order_number}</h3>
                <span className={`px-2.5 py-1 border rounded-full text-xs font-bold uppercase tracking-wider ${statusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Customer */}
              <div className="border-b border-[#30363d] pb-3 mb-4">
                <p className="text-sm text-gray-400">
                  Collector: <span className="text-white font-bold">{order.customer_name}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{order.shipping_address}</p>
              </div>

              {/* Items */}
              <div className="flex-1 space-y-2 mb-6 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex gap-3 text-sm items-start">
                    <span className="font-bold text-[#FF42B0] shrink-0">{item.quantity}×</span>
                    <span className="text-gray-300 line-clamp-2 text-xs">{item.product_name}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-[#30363d] flex justify-between items-end">
                <div className="text-xl font-bold text-white tracking-tight">
                  {formatVND(order.total_amount)}
                </div>

                <div className="flex gap-2 items-center">
                  <select
                    className="bg-[#0d1117] border border-[#30363d] text-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-[#58a6ff] cursor-pointer"
                    value={order.status}
                    onChange={(e) => setOrderToUpdateStatus({ id: order.id, current: order.status, next: e.target.value })}
                    disabled={isUpdating}
                  >
                    <option value="pending">PENDING</option>
                    <option value="processing">PROCESSING</option>
                    <option value="shipped">SHIPPED</option>
                    <option value="delivered">DELIVERED</option>
                    <option value="cancelled">CANCELLED</option>
                  </select>

                  <button
                    onClick={() => setOrderToDelete(order.id)}
                    className="p-1.5 text-gray-500 hover:text-[#ff7b72] hover:bg-[#e5534b]/10 rounded transition-colors"
                    title="Delete Order"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Status Confirmation Modal */}
      {orderToUpdateStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-[1px] px-4">
          <div className="bg-[#161b22] border-2 border-[#FF42B0]/20 rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-[#FF42B0]/10 rounded-full flex items-center justify-center text-[#FF42B0] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m12 8 4 4-4 4"></path><path d="M8 12h8"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase font-tech">Sync Status?</h3>
              <p className="text-sm text-gray-500 mt-2 font-gaming lowercase">
                transitioning <span className="text-white font-bold">{orderToUpdateStatus.current}</span> to <span className="text-[#FF42B0] font-bold">{orderToUpdateStatus.next}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={updateStatus}
                disabled={isUpdating}
                className="px-6 py-3.5 rounded-2xl font-black text-[10px] text-white bg-[#FF42B0] hover:bg-[#E52292] shadow-[0_10px_20px_-5px_rgba(255,66,176,0.3)] transition-all uppercase tracking-widest font-gaming btn-glossy flex items-center justify-center gap-2"
              >
                {isUpdating ? 'WAITING...' : 'YES'}
              </button>
              <button
                onClick={() => setOrderToUpdateStatus(null)}
                className="px-6 py-3.5 rounded-2xl font-black text-[10px] text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all uppercase tracking-widest font-gaming btn-glossy"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-[1px] px-4">
          <div className="bg-[#161b22] border-2 border-red-500/20 rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase font-tech">Wipe Order?</h3>
              <p className="text-sm text-gray-500 mt-2 font-gaming lowercase">
                this action is permanent and cannot be reversed
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={confirmDelete}
                className="px-6 py-3.5 rounded-2xl font-black text-[10px] text-white bg-red-600 hover:bg-red-500 shadow-[0_10px_20px_-5px_rgba(220,38,38,0.3)] transition-all uppercase tracking-widest font-gaming btn-glossy"
              >
                YES
              </button>
              <button
                onClick={() => setOrderToDelete(null)}
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
