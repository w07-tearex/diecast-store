import { defineField, defineType } from 'sanity'

export const product = defineType({
    name: 'product',
    title: 'Xe Mô Hình (Product)',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Tên xe',
            type: 'string',
        }),
        defineField({
            name: 'brand',
            title: 'Hãng sản xuất',
            type: 'string',
            options: {
                list: ['Tarmac Works', 'Inno64', 'MiniGT', 'AutoArt', 'Ignition Model'],
            }
        }),
        defineField({
            name: 'price',
            title: 'Giá tiền ($)',
            type: 'number',
        }),
        defineField({
            name: 'image',
            title: 'Ảnh đại diện (Hiển thị ngoài trang chủ)',
            type: 'image',
            options: {
                hotspot: true,
            }
        }),
        // ==========================================
        // NHỮNG TRƯỜNG MỚI THÊM CHO TRANG CHI TIẾT
        // ==========================================
        defineField({
            name: 'gallery',
            title: 'Thư viện ảnh (Hiển thị trong trang chi tiết)',
            type: 'array',
            of: [{ type: 'image', options: { hotspot: true } }], // Cho phép up NHIỀU ảnh
        }),
        defineField({
            name: 'description',
            title: 'Mô tả chi tiết',
            type: 'text', // Dùng 'text' thay vì 'string' để gõ được nhiều dòng (Enter xuống dòng thoải mái)
            rows: 6, // Hiển thị sẵn 6 dòng cho dễ gõ
        }),
        defineField({
            name: 'stock',
            title: 'Tồn kho (Stock)',
            type: 'number',
            description: 'Số lượng xe hiện có trong kho. Nếu hết hàng thì để 0.',
            initialValue: 0,
            validation: (Rule) => Rule.min(0).error('Tồn kho không được nhỏ hơn 0!'),
        }),
    ],
})