'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import toast from 'react-hot-toast';

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

const TAX_RATE = 0.08; // 8% tax
const SHIPPING_COST = 10; // Flat $10 shipping

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
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
  }, [supabase.auth]);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
        <Link href="/" className="text-pink-500 hover:underline">
          Continue shopping
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
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Please enter valid email';
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
        items: items.map((item) => ({
          productId: item._id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || '',
        })),
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state || '',
          postalCode: formData.postalCode || '',
          country: formData.country,
        },
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod: formData.paymentMethod,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      
      toast.success('Order created successfully!');
      clearCart();
      
      // Redirect to order confirmation using PostgreSQL UUID
      router.push(`/order-confirmation/${result.orderId}?orderNumber=${result.orderNumber}`);
    } catch (error) {
      console.error('Order submission error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create order';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-white mb-12">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Order Details */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmitOrder} className="space-y-8">
            {/* Delivery Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                Delivery Information
              </h2>
              <div className="border border-zinc-700 rounded p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-200 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-2 text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-200 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-2 text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-2 text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-2 text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-200 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-2 text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-200 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      placeholder="State/Province"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-2 text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-200 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="Postal Code"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-2 text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-200 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      placeholder="Country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-2 text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 text-sm">2</span>
                Payment Method
              </h2>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl p-2">
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-5 py-4 text-white appearance-none focus:border-pink-500 focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="cod">💵 Cash on Delivery (COD)</option>
                    <option value="credit_card">💳 Credit Card</option>
                    <option value="paypal">🅿️ PayPal</option>
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                    <option value="crypto">₿ Cryptocurrency</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-4 rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border border-zinc-700 rounded p-6 sticky top-24 space-y-6">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Order Summary</h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between text-sm text-zinc-400 pb-4 border-b border-zinc-700">
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-xs">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-zinc-700">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Shipping:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white pt-4 border-t border-zinc-700">
                <span>Total:</span>
                <span className="text-red-500">${total.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/cart"
              className="block text-center text-pink-500 hover:underline text-sm"
            >
              Back to cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
