'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Home as HomeIcon, Store, User, LogOut, Settings, X, ShoppingCart, Package, MessageSquare, Shirt, Palette, MessageCircle, Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { usePublishedData } from '../contexts/PublishedDataContext';
import { objectToArray } from '../utils/publishedData';
import FeedbackModal from './FeedbackModal';
import WhatsAppChatModal from './WhatsAppChatModal';
import type { Product } from '../types';

interface NavigationProps {
  currentPage: 'home' | 'shop' | 'admin' | 'checkout';
  onNavigate: (page: 'home' | 'shop' | 'admin' | 'checkout') => void;
  onLoginClick: () => void;
  onCartClick: () => void;
  onOrdersClick: () => void;
  onProductClick?: (product: Product) => void;
  onTryOnClick?: () => void;
  onColorMatchClick?: () => void;
}

export default function Navigation({ currentPage, onNavigate, onLoginClick, onCartClick, onOrdersClick, onProductClick, onTryOnClick, onColorMatchClick }: NavigationProps) {
  const { user, signOut } = useAuth();
  const { itemCount, addToCart } = useCart();
  const { data: publishedData } = usePublishedData();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [activeModal, setActiveModal] = useState<'feedback' | 'whatsapp' | null>(null);
  const isDevelopment = import.meta.env.DEV;

  const fabFeatures = [
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      color: 'from-emerald-400 to-emerald-500',
      bgColor: 'bg-emerald-500 hover:bg-emerald-600'
    },
    {
      id: 'tryon',
      label: 'Virtual Try On',
      icon: Shirt,
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'colormatch',
      label: 'Color Match',
      icon: Palette,
      color: 'from-pink-400 to-pink-500',
      bgColor: 'bg-pink-500 hover:bg-pink-600'
    },
    {
      id: 'whatsapp',
      label: 'Chat with us',
      icon: MessageCircle,
      color: 'from-green-400 to-green-500',
      bgColor: 'bg-green-500 hover:bg-green-600'
    }
  ];

  const handleFeatureClick = (featureId: string) => {
    if (featureId === 'feedback') {
      setActiveModal('feedback');
    } else if (featureId === 'tryon') {
      onTryOnClick?.();
      setShowMoreMenu(false);
    } else if (featureId === 'colormatch') {
      onColorMatchClick?.();
      setShowMoreMenu(false);
    } else if (featureId === 'whatsapp') {
      setActiveModal('whatsapp');
    }
    setShowMoreMenu(false);
  };

  const [navStyle, setNavStyle] = useState({
    background: '#ffffff',
    text: '#111827',
    activeTab: '#14b8a6',
    inactiveButton: '#f3f4f6',
    borderRadius: 'full',
    buttonSize: 'md',
    themeMode: 'default'
  });

  const [buttonLabels, setButtonLabels] = useState({
    home: 'Home',
    shop: 'Shop All',
    search: 'Search',
    cart: 'Cart',
    myOrders: 'My Orders',
    login: 'Login',
    signOut: 'Sign Out',
    admin: 'Admin'
  });

  useEffect(() => {
    // Use default navigation style while loading
    if (!publishedData) {
      console.log('[NAVIGATION] Data still loading, using defaults');
      return;
    }

    if (!publishedData.navigation_settings) {
      console.log('[NAVIGATION] No navigation_settings in published data, using defaults');
      return;
    }

    try {
      const style = publishedData.navigation_settings;
      console.log('[NAVIGATION] Loaded navigation settings from R2:', style);
      
      setNavStyle({
        background: style.background || '#ffffff',
        text: style.text || '#111827',
        activeTab: style.activeTab || '#14b8a6',
        inactiveButton: style.inactiveButton || '#f3f4f6',
        borderRadius: style.borderRadius || 'full',
        buttonSize: style.buttonSize || 'md',
        themeMode: style.themeMode || 'default'
      });

      if (style.buttonLabels) {
        console.log('[NAVIGATION] Applying button labels:', style.buttonLabels);
        setButtonLabels({
          home: style.buttonLabels.home || 'Home',
          shop: style.buttonLabels.shop || 'Shop All',
          search: style.buttonLabels.search || 'Search',
          cart: style.buttonLabels.cart || 'Cart',
          myOrders: style.buttonLabels.myOrders || 'My Orders',
          login: style.buttonLabels.login || 'Login',
          signOut: style.buttonLabels.signOut || 'Sign Out',
          admin: style.buttonLabels.admin || 'Admin'
        });
      } else {
        console.log('[NAVIGATION] No button labels found, using defaults');
      }
    } catch (error) {
      console.error('[NAVIGATION] Error loading navigation style:', error);
    }
  }, [publishedData]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const isAdminUser = publishedData?.admins?.[user.uid] || publishedData?.super_admins?.[user.uid];
      setIsAdmin(!!isAdminUser);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  }, [user, publishedData]);

  useEffect(() => {
    if (searchOpen && publishedData?.products) {
      try {
        setLoading(true);
        const productsData: Product[] = objectToArray<Product>(publishedData.products);
        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading products:', error);
        setLoading(false);
      }
    }
  }, [searchOpen, publishedData]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const getBorderRadiusClass = (radius: string) => {
    const map: { [key: string]: string } = {
      'none': 'rounded-none',
      'sm': 'rounded-sm',
      'md': 'rounded-md',
      'lg': 'rounded-lg',
      'xl': 'rounded-xl',
      '2xl': 'rounded-2xl',
      'full': 'rounded-full'
    };
    return map[radius] || 'rounded-full';
  };

  const getButtonSizeClass = (size: string) => {
    const sizeMap: { [key: string]: { padding: string; text: string } } = {
      'sm': { padding: 'px-2 py-1 sm:px-3 sm:py-1.5', text: 'text-xs sm:text-xs' },
      'md': { padding: 'px-2 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5', text: 'text-xs sm:text-sm' },
      'lg': { padding: 'px-3 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3', text: 'text-sm sm:text-base' },
      'xl': { padding: 'px-4 py-2 sm:px-6 sm:py-3 md:px-7 md:py-3.5', text: 'text-sm sm:text-lg' }
    };
    return sizeMap[size] || sizeMap['md'];
  };

  const getButtonClasses = (isActive: boolean) => {
    const sizeClasses = getButtonSizeClass(navStyle.buttonSize);
    const baseClasses = `inline-flex items-center gap-2 ${sizeClasses.padding} ${getBorderRadiusClass(navStyle.borderRadius)} ${sizeClasses.text} font-bold transition-all border-2`;

    if (isActive) {
      return `${baseClasses} border-2`;
    }
    return `${baseClasses} border-2 hover:opacity-80`;
  };

  return (
    <nav className="w-full" style={{ backgroundColor: navStyle.background }}>
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-3 sm:py-4 lg:py-6 gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="group flex flex-col items-center gap-2 mb-2"
          >
            <img
              src="/logo.png"
              alt="Pixie Blooms"
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </button>

          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center relative w-full">
            <button
              onClick={() => onNavigate('home')}
              className={getButtonClasses(currentPage === 'home')}
              style={{
                backgroundColor: currentPage === 'home' ? navStyle.activeTab : navStyle.inactiveButton,
                color: currentPage === 'home' ? '#ffffff' : navStyle.text,
                borderColor: currentPage === 'home' ? navStyle.activeTab : 'transparent'
              }}
            >
              <HomeIcon className="w-4 h-4" />
              {buttonLabels.home}
            </button>

            <button
              onClick={() => onNavigate('shop')}
              className={getButtonClasses(currentPage === 'shop')}
              style={{
                backgroundColor: currentPage === 'shop' ? navStyle.activeTab : navStyle.inactiveButton,
                color: currentPage === 'shop' ? '#ffffff' : navStyle.text,
                borderColor: currentPage === 'shop' ? navStyle.activeTab : 'transparent'
              }}
            >
              <Store className="w-4 h-4" />
              {buttonLabels.shop}
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className={getButtonClasses(false)}
              style={{
                backgroundColor: navStyle.inactiveButton,
                color: navStyle.text,
                borderColor: 'transparent'
              }}
            >
              <Search className="w-4 h-4" />
              {buttonLabels.search}
            </button>

            <button
              onClick={onCartClick}
              className={`relative ${getButtonClasses(false)}`}
              style={{
                backgroundColor: navStyle.inactiveButton,
                color: navStyle.text,
                borderColor: 'transparent'
              }}
            >
              <ShoppingBag className="w-4 h-4" />
              {buttonLabels.cart}
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white"
                  style={{ backgroundColor: navStyle.activeTab }}
                >
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <>
                <button
                  onClick={onOrdersClick}
                  className={getButtonClasses(false)}
                  style={{
                    backgroundColor: navStyle.inactiveButton,
                    color: navStyle.text,
                    borderColor: 'transparent'
                  }}
                >
                  <Package className="w-4 h-4" />
                  {buttonLabels.myOrders}
                </button>
                {(isAdmin || isDevelopment) && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className={getButtonClasses(currentPage === 'admin')}
                    style={{
                      backgroundColor: currentPage === 'admin' ? navStyle.activeTab : navStyle.inactiveButton,
                      color: currentPage === 'admin' ? '#ffffff' : navStyle.text,
                      borderColor: currentPage === 'admin' ? navStyle.activeTab : 'transparent'
                    }}
                  >
                    <Settings className="w-4 h-4" />
                    {buttonLabels.admin}
                  </button>
                )}
                <button
                  onClick={() => signOut()}
                  className={getButtonClasses(false)}
                  style={{
                    backgroundColor: navStyle.activeTab,
                    color: '#ffffff',
                    borderColor: navStyle.activeTab
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  {buttonLabels.signOut}
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className={getButtonClasses(false)}
                style={{
                  backgroundColor: navStyle.activeTab,
                  color: '#ffffff',
                  borderColor: navStyle.activeTab
                }}
              >
                <User className="w-4 h-4" />
                {buttonLabels.login}
              </button>
            )}

            {/* More Features Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={getButtonClasses(false)}
                style={{
                  backgroundColor: navStyle.inactiveButton,
                  color: navStyle.text,
                  borderColor: 'transparent'
                }}
              >
                <Plus className="w-4 h-4" />
                More
              </button>

              {/* iOS-Style Dropdown Menu */}
              {showMoreMenu && (
                <div className="fixed inset-x-0 bottom-0 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-3 sm:inset-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-2 sm:border-2 border-gray-100 overflow-hidden w-full sm:w-auto sm:min-w-max z-50 backdrop-blur-sm bg-opacity-95 animate-in fade-in slide-in-from-bottom-2 sm:slide-in-from-top-2 duration-300">
                  {/* Mobile Handle */}
                  <div className="sm:hidden flex justify-center py-2">
                    <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                  </div>
                  
                  {/* Header */}
                  <div className="px-4 sm:px-4 py-3 sm:py-3 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-emerald-50">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider text-center sm:text-left">Smart Features</p>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="p-2 sm:p-2 max-h-96 overflow-y-auto">
                    {fabFeatures.map((feature, idx) => {
                      const Icon = feature.icon;
                      return (
                        <button
                          key={feature.id}
                          onClick={() => handleFeatureClick(feature.id)}
                          className="w-full px-3 sm:px-4 py-3 sm:py-3.5 flex items-center gap-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 active:bg-gray-100 transition-all duration-200 text-left rounded-2xl group"
                        >
                          <div className={`w-10 sm:w-10 h-10 sm:h-10 flex-shrink-0 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95 ${feature.bgColor} shadow-md group-hover:shadow-lg`}>
                            <Icon className="w-5 sm:w-5 h-5 sm:h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm sm:text-sm group-hover:text-teal-600 transition-colors">
                              {feature.label}
                            </p>
                            <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors hidden sm:block">
                              {idx === 0 && 'Share your feedback'}
                              {idx === 1 && 'Try clothes virtually'}
                              {idx === 2 && 'Find your color'}
                              {idx === 3 && 'Chat with support'}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all hidden sm:block flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Mobile Footer */}
                  <div className="sm:hidden px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={() => setShowMoreMenu(false)}
                      className="w-full py-2 text-center text-gray-600 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Close menu when clicking outside */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMoreMenu(false)}
          aria-hidden="true"
        />
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)}></div>

          <div className="relative bg-white rounded-3xl border-2 border-teal-200 w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b-2 border-teal-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    autoFocus
                    className="w-full pl-12 pr-4 py-3 border-2 border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 text-gray-900"
                  />
                </div>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {searchQuery && (
                <p className="text-sm text-gray-600">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} found
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                  <p className="text-gray-600 mt-4">Loading products...</p>
                </div>
              ) : searchQuery === '' ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-semibold mb-2">Start typing to search</p>
                  <p className="text-gray-500 text-sm">Search through our collection of products</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-semibold mb-2">No products found</p>
                  <p className="text-gray-500 text-sm">Try different keywords</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        if (onProductClick) {
                          onProductClick(product);
                          setSearchOpen(false);
                          setSearchQuery('');
                        }
                      }}
                      className="flex gap-4 bg-white rounded-2xl p-4 border-2 border-teal-200 hover:border-teal-400 transition-all cursor-pointer group"
                    >
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-teal-600">
                            ₹{product.price.toFixed(2)}
                          </span>
                          {product.in_stock && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                              className="flex items-center gap-2 bg-teal-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Add
                            </button>
                          )}
                          {!product.in_stock && (
                            <span className="text-sm text-gray-500 font-semibold">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {activeModal === 'feedback' && <FeedbackModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'whatsapp' && <WhatsAppChatModal onClose={() => setActiveModal(null)} />}
    </nav>
  );
}
