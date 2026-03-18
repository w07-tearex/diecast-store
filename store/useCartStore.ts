import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
// 1. Định nghĩa cấu trúc dữ liệu chuẩn hóa
export interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number; // BẮT BUỘC CÓ: Để check tồn kho
}

export interface CartItem extends Product {
    quantity: number; // Số lượng khách chọn mua
}

interface CartState {
    items: CartItem[];

    // Các hành động (Actions)
    addToCart: (product: Product, qty?: number) => void;
    updateQuantity: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;

    // Tính toán (Getters)
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

// 2. Tạo Store với Middleware Persist (Lưu LocalStorage)
export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            // THÊM VÀO GIỎ HÀNG (Có check tồn kho)
            addToCart: (product, qty = 1) => {
                set((state) => {
                    const existingItem = state.items.find((item) => item._id === product._id);
                    const availableStock = product.stock || Infinity; // Nếu Sanity chưa có stock, mặc định là Vô Cực (mua thả ga)

                    if (existingItem) {
                        const newQuantity = existingItem.quantity + qty;
                        if (newQuantity > availableStock) {
                            toast.error(`Only ${availableStock} left in stock!`);
                            return state;
                        }

                        toast.success(`Added ${qty} x ${product.name} to cart!`);
                        return {
                            items: state.items.map((item) =>
                                item._id === product._id ? { ...item, quantity: newQuantity } : item
                            ),
                        };
                    }

                    // Nếu là xe mới hoàn toàn
                    if (qty > availableStock) {
                        toast.error(`Only ${availableStock} left in stock!`);
                        return state;
                    }

                    toast.success(`Added ${qty} x ${product.name} to cart!`);
                    return { items: [...state.items, { ...product, quantity: qty }] };
                });
            },

            // TĂNG/GIẢM SỐ LƯỢNG TRONG GIỎ
            updateQuantity: (id, quantity) => {
                set((state) => {
                    // Nếu số lượng lùi về <= 0 thì xóa luôn khỏi giỏ
                    if (quantity <= 0) {
                        return { items: state.items.filter((item) => item._id !== id) };
                    }

                    return {
                        items: state.items.map((item) => {
                            if (item._id === id) {
                                // Check tồn kho khi bấm nút "+"
                                if (quantity > item.stock) {
                                    alert(`Đã đạt giới hạn tồn kho (${item.stock})`);
                                    return item;
                                }
                                return { ...item, quantity };
                            }
                            return item;
                        }),
                    };
                });
            },

            // XÓA SẢN PHẨM KHỎI GIỎ
            removeFromCart: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item._id !== id),
                }));
            },

            // LÀM SẠCH GIỎ (Dùng sau khi thanh toán thành công)
            clearCart: () => set({ items: [] }),

            // HÀM TÍNH TOÁN
            getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
            getTotalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
        }),
        {
            name: 'diecast-cart-storage', // Tên key lưu trong LocalStorage
        }
    )
);