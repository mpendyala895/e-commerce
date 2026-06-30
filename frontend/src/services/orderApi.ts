import api from './api';
import { Order } from '../types';

export const createOrder = async (orderPayload: Record<string, unknown>): Promise<Order> => {
  const response = await api.post<Order>('/api/saga/order', orderPayload);
  return response.data;
};

export const getUserOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/api/orders');
  return response.data;
};
