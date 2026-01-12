import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className="py-8 border-t border-border/50">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-2xl text-gradient"
          >
            Klangwunder
          </motion.span>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm text-muted-foreground font-body"
          >
            © {new Date().getFullYear()} Klangwunder. Alle Rechte vorbehalten.
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
