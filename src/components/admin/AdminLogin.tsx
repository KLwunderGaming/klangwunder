import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import klangwunderIcon from '@/assets/klangwunder-icon.png';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Login fehlgeschlagen', {
          description: error.message === 'Invalid login credentials' 
            ? 'E-Mail oder Passwort falsch' 
            : error.message
        });
      } else if (data.user) {
        toast.success('Erfolgreich angemeldet');
      }
    } catch (err) {
      toast.error('Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back button */}
        <motion.button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft size={20} />
          Zurück zur Seite
        </motion.button>

        {/* Login Card */}
        <div className="glass rounded-3xl p-8 border border-primary/20">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.img
              src={klangwunderIcon}
              alt="Klangwunder"
              className="w-20 h-20 rounded-full mb-4"
              style={{ boxShadow: '0 0 30px hsl(var(--primary)/0.4)' }}
              animate={{
                boxShadow: [
                  '0 0 30px hsl(var(--primary)/0.3)',
                  '0 0 50px hsl(var(--primary)/0.5)',
                  '0 0 30px hsl(var(--primary)/0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <h1 className="font-display text-3xl text-gradient">Admin Login</h1>
            <p className="text-muted-foreground text-sm mt-2">Klangwunder Verwaltung</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-body text-muted-foreground">E-Mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none transition-colors font-body"
                  placeholder="admin@klangwunder.de"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-body text-muted-foreground">Passwort</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none transition-colors font-body"
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
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl btn-primary font-body text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⟳
                  </motion.span>
                  Anmelden...
                </span>
              ) : (
                'Anmelden'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
