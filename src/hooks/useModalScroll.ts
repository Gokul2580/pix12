'use client';

import { useEffect } from 'react';

export function useModalScroll(isOpen: boolean) {
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
}
