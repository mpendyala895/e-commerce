import { describe, it, expect, beforeEach } from 'vitest';
import cartReducer, {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} from './cartSlice';
import { Product } from '../types';

const mockProduct: Product = {
  id: 'p1',
  name: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  imageUrl: 'test.jpg',
  category: 'Electronics',
};

describe('cartSlice reducer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return the initial state', () => {
    const state = cartReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({ items: [] });
  });

  it('should handle addToCart for a new product', () => {
    const state = cartReducer(undefined, addToCart(mockProduct));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual({ product: mockProduct, quantity: 1 });
    expect(JSON.parse(localStorage.getItem('cart') || '[]')).toEqual([
      { product: mockProduct, quantity: 1 },
    ]);
  });

  it('should handle addToCart for an existing product', () => {
    const initialState = {
      items: [{ product: mockProduct, quantity: 1 }],
    };
    const state = cartReducer(initialState, addToCart(mockProduct));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('should handle removeFromCart', () => {
    const initialState = {
      items: [{ product: mockProduct, quantity: 2 }],
    };
    const state = cartReducer(initialState, removeFromCart('p1'));
    expect(state.items).toHaveLength(0);
    expect(localStorage.getItem('cart')).toBe('[]');
  });

  it('should handle increaseQuantity', () => {
    const initialState = {
      items: [{ product: mockProduct, quantity: 2 }],
    };
    const state = cartReducer(initialState, increaseQuantity('p1'));
    expect(state.items[0].quantity).toBe(3);
  });

  it('should handle decreaseQuantity when quantity > 1', () => {
    const initialState = {
      items: [{ product: mockProduct, quantity: 2 }],
    };
    const state = cartReducer(initialState, decreaseQuantity('p1'));
    expect(state.items[0].quantity).toBe(1);
  });

  it('should handle decreaseQuantity when quantity is 1', () => {
    const initialState = {
      items: [{ product: mockProduct, quantity: 1 }],
    };
    const state = cartReducer(initialState, decreaseQuantity('p1'));
    expect(state.items).toHaveLength(0);
    expect(localStorage.getItem('cart')).toBe('[]');
  });

  it('should handle clearCart', () => {
    const initialState = {
      items: [{ product: mockProduct, quantity: 5 }],
    };
    const state = cartReducer(initialState, clearCart());
    expect(state.items).toHaveLength(0);
    expect(localStorage.getItem('cart')).toBeNull();
  });
});
