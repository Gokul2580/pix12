import { Instagram, Mail, Facebook, Twitter, MessageCircle, Linkedin, Youtube, AtSign, Link as LinkIcon } from 'lucide-react';
import { usePublishedData } from '../contexts/PublishedDataContext';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  order: number;
}

const PLATFORM_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  email: Mail,
  whatsapp: MessageCircle,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: AtSign,
  custom: LinkIcon
};

export default function WelcomeBanner() {
  const { data: publishedData } = usePublishedData();
  
  const defaultBannerContent = {
    title: 'Welcome to Pixie Blooms!',
    subtitle: 'Discover our exclusive collection of handcrafted hair accessories',
    isVisible: true
  };

  const bannerContent = publishedData?.site_content?.welcome_banner?.value || defaultBannerContent;
  
  if (publishedData?.site_content?.welcome_banner?.value) {
    console.log('[WELCOME-BANNER] Using published banner data');
  }

  const defaultSocialLinks: SocialLink[] = [
    {
      id: 'default_instagram',
      platform: 'instagram',
      url: 'https://www.instagram.com/pixieblooms',
      icon: 'instagram',
      order: 0
    },
    {
      id: 'default_email',
      platform: 'email',
      url: 'mailto:pixieblooms2512@gmail.com',
      icon: 'email',
      order: 1
    }
  ];

  let socialLinks: SocialLink[] = defaultSocialLinks;
  if (publishedData?.social_links) {
    console.log('[WELCOME-BANNER] Using published social links');
    const linksArray = Object.entries(publishedData.social_links).map(([id, link]: [string, any]) => ({
      id,
      ...link
    }));
    socialLinks = linksArray.sort((a, b) => a.order - b.order);
  } else {
    console.log('[WELCOME-BANNER] Using default social links');
  }

  if (!bannerContent.isVisible) {
    return null;
  }

  // Ensure valid colors with fallback
  const isValidColor = (color: string) => color && (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb/.test(color));
  const textColor = isValidColor(bannerContent.text_color) ? bannerContent.text_color : '#ffffff';
  const bgColor = isValidColor(bannerContent.bg_color) ? bannerContent.bg_color : '#06b6d4';

  return (
    <div 
      className="py-6 sm:py-8 md:py-10 px-4 text-center w-full" 
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 
          className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 leading-tight" 
          style={{ color: textColor }}
        >
          {bannerContent.title}
        </h2>
        <p 
          className="text-xs sm:text-sm md:text-base mb-4 sm:mb-6 leading-relaxed" 
          style={{ color: textColor, opacity: 0.95 }}
        >
          {bannerContent.subtitle}
        </p>
        
        <div className="flex justify-center items-center gap-3 sm:gap-4 mt-4 sm:mt-6 flex-wrap">
          {socialLinks.map((social) => {
            const IconComponent = PLATFORM_ICONS[social.platform as keyof typeof PLATFORM_ICONS] || LinkIcon;
            return (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all duration-200 transform active:scale-95 hover:scale-110 backdrop-blur-sm bg-white/25 hover:bg-white/40"
                aria-label={`Follow us on ${social.platform}`}
                title={social.platform}
              >
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: textColor }} strokeWidth={2} />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
