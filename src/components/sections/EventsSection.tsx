import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  ticket_url: string | null;
}

export function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_visible', true)
      .gte('event_date', new Date().toISOString().split('T')[0]) // Only future events
      .order('event_date', { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
    setIsLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleString('de-DE', { month: 'short' }).toUpperCase(),
      full: date.toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      })
    };
  };

  // Don't render section if no events and not loading
  if (!isLoading && events.length === 0) {
    return null;
  }

  return (
    <section id="events" className="py-24 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-5xl sm:text-6xl text-gradient mb-4">
            Events
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Erlebe Klangwunder live – auf der Bühne, im Club oder unter freiem Himmel.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event, index) => {
              const date = formatDate(event.event_date);
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass rounded-2xl p-6 card-hover group"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Date badge */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-accent flex flex-col items-center justify-center text-accent-foreground">
                      <span className="text-2xl font-bold">{date.day}</span>
                      <span className="text-xs uppercase">{date.month}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-body text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {date.full}
                        </span>
                        {event.event_time && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {event.event_time}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    {event.ticket_url ? (
                      <motion.a
                        href={event.ticket_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-3 rounded-full btn-accent font-body text-sm"
                      >
                        Tickets
                        <ExternalLink size={14} />
                      </motion.a>
                    ) : (
                      <div className="px-6 py-3 rounded-full bg-muted/30 text-muted-foreground font-body text-sm">
                        Bald verfügbar
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-muted-foreground mt-8 font-body"
        >
          Mehr Events folgen bald. Bleib dran!
        </motion.p>
      </div>
    </section>
  );
}
