import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { formatVND } from '@/lib/utils';
import { conditionBadgeLabel } from '@/lib/product-condition';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Products Inventory</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your storefront diecast models.</p>
          </div>
          <Link
            href="/admin/products/new"
            className="bg-[#2ea043] hover:bg-[#2c974b] text-white px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            + Add New Product
          </Link>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#1f242b] border-b border-[#30363d]">
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Brand</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Condition</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]">
              {!products || products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-3">📦</div>
                    <p>No products found in Supabase.</p>
                    <p className="text-sm mt-1">Click &apos;Add New Product&apos; to start building your inventory.</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#1f242b]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-[#0d1117] border border-[#30363d] overflow-hidden flex-shrink-0 relative">
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">No Img</div>
                          )}
                        </div>
                        <div className="font-medium text-gray-200 line-clamp-2">{product.name}</div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400">{product.brand}</td>
                    <td className="p-4 text-gray-300 text-xs font-mono whitespace-nowrap">
                      {conditionBadgeLabel(product.product_condition ?? product.condition)}
                    </td>
                    <td className="p-4 font-mono text-[#79c0ff] whitespace-nowrap">{formatVND(product.price)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${product.stock > 0 ? 'bg-[#2ea043]/10 text-[#3fb950] border-[#2ea043]/20' : 'bg-[#e5534b]/10 text-[#ff7b72] border-[#e5534b]/20'}`}
                      >
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-3">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-[#58a6ff] hover:underline text-sm font-medium">Edit</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
  );
}
