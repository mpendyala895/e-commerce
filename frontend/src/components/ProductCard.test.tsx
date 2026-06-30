import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from './ProductCard';
import { addToCart } from '../features/cartSlice';

const mockProduct = {
  id: 'p123',
  name: 'Premium Headphones',
  description: 'Noise cancelling overhead headphones.',
  price: 299.99,
  imageUrl: 'https://example.com/headphones.jpg',
  category: 'Audio',
};

const mockDispatch = vi.fn();
vi.mock('../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

vi.mock('../features/cartSlice', () => ({
  addToCart: (prod: typeof mockProduct) => ({ type: 'cart/addToCart', payload: prod }),
}));

describe('ProductCard Component', () => {
  it('renders product details correctly', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    expect(screen.getByText('Premium Headphones')).toBeInTheDocument();
    expect(screen.getByText('Noise cancelling overhead headphones.')).toBeInTheDocument();
    expect(screen.getByText('₹299.99')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/headphones.jpg');
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Premium Headphones');
  });

  it('dispatches addToCart action on click', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(button);

    expect(mockDispatch).toHaveBeenCalledWith(addToCart(mockProduct));
  });
});
