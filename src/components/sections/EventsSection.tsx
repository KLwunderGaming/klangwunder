import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';

const events = [
  {
    id: 1,
    title: 'Amethyst Night',
    date: '15. Februar 2026',
    time: '22:00 Uhr',
    location: 'Club Violet, Berlin',
    description: 'Eine Nacht voller elektronischer Klänge und visueller Kunst.',
    status: 'upcoming',
  },
  {
    id: 2,
    title: 'Klangwunder Live',
    date: '28. März 2026',
    time: '20:00 Uhr',
    location: 'Musikhalle, München',
    description: 'Exklusives Live-Set mit neuen, unveröffentlichten Tracks.',
    status: 'upcoming',
  },
  {
    id: 3,
    title: 'Summer Vibes Festival',
    date: '12. Juli 2026',
    time: '16:00 Uhr',
    location: 'Open Air, Hamburg',
    description: 'Teil des großen Sommerfestivals mit internationalen Acts.',
    status: 'upcoming',
  },
];

export function EventsSection() {
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

        <div className="space-y-6">
          {events.map((event, index) => (
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
                  <span className="text-2xl font-bold">{event.date.split('.')[0]}</span>
                  <span className="text-xs uppercase">{event.date.split(' ')[1]?.slice(0, 3)}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-body text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {event.location}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full btn-accent font-body text-sm"
                >
                  Tickets
                  <ExternalLink size={14} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

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
