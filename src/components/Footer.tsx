'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, Youtube, Heart } from 'lucide-react';
import { usePublishedData } from '../contexts/PublishedDataContext';

interface FooterConfig {
  is_visible: boolean;
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  linkColor: string;
  linkHoverColor: string;
  accentColor: string;
  companyName: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
  };
  quickLinks: Array<{ label: string; url: string }>;
  copyrightText: string;
  showQuickLinks: boolean;
  showSocial: boolean;
  showContact: boolean;
}

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const { data: publishedData } = usePublishedData();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  
  const config = publishedData?.footer_config as FooterConfig | null;

  if (!config || !config.is_visible) {
    return null;
  }

  const handleLinkClick = (url: string) => {
    if (url.startsWith('/')) {
      const page = url.substring(1);
      if (onNavigate) {
        onNavigate(page);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Validate colors
  const isValidColor = (color: string) => color && (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb/.test(color));
  
  const socialIcons = config.social ? [
    { name: 'facebook', icon: Facebook, url: config.social.facebook, color: '#1877F2' },
    { name: 'instagram', icon: Instagram, url: config.social.instagram, color: '#E4405F' },
    { name: 'twitter', icon: Twitter, url: config.social.twitter, color: '#1DA1F2' },
    { name: 'linkedin', icon: Linkedin, url: config.social.linkedin, color: '#0A66C2' },
    { name: 'youtube', icon: Youtube, url: config.social.youtube, color: '#FF0000' },
  ].filter((social) => social.url) : [];

  const bgColor = isValidColor(config.backgroundColor) ? config.backgroundColor : '#1f2937';
  const txtColor = isValidColor(config.textColor) ? config.textColor : '#ffffff';
  const headingColor = isValidColor(config.headingColor) ? config.headingColor : '#ffffff';
  const linkColor = isValidColor(config.linkColor) ? config.linkColor : '#60a5fa';
  const accentColor = isValidColor(config.accentColor) ? config.accentColor : '#14b8a6';

  return (
    <footer
      style={{
        backgroundColor: bgColor,
        color: txtColor,
      }}
      className="w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="w-full px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <div className="lg:col-span-1">
            <h3
              style={{ color: headingColor }}
              className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4"
            >
              {config.companyName}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed mb-4" style={{ color: txtColor, opacity: 0.9 }}>{config.description}</p>
          </div>

          {config.showQuickLinks && Array.isArray(config.quickLinks) && config.quickLinks.length > 0 && (
            <div>
              <h4
                style={{ color: headingColor }}
                className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4"
              >
                Quick Links
              </h4>
              <ul className="space-y-1.5 sm:space-y-2">
                {config.quickLinks.map((link, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleLinkClick(link.url)}
                      onMouseEnter={() => setHoveredLink(`link-${index}`)}
                      onMouseLeave={() => setHoveredLink(null)}
                      style={{
                        color: hoveredLink === `link-${index}` ? config.linkHoverColor || linkColor : linkColor,
                      }}
                      className="text-xs sm:text-sm transition-colors hover:underline"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {config.showContact && (
            <div>
              <h4
                style={{ color: headingColor }}
                className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4"
              >
                Contact Us
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                {config.email && (
                  <li className="flex items-start gap-2">
                    <Mail size={16} className="mt-0.5 flex-shrink-0 sm:w-5 sm:h-5" style={{ color: accentColor }} />
                    <a
                      href={`mailto:${config.email}`}
                      onMouseEnter={() => setHoveredLink('email')}
                      onMouseLeave={() => setHoveredLink(null)}
                      style={{
                        color: hoveredLink === 'email' ? (config.linkHoverColor || accentColor) : txtColor,
                      }}
                      className="text-xs sm:text-sm transition-colors hover:underline break-all"
                    >
                      {config.email}
                    </a>
                  </li>
                )}
                {config.phone && (
                  <li className="flex items-start gap-2">
                    <Phone size={16} className="mt-0.5 flex-shrink-0 sm:w-5 sm:h-5" style={{ color: accentColor }} />
                    <a
                      href={`tel:${config.phone}`}
                      onMouseEnter={() => setHoveredLink('phone')}
                      onMouseLeave={() => setHoveredLink(null)}
                      style={{
                        color: hoveredLink === 'phone' ? (config.linkHoverColor || accentColor) : txtColor,
                      }}
                      className="text-xs sm:text-sm transition-colors hover:underline"
                    >
                      {config.phone}
                    </a>
                  </li>
                )}
                {config.address && (
                  <li className="flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0 sm:w-5 sm:h-5" style={{ color: accentColor }} />
                    <span className="text-xs sm:text-sm" style={{ color: txtColor }}>{config.address}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {config.showSocial && socialIcons.length > 0 && (
            <div>
              <h4
                style={{ color: headingColor }}
                className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4"
              >
                Follow Us
              </h4>
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {socialIcons.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => setHoveredLink(social.name)}
                      onMouseLeave={() => setHoveredLink(null)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                      style={{
                        backgroundColor: hoveredLink === social.name ? social.color : accentColor,
                        opacity: hoveredLink === social.name ? 1 : 0.8,
                      }}
                      aria-label={`Follow us on ${social.name}`}
                    >
                      <Icon size={16} className="sm:w-5 sm:h-5" style={{ color: '#FFFFFF' }} />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div
          className="border-t pt-4 sm:pt-6 mt-6 sm:mt-8"
          style={{ borderColor: accentColor + '30' }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-center sm:text-left" style={{ color: txtColor, opacity: 0.9 }}>{config.copyrightText}</p>
            <p className="text-xs sm:text-sm flex items-center gap-1" style={{ color: txtColor }}>
              Made with <Heart size={14} className="sm:w-4 sm:h-4" style={{ color: accentColor }} fill={accentColor} /> for you
            </p>
          </div>
          <div className="text-center mt-3 sm:mt-4 pt-3 sm:pt-4" style={{ borderColor: accentColor + '20', borderTopWidth: '1px' }}>
            <p className="text-xs" style={{ color: txtColor, opacity: 0.7 }}>
              Crafted by <a href="https://tagyverse.com" target="_blank" rel="noopener noreferrer" className="font-semibold hover:opacity-100 transition-opacity" style={{ color: linkColor }}>Tagyverse</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
