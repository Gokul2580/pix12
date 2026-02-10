'use client';

import React, { useEffect } from "react"
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      const scrollTop = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollTop}px`;
      document.body.style.width = '100%';
    } else {
      // Restore body scroll
      const scrollTop = parseInt(document.body.style.top || '0') * -1;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollTop);
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative bg-white w-full max-w-md rounded-2xl flex flex-col animate-scale-in overflow-hidden border-4 border-black pointer-events-auto max-h-[90vh] flex-shrink-0">
          <div className="flex items-center justify-between p-3 sm:p-5 border-b-4 border-black bg-[#B5E5CF] flex-shrink-0">
            <h2 className="text-lg font-semibold text-black">{title}</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white hover:bg-gray-100 transition-all duration-200 hover:scale-110 hover:rotate-90 border-2 border-black flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-black" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#B5E5CF]">
            <div className="prose prose-sm prose-gray max-w-none text-black">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
