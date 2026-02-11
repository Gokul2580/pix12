'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingCart, ChevronLeft, ChevronRight, Heart, Copy, Check } from 'lucide-react';
import { useModalScroll } from '../hooks/useModalScroll';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import LazyImage from './LazyImage';
import { createPortal } from 'react-dom';

interface ProductDetailsSheetProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onCartClick: () => void;
}

export default function ProductDetailsSheet({ product, isOpen, onClose, onCartClick }: ProductDetailsSheetProps) {
  useModalScroll(isOpen);
  const { addToCart, isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0);
      setQuantity(1);
      setSelectedSize(product.default_size || '');
      setSelectedColor(product.default_color || '');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const allImages = [
    product.image_url || '/placeholder.svg',
    ...(product.gallery_images && Array.isArray(product.gallery_images) 
      ? product.gallery_images.filter(img => img && typeof img === 'string')
      : [])
  ].filter(Boolean);

  const currentImage = allImages[currentImageIndex] || '/placeholder.svg';
  const comparePrice = product.compare_at_price && product.compare_at_price > 0 ? product.compare_at_price : product.price;
  const currentPrice = product.price < comparePrice ? product.price : comparePrice;
  const hasDiscount = comparePrice > product.price;
  const discountPercentage = hasDiscount ? Math.round(((comparePrice - product.price) / comparePrice) * 100) : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize || undefined, selectedColor || undefined);
    onCartClick();
    onClose();
  };

  const handleCopyLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="modal-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="modal-content flex flex-col items-center justify-end sm:justify-center w-full px-0 sm:px-4">
        <div className="w-full sm:w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border-0 sm:border-4 border-b-4 border-black" style={{ overscrollBehavior: 'contain' }}>
          {/* Header */}
          <div className="sticky top-0 z-20 bg-gradient-to-r from-teal-50 to-mint-50 px-4 sm:px-6 py-4 flex items-center justify-between border-b-4 border-black rounded-t-3xl sm:rounded-t-none">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2">{product.name}</h2>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-gray-100 transition-all border-2 border-black"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Image Gallery */}
            <div className="space-y-2 sm:space-y-3">
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl overflow-hidden border-2 sm:border-4 border-black aspect-square">
                <LazyImage
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-2.5 rounded-full transition-all border-2 border-black active:scale-90"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-2.5 rounded-full transition-all border-2 border-black active:scale-90"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                    </button>
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}

                {hasDiscount && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                    -{discountPercentage}%
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-3 transition-all ${
                        idx === currentImageIndex ? 'border-black' : 'border-gray-300'
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <LazyImage src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-teal-50 to-mint-50 p-4 rounded-xl border-4 border-black">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">{'₹'}{currentPrice?.toFixed(2)}</span>
                {hasDiscount && (
                  <span className="text-lg text-gray-500 line-through">{'₹'}{product.price?.toFixed(2)}</span>
                )}
              </div>
              {product.description && (
                <p className="text-sm text-gray-700 mt-3">{product.description}</p>
              )}
            </div>

            {/* Options */}
            {(product.sizes && product.sizes.length > 0 || product.colors && product.colors.length > 0) && (
              <div className="space-y-3 sm:space-y-4">
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">Size</label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 sm:px-4 py-2 rounded-lg border-2 sm:border-3 font-semibold text-sm sm:text-base transition-all active:scale-95 ${
                            selectedSize === size
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-black border-gray-300 hover:border-black'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors && product.colors.length > 0 && (
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 sm:px-4 py-2 rounded-lg border-2 sm:border-3 font-semibold text-sm sm:text-base transition-all active:scale-95 ${
                            selectedColor === color
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-black border-gray-300 hover:border-black'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">Quantity</label>
              <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-lg border-2 sm:border-3 border-black w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-gray-200 rounded-lg font-bold transition-colors text-sm sm:text-base active:scale-95"
                  aria-label="Decrease quantity"
                >
                  {'−'}
                </button>
                <span className="text-lg sm:text-xl font-bold text-gray-900 w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-gray-200 rounded-lg font-bold transition-colors text-sm sm:text-base active:scale-95"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`py-3 rounded-lg sm:rounded-xl font-bold border-2 sm:border-3 transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  isFavorite(product.id)
                    ? 'bg-red-500 text-white border-red-600 hover:bg-red-600'
                    : 'bg-white text-gray-900 border-black hover:bg-gray-100'
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart className={`w-4 sm:w-5 h-4 sm:h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                <span className="text-xs sm:text-base">Wishlist</span>
              </button>

              <button
                onClick={handleAddToCart}
                className={`py-3 rounded-lg sm:rounded-xl font-bold border-2 sm:border-3 transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  isInCart(product.id)
                    ? 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600'
                    : 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
                }`}
              >
                <ShoppingCart className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="text-xs sm:text-base">{isInCart(product.id) ? 'Update' : 'Add'}</span>
              </button>
            </div>

            {/* Share Section */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 sm:border-4 border-black">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-sm sm:text-base transition-colors active:scale-95"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 sm:w-5 h-4 sm:h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="hidden sm:inline">Share Link</span>
                    <span className="sm:hidden">Share</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return modalContent;
}
