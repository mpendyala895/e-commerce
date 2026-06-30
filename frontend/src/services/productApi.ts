import api from './api';
import { Product } from '../types';

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('/api/product');
  return response.data;
};

export const getProductsBySkus = async (skuCodes: string[]): Promise<Product[]> => {
  const response = await api.post<Product[]>('/api/product/by-skus', skuCodes);
  return response.data;
};
