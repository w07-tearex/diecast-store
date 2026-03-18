import React from 'react'
import { defineType, defineField } from 'sanity'

export const orderType = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    defineField({
      name: 'orderNumber',
      title: 'Order Number',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'customer',
      title: 'Customer',
      type: 'object',
      fields: [
        { name: 'name', type: 'string', title: 'Full Name' },
        { name: 'email', type: 'string', title: 'Email' },
        { name: 'phone', type: 'string', title: 'Phone Number' },
        { name: 'address', type: 'string', title: 'Address' },
        { name: 'city', type: 'string', title: 'City' },
        { name: 'state', type: 'string', title: 'State/Province' },
        { name: 'postalCode', type: 'string', title: 'Postal Code' },
        { name: 'country', type: 'string', title: 'Country' },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Order Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'productId', type: 'string', title: 'Product ID' }),
            defineField({ name: 'productName', type: 'string', title: 'Product Name' }),
            defineField({ name: 'price', type: 'number', title: 'Unit Price' }),
            defineField({ name: 'quantity', type: 'number', title: 'Quantity' }),
            defineField({ name: 'image', type: 'string', title: 'Product Image URL' }),
          ],
          preview: {
            select: {
              title: 'productName',
              quantity: 'quantity',
              price: 'price',
              imageUrl: 'image',
            },
            prepare(selection: any) {
              const { title, quantity, price, imageUrl } = selection
              return {
                title: title || 'Unnamed Product',
                subtitle: `Qty: ${quantity || 1} | Price: $${(Number(price) || 0).toFixed(2)}`,
                // We use React to render an <img> tag for the preview
                media: imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : undefined,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'subtotal',
      title: 'Subtotal',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'tax',
      title: 'Tax',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'shipping',
      title: 'Shipping Cost',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'total',
      title: 'Total Amount',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'status',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Processing', value: 'processing' },
          { title: 'Shipped', value: 'shipped' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'paymentMethod',
      title: 'Payment Method',
      type: 'string',
      options: {
        list: [
          { title: 'Credit Card', value: 'credit_card' },
          { title: 'PayPal', value: 'paypal' },
          { title: 'Bank Transfer', value: 'bank_transfer' },
          { title: 'Crypto', value: 'crypto' },
          { title: 'Cash on Delivery (COD)', value: 'cod' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'notes',
      title: 'Order Notes',
      type: 'text',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      orderNumber: 'orderNumber',
      customerName: 'customer.name',
      total: 'total',
      status: 'status',
      createdAt: 'createdAt'
    },
    prepare(selection: any) {
      const { orderNumber, customerName, total, status, createdAt } = selection
      const date = createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : 'N/A'
      
      // Ensure numeric formatting to 2 decimals
      const formattedTotal = Number(total || 0).toFixed(2)
      
      const statusLabels: Record<string, string> = {
        pending: 'Chờ xác nhận',
        processing: 'Đang chuẩn bị',
        shipped: 'Giao cho đơn vị vận chuyển (Shipped)',
        delivered: 'Đã giao hàng',
        cancelled: 'Đã hủy',
      }

      return {
        title: `${orderNumber} - ${customerName}`,
        subtitle: `$${formattedTotal} [${(statusLabels[status] || status || 'pending').toUpperCase()}] - ${date}`,
      }
    },
  },
})
