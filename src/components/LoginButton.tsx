import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { X, Eye, EyeOff, Lock, Mail, LogIn, LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';
import klangwunderIcon from '@/assets/klangwunder-icon.png';

export function LoginButton() {
  const [showModal, setShowModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        setIsAdmin(!!roleData);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsLoggedIn(true);
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        setIsAdmin(!!roleData);
        setShowModal(false);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error('Login fehlgeschlagen', {
          description: error.message === 'Invalid login credentials' 
            ? 'E-Mail oder Passwort falsch' 
            : error.message
        });
      } else {
        toast.success('Erfolgreich angemeldet');
        setEmail('');
        setPassword('');
      }
    } catch {
      toast.error('Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Abgemeldet');
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-24 right-6 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        {isLoggedIn ? (
          <div className="flex flex-col gap-2">
            {isAdmin && (
              <motion.button
                onClick={() => navigate('/admin')}
                className="p-4 rounded-full glass border border-primary/30 hover:border-primary/60 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ boxShadow: '0 0 20px hsl(var(--primary)/0.3)' }}
              >
                <Settings size={24} className="text-primary" />
              </motion.button>
            )}
            <motion.button
              onClick={handleLogout}
              className="p-4 rounded-full glass border border-muted/30 hover:border-destructive/60 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <LogOut size={24} className="text-muted-foreground hover:text-destructive" />
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={() => setShowModal(true)}
            className="p-4 rounded-full glass border border-primary/30 hover:border-primary/60 transition-all group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ boxShadow: '0 0 20px hsl(var(--primary)/0.3)' }}
          >
            <LogIn size={24} className="text-primary group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </motion.div>

      {/* Login Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100, rotateX: -15 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 100, rotateX: 15 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300,
                duration: 0.5
              }}
              className="relative w-full max-w-md"
              style={{ perspective: '1000px' }}
            >
              {/* Glowing border effect */}
              <motion.div
                className="absolute -inset-1 rounded-3xl opacity-50 blur-xl"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.02, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Card */}
              <div className="relative glass rounded-3xl p-8 border border-primary/30 overflow-hidden">
                {/* Animated background particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-primary/30"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${10 + (i % 3) * 30}%`
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.5, 1]
                      }}
                      transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                    />
                  ))}
                </div>

                {/* Close button */}
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-xl hover:bg-muted/50 transition-colors z-10"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>

                {/* Logo */}
                <motion.div
                  className="flex flex-col items-center mb-8"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.img
                    src={klangwunderIcon}
                    alt="Klangwunder"
                    className="w-20 h-20 rounded-full mb-4"
                    style={{ boxShadow: '0 0 30px hsl(var(--primary)/0.5)' }}
                    animate={{
                      boxShadow: [
                        '0 0 30px hsl(var(--primary)/0.3)',
                        '0 0 50px hsl(var(--primary)/0.6)',
                        '0 0 30px hsl(var(--primary)/0.3)'
                      ],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <h2 className="font-display text-3xl text-gradient">Anmelden</h2>
                  <p className="text-muted-foreground text-sm mt-1">Willkommen zurück!</p>
                </motion.div>

                {/* Form */}
                <motion.form
                  onSubmit={handleLogin}
                  className="space-y-5"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="text-sm text-muted-foreground mb-2 block">E-Mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none transition-all focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                        placeholder="deine@email.de"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="text-sm text-muted-foreground mb-2 block">Passwort</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none transition-all focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl btn-primary font-body text-lg disabled:opacity-50 relative overflow-hidden group"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                    />
                    
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            ⟳
                          </motion.span>
                          Anmelden...
                        </>
                      ) : (
                        <>
                          <LogIn size={20} />
                          Anmelden
                        </>
                      )}
                    </span>
                  </motion.button>
                </motion.form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
