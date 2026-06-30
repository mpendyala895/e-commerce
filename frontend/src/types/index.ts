export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  enabled?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  skuCode?: string;
  quantity?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface OrderLineItem {
  skuCode: string;
  price: number;
  quantity: number;
  // Enriched fields:
  productName?: string;
  imageUrl?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  orderLineItemsList: OrderLineItem[];
  orderStatus: string;
  userId: number;
  totalPrice: number;
  createdAt: string;
}

export interface InventoryItem {
  id?: number;
  skuCode: string;
  quantity: number;
  inStock?: boolean;
}

export interface NotificationEvent {
  orderNumber: string;
  message: string;
  status: string;
}
