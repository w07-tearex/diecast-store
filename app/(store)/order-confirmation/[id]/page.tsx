'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import React from 'react';
import { formatVND } from '@/lib/utils';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    image_url: string;
  }>;
}

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const { id } = React.use(params);
  const orderNumberParam = searchParams.get('orderNumber');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items(*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // REAL-TIME STATUS UPDATES from Supabase
    const channel = supabase
      .channel('order-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        (payload) => {

          setOrder(prev => prev ? { ...prev, ...payload.new } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-20">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-400">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Thank you for your purchase!</h1>
        <p className="text-zinc-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          Your order <span className="text-pink-500 font-mono font-bold bg-pink-500/10 px-2 py-1 rounded">{orderNumberParam}</span> has been received successfully. 
          We are preparing your model cars for shipment.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/" 
            className="w-full sm:w-auto bg-white text-zinc-950 px-10 py-4 rounded-xl font-black hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Continue Shopping
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto border border-zinc-700 text-zinc-400 px-10 py-4 rounded-xl font-bold hover:bg-zinc-900 hover:text-white transition-all active:scale-95"
          >
            Refresh Details
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    pending: 'text-yellow-500',
    processing: 'text-blue-500',
    shipped: 'text-purple-500',
    delivered: 'text-green-500',
    cancelled: 'text-red-500',
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Success Message */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Order Confirmed!</h1>
        <p className="text-zinc-400 text-lg">
          Thank you for your purchase. Your order has been received.
        </p>
      </div>

      <div className="space-y-8">
        {/* Order Number & Status */}
        <div className="border border-zinc-700 rounded p-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-zinc-400 text-sm uppercase tracking-wider mb-2">Order Number</p>
              <p className="text-2xl font-bold text-white">{order.order_number}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm uppercase tracking-wider mb-2">Status</p>
              <p className={`text-2xl font-bold capitalize ${statusColors[order.status as keyof typeof statusColors] || 'text-white'}`}>
                {order.status}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="border border-zinc-700 rounded p-8">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6">
            Delivery Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Name</p>
              <p className="text-white">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-1">Email</p>
              <p className="text-white">{order.customer_email}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-zinc-400 text-sm mb-1">Address</p>
              <p className="text-white">{order.shipping_address}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="border border-zinc-700 rounded p-8">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center pb-4 border-b border-zinc-700 last:border-b-0">
                <div className="flex-1">
                  <p className="text-white font-medium">{item.product_name}</p>
                  <p className="text-zinc-400 text-sm">Quantity: {item.quantity}</p>
                </div>
                <p className="text-white font-bold">{formatVND((item.price * item.quantity))}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border border-zinc-700 rounded p-8">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-lg font-bold text-white pt-4">
              <span>Total:</span>
              <span className="text-red-500">{formatVND(order.total_amount || 0)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="border border-zinc-700 rounded p-8">
          <p className="text-zinc-400 text-sm uppercase tracking-wider mb-2">Payment Method</p>
          <p className="text-white capitalize text-lg">
            {order.payment_method?.replace('_', ' ')}
          </p>
        </div>

        {/* Continue Shopping */}
        <Link
          href="/"
          className="block text-center bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-4 rounded transition duration-300"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
