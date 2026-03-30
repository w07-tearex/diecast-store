'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/useCartStore';
import { createClient } from '@/lib/supabase/client';
import { TAX_RATE, SHIPPING_COST } from '@/lib/constants';
import { formatVND } from '@/lib/utils';

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer' | 'crypto' | 'cod';
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  paymentMethod: 'cod',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.user_metadata.full_name || prev.name,
          email: user.email || prev.email,
        }));
      }
    };
    fetchUser();
  }, []);

  if (!isMounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-32 text-center bg-zinc-950/50 border border-white/5 rounded-3xl backdrop-blur-xl">
        <h1 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Your cart is empty</h1>
        <p className="text-zinc-500 mb-10">You don't have any items in your cart yet. Let's go shopping!</p>
        <Link 
          href="/" 
          className="inline-block bg-[#FF42B0] hover:bg-[#E52292] text-white px-10 py-5 rounded-xl font-black uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_-15px_rgba(255,66,176,0.4)] btn-glossy font-gaming text-xs"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const shipping = SHIPPING_COST;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) return 'Email is invalid';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.city.trim()) return 'City is required';
    if (!formData.country.trim()) return 'Country is required';
    return null;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsProcessing(true);

    try {

      
      const orderData = {
        items: items.map((item) => {
          const pid = item.id || (item as any)._id;
          if (!pid) console.warn('Warning: Item missing ID at checkout:', item.name);
          return {
            productId: pid,
            productName: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          };
        }),
        customer: { ...formData },
        paymentMethod: formData.paymentMethod,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      
      if (!response.ok) {
          throw new Error(result.error || 'Failed to create order');
      }
      
      toast.success('Order placed successfully!');
      clearCart();
      
      router.push(`/order-confirmation/${result.orderId}?orderNumber=${result.orderNumber}`);
    } catch (error) {
      console.error('Order Error:', error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred while ordering');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex flex-col items-center mb-16 space-y-4">
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Checkout</h1>
          <div className="h-1.5 w-24 bg-gradient-to-r from-[#FF42B0] to-[#FF42B0] rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmitOrder} className="space-y-12">
            <section className="space-y-6">
              <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">01. Shipping Information</h2>
              <div className="bg-zinc-950/30 border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-[#FF42B0] focus:outline-none transition-all placeholder:text-zinc-700 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="example@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-[#FF42B0] focus:outline-none transition-all placeholder:text-zinc-700 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+1 (xxx) xxx-xxxx"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-[#FF42B0] focus:outline-none transition-all placeholder:text-zinc-700 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Detailed Address *</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="123 Street Name, Area..."
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-[#FF42B0] focus:outline-none transition-all placeholder:text-zinc-700 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="New York"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-[#FF42B0] focus:outline-none text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="10001"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-[#FF42B0] focus:outline-none text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Country *</label>
                    <input
                      type="text"
                      name="country"
                      placeholder="United States"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-[#FF42B0] focus:outline-none text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">02. Payment Method</h2>
              <div className="bg-zinc-950/30 border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="currentColor" viewBox="0 0 256 256"><path d="M224,48H32a16,16,0,0,0-16,16V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM32,64H224V88H32Zm192,128H32V120H224v72Zm-48-32a12,12,0,1,1,12,12A12,12,0,0,1,176,160Zm-40,0a12,12,0,1,1,12,12A12,12,0,0,1,136,160Z"></path></svg>
                </div>
                <div className="relative">
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white appearance-none focus:border-[#FF42B0] focus:outline-none cursor-pointer transition-all font-bold tracking-wide"
                  >
                    <option value="cod" className="bg-zinc-900">💵 Cash on Delivery (COD)</option>
                    <option value="credit_card" className="bg-zinc-900">💳 Credit / Debit Card</option>
                    <option value="paypal" className="bg-zinc-900">🅿️ PayPal Wallet</option>
                    <option value="bank_transfer" className="bg-zinc-900">🏦 Direct Bank Transfer</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#FF42B0]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isProcessing}
              className="group relative w-full py-7 rounded-2xl bg-gradient-to-r from-[#FF42B0] to-[#FF42B0] text-white font-black uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 shadow-[0_20px_50px_-15px_rgba(255,66,176,0.4)] btn-glossy font-gaming text-xs"
            >
              <span className="relative z-10">{isProcessing ? 'SYSTEM PROCESSING...' : 'FINALIZE COLLECTION'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            </button>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-zinc-950/50 border border-white/10 rounded-[2.5rem] p-8 sticky top-28 space-y-8 shadow-2xl backdrop-blur-3xl overflow-hidden group">
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="text-[#FF42B0]"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Inventory Summary
            </h2>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 group/item">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0 group-hover/item:border-[#FF42B0]/30 transition-all duration-500 relative">
                    <Image 
                      src={item.image || 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=200'} 
                      alt={item.name} 
                      fill
                      sizes="80px"
                      className="object-cover group-hover/item:scale-110 transition-transform duration-700" 
                    />
                  </div>
                  <div className="flex-1 space-y-1 py-1">
                    <p className="text-white text-sm font-black truncate group-hover/item:text-[#FF42B0] transition-colors uppercase leading-none font-tech italic">{item.name}</p>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2">LVL {item.quantity}</p>
                    <p className="text-white font-black mt-2 leading-none font-mono">{formatVND((item.price * item.quantity))}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center text-zinc-500">
                <span className="text-[10px] font-black uppercase tracking-widest">Base Value:</span>
                <span className="text-white font-bold font-mono text-sm">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span className="text-[10px] font-black uppercase tracking-widest">Global Tax ({Math.round(TAX_RATE * 100)}%):</span>
                <span className="text-white font-bold font-mono text-sm">{formatVND(tax)}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span className="text-[10px] font-black uppercase tracking-widest">Logistics:</span>
                <span className="text-white font-bold font-mono text-sm">{formatVND(shipping)}</span>
              </div>
              <div className="flex justify-between pt-8 border-t border-white/10 mt-4 h-16 items-center">
                <span className="text-xl font-black text-white uppercase tracking-tighter italic">Total Due:</span>
                <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-[#FF42B0] italic drop-shadow-[0_0_15px_rgba(255,66,176,0.5)] font-tech whitespace-nowrap">{formatVND(total)}</span>
                    <p className="text-[10px] text-zinc-600 font-black mt-1 uppercase tracking-[0.2em] leading-none">Transaction Locked</p>
                </div>
              </div>
            </div>

            <Link href="/cart" className="block text-center text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-colors py-4 border-t border-white/5 mt-4">
              Return to Hangar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
