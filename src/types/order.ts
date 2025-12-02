export interface OrderItem {
  id?: string | number;
  orderId?: string | number;
  productId?: string | number;
  productName?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string | number;
  code: string;
  userId?: string | number;
  status: string;
  totalAmount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  notes?: string;
  accountName?: string;
  accountEmail?: string;
  items?: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}
