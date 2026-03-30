import { redirect } from 'next/navigation';

export default function AdminHomePage() {
  // Tự động chuyển hướng vào Trang Quản lý Sản Phẩm khi vừa mở /admin
  redirect('/admin/products');
}
