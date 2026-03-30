import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    stock: number;
}

interface CartState {
    items: CartItem[];
    addToCart: (product: any, qty?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
}

// Helper: Stable storage for SSR
const customStorage = {
    getItem: (name: string) => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(name);
    },
    setItem: (name: string, value: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(name, value);
        }
    },
    removeItem: (name: string) => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(name);
        }
    },
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            
            addToCart: (product, qty = 1) => set((state) => {
                const productId = product.id || product._id;
                if (!productId) {
                    console.error('CRITICAL: Attempted to add product without ID!', product);
                    return { items: state.items };
                }

                const existingItem = state.items.find((item) => item.id === productId);
                if (existingItem) {
                    return {
                        items: state.items.map((item) =>
                            item.id === productId
                                ? { ...item, quantity: Math.min(item.quantity + qty, product.stock || 99) }
                                : item
                        ),
                    };
                }
                
                // New item
                const imagePath = product.image_url || product.image;
                const newItem: CartItem = {
                    id: productId,
                    name: product.name,
                    price: product.price,
                    image: (typeof imagePath === 'string' && imagePath.length > 0) ? imagePath : '',
                    quantity: qty,
                    stock: product.stock || 0
                };
                console.log('Item added to cart store:', newItem.id);
                return { items: [...state.items, newItem] };
            }),

            removeFromCart: (productId) => set((state) => ({
                items: state.items.filter((item) => item.id !== productId),
            })),

            updateQuantity: (productId, quantity) => set((state) => ({
                items: state.items.map((item) => {
                    if (item.id === productId) {
                        const validatedQty = Math.max(1, Math.min(quantity, item.stock));
                        return { ...item, quantity: validatedQty };
                    }
                    return item;
                }),
            })),

            clearCart: () => set({ items: [] }),

            getTotalPrice: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            getTotalItems: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.quantity, 0);
            },
        }),
        {
            name: 'diecast-cart-storage',
            storage: createJSONStorage(() => customStorage),
            // Important: This handles the initial hydration from storage correctly
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // MIGRATION: Ensure all items have 'id' if they only have legacy '_id'
                    state.items = state.items.map((item: any) => ({
                        ...item,
                        id: item.id || item._id
                    }));
                }
                console.log('Cart rehydrated & migrated');
            },
        }
    )
);