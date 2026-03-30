// APP CONSTANTS
export const TAX_RATE = 0.08; // 8% tax (Current VN standard for many goods)
export const SHIPPING_COST = 30000; // Flat 30,000 VND shipping

export const CURRENCY = {
    SYMBOL: '₫',
    NAME: 'VND',
    LOCALE: 'vi-VN'
};

export const ORDER_STATUSES = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
} as const;

export const PAYMENT_METHODS = {
    COD: 'cod',
    CREDIT_CARD: 'credit_card',
    PAYPAL: 'paypal',
    BANK_TRANSFER: 'bank_transfer',
    CRYPTO: 'crypto',
} as const;

export const FOOTER_CONFIG = {
    ABOUT: "Với hơn 10 năm kinh nghiệm trong việc sưu tầm và cập nhật mô hình các hãng xe, Diecast Store nắm bắt được nhu cầu và tinh ý của dân sưu tập xe. Luôn mang đến những mẫu xe Hot nhất, trending nhất để phục vụ thượng khách.",
    CONTACT: {
        ADDRESS: "21 Phùng Khắc Khoan, Quận 1, TP.HCM",
        EMAIL: "Tstorerex@gmail.com",
        PHONE: "Zalo: 084601XXXX"
    },
    SOCIALS: {
        FACEBOOK: "https://facebook.com/mohinhvn",
        YOUTUBE: "https://youtube.com/@mohinhvn",
        INSTAGRAM: "https://instagram.com/mohinhvn",
        GMAIL: "mailto:Tstorerex@gmail.com",
        ZALO: "https://zalo.me/0846017797"
    }
};
