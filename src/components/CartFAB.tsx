'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, X, Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { usePublishedData } from '../contexts/PublishedDataContext';
import { objectToArray } from '../utils/publishedData';
import type { Product } from '../types';

interface CartFABProps {
  onCartClick: () => void;
  position?: 'right' | 'left';
}

const SUGGESTION_MESSAGES = [
  { text: "We picked this for you", emoji: "✨" },
  { text: "Don't miss this!", emoji: "🔥" },
  { text: "Trending now", emoji: "📈" },
  { text: "Add this beauty", emoji: "💎" },
  { text: "Customer favorite", emoji: "⭐" },
  { text: "Limited stock", emoji: "⏰" },
  { text: "On sale today", emoji: "🎉" },
  { text: "You'll love this", emoji: "💕" }
];

export default function CartFAB({ onCartClick, position = 'right' }: CartFABProps) {
  const { itemCount, cart, addToCart } = useCart();
  const { data: publishedData } = usePublishedData();
  const [expanded, setExpanded] = useState(false);
  const [suggestedProduct, setSuggestedProduct] = useState<Product | null>(null);
  const [currentMessage, setCurrentMessage] = useState(SUGGESTION_MESSAGES[0]);
  const [showNotification, setShowNotification] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Get all products and pick a random one every 5 seconds
  useEffect(() => {
    if (publishedData?.products) {
      const allProducts = objectToArray<Product>(publishedData.products);
      setProducts(allProducts);
      
      if (allProducts.length > 0) {
        const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
        setSuggestedProduct(randomProduct);
        const randomMessage = SUGGESTION_MESSAGES[Math.floor(Math.random() * SUGGESTION_MESSAGES.length)];
        setCurrentMessage(randomMessage);
      }
    }
  }, [publishedData]);

  // Change suggestion every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (products.length > 0) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        setSuggestedProduct(randomProduct);
        const randomMessage = SUGGESTION_MESSAGES[Math.floor(Math.random() * SUGGESTION_MESSAGES.length)];
        setCurrentMessage(randomMessage);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [products]);

  const handleAddSuggested = () => {
    if (suggestedProduct) {
      addToCart(suggestedProduct);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }
  };

  const positionClasses = position === 'right' 
    ? 'bottom-6 right-6' 
    : 'bottom-6 left-6';

  const expandedPositionClasses = position === 'right'
    ? 'right-0'
    : 'left-0';

  return (
    <>
      {/* Chat Bubble Notification */}
      {showNotification && (
        <div className="fixed bottom-32 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 overflow-hidden max-w-sm">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-sm">Added to cart!</span>
            </div>
          </div>
        </div>
      )}

      {/* Cart FAB Container */}
      <div className={`fixed ${positionClasses} z-50 flex flex-col items-${position === 'right' ? 'end' : 'start'} gap-4`}>
        {/* Expanded Chat Menu */}
        {expanded && (
          <div className="absolute bottom-20 ${expandedPositionClasses} bg-white rounded-3xl shadow-2xl border-2 border-emerald-100 overflow-hidden min-w-80 max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <h3 className="font-bold text-white text-base">Smart Suggestions</h3>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Cart Stats */}
            {itemCount > 0 && (
              <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100 flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">Items in cart</span>
                <span className="text-2xl font-bold text-emerald-600">{itemCount}</span>
              </div>
            )}

            {/* Suggested Product Chat Bubble */}
            {suggestedProduct && (
              <div className="p-6 space-y-4">
                {/* Message Bubble */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl rounded-tl-none px-4 py-3 border border-emerald-200">
                      <p className="text-sm text-gray-900 font-semibold">{currentMessage.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-2">{currentMessage.emoji}</p>
                  </div>
                </div>

                {/* Product Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 overflow-hidden">
                  <div className="aspect-square overflow-hidden bg-white">
                    <img
                      src={suggestedProduct.image_url || '/placeholder.svg'}
                      alt={suggestedProduct.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-900 text-sm line-clamp-2">
                      {suggestedProduct.name}
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-emerald-600 font-bold text-lg">
                        ₹{suggestedProduct.price.toFixed(0)}
                      </p>
                      {suggestedProduct.original_price && suggestedProduct.original_price > suggestedProduct.price && (
                        <p className="text-gray-500 line-through text-xs">
                          ₹{suggestedProduct.original_price.toFixed(0)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddSuggested}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold flex items-center justify-between hover:shadow-lg transition-all group active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* View Cart Button */}
                <button
                  onClick={() => {
                    onCartClick();
                    setExpanded(false);
                  }}
                  className="w-full px-4 py-2.5 bg-white text-emerald-600 rounded-2xl font-bold border-2 border-emerald-500 hover:bg-emerald-50 transition-all"
                >
                  View Cart
                </button>
              </div>
            )}

            {/* Empty State */}
            {!suggestedProduct && (
              <div className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">Loading suggestions...</p>
              </div>
            )}
          </div>
        )}

        {/* Main FAB Button - Material Design */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="relative w-16 h-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group flex items-center justify-center font-bold text-white border-4 border-white active:scale-95"
          style={{
            background: itemCount > 0
              ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)'
              : 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)'
          }}
        >
          <ShoppingCart className="w-7 h-7 group-hover:scale-110 transition-transform" />

          {/* Counter Badge - Material Design */}
          {itemCount > 0 && (
            <span className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-pulse">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}

          {/* Floating Label */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-full whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {itemCount > 0 ? `${itemCount} items` : 'Add items'}
          </div>
        </button>
      </div>
    </>
  );
}
