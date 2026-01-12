import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Music, Heart, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface ContentSection {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
}

export function AboutSection() {
  const { settings } = useSiteSettings();
  const [aboutContent, setAboutContent] = useState<ContentSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const { data } = await supabase
        .from('content_sections')
        .select('*')
        .eq('section_key', 'about')
        .eq('is_visible', true)
        .maybeSingle();
      
      setAboutContent(data as ContentSection | null);
    } catch (err) {
      console.error('Error fetching about content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Use settings.about_text as fallback if no content_section exists
  const aboutText = aboutContent?.content || settings.about_text;

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl glass overflow-hidden relative">
              {aboutContent?.image_url ? (
                <img 
                  src={aboutContent.image_url} 
                  alt="Über mich" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="w-48 h-48 rounded-full border-2 border-primary/30 flex items-center justify-center"
                    >
                      <Headphones className="w-24 h-24 text-primary" />
                    </motion.div>
                  </div>
                </>
              )}
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-10 right-10 w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center backdrop-blur-sm"
              >
                <Music className="w-6 h-6 text-accent" />
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute bottom-10 left-10 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm"
              >
                <Heart className="w-6 h-6 text-primary" />
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="font-display text-5xl sm:text-6xl text-gradient mb-6">
              {aboutContent?.title || 'Über mich'}
            </h2>
            
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Laden...
              </div>
            ) : aboutText ? (
              <div className="space-y-4 font-body text-muted-foreground">
                {aboutText.split('\n\n').map((paragraph, index) => (
                  <p key={index} className={index === 0 ? 'text-lg' : ''}>
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="space-y-4 font-body text-muted-foreground">
                <p className="text-lg">
                  Willkommen in meiner musikalischen Welt! Ich bin <span className="text-foreground font-semibold">Klangwunder</span>, 
                  ein leidenschaftlicher Musikproduzent aus dem Herzen Deutschlands.
                </p>
                
                <p>
                  Meine Reise begann mit einer einfachen Idee: Klänge zu erschaffen, die Menschen 
                  berühren und in andere Welten entführen. Von atmosphärischen Ambient-Landschaften 
                  bis hin zu pulsierenden elektronischen Beats – jeder Track erzählt eine Geschichte.
                </p>
                
                <p>
                  Inspiriert von der Natur, urbanen Klängen und den unendlichen Möglichkeiten 
                  digitaler Produktion, erschaffe ich Musik, die zum Träumen einlädt und 
                  gleichzeitig zum Bewegen animiert.
                </p>
              </div>
            )}

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: Music, label: settings.stat_tracks_value || '50+', desc: settings.stat_tracks_label || 'Tracks' },
                { icon: Headphones, label: settings.stat_streams_value || '10K+', desc: settings.stat_streams_label || 'Streams' },
                { icon: Sparkles, label: settings.stat_years_value || '5', desc: settings.stat_years_label || 'Jahre' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.desc}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="glass rounded-xl p-4 text-center"
                >
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-foreground">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
