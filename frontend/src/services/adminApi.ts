import api from './api';
import { User, Product, Order, InventoryItem, NotificationEvent } from '../types';


export const adminGetUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/api/users/admin/all');
  return response.data;
};

export const adminUpdateUserStatus = async (id: string, enabled: boolean): Promise<void> => {
  await api.put(`/api/users/admin/${id}/status?enabled=${enabled}`);
};

export const adminUpdateUserRole = async (id: string, role: string): Promise<void> => {
  await api.put(`/api/users/admin/${id}/role?role=${role}`);
};

export const adminUpdateUser = async (id: string, userData: User & Record<string, string>): Promise<User> => {
  const response = await api.put<User>(`/api/users/admin/${id}`, userData);
  return response.data;
};

export const adminDeleteUser = async (id: string): Promise<void> => {
  await api.delete(`/api/users/admin/${id}`);
};



export const adminAddProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  const response = await api.post<Product>('/api/product', productData);
  return response.data;
};

export const adminUpdateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  const response = await api.put<Product>(`/api/product/${id}`, productData);
  return response.data;
};

export const adminDeleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/api/product/${id}`);
};



export const adminGetOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/api/orders/admin/all');
  return response.data;
};

export const adminUpdateOrderStatus = async (orderNumber: string, status: string): Promise<void> => {
  await api.put(`/api/orders/admin/status/${orderNumber}?status=${status}`);
};

export const adminDeleteOrder = async (orderNumber: string): Promise<void> => {
  await api.delete(`/api/orders/admin/${orderNumber}`);
};



export const adminGetInventory = async (): Promise<InventoryItem[]> => {
  const response = await api.get<InventoryItem[]>('/api/inventory/admin/all');
  return response.data;
};

export const adminUpdateStock = async (skuCode: string, quantity: number): Promise<void> => {
  await api.put(`/api/inventory/admin/update?skuCode=${skuCode}&quantity=${quantity}`);
};

export const adminRestock = async (skuCode: string, quantity: number): Promise<void> => {
  await api.post(`/api/inventory/admin/restock?skuCode=${skuCode}&quantity=${quantity}`);
};

export const adminDeleteInventory = async (skuCode: string): Promise<void> => {
  await api.delete(`/api/inventory/admin/${skuCode}`);
};



export const adminGetNotifications = async (): Promise<NotificationEvent[]> => {
  const response = await api.get<NotificationEvent[]>('/api/notifications/all');
  return response.data;
};
