import { motion } from 'framer-motion';
import { Mail, Instagram, Youtube, Music2, Send } from 'lucide-react';
import { useState } from 'react';

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: '#', color: 'hover:text-pink-500' },
  { icon: Youtube, label: 'YouTube', href: '#', color: 'hover:text-red-500' },
  { icon: Music2, label: 'Spotify', href: '#', color: 'hover:text-green-500' },
];

export function ContactSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-5xl sm:text-6xl text-gradient mb-4">
            Kontakt
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Lass uns in Verbindung bleiben. Folge mir auf Social Media oder 
            schreib mir direkt.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center gap-6 mb-12"
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-14 h-14 rounded-full glass flex items-center justify-center text-foreground transition-colors duration-300 ${social.color}`}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <social.icon size={24} />
              </motion.a>
            ))}
          </motion.div>

          {/* Email Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Mail className="text-primary" size={24} />
              <span className="font-body text-lg">Newsletter abonnieren</span>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                className="flex-1 px-4 py-3 rounded-full bg-input border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-body text-foreground placeholder:text-muted-foreground transition-all duration-300"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-full btn-primary flex items-center gap-2"
              >
                <Send size={18} />
                <span className="hidden sm:inline">Abonnieren</span>
              </motion.button>
            </form>

            {submitted && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center text-primary font-body"
              >
                Vielen Dank! Du bist jetzt angemeldet.
              </motion.p>
            )}
          </motion.div>

          {/* Direct Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-8"
          >
            <p className="text-muted-foreground font-body">
              Für Booking-Anfragen: <br />
              <a 
                href="mailto:booking@klangwunder.de" 
                className="text-primary hover:text-accent transition-colors"
              >
                booking@klangwunder.de
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
