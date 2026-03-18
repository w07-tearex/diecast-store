import type { StructureResolver } from 'sanity/structure'

// Đoạn code này bảo Sanity: "Có schema nào trong index.ts thì tự động lôi hết ra menu cho tôi"
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Quản lý cửa hàng')
    .items(S.documentTypeListItems())