import { usePublishedData } from '../contexts/PublishedDataContext';

export default function TopBanner() {
  const { data: publishedData } = usePublishedData();
  
  const defaultContent = {
    text: '🎉 Grand Opening Sale! Get 20% OFF on all items!',
    isVisible: true,
    backgroundColor: '#f59e0b',
    textColor: '#ffffff'
  };

  let bannerContent = defaultContent;
  
  if (publishedData?.site_content?.top_banner?.value) {
    console.log('[TOP-BANNER] Using published data');
    bannerContent = publishedData.site_content.top_banner.value;
  } else {
    console.log('[TOP-BANNER] Using default content');
  }
  
  if (publishedData?.default_sections_visibility?.marquee !== undefined) {
    bannerContent = { ...bannerContent, isVisible: publishedData.default_sections_visibility.marquee && bannerContent.isVisible };
  }

  if (!bannerContent.isVisible) {
    return null;
  }

  // Ensure valid colors
  const bgColor = bannerContent.backgroundColor && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb/.test(bannerContent.backgroundColor) 
    ? bannerContent.backgroundColor 
    : '#f59e0b';
  const txtColor = bannerContent.textColor && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb/.test(bannerContent.textColor)
    ? bannerContent.textColor
    : '#ffffff';

  return (
    <div
      className="py-2.5 sm:py-3 overflow-hidden w-full"
      style={{
        backgroundColor: bgColor,
        color: txtColor
      }}
      role="status"
      aria-live="polite"
    >
      <div className="animate-marquee whitespace-nowrap inline-block w-full">
        <span className="text-xs sm:text-sm font-semibold mx-6 sm:mx-8 inline-block">{bannerContent.text}</span>
        <span className="text-xs sm:text-sm font-semibold mx-6 sm:mx-8 inline-block">{bannerContent.text}</span>
        <span className="text-xs sm:text-sm font-semibold mx-6 sm:mx-8 inline-block">{bannerContent.text}</span>
        <span className="text-xs sm:text-sm font-semibold mx-6 sm:mx-8 inline-block">{bannerContent.text}</span>
      </div>
    </div>
  );
}
