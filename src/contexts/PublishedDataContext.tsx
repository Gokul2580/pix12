import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getPublishedData } from '../utils/publishedData';
import { loadPreviewDataFromFirebase } from './PreviewContext';

interface PublishedData {
  products: Record<string, any> | null;
  categories: Record<string, any> | null;
  reviews: Record<string, any> | null;
  offers: Record<string, any> | null;
  site_settings: Record<string, any> | null;
  carousel_images: Record<string, any> | null;
  carousel_settings: any | null;
  homepage_sections: Record<string, any> | null;
  info_sections: Record<string, any> | null;
  marquee_sections: Record<string, any> | null;
  video_sections: Record<string, any> | null;
  video_section_settings: any | null;
  video_overlay_sections: Record<string, any> | null;
  video_overlay_items: Record<string, any> | null;
  default_sections_visibility: any | null;
  card_designs: Record<string, any> | null;
  navigation_settings: any | null;
  coupons: Record<string, any> | null;
  try_on_models: Record<string, any> | null;
  tax_settings: any | null;
  footer_settings: any | null;
  footer_config: any | null;
  policies: Record<string, any> | null;
  settings: any | null;
  bill_settings: any | null;
  published_at?: string;
}

interface PublishedDataContextType {
  data: PublishedData | null;
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

const PublishedDataContext = createContext<PublishedDataContextType | undefined>(undefined);

export function PublishedDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PublishedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      // Check if in preview mode
      const urlParams = new URLSearchParams(window.location.search);
      const isPreviewMode = urlParams.get('preview') === 'true';

      if (isPreviewMode) {
        console.log('Preview mode: Loading from Firebase');
        const firebaseData = await loadPreviewDataFromFirebase();
        if (firebaseData) {
          setData(firebaseData as any);
        } else {
          setError(true);
        }
      } else {
        // Normal mode: Load from R2
        const publishedData = await getPublishedData();
        if (publishedData) {
          setData(publishedData);
        } else {
          setError(true);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refresh = async () => {
    await loadData();
  };

  return (
    <PublishedDataContext.Provider value={{ data, loading, error, refresh }}>
      {children}
    </PublishedDataContext.Provider>
  );
}

export function usePublishedData() {
  const context = useContext(PublishedDataContext);
  if (context === undefined) {
    throw new Error('usePublishedData must be used within a PublishedDataProvider');
  }
  return context;
}
