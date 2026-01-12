import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Loader2 } from 'lucide-react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (roleData) {
          setIsAuthenticated(true);
          setIsAdmin(true);
        } else {
          // User is logged in but not admin
          setIsAuthenticated(true);
          setIsAdmin(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        setIsAuthenticated(true);
        setIsAdmin(!!roleData);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, hsl(270 75% 4%) 0%, hsl(270 60% 8%) 100%)' }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, hsl(270 75% 4%) 0%, hsl(270 60% 8%) 100%)' }}
    >
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AdminLogin />
          </motion.div>
        ) : !isAdmin ? (
          <motion.div
            key="not-admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-4"
          >
            <div className="glass rounded-2xl p-8 text-center max-w-md">
              <h1 className="font-display text-3xl text-gradient mb-4">Kein Zugriff</h1>
              <p className="text-muted-foreground mb-6">
                Du hast keine Admin-Berechtigung. Bitte kontaktiere den Administrator.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-full btn-ghost"
                >
                  Zur Startseite
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 rounded-full btn-primary"
                >
                  Abmelden
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AdminDashboard onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
