'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, X, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { usePublishedData } from '../contexts/PublishedDataContext';
import { objectToArray } from '../utils/publishedData';
import type { Product } from '../types';

interface CartFABProps {
  onCartClick: () => void;
  position?: 'right' | 'left';
}

const MARKETING_MESSAGES = [
  "🎉 Don't miss this!",
  "⚡ Limited stock!",
  "✨ Trending now!",
  "🔥 Hot deal!",
  "💎 Customer favorite!",
  "🚀 New arrival!",
  "⏰ Ending soon!",
  "🎁 Special offer!"
];

export default function CartFAB({ onCartClick, position = 'right' }: CartFABProps) {
  const { itemCount, cart } = useCart();
  const { data: publishedData } = usePublishedData();
  const [showNotification, setShowNotification] = useState(false);
  const [lastProduct, setLastProduct] = useState<Product | null>(null);
  const [marketingMessage, setMarketingMessage] = useState(MARKETING_MESSAGES[0]);
  const [expanded, setExpanded] = useState(false);

  // Rotate marketing message periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setMarketingMessage(
        MARKETING_MESSAGES[Math.floor(Math.random() * MARKETING_MESSAGES.length)]
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Show notification when item is added
  useEffect(() => {
    if (cart && cart.length > 0) {
      const products: Product[] = objectToArray<Product>(publishedData?.products || {});
      const latestItem = cart[cart.length - 1];
      const product = products.find(p => p.id === latestItem.product_id);
      if (product) {
        setLastProduct(product);
        setShowNotification(true);
        const timer = setTimeout(() => setShowNotification(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [cart, publishedData]);

  const positionClasses = position === 'right' 
    ? 'bottom-6 right-6' 
    : 'bottom-6 left-6';

  return (
    <>
      {/* Notification Toast */}
      {showNotification && lastProduct && (
        <div className="fixed bottom-32 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-emerald-200 overflow-hidden max-w-xs">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 flex items-center gap-2">
              <span className="text-white font-bold text-sm">✅ Added to cart!</span>
            </div>
            <div className="p-4 flex gap-3">
              <img
                src={lastProduct.image_url || "/placeholder.svg"}
                alt={lastProduct.name}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm line-clamp-1">
                  {lastProduct.name}
                </p>
                <p className="text-teal-600 font-bold text-sm mt-1">
                  ₹{lastProduct.price.toFixed(2)}
                </p>
                <p className="text-emerald-600 text-xs font-semibold mt-2">
                  {marketingMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart FAB */}
      <div className={`fixed ${positionClasses} z-50`}>
        {/* Expanded Menu */}
        {expanded && (
          <div className="absolute bottom-20 right-0 bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 overflow-hidden p-4 min-w-64 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Quick Actions</h3>
              <button
                onClick={() => setExpanded(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {itemCount > 0 ? (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onCartClick();
                    setExpanded(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold flex items-center justify-between hover:shadow-lg transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    View Cart
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Items in cart</p>
                  <p className="text-2xl font-bold text-emerald-600">{itemCount}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Your cart is empty</p>
                <p className="text-xs text-gray-500 mt-1">Start shopping to add items</p>
              </div>
            )}
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={() => {
            if (expanded) {
              setExpanded(false);
            } else {
              setExpanded(!expanded);
            }
          }}
          className={`relative w-16 h-16 rounded-full shadow-2xl border-4 border-white flex items-center justify-center font-bold text-white transition-all duration-300 group hover:shadow-xl ${
            itemCount > 0
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
              : 'bg-gradient-to-br from-gray-400 to-gray-500'
          }`}
        >
          <ShoppingCart className="w-7 h-7 group-hover:scale-110 transition-transform" />

          {/* Cart Counter Badge */}
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}

          {/* Marketing Badge */}
          {itemCount > 0 && (
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {marketingMessage}
            </div>
          )}
        </button>
      </div>
    </>
  );
}
