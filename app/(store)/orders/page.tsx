'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatVND } from '@/lib/utils';
import toast from 'react-hot-toast';

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  image_url: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/api/auth/google');
        return;
      }
      setUser(user);
      fetchOrders(user.id);
    };

    const fetchOrders = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items(*)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, supabase]);

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    setIsCancelling(true);
    try {
      const response = await fetch(`/api/orders/${orderToCancel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Cancellation failed');

      setOrders(prev => prev.map(o => o.id === orderToCancel.id ? { ...o, status: 'cancelled' } : o));
      toast.success('Order Successfully Cancelled', { 
        icon: '🛑', 
        style: { background: '#18181b', color: '#fff', border: '1px solid #ef4444' } 
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsCancelling(false);
      setOrderToCancel(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'shipped': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#FF42B0] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Loading internal logs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 relative">
      <div className="flex flex-col items-start mb-12 space-y-2">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic font-tech">Transaction History</h1>
        <p className="text-zinc-500 text-sm font-medium">Manage and track your primary diecast acquisition logs.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-zinc-950/50 border border-white/5 rounded-3xl p-20 text-center backdrop-blur-xl">
          <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-500">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Logs Empty</h3>
          <p className="text-zinc-500 mb-8 max-w-xs mx-auto">No orders detected in your secure channel profile.</p>
          <Link href="/" className="bg-[#FF42B0] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(255,66,176,0.5)] transition-all font-gaming">
            Enter Field Store
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-zinc-950/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-[1px] hover:border-white/10 transition-all shadow-2xl group">
              <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest opacity-50 font-gaming">Order ID</p>
                  <p className="text-white font-bold font-tech uppercase">{order.order_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest opacity-50 font-gaming">Timestamp</p>
                  <p className="text-white font-medium text-xs font-gaming lowercase">
                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest opacity-50 font-gaming">Status</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)} font-tech`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest opacity-50 font-gaming">Asset Total</p>
                  <p className="text-[#FF42B0] font-black text-xl italic font-tech whitespace-nowrap">{formatVND(order.total_amount)}</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 group/item">
                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0 group-hover/item:border-pink-500/30 transition-all relative">
                      <Image 
                        src={item.image_url || 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=200'} 
                        alt={item.product_name} 
                        fill
                        sizes="64px"
                        className="object-cover group-hover/item:scale-110 transition-transform duration-700" 
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white group-hover/item:text-pink-500 transition-colors uppercase leading-none font-tech">{item.product_name}</p>
                      <p className="text-[10px] text-zinc-500 mt-2 font-black uppercase tracking-widest whitespace-nowrap font-gaming opacity-60">QTY: {item.quantity} × {formatVND(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 p-4 flex justify-between items-center">
                <div className="flex gap-4">
                  {order.status.toLowerCase() === 'pending' && (
                    <button 
                      onClick={() => setOrderToCancel(order)}
                      className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-2 transition font-gaming"
                    >
                      [ Abort Order ]
                    </button>
                  )}
                </div>
                <Link 
                  href={`/order-confirmation/${order.id}?orderNumber=${order.order_number}`}
                  className="text-[10px] font-black text-white hover:text-pink-500 uppercase tracking-widest flex items-center gap-2 transition font-gaming"
                >
                  View Intel
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/5 backdrop-blur-[1px] px-4">
          <div className="bg-[#0d1117] border-2 border-red-500/30 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.2)] p-8 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
             <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m14.5 9-5 5"></path><path d="m9.5 9 5 5"></path></svg>
             </div>
             <h3 className="text-2xl font-black text-white mb-2 italic tracking-tighter uppercase font-tech text-center">Abort Sequence?</h3>
             <p className="text-sm text-zinc-500 mb-8 text-center leading-relaxed font-gaming">
               This will permanently cancel your order for <span className="text-white font-bold">{orderToCancel.order_number}</span>. This action cannot be undone.
             </p>
             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="px-4 py-3.5 rounded-2xl font-black text-[10px] text-white bg-red-600 hover:bg-red-500 shadow-[0_10px_20px_-5px_rgba(220,38,38,0.3)] transition-all uppercase tracking-widest font-gaming btn-glossy flex items-center justify-center gap-2"
                >
                  {isCancelling ? 'WAITING...' : 'YES'}
                </button>
                <button 
                  onClick={() => setOrderToCancel(null)}
                  disabled={isCancelling}
                  className="px-4 py-3.5 rounded-2xl font-black text-[10px] text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all uppercase tracking-widest font-gaming btn-glossy"
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
