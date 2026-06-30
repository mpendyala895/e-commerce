import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { increaseQuantity, decreaseQuantity, removeFromCart, clearCart } from '../features/cartSlice';
import { createOrder } from '../services/orderApi';
import { Trash2, Plus, Minus, CreditCard, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const totalPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (!user) {
      setCheckoutMessage({ type: 'error', text: 'User details not found. Please log in again.' });
      return;
    }

    setCheckoutLoading(true);
    setCheckoutMessage(null);

    const orderPayload = {
      userId: Number(user.id),
      orderLineItemsDTOList: cartItems.map((item) => ({
        skuCode: item.product.skuCode || item.product.id,
        price: item.product.price,
        quantity: item.quantity,
      })),
    };

    try {
      await createOrder(orderPayload);
      setCheckoutMessage({ type: 'success', text: 'Order placed successfully!' });
      dispatch(clearCart());
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error placing order';
      setCheckoutMessage({
        type: 'error',
        text: `Checkout failed: ${errorMsg}`,
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0 && !checkoutMessage) {
    return (
      <EmptyState
        title="Your Cart is Empty"
        description="Looks like you haven't added anything to your cart yet. Explore our products catalog to find amazing deals!"
        actionText="Shop Now"
        actionPath="/products"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Shopping Cart</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your items and proceed to secure checkout</p>
      </div>

      {checkoutMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center space-x-2 ${
            checkoutMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>{checkoutMessage.text}</span>
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center space-x-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-xs"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-xl bg-slate-50 border border-slate-100"
                />
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm truncate">{item.product.name}</h3>
                  <p className="text-xs text-slate-400 capitalize">{item.product.category}</p>
                  <p className="text-sm font-extrabold text-indigo-600 mt-1">₹{item.product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  <button
                    onClick={() => dispatch(decreaseQuantity(item.product.id))}
                    className="p-1 text-slate-500 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-700 px-2 min-w-[20px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => dispatch(increaseQuantity(item.product.id))}
                    className="p-1 text-slate-500 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => dispatch(removeFromCart(item.product.id))}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>

          <aside className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-6">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-slate-500 font-medium">
                <span>Subtotal</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500 font-medium">
                <span>Shipping</span>
                <span className="text-emerald-600">FREE</span>
              </div>
              <div className="border-t border-slate-100 pt-4 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-white py-3.5 px-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer text-sm"
            >
              <CreditCard className="w-4.5 h-4.5" />
              <span>{checkoutLoading ? 'Processing...' : 'Place Order'}</span>
              {!checkoutLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
