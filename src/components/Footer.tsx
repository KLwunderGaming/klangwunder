import { motion } from 'framer-motion';
import { Instagram, Youtube, Music2, CloudRain, Twitter } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function Footer() {
  const { settings } = useSiteSettings();

  const socialLinks = [
    { 
      icon: Instagram, 
      label: 'Instagram', 
      href: settings.instagram_url, 
      color: 'hover:text-pink-500' 
    },
    { 
      icon: Youtube, 
      label: 'YouTube', 
      href: settings.youtube_url, 
      color: 'hover:text-red-500' 
    },
    { 
      icon: Music2, 
      label: 'Spotify', 
      href: settings.spotify_url, 
      color: 'hover:text-green-500' 
    },
    { 
      icon: CloudRain, 
      label: 'SoundCloud', 
      href: settings.soundcloud_url, 
      color: 'hover:text-orange-500' 
    },
    { 
      icon: Twitter, 
      label: 'TikTok', 
      href: settings.tiktok_url, 
      color: 'hover:text-cyan-400' 
    },
  ].filter(link => link.href); // Only show links that have URLs

  return (
    <footer className="py-8 border-t border-border/50">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-2xl text-gradient"
          >
            {settings.site_title || 'Klangwunder'}
          </motion.span>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex gap-4"
            >
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full glass flex items-center justify-center text-muted-foreground transition-colors duration-300 ${social.color}`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  title={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </motion.div>
          )}
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm text-muted-foreground font-body"
          >
            © {new Date().getFullYear()} {settings.site_title || 'Klangwunder'}. Alle Rechte vorbehalten.
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
