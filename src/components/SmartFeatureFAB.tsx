'use client';

import React, { useState, useEffect } from 'react';
import { Shirt, Palette, Sparkles } from 'lucide-react';

interface SmartFeatureFABProps {
  onTryOnClick: () => void;
  onColorMatchClick: () => void;
}

export default function SmartFeatureFAB({ onTryOnClick, onColorMatchClick }: SmartFeatureFABProps) {
  const [showFeatures, setShowFeatures] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState('');

  useEffect(() => {
    const tooltips = ['Try On!', 'Match with Dress'];
    let currentIndex = 0;

    const autoShowInterval = setInterval(() => {
      setTooltipText(tooltips[currentIndex]);
      setShowTooltip(true);

      setTimeout(() => {
        setShowTooltip(false);
      }, 3000);

      currentIndex = (currentIndex + 1) % tooltips.length;
    }, 8000);

    return () => clearInterval(autoShowInterval);
  }, []);

  return (
    <div className="fixed bottom-32 sm:bottom-36 md:bottom-40 right-3 sm:right-4 md:right-6 flex justify-end z-40 pointer-events-none">
      <div className="flex flex-col items-end gap-2 sm:gap-3 pointer-events-auto">
        {showFeatures && (
          <>
            <div className="flex items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="bg-pink-500 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm font-semibold whitespace-nowrap">
                Match with Dress
              </div>
              <button
                onClick={() => {
                  onColorMatchClick();
                  setShowFeatures(false);
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95"
                aria-label="Color Match"
                title="Match with Dress"
              >
                <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-right-2 duration-200" style={{ animationDelay: '0.1s' }}>
              <div className="bg-blue-500 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm font-semibold whitespace-nowrap">
                Virtual Try On
              </div>
              <button
                onClick={() => {
                  onTryOnClick();
                  setShowFeatures(false);
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95"
                aria-label="Virtual Try On"
                title="Virtual Try On"
              >
                <Shirt className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {showTooltip && !showFeatures && (
            <div className="bg-gray-800 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm font-medium whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-300">
              {tooltipText}
            </div>
          )}

          <button
            onClick={() => setShowFeatures(!showFeatures)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-white hover:bg-gray-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95 border-2 border-gray-200"
            aria-label="Smart Features"
          >
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-teal-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
