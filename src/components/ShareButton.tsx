import { useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Track } from '@/types/music';

interface ShareButtonProps {
  track: Track;
  size?: number;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const SITE_URL = 'https://music.klwunder.de';

function getShareUrl(trackId: string) {
  return `${SUPABASE_URL}/functions/v1/og-share?track=${trackId}&site=${encodeURIComponent(SITE_URL)}`;
}

export function ShareButton({ track, size = 16 }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = getShareUrl(track.id);
  const shareText = `🎵 ${track.title} von ${track.artist} – Jetzt anhören!`;

  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link kopiert!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Kopieren fehlgeschlagen');
    }
  };

  const handleInstagramStory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Instagram Stories can be shared via the native Web Share API on mobile
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: `${shareText}\n${shareUrl}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or not supported
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link kopiert – füge ihn in deine Instagram Story ein!');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link kopiert – füge ihn in deine Instagram Story ein!');
    }
  };

  const shareOptions = [
    {
      name: 'Instagram Story',
      icon: '📸',
      action: handleInstagramStory,
      label: 'In Story teilen',
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`,
    },
    {
      name: 'Discord',
      icon: '🎮',
      action: copyLink,
      label: 'Link kopieren (für Discord)',
    },
    {
      name: 'Telegram',
      icon: '✈️',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'X / Twitter',
      icon: '𝕏',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Facebook',
      icon: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
  ];

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleToggle}
        className="p-1.5 rounded-full hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Teilen"
      >
        <Share2 size={size} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            />
            
            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              className="absolute right-0 bottom-full mb-2 z-50 w-56 glass rounded-xl p-2 shadow-xl border border-primary/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 py-2 mb-1">
                <span className="text-sm font-medium">Teilen</span>
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={14} />
                </button>
              </div>

              {/* Copy link */}
              <button
                onClick={copyLink}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-left text-sm"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                <span>{copied ? 'Kopiert!' : 'Link kopieren'}</span>
              </button>

              <div className="h-px bg-primary/10 my-1" />

              {/* Share options */}
              {shareOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (option.action) {
                      e.preventDefault();
                      option.action(e);
                    }
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-sm"
                >
                  <span className="text-base">{option.icon}</span>
                  <span>{option.label || option.name}</span>
                </a>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
