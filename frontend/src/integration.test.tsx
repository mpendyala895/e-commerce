import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import productsReducer from './features/productsSlice';
import cartReducer from './features/cartSlice';
import Login from './pages/Login';
import Products from './pages/Products';
import Navbar from './components/Navbar';
import Cart from './pages/Cart';
import { login as loginService } from './services/authApi';
import { getProducts as getProductsService } from './services/productApi';

vi.mock('./services/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('./services/productApi', () => ({
  getProducts: vi.fn(),
}));

const makeTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      products: productsReducer,
      cart: cartReducer,
    },
  });

describe('E-Commerce Frontend Integration Flows', () => {
  let store: ReturnType<typeof makeTestStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    store = makeTestStore();
  });

  it('verifies the Login Flow', async () => {
    vi.mocked(loginService).mockResolvedValue({
      token: 'mock-jwt-token',
      user: { email: 'user@example.com', firstName: 'Alice', lastName: 'Smith' },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<div>Welcome Home</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'securepwd123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginService).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'securepwd123',
      });
    });

    await waitFor(() => {
      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.user).toEqual({ email: 'user@example.com', firstName: 'Alice', lastName: 'Smith' });
      expect(state.auth.token).toBe('mock-jwt-token');
      expect(localStorage.getItem('token')).toBe('mock-jwt-token');
    });
  });

  it('verifies Product Fetching Flow', async () => {
    const mockProducts = [
      { id: '1', name: 'MacBook Pro', description: 'Powerful laptop', price: 1999.99, imageUrl: 'mac.jpg', category: 'Tech' },
      { id: '2', name: 'iPhone 15', description: 'Smartphone', price: 999.99, imageUrl: 'iphone.jpg', category: 'Tech' },
    ];

    vi.mocked(getProductsService).mockResolvedValue(mockProducts);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/products']}>
          <Products />
        </MemoryRouter>
      </Provider>
    );

    expect(await screen.findByText('MacBook Pro')).toBeInTheDocument();
    expect(screen.getByText('iPhone 15')).toBeInTheDocument();

    const state = store.getState();
    expect(state.products.items).toHaveLength(2);
    expect(state.products.items[0].name).toBe('MacBook Pro');
  });

  it('verifies Add To Cart Flow', async () => {
    const mockProducts = [
      { id: '1', name: 'Leather Wallet', description: 'RFID blocking', price: 49.99, imageUrl: 'wallet.jpg', category: 'Fashion' },
    ];

    vi.mocked(getProductsService).mockResolvedValue(mockProducts);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/products']}>
          <Routes>
            <Route
              path="/products"
              element={
                <>
                  <Navbar />
                  <Products />
                </>
              }
            />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(await screen.findByText('Leather Wallet')).toBeInTheDocument();

    const addToCartBtn = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartBtn);

    const state = store.getState();
    expect(state.cart.items).toHaveLength(1);
    expect(state.cart.items[0].product.name).toBe('Leather Wallet');
    expect(state.cart.items[0].quantity).toBe(1);
  });
});
