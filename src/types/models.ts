// All API models — matching the Swagger schemas

export interface Product {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  brandId: number;
  brandName?: string;
  price: number;
  minStock: number;
  active: boolean;
  createdAt: string;
  currentStock: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface PriceHistory {
  id: number;
  productId: number;
  price: number;
  reason?: string;
  createdAt: string;
}

export interface ProductStock {
  productId: number;
  stock: number;
}

export interface SaleInvoice {
  id: number;
  date: string;
  total: number;
  onCredit: boolean;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  items: SaleLineItem[];
}

export interface SaleLineItem {
  id: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseInvoice {
  id: number;
  supplierId: number;
  supplierName?: string;
  date: string;
  total: number;
  paid: number;
  notes?: string;
  createdAt: string;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  id: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
}

export interface StockMovement {
  id: number;
  productId: number;
  productName?: string;
  typeId: number;
  typeName?: string;
  quantity: number;
  referenceId?: number;
  notes?: string;
  createdAt: string;
}

export interface MovementType {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName?: string;
  active: boolean;
  createdAt: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}
